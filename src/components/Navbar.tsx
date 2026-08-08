import React from 'react';
import { WifiOff, Radio, QrCode, Activity, Settings, MessageSquare, ShieldCheck } from 'lucide-react';
import { UserProfile, PeerNode } from '../types/mesh';

interface NavbarProps {
  userProfile: UserProfile;
  activePeers: PeerNode[];
  activeTab: 'chats' | 'radar' | 'settings';
  setActiveTab: (tab: 'chats' | 'radar' | 'settings') => void;
  onOpenQRModal: () => void;
  onOpenDiagnostics: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  activePeers,
  activeTab,
  setActiveTab,
  onOpenQRModal,
  onOpenDiagnostics,
}) => {
  const directPeersCount = activePeers.filter((p) => p.hopsAway === 1).length;
  const relayedPeersCount = activePeers.filter((p) => p.hopsAway > 1).length;

  return (
    <header className="sticky top-0 z-30 bg-[#353782]/95 backdrop-blur-md border-b border-[#ff7f5d]/30 px-4 py-3 shadow-xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand & Offline Status */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff7f5d] to-[#ff9e85] p-0.5 shadow-lg shadow-[#ff7f5d]/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#43459b] rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-[#ff7f5d] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white">
                MeshChat
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ff7f5d]/20 text-[#ff7f5d] border border-[#ff7f5d]/40">
                <WifiOff className="w-3 h-3 mr-1 text-[#ff7f5d]" />
                100% OFF-GRID
              </span>
            </div>
            <p className="text-[11px] text-[#b3b6e6] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#ff7f5d]" />
              E2EE Bluetooth Mesh • {userProfile.keys.fingerprint}
            </p>
          </div>
        </div>

        {/* Mesh Peer Counter & Navigation Actions */}
        <div className="flex items-center space-x-2">
          
          {/* Peer Count Indicator */}
          <button
            onClick={() => setActiveTab('radar')}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#2a2b69] hover:bg-[#353782] border border-[#ff7f5d]/30 transition-all text-xs text-white"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff7f5d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff7f5d]"></span>
            </span>
            <span>
              <strong className="text-[#ff7f5d]">{directPeersCount}</strong> Direct •{' '}
              <strong className="text-white">{relayedPeersCount}</strong> Relayed
            </span>
          </button>

          {/* Tab Switches */}
          <div className="flex items-center bg-[#2a2b69] p-1 rounded-xl border border-[#ff7f5d]/20">
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'chats'
                  ? 'bg-[#ff7f5d] text-white shadow-md font-bold'
                  : 'text-[#b3b6e6] hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Chats</span>
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-[#ff7f5d] text-white shadow-md font-bold'
                  : 'text-[#b3b6e6] hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Radar</span>
            </button>
          </div>

          {/* Quick Action Tools */}
          <button
            onClick={onOpenQRModal}
            title="In-Person Key Pairing QR"
            className="p-2 rounded-xl bg-[#2a2b69] hover:bg-[#ff7f5d]/20 border border-[#ff7f5d]/30 text-[#ff7f5d] transition-all"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenDiagnostics}
            title="Off-Grid Mesh Diagnostics"
            className="p-2 rounded-xl bg-[#2a2b69] hover:bg-[#ff7f5d]/20 border border-[#ff7f5d]/30 text-white transition-all"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            title="Settings"
            className={`p-2 rounded-xl bg-[#2a2b69] border border-[#ff7f5d]/30 transition-all ${
              activeTab === 'settings' ? 'text-[#ff7f5d] border-[#ff7f5d]' : 'text-[#b3b6e6] hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
