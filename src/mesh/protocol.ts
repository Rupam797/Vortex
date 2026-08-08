import { MeshPacket, UserProfile, PeerNode, ChatMessage, MeshMetrics } from '../types/mesh';
import { decryptPayload, verifySignature, encryptPayload, signMessage } from '../crypto/e2ee';
import { db } from '../storage/database';

export const DEFAULT_TTL = 7;

export interface RoutingEngineCallbacks {
  onNewMessageReceived: (message: ChatMessage) => void;
  onPacketRelayed: (packet: MeshPacket) => void;
  onPacketDropped: (packetId: string, reason: string) => void;
  onPeerUpdated: (peer: PeerNode) => void;
  onMetricsUpdated: (metrics: MeshMetrics) => void;
}

export class MeshProtocolEngine {
  private userProfile: UserProfile;
  private callbacks: RoutingEngineCallbacks;

  constructor(userProfile: UserProfile, callbacks: RoutingEngineCallbacks) {
    this.userProfile = userProfile;
    this.callbacks = callbacks;
  }

  /**
   * Constructs an encrypted MeshPacket ready to be broadcast over Bluetooth/Wi-Fi Direct.
   */
  createPacket(
    recipientPeer: PeerNode,
    text: string,
    attachmentType: 'text' | 'image' | 'voice' = 'text',
    attachmentUrl?: string
  ): { packet: MeshPacket; localMessage: ChatMessage } {
    const packetId = `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const messageDataToEncrypt = JSON.stringify({
      text,
      attachmentType,
      attachmentUrl,
      timestamp: Date.now(),
    });

    // Encrypt payload specifically for recipient using TweetNaCl Box
    const { ciphertext, nonce } = encryptPayload(
      messageDataToEncrypt,
      recipientPeer.boxPublicKey,
      this.userProfile.keys.boxSecretKey
    );

    // Sign payload with Ed25519 for tamperproof origin verification
    const signature = signMessage(
      `${ciphertext}:${nonce}:${recipientPeer.signPublicKey}`,
      this.userProfile.keys.signSecretKey
    );

    const packet: MeshPacket = {
      packetId,
      senderPubKey: this.userProfile.keys.signPublicKey,
      senderFingerprint: this.userProfile.keys.fingerprint,
      senderDisplayName: this.userProfile.displayName,
      recipientPubKey: recipientPeer.signPublicKey,
      payload: ciphertext,
      nonce,
      signature,
      ttl: DEFAULT_TTL,
      hopCount: 0,
      relayedByNodes: [],
      timestamp: Date.now(),
    };

    const localMessage: ChatMessage = {
      id: packetId,
      packetId,
      threadId: recipientPeer.fingerprint,
      senderId: this.userProfile.keys.fingerprint,
      senderName: this.userProfile.displayName,
      recipientId: recipientPeer.fingerprint,
      text,
      attachmentType,
      attachmentUrl,
      timestamp: Date.now(),
      status: 'pending',
      hopCount: 0,
      relayedViaNodes: [],
      isOutgoing: true,
      decrypted: true,
    };

    db.saveMessage(localMessage);

    return { packet, localMessage };
  }

  /**
   * Processes an incoming MeshPacket received via Bluetooth / Peer network.
   * Handles target delivery vs multi-hop mesh relaying.
   */
  processIncomingPacket(packet: MeshPacket, sourcePeerId: string): { action: 'delivered' | 'relayed' | 'dropped'; reason?: string } {
    const metrics = db.getMetrics();
    metrics.totalPacketsProcessed += 1;

    // 1. Check for Duplicate Packet (Loop Prevention)
    if (db.isPacketDuplicate(packet.packetId)) {
      metrics.packetsDroppedDuplicate += 1;
      db.saveMetrics(metrics);
      this.callbacks.onMetricsUpdated(metrics);
      this.callbacks.onPacketDropped(packet.packetId, 'Duplicate packet (broadcast loop prevented)');
      return { action: 'dropped', reason: 'duplicate' };
    }

    // Add packet ID to deduplication cache
    db.addPacketToDedupCache(packet.packetId);

    // 2. Verify Signature
    const isValidSig = verifySignature(
      `${packet.payload}:${packet.nonce}:${packet.recipientPubKey}`,
      packet.signature,
      packet.senderPubKey
    );

    if (!isValidSig) {
      this.callbacks.onPacketDropped(packet.packetId, 'Invalid cryptographic signature');
      return { action: 'dropped', reason: 'invalid_signature' };
    }

    const isForMe =
      packet.recipientPubKey === this.userProfile.keys.signPublicKey ||
      packet.recipientPubKey === 'BROADCAST';

    // 3. TARGET RECIPIENT: Decrypt & Store Message
    if (isForMe) {
      // Find sender peer details to get sender's Box Public Key
      const contacts = db.getContacts();
      const senderPeer = contacts.find((c) => c.signPublicKey === packet.senderPubKey);

      // Derive Box PubKey (in real NaCl, sender sends both Box & Sign pubkey or maps them)
      const senderBoxPubKey = senderPeer ? senderPeer.boxPublicKey : packet.senderPubKey;

      const decryptedText = decryptPayload(
        packet.payload,
        packet.nonce,
        senderBoxPubKey,
        this.userProfile.keys.boxSecretKey
      );

      if (decryptedText !== null) {
        let parsedPayload: any = { text: decryptedText };
        try {
          parsedPayload = JSON.parse(decryptedText);
        } catch (e) {
          // Plain string fallback
        }

        const chatMsg: ChatMessage = {
          id: packet.packetId,
          packetId: packet.packetId,
          threadId: packet.senderFingerprint,
          senderId: packet.senderFingerprint,
          senderName: packet.senderDisplayName,
          recipientId: this.userProfile.keys.fingerprint,
          text: parsedPayload.text || decryptedText,
          attachmentType: parsedPayload.attachmentType || 'text',
          attachmentUrl: parsedPayload.attachmentUrl,
          timestamp: packet.timestamp,
          status: 'delivered',
          hopCount: packet.hopCount,
          relayedViaNodes: packet.relayedByNodes,
          isOutgoing: false,
          decrypted: true,
        };

        db.saveMessage(chatMsg);
        this.callbacks.onNewMessageReceived(chatMsg);
        db.saveMetrics(metrics);
        this.callbacks.onMetricsUpdated(metrics);
        return { action: 'delivered' };
      } else {
        // Intermediate node attempted decryption but couldn't (E2EE security working as expected!)
        console.log(`Node ${this.userProfile.keys.fingerprint} cannot decrypt packet for ${packet.recipientPubKey}`);
      }
    }

    // 4. MULTI-HOP RELAY NODE LOGIC (If not for me or broadcast)
    if (packet.ttl <= 1) {
      metrics.packetsDroppedTTLExpired += 1;
      db.saveMetrics(metrics);
      this.callbacks.onMetricsUpdated(metrics);
      this.callbacks.onPacketDropped(packet.packetId, 'TTL expired (max hops reached)');
      return { action: 'dropped', reason: 'ttl_expired' };
    }

    // Re-route & Relay Packet
    const relayedPacket: MeshPacket = {
      ...packet,
      ttl: packet.ttl - 1,
      hopCount: packet.hopCount + 1,
      relayedByNodes: [...packet.relayedByNodes, this.userProfile.keys.fingerprint],
    };

    metrics.packetsRelayed += 1;
    metrics.bandwidthRelayedBytes += JSON.stringify(relayedPacket).length;
    db.saveMetrics(metrics);
    this.callbacks.onMetricsUpdated(metrics);

    this.callbacks.onPacketRelayed(relayedPacket);
    return { action: 'relayed' };
  }
}
