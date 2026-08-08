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
    <div className="min-h-screen bg-[#43459b] flex flex-col justify-center items-center p-4 whatsapp-pattern">
      <div className="max-w-md w-full glass-modal p-8 rounded-3xl border border-[#ff7f5d]/40 shadow-2xl relative overflow-hidden bg-[#353782]">
        
        {/* Glow background pill */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#ff7f5d]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff7f5d] to-[#ff9e85] p-0.5 shadow-xl shadow-[#ff7f5d]/30 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-[#43459b] rounded-[14px] flex items-center justify-center">
              <Radio className="w-8 h-8 text-[#ff7f5d] animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white tracking-wide">
            MeshChat
          </h1>
          <p className="text-xs text-[#b3b6e6] mt-1 font-medium flex items-center gap-1.5 justify-center">
            <WifiOff className="w-3.5 h-3.5 text-[#ff7f5d]" />
            0 Internet • 0 Server • 100% Off-Grid Bluetooth Mesh
          </p>
        </div>

        {/* Key Gen Form */}
        <form onSubmit={handleCreateProfile} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-white mb-2">
              Local Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Commander Shepherd"
              className="w-full bg-[#2a2b69] border border-[#ff7f5d]/40 rounded-2xl px-4 py-3 text-white placeholder-[#b3b6e6]/60 text-sm focus:outline-none focus:border-[#ff7f5d] transition-all"
            />
            <p className="text-[11px] text-[#b3b6e6] mt-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#ff7f5d]" />
              No phone number, email, or cloud server account required.
            </p>
          </div>

          {/* Cryptographic Key Gen Specs Notice */}
          <div className="bg-[#2a2b69] border border-[#ff7f5d]/20 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-[#ff7f5d] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>TweetNaCl ECC Asymmetric Cryptography</span>
            </div>
            <p className="text-[#b3b6e6] text-[11px] leading-relaxed">
              Upon entry, your device will generate a local 256-bit Curve25519 Encryption Key Pair and Ed25519 Digital Signing Identity Pair.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating || !displayName.trim()}
            className="w-full py-3.5 rounded-2xl bg-[#ff7f5d] hover:bg-[#e06847] text-white font-bold text-sm shadow-xl shadow-[#ff7f5d]/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Key className="w-4 h-4 animate-spin text-white" />
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
