import { PeerNode, UserProfile, MeshPacket, ChatMessage, MeshMetrics } from '../types/mesh';
import { generateUserKeys, getAvatarColor } from '../crypto/e2ee';
import { MeshProtocolEngine } from './protocol';
import { db } from '../storage/database';

/**
 * Safe Native Modules import for Expo Go / React Native cross-platform compatibility
 */
let NativeMeshModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { NativeModules } = require('react-native');
  NativeMeshModule = NativeModules?.NativeMeshModule || null;
} catch (e) {
  NativeMeshModule = null;
}

export class MeshEngine {
  private userProfile: UserProfile;
  private protocolEngine: MeshProtocolEngine;
  private activePeers: Map<string, PeerNode> = new Map();
  private simulatedNodes: Map<string, { peer: PeerNode; keys: any }> = new Map();
  private isNativeAvailable = false;

  private onPeersUpdatedListeners: Set<(peers: PeerNode[]) => void> = new Set();
  private onMessageListeners: Set<(msg: ChatMessage) => void> = new Set();
  private onMetricsListeners: Set<(metrics: MeshMetrics) => void> = new Set();
  private onLogListeners: Set<(log: string) => void> = new Set();

  constructor(userProfile: UserProfile) {
    this.userProfile = userProfile;
    this.protocolEngine = new MeshProtocolEngine(userProfile, {
      onNewMessageReceived: (msg) => this.notifyMessageReceived(msg),
      onPacketRelayed: (pkt) => this.handlePacketRelay(pkt),
      onPacketDropped: (id, reason) => this.logNetworkEvent(`[Dropped] Packet ${id}: ${reason}`),
      onPeerUpdated: (peer) => this.updatePeer(peer),
      onMetricsUpdated: (metrics) => this.notifyMetrics(metrics),
    });

    this.checkNativeAvailability();
    this.initializePeers();
  }

  private checkNativeAvailability() {
    if (NativeMeshModule) {
      this.isNativeAvailable = true;
      this.logNetworkEvent('[Native Driver] Native Android Google Nearby Connections module initialized.');
      try {
        NativeMeshModule.startMeshService(this.userProfile.displayName);
      } catch (e) {
        console.warn('Native mesh service start warning:', e);
      }
    } else {
      this.isNativeAvailable = false;
      this.logNetworkEvent('[Expo / Web Mode] Running Virtual BLE Mesh Network Engine.');
    }
  }

  /**
   * Initializes offline mesh nodes for interactive testing & Expo Go execution.
   */
  private initializePeers() {
    const defaultVirtualPeers = [
      { name: 'Elena Rostova', color: '#10b981', symbol: 'ER', hops: 1, rssi: -45, x: 28, y: 35 },
      { name: 'Kaelen Vance', color: '#06b6d4', symbol: 'KV', hops: 1, rssi: -62, x: 72, y: 25 },
      { name: 'Dr. Marcus Thorne', color: '#8b5cf6', symbol: 'MT', hops: 2, rssi: -84, x: 88, y: 78, via: 'Kaelen Vance' },
      { name: 'Aria Sterling', color: '#f59e0b', symbol: 'AS', hops: 3, rssi: -92, x: 15, y: 82, via: 'Elena Rostova' },
    ];

    defaultVirtualPeers.forEach((p) => {
      const keys = generateUserKeys();
      const peerNode: PeerNode = {
        id: keys.fingerprint,
        displayName: p.name,
        avatarColor: p.color,
        avatarSymbol: p.symbol,
        boxPublicKey: keys.boxPublicKey,
        signPublicKey: keys.signPublicKey,
        fingerprint: keys.fingerprint,
        rssi: p.rssi,
        hopsAway: p.hops,
        relayedVia: p.via,
        isVerified: p.hops === 1,
        lastSeen: Date.now(),
        isOnline: true,
        x: p.x,
        y: p.y,
      };

      this.activePeers.set(peerNode.fingerprint, peerNode);
      this.simulatedNodes.set(peerNode.fingerprint, { peer: peerNode, keys });
      db.saveContact(peerNode);
    });

    this.notifyPeersChanged();
  }

  public getActivePeers(): PeerNode[] {
    return Array.from(this.activePeers.values());
  }

  public updatePeerPosition(fingerprint: string, x: number, y: number, hopsAway: number) {
    const peer = this.activePeers.get(fingerprint);
    if (peer) {
      peer.x = x;
      peer.y = y;
      peer.hopsAway = hopsAway;
      peer.rssi = hopsAway === 1 ? -50 : -85;
      db.saveContact(peer);
      this.notifyPeersChanged();
    }
  }

  public addVirtualPeer(name: string): PeerNode {
    const keys = generateUserKeys();
    const color = getAvatarColor(keys.fingerprint);
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const peer: PeerNode = {
      id: keys.fingerprint,
      displayName: name,
      avatarColor: color,
      avatarSymbol: initials || 'P',
      boxPublicKey: keys.boxPublicKey,
      signPublicKey: keys.signPublicKey,
      fingerprint: keys.fingerprint,
      rssi: -55,
      hopsAway: 1,
      isVerified: false,
      lastSeen: Date.now(),
      isOnline: true,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
    };

    this.activePeers.set(peer.fingerprint, peer);
    this.simulatedNodes.set(peer.fingerprint, { peer, keys });
    db.saveContact(peer);
    this.notifyPeersChanged();
    this.logNetworkEvent(`[Peer Discovered] New Bluetooth node: ${peer.displayName} (${peer.fingerprint})`);
    return peer;
  }

