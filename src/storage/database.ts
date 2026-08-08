import { UserProfile, PeerNode, ChatMessage, ChatThread, MeshMetrics } from '../types/mesh';

const STORAGE_KEYS = {
  USER_PROFILE: 'meshchat_user_profile',
  CONTACTS: 'meshchat_contacts',
  MESSAGES: 'meshchat_messages',
  METRICS: 'meshchat_metrics',
  DEDUP_CACHE: 'meshchat_dedup_cache',
  THEME_MODE: 'meshchat_theme_mode',
};

// Memory fallback for Native React Native environments where window.localStorage is unavailable
const memoryStorage = new Map<string, string>();

function getItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    // Ignore error in native sandbox
  }
  return memoryStorage.get(key) || null;
}

function setItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(key, value);
      return;
    }
  } catch (e) {
    // Ignore error in native sandbox
  }
  memoryStorage.set(key, value);
}

function clearItems(): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear();
    }
  } catch (e) {
    // Ignore error
  }
  memoryStorage.clear();
}

class LocalDatabase {
  // User Profile Storage
  getUserProfile(): UserProfile | null {
    const data = getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  }

  saveUserProfile(profile: UserProfile): void {
    setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  // Contacts / Peers Storage
  getContacts(): PeerNode[] {
    const data = getItem(STORAGE_KEYS.CONTACTS);
    return data ? JSON.parse(data) : [];
  }

  saveContact(peer: PeerNode): void {
    const contacts = this.getContacts();
    const index = contacts.findIndex((c) => c.fingerprint === peer.fingerprint);
    if (index >= 0) {
      contacts[index] = { ...contacts[index], ...peer };
    } else {
      contacts.push(peer);
    }
    setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }

  // Messages Storage
  getMessages(): ChatMessage[] {
    const data = getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  }

  getThreadMessages(threadId: string): ChatMessage[] {
    return this.getMessages().filter(
      (m) => m.threadId === threadId || m.senderId === threadId || m.recipientId === threadId
    );
  }

  saveMessage(msg: ChatMessage): void {
    const messages = this.getMessages();
    const existingIndex = messages.findIndex((m) => m.id === msg.id || m.packetId === msg.packetId);

    if (existingIndex >= 0) {
      messages[existingIndex] = { ...messages[existingIndex], ...msg };
    } else {
      messages.push(msg);
    }

    setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }

  updateMessageStatus(packetId: string, status: ChatMessage['status'], hopCount?: number, relayedVia?: string[]): void {
    const messages = this.getMessages();
    const msg = messages.find((m) => m.packetId === packetId);
    if (msg) {
      msg.status = status;
      if (hopCount !== undefined) msg.hopCount = hopCount;
      if (relayedVia) msg.relayedViaNodes = relayedVia;
      setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }
  }

  // Chat Threads List
  getChatThreads(): ChatThread[] {
    const contacts = this.getContacts();
    const messages = this.getMessages();

    const threadsMap = new Map<string, ChatThread>();

    contacts.forEach((contact) => {
      const threadMsgs = messages.filter(
        (m) => m.senderId === contact.fingerprint || m.recipientId === contact.fingerprint
      );

      threadMsgs.sort((a, b) => b.timestamp - a.timestamp);
      const lastMsg = threadMsgs[0];
      const unreadCount = threadMsgs.filter((m) => !m.isOutgoing && m.status !== 'delivered').length;

      threadsMap.set(contact.fingerprint, {
        contactId: contact.fingerprint,
        peer: contact,
        lastMessage: lastMsg,
        unreadCount,
        updatedAt: lastMsg ? lastMsg.timestamp : contact.lastSeen,
      });
    });

    return Array.from(threadsMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // Sliding Window Packet Deduplication Cache (Prevents Broadcast Loops)
  getDeduplicationCache(): string[] {
    const data = getItem(STORAGE_KEYS.DEDUP_CACHE);
    return data ? JSON.parse(data) : [];
  }

  addPacketToDedupCache(packetId: string): void {
    const cache = this.getDeduplicationCache();
    if (!cache.includes(packetId)) {
      cache.push(packetId);
      // Limit to 500 recent packets
      if (cache.length > 500) cache.shift();
      setItem(STORAGE_KEYS.DEDUP_CACHE, JSON.stringify(cache));
    }
  }

  isPacketDuplicate(packetId: string): boolean {
    const cache = this.getDeduplicationCache();
    return cache.includes(packetId);
  }

  // Network Metrics Storage
  getMetrics(): MeshMetrics {
    const data = getItem(STORAGE_KEYS.METRICS);
    return data
      ? JSON.parse(data)
      : {
          totalPacketsProcessed: 0,
          packetsRelayed: 0,
          packetsDroppedDuplicate: 0,
          packetsDroppedTTLExpired: 0,
          activeDirectPeers: 0,
          activeRelayedPeers: 0,
          bandwidthRelayedBytes: 0,
        };
  }

  saveMetrics(metrics: Partial<MeshMetrics>): void {
    const current = this.getMetrics();
    const updated = { ...current, ...metrics };
    setItem(STORAGE_KEYS.METRICS, JSON.stringify(updated));
  }

  clearAllData(): void {
    clearItems();
  }
}

export const db = new LocalDatabase();
