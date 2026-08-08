import React from 'react';
import { UserProfile } from '../types/mesh';
import { ShieldCheck, QrCode, Activity, Key, Trash2, WifiOff, Lock, Check } from 'lucide-react';
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
      <div className="bg-[#111b21] p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex items-center space-x-4">
        <div
          style={{ backgroundColor: userProfile.avatarColor }}
          className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-lg border-2 border-emerald-400 flex-shrink-0"
        >
          {userProfile.avatarSymbol}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-100 truncate">{userProfile.displayName}</h2>
          <p className="text-xs text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Fingerprint: {userProfile.keys.fingerprint}
          </p>
          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded-full border border-emerald-500/30 font-semibold">
            0 Internet • Local Device Cryptographic Identity
          </span>
        </div>
      </div>

      {/* Security & Cryptography Box */}
      <div className="bg-[#111b21] p-5 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-400" />
          TweetNaCl Asymmetric Cryptography Specifications
        </h3>

        <div className="bg-[#0b141a] p-3 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Curve25519 Box Encryption PubKey:</span>
            <span className="text-slate-200 truncate max-w-[200px]">
              {userProfile.keys.boxPublicKey.slice(0, 16)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ed25519 Signing Identity PubKey:</span>
            <span className="text-slate-200 truncate max-w-[200px]">
              {userProfile.keys.signPublicKey.slice(0, 16)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Intermediate Relay Decryption:</span>
            <span className="text-amber-400 font-bold">Impossible (E2EE Protected)</span>
          </div>
        </div>
      </div>

      {/* Tools & Utilities */}
      <div className="bg-[#111b21] p-5 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Security & Mesh Tools</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onOpenQR}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] border border-slate-700/50 text-left transition-all"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs text-white">QR Code Key Pairing</strong>
              <span className="text-[10px] text-slate-400">In-person public key exchange</span>
            </div>
          </button>

          <button
            onClick={onOpenDiagnostics}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] border border-slate-700/50 text-left transition-all"
          >
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs text-white">Off-Grid Mesh Diagnostics</strong>
              <span className="text-[10px] text-slate-400">Topology & hop metrics</span>
            </div>
          </button>
        </div>
      </div>

      {/* Reset Storage */}
      <div className="bg-[#111b21] p-5 rounded-3xl border border-red-900/30 space-y-3">
        <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
        <p className="text-xs text-slate-400">
          Wipe local device storage, contacts, local cryptographic keys, and offline message history.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to erase local cryptographic keys and chat history?')) {
              db.clearAllData();
              onResetApp();
            }
          }}
          className="flex items-center justify-center space-x-2 w-full py-3 rounded-2xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/40 text-xs font-semibold transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>Purge Local Cryptographic Vault</span>
        </button>
      </div>

    </div>
  );
};