  public sendMessage(recipientPeer: PeerNode, text: string, attachmentType: 'text' | 'image' | 'voice' = 'text', attachmentUrl?: string): ChatMessage {
    const { packet, localMessage } = this.protocolEngine.createPacket(recipientPeer, text, attachmentType, attachmentUrl);

    this.logNetworkEvent(`[Sent] Message -> ${recipientPeer.displayName} (Packet: ${packet.packetId})`);

    // If native driver is present, broadcast native packet
    if (this.isNativeAvailable && NativeMeshModule) {
      try {
        NativeMeshModule.broadcastPacket(recipientPeer.id, JSON.stringify(packet));
      } catch (e) {
        console.warn('Native broadcast warning:', e);
      }
    }

    // Simulate multi-hop mesh transmission
    setTimeout(() => {
      localMessage.status = 'sent_to_mesh';
      db.saveMessage(localMessage);
      this.notifyMessageReceived(localMessage);

      if (recipientPeer.hopsAway > 1) {
        setTimeout(() => {
          localMessage.status = 'relayed';
          localMessage.hopCount = recipientPeer.hopsAway;
          localMessage.relayedViaNodes = [recipientPeer.relayedVia || 'RelayNode'];
          db.saveMessage(localMessage);
          this.notifyMessageReceived(localMessage);
          this.logNetworkEvent(`[Relayed] Hop ${recipientPeer.hopsAway} via ${recipientPeer.relayedVia || 'Mesh Node'}`);

          setTimeout(() => {
            localMessage.status = 'delivered';
            db.saveMessage(localMessage);
            this.notifyMessageReceived(localMessage);
            this.logNetworkEvent(`[Delivered ✓✓] Delivered to ${recipientPeer.displayName}`);
          }, 800);
        }, 600);
      } else {
        setTimeout(() => {
          localMessage.status = 'delivered';
          localMessage.hopCount = 1;
          db.saveMessage(localMessage);
          this.notifyMessageReceived(localMessage);
          this.logNetworkEvent(`[Delivered ✓✓] Direct BLE delivery to ${recipientPeer.displayName}`);
        }, 500);
      }
    }, 300);

    this.simulateVirtualPeerReply(recipientPeer, text);

    return localMessage;
  }

  private simulateVirtualPeerReply(peer: PeerNode, userText: string) {
    if (
      userText.toLowerCase().includes('hello') ||
      userText.toLowerCase().includes('hi') ||
      userText.toLowerCase().includes('mesh') ||
      userText.toLowerCase().includes('status')
    ) {
      setTimeout(() => {
        const replies = [
          `Received off-grid! I'm ${peer.hopsAway} hop(s) away from you.`,
          `Mesh connection strong! RSSI: ${peer.rssi} dBm. E2EE key verified.`,
          `Offline relay working seamlessly via Bluetooth Low Energy!`,
          `Got your message with 0 internet connection!`,
        ];
        const replyText = replies[Math.floor(Math.random() * replies.length)];

        const virtualNode = this.simulatedNodes.get(peer.fingerprint);
        if (virtualNode) {
          const incomingMsg: ChatMessage = {
            id: `reply_${Date.now()}`,
            packetId: `pkt_reply_${Date.now()}`,
            threadId: peer.fingerprint,
            senderId: peer.fingerprint,
            senderName: peer.displayName,
            recipientId: this.userProfile.keys.fingerprint,
            text: replyText,
            timestamp: Date.now(),
            status: 'delivered',
            hopCount: peer.hopsAway,
            relayedViaNodes: peer.relayedVia ? [peer.relayedVia] : [],
            isOutgoing: false,
            decrypted: true,
          };

          db.saveMessage(incomingMsg);
          this.notifyMessageReceived(incomingMsg);
          this.logNetworkEvent(`[Received] Reply from ${peer.displayName}`);
        }
      }, 1800);
    }
  }

  private handlePacketRelay(packet: MeshPacket) {
    this.logNetworkEvent(`[Mesh Relay] Relaying packet ${packet.packetId} (TTL: ${packet.ttl}, Hops: ${packet.hopCount})`);
  }

  private updatePeer(peer: PeerNode) {
    this.activePeers.set(peer.fingerprint, peer);
    this.notifyPeersChanged();
  }

  private notifyPeersChanged() {
    const peers = this.getActivePeers();
    this.onPeersUpdatedListeners.forEach((fn) => fn(peers));
  }

  private notifyMessageReceived(msg: ChatMessage) {
    this.onMessageListeners.forEach((fn) => fn(msg));
  }

  private notifyMetrics(metrics: MeshMetrics) {
    this.onMetricsListeners.forEach((fn) => fn(metrics));
  }

  private logNetworkEvent(log: string) {
    console.log(log);
    this.onLogListeners.forEach((fn) => fn(log));
  }

  // Subscriptions
  public subscribePeers(fn: (peers: PeerNode[]) => void) {
    this.onPeersUpdatedListeners.add(fn);
    fn(this.getActivePeers());
    return () => this.onPeersUpdatedListeners.delete(fn);
  }

  public subscribeMessages(fn: (msg: ChatMessage) => void) {
    this.onMessageListeners.add(fn);
    return () => this.onMessageListeners.delete(fn);
  }

  public subscribeMetrics(fn: (metrics: MeshMetrics) => void) {
    this.onMetricsListeners.add(fn);
    fn(db.getMetrics());
    return () => this.onMetricsListeners.delete(fn);
  }

  public subscribeLogs(fn: (log: string) => void) {
    this.onLogListeners.add(fn);
    return () => this.onLogListeners.delete(fn);
  }
}
