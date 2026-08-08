import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { CryptographicKeys } from '../types/mesh';

const { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } = naclUtil;

/**
 * TweetNaCl End-to-End Encryption (E2EE) Cryptographic Utility Module.
 * - Curve25519 for authenticated public key box encryption (nacl.box)
 * - Ed25519 for digital identity signatures (nacl.sign)
 * - SHA-256 styled fingerprints for QR verification
 */

/**
 * Generates local user ECC Key Pairs (Box + Sign) upon first app launch.
 */
export function generateUserKeys(): CryptographicKeys {
  // Generate Box KeyPair (Curve25519 for asymmetric encryption)
  const boxKeyPair = nacl.box.keyPair();

  // Generate Sign KeyPair (Ed25519 for identity & payload signing)
  const signKeyPair = nacl.sign.keyPair();

  const boxPublicKey = encodeBase64(boxKeyPair.publicKey);
  const boxSecretKey = encodeBase64(boxKeyPair.secretKey);
  const signPublicKey = encodeBase64(signKeyPair.publicKey);
  const signSecretKey = encodeBase64(signKeyPair.secretKey);

  const fingerprint = generateFingerprint(signPublicKey);

  return {
    boxPublicKey,
    boxSecretKey,
    signPublicKey,
    signSecretKey,
    fingerprint,
  };
}

/**
 * Formats a public key into a clean, human-readable 16-character fingerprint badge.
 * Example: "4A8F-9C12-E03B-77FA"
 */
export function generateFingerprint(publicKeyBase64: string): string {
  let hash = 0;
  for (let i = 0; i < publicKeyBase64.length; i++) {
    const char = publicKeyBase64.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(16, 'A');
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

/**
 * Encrypts a plaintext message for a specific recipient using TweetNaCl nacl.box.
 * Returns { ciphertext, nonce } in Base64 encoding.
 */
export function encryptPayload(
  plaintext: string,
  recipientBoxPubKeyBase64: string,
  senderBoxSecretKeyBase64: string
): { ciphertext: string; nonce: string } {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = decodeUTF8(plaintext); // string -> Uint8Array
  const recipientBoxPubKeyUint8 = decodeBase64(recipientBoxPubKeyBase64); // base64 string -> Uint8Array
  const senderBoxSecretKeyUint8 = decodeBase64(senderBoxSecretKeyBase64); // base64 string -> Uint8Array

  const encryptedUint8 = nacl.box(
    messageUint8,
    nonce,
    recipientBoxPubKeyUint8,
    senderBoxSecretKeyUint8
  );

  return {
    ciphertext: encodeBase64(encryptedUint8),
    nonce: encodeBase64(nonce),
  };
}

/**
 * Decrypts an incoming encrypted ciphertext from a sender using TweetNaCl nacl.box.open.
 * Intermediate relay nodes WILL FAIL decryption here because they lack the recipient's secret key!
 */
export function decryptPayload(
  ciphertextBase64: string,
  nonceBase64: string,
  senderBoxPubKeyBase64: string,
  recipientBoxSecretKeyBase64: string
): string | null {
  try {
    const ciphertextUint8 = decodeBase64(ciphertextBase64);
    const nonceUint8 = decodeBase64(nonceBase64);
    const senderBoxPubKeyUint8 = decodeBase64(senderBoxPubKeyBase64);
    const recipientBoxSecretKeyUint8 = decodeBase64(recipientBoxSecretKeyBase64);

    const decryptedUint8 = nacl.box.open(
      ciphertextUint8,
      nonceUint8,
      senderBoxPubKeyUint8,
      recipientBoxSecretKeyUint8
    );

    if (!decryptedUint8) {
      return null; // Decryption failed (invalid key or tampered payload)
    }

    return encodeUTF8(decryptedUint8); // Uint8Array -> string
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Signs a packet header and payload with the sender's Ed25519 private key.
 */
export function signMessage(messageData: string, signSecretKeyBase64: string): string {
  const messageUint8 = decodeUTF8(messageData); // string -> Uint8Array
  const signSecretKeyUint8 = decodeBase64(signSecretKeyBase64); // base64 string -> Uint8Array
  const signatureUint8 = nacl.sign.detached(messageUint8, signSecretKeyUint8);
  return encodeBase64(signatureUint8);
}

/**
 * Verifies that a message signature matches the sender's Ed25519 public key.
 */
export function verifySignature(
  messageData: string,
  signatureBase64: string,
  senderSignPubKeyBase64: string
): boolean {
  try {
    const messageUint8 = decodeUTF8(messageData); // string -> Uint8Array
    const signatureUint8 = decodeBase64(signatureBase64);
    const senderSignPubKeyUint8 = decodeBase64(senderSignPubKeyBase64);
    return nacl.sign.detached.verify(messageUint8, signatureUint8, senderSignPubKeyUint8);
  } catch (error) {
    return false;
  }
}

/**
 * Utility to create a deterministic SHA-like color for avatars from public key fingerprint.
 */
export function getAvatarColor(fingerprint: string): string {
  const colors = [
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#14b8a6', // Teal
    '#f97316', // Orange
  ];
  let sum = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    sum += fingerprint.charCodeAt(i);
  }
  return colors[sum % colors.length];
}
