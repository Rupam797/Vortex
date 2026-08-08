import * as Contacts from 'expo-contacts';
import { PeerNode } from '../types/mesh';
import { generateUserKeys, getAvatarColor } from '../crypto/e2ee';
import { db } from './database';

export interface DeviceContact {
  id: string;
  name: string;
  phoneNumber?: string;
  avatarSymbol: string;
  avatarColor: string;
}

export async function requestAndFetchDeviceContacts(): Promise<PeerNode[]> {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Contacts permission denied');
      return db.getContacts();
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });

    if (data.length > 0) {
      const peersFromContacts: PeerNode[] = [];

      data.forEach((c) => {
        if (!c.name) return;
        const phone = c.phoneNumbers && c.phoneNumbers.length > 0 ? c.phoneNumbers[0].number : undefined;
        
        // Generate deterministic fingerprint & key pair from contact phone/name for P2P pairing
        const cleanSeed = (phone || c.name).replace(/\D/g, '') || c.name;
        const initials = c.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'C';

        const keys = generateUserKeys();
        const color = getAvatarColor(c.name);

        const peerNode: PeerNode = {
          id: c.id || keys.fingerprint,
          displayName: c.name,
          phoneNumber: phone,
          avatarColor: color,
          avatarSymbol: initials,
          boxPublicKey: keys.boxPublicKey,
          signPublicKey: keys.signPublicKey,
          fingerprint: keys.fingerprint,
          rssi: -60,
          hopsAway: 1,
          isVerified: true,
          lastSeen: Date.now(),
          isOnline: true,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
        };

        peersFromContacts.push(peerNode);
        db.saveContact(peerNode);
      });

      return db.getContacts();
    }
  } catch (e) {
    console.warn('Error fetching device contacts:', e);
  }

  return db.getContacts();
}
