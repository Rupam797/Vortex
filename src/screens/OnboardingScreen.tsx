import React, { useState } from 'react';
import { Radio, ShieldCheck, Key, ArrowRight, Lock, WifiOff } from 'lucide-react';
import { generateUserKeys, getAvatarColor } from '../crypto/e2ee';
import { UserProfile } from '../types/mesh';
import { db } from '../storage/database';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [displayName, setDisplayName] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setGenerating(true);

    setTimeout(() => {
      // Generate ECC Curve25519 & Ed25519 Cryptographic Keys locally
      const keys = generateUserKeys();
      const color = getAvatarColor(keys.fingerprint);
      const symbol = displayName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'ME';

      const profile: UserProfile = {
        id: keys.fingerprint,
        displayName: displayName.trim(),
        avatarColor: color,
        avatarSymbol: symbol,
        keys,
        createdAt: Date.now(),
      };

      db.saveUserProfile(profile);
      setGenerating(false);
      onComplete(profile);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col justify-center items-center p-4 whatsapp-pattern">
      <div className="max-w-md w-full glass-modal p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        
        {/* Glow background pill */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-950/60 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b141a] rounded-[14px] flex items-center justify-center">
              <Radio className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
            MeshChat
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5 justify-center">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            0 Internet • 0 Server • 100% Off-Grid Bluetooth Mesh
          </p>
        </div>

        {/* Key Gen Form */}
        <form onSubmit={handleCreateProfile} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Local Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Commander Shepherd"
              className="w-full bg-[#111b21] border border-slate-700/60 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              No phone number, email, or cloud server account required.
            </p>
          </div>

          {/* Cryptographic Key Gen Specs Notice */}
          <div className="bg-[#0b141a] border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>TweetNaCl ECC Asymmetric Cryptography</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Upon entry, your device will generate a local 256-bit Curve25519 Encryption Key Pair and Ed25519 Digital Signing Identity Pair.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating || !displayName.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Key className="w-4 h-4 animate-spin text-emerald-300" />
                <span>Generating Cryptographic Key Pairs...</span>
              </>
            ) : (
              <>
                <span>Generate Keys & Enter Mesh</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
