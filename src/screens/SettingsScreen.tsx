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
    <div className="max-w-2xl mx-auto p-4 space-y-6 min-h-[calc(100vh-80px)]">
      
      {/* User Identity Profile Card */}
      <div className="bg-[#353782] p-6 rounded-3xl border border-[#ff7f5d]/40 shadow-xl flex items-center space-x-4">
        <div
          style={{ backgroundColor: userProfile.avatarColor || '#ff7f5d' }}
          className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-lg border-2 border-white flex-shrink-0"
        >
          {userProfile.avatarSymbol}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-white truncate">{userProfile.displayName}</h2>
          <p className="text-xs text-[#ff7f5d] font-mono flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Fingerprint: {userProfile.keys.fingerprint}
          </p>
          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-[#2a2b69] text-white rounded-full border border-[#ff7f5d]/30 font-semibold">
            0 Internet • Local Device Cryptographic Identity
          </span>
        </div>
      </div>

      {/* Security & Cryptography Box */}
      <div className="bg-[#353782] p-5 rounded-3xl border border-[#ff7f5d]/30 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-[#ff7f5d]" />
          TweetNaCl Asymmetric Cryptography Specifications
        </h3>

        <div className="bg-[#2a2b69] p-3 rounded-2xl border border-[#ff7f5d]/20 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-[#b3b6e6]">Curve25519 Box Encryption PubKey:</span>
            <span className="text-white truncate max-w-[200px]">
              {userProfile.keys.boxPublicKey.slice(0, 16)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#b3b6e6]">Ed25519 Signing Identity PubKey:</span>
            <span className="text-white truncate max-w-[200px]">
              {userProfile.keys.signPublicKey.slice(0, 16)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#b3b6e6]">Intermediate Relay Decryption:</span>
            <span className="text-[#ff7f5d] font-bold">Impossible (E2EE Protected)</span>
          </div>
        </div>
      </div>

      {/* Tools & Utilities */}
      <div className="bg-[#353782] p-5 rounded-3xl border border-[#ff7f5d]/30 space-y-3">
        <h3 className="text-sm font-bold text-white">Security & Mesh Tools</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onOpenQR}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#2a2b69] hover:bg-[#ff7f5d]/20 border border-[#ff7f5d]/30 text-left transition-all"
          >
            <div className="p-2 rounded-xl bg-[#ff7f5d]/20 text-[#ff7f5d]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs text-white">QR Code Key Pairing</strong>
              <span className="text-[10px] text-[#b3b6e6]">In-person public key exchange</span>
            </div>
          </button>

          <button
            onClick={onOpenDiagnostics}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#2a2b69] hover:bg-[#ff7f5d]/20 border border-[#ff7f5d]/30 text-left transition-all"
          >
            <div className="p-2 rounded-xl bg-[#ff7f5d]/20 text-white">
              <Activity className="w-5 h-5 text-[#ff7f5d]" />
            </div>
            <div>
              <strong className="block text-xs text-white">Off-Grid Mesh Diagnostics</strong>
              <span className="text-[10px] text-[#b3b6e6]">Topology & hop metrics</span>
            </div>
          </button>
        </div>
      </div>

      {/* Reset Storage */}
      <div className="bg-[#353782] p-5 rounded-3xl border border-red-500/40 space-y-3">
        <h3 className="text-sm font-bold text-red-300">Danger Zone</h3>
        <p className="text-xs text-[#b3b6e6]">
          Wipe local device storage, contacts, local cryptographic keys, and offline message history.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to erase local cryptographic keys and chat history?')) {
              db.clearAllData();
              onResetApp();
            }
          }}
          className="flex items-center justify-center space-x-2 w-full py-3 rounded-2xl bg-red-950/80 hover:bg-red-900 text-white border border-red-500/50 text-xs font-bold transition-all"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
          <span>Purge Local Cryptographic Vault</span>
        </button>
      </div>

    </div>
  );
};
