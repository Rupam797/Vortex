import React from 'react';
import { UserProfile } from '../types/mesh';
import { ShieldCheck, QrCode, Activity, Key, Trash2 } from 'lucide-react';
import { db } from '../storage/database';

interface SettingsScreenProps {
  userProfile: UserProfile;
  onOpenQR: () => void;
  onOpenDiagnostics: () => void;
  onResetApp: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userProfile,
  onOpenQR,
  onOpenDiagnostics,
  onResetApp,
}) => {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 min-h-[calc(100vh-80px)] bg-[#ffffff]">
      
      {/* User Identity Profile Card */}
      <div className="bg-[#ff7f5d] p-6 rounded-3xl border border-[#43459b]/20 shadow-xl flex items-center space-x-4 text-white">
        <div
          style={{ backgroundColor: userProfile.avatarColor || '#43459b' }}
          className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-lg border-2 border-white flex-shrink-0"
        >
          {userProfile.avatarSymbol}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-white truncate">{userProfile.displayName}</h2>
          <p className="text-xs text-white font-mono flex items-center gap-1 mt-0.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Fingerprint: {userProfile.keys.fingerprint}
          </p>
          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-[#43459b] text-white rounded-full font-bold">
            0 Internet • Local Device Cryptographic Identity
          </span>
        </div>
      </div>

      {/* Security & Cryptography Box */}
      <div className="bg-[#ff7f5d] p-5 rounded-3xl border border-[#43459b]/20 space-y-3 text-white shadow-md">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-white" />
          TweetNaCl Asymmetric Cryptography Specifications
        </h3>

        <div className="bg-[#43459b] p-3 rounded-2xl border border-white/20 space-y-2 text-xs font-mono text-white">
          <div className="flex justify-between">
            <span className="text-white/80">Curve25519 Box Encryption PubKey:</span>
            <span className="text-white font-bold truncate max-w-[200px]">
              {userProfile.keys.boxPublicKey.slice(0, 16)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Ed25519 Signing Identity PubKey:</span>
            <span className="text-white font-bold truncate max-w-[200px]">
              {userProfile.keys.signPublicKey.slice(0, 16)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/80">Intermediate Relay Decryption:</span>
            <span className="text-[#ff7f5d] font-extrabold bg-white px-2 py-0.5 rounded">Impossible (E2EE Protected)</span>
          </div>
        </div>
      </div>

      {/* Tools & Utilities */}
      <div className="bg-[#ff7f5d] p-5 rounded-3xl border border-[#43459b]/20 space-y-3 text-white shadow-md">
        <h3 className="text-sm font-bold text-white">Security & Mesh Tools</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onOpenQR}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#43459b] hover:bg-[#303273] text-left transition-all text-white shadow-sm"
          >
            <div className="p-2 rounded-xl bg-white text-[#ff7f5d]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs text-white">QR Code Key Pairing</strong>
              <span className="text-[10px] text-white/80">In-person public key exchange</span>
            </div>
          </button>

          <button
            onClick={onOpenDiagnostics}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#43459b] hover:bg-[#303273] text-left transition-all text-white shadow-sm"
          >
            <div className="p-2 rounded-xl bg-white text-[#ff7f5d]">
              <Activity className="w-5 h-5 text-[#ff7f5d]" />
            </div>
            <div>
              <strong className="block text-xs text-white">Off-Grid Mesh Diagnostics</strong>
              <span className="text-[10px] text-white/80">Topology & hop metrics</span>
            </div>
          </button>
        </div>
      </div>

      {/* Reset Storage */}
      <div className="bg-[#ff7f5d] p-5 rounded-3xl border border-[#43459b]/20 space-y-3 text-white shadow-md">
        <h3 className="text-sm font-bold text-white">Danger Zone</h3>
        <p className="text-xs text-white/90 font-medium">
          Wipe local device storage, contacts, local cryptographic keys, and offline message history.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to erase local cryptographic keys and chat history?')) {
              db.clearAllData();
              onResetApp();
            }
          }}
          className="flex items-center justify-center space-x-2 w-full py-3 rounded-2xl bg-[#43459b] hover:bg-[#303273] text-white text-xs font-bold transition-all shadow-md"
        >
          <Trash2 className="w-4 h-4 text-white" />
          <span>Purge Local Cryptographic Vault</span>
        </button>
      </div>

    </div>
  );
};
