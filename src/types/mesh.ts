export type MessageStatus = 'pending' | 'sent_to_mesh' | 'relayed' | 'delivered' | 'failed';

export interface CryptographicKeys {
  boxPublicKey: string;     // Base64 Curve25519 public key (Encryption)
  boxSecretKey: string;    // Base64 Curve25519 secret key
  signPublicKey: string;    // Base64 Ed25519 public key (Identity & Signing)
  signSecretKey: string;   // Base64 Ed25519 secret key
  fingerprint: string;      // Formatted SHA256 hex/base64 string e.g. "4A8F-9C12-E03B-77FA"
}

export interface UserProfile {
  id: string;               // Local unique user ID (Public Key fingerprint)
  displayName: string;
  phoneNumber?: string;
  avatarColor: string;
  avatarSymbol: string;
  keys: CryptographicKeys;
  createdAt: number;
}

export interface PeerNode {
  id: string;               // Endpoint ID or Peer PubKey fingerprint
  displayName: string;
  phoneNumber?: string;
  avatarColor: string;
  avatarSymbol: string;
  boxPublicKey: string;     // Base64 Curve25519
  signPublicKey: string;    // Base64 Ed25519
  fingerprint: string;
  rssi: number;             // Signal strength in dBm (-30 dBm strong, -90 dBm weak)
  hopsAway: number;         // 1 = Direct Range, 2+ = Relayed via Mesh
  relayedVia?: string;      // ID of intermediate peer if relayed
  isVerified: boolean;      // In-person QR paired public key
  lastSeen: number;
  isOnline: boolean;
  x?: number;               // Coordinates for visual radar (0 to 100)
  y?: number;
}

export interface MeshPacket {
  packetId: string;         // Unique packet ID for sliding-window deduplication
  senderPubKey: string;     // Base64 Ed25519 Public Key of original sender
  senderFingerprint: string;// Short sender identity badge
  senderDisplayName: string;
  recipientPubKey: string;  // Base64 Ed25519 Public Key of recipient (or "BROADCAST")
  payload: string;          // TweetNaCl nacl.box encrypted ciphertext (Base64)
  nonce: string;            // Encryption nonce (Base64)
  signature: string;        // Ed25519 Signature of (payload + nonce + recipientPubKey)
  ttl: number;              // Time-To-Live hop limit (default: 7)
  hopCount: number;         // Hops traversed so far (starts at 0)
  relayedByNodes: string[]; // List of peer fingerprints that relayed this packet
  timestamp: number;        // Origination epoch ms
}

export interface ChatMessage {
  id: string;               // Local message ID or Packet ID
  packetId: string;
  threadId: string;         // Contact fingerprint or group ID
  senderId: string;         // Sender fingerprint
  senderName: string;
  recipientId: string;      // Recipient fingerprint
  text: string;
  attachmentType?: 'text' | 'image' | 'voice' | 'location';
  attachmentUrl?: string;
  timestamp: number;
  status: MessageStatus;
  hopCount: number;
  relayedViaNodes?: string[];
  isOutgoing: boolean;
  decrypted: boolean;
}

export interface ChatThread {
  contactId: string;        // Peer fingerprint
  peer: PeerNode;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: number;
}

export interface MeshMetrics {
  totalPacketsProcessed: number;
  packetsRelayed: number;
  packetsDroppedDuplicate: number;
  packetsDroppedTTLExpired: number;
  activeDirectPeers: number;
  activeRelayedPeers: number;
  bandwidthRelayedBytes: number;
}
