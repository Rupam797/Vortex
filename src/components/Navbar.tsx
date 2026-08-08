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
    <header className="sticky top-0 z-30 bg-[#111b21]/90 backdrop-blur-md border-b border-emerald-900/30 px-4 py-3 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand & Offline Status */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-[#0b141a] rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                MeshChat
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                <WifiOff className="w-3 h-3 mr-1 text-emerald-400" />
                100% OFF-GRID
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              E2EE Bluetooth Mesh • {userProfile.keys.fingerprint}
            </p>
          </div>
        </div>

        {/* Mesh Peer Counter & Navigation Actions */}
        <div className="flex items-center space-x-2">
          
          {/* Peer Count Indicator */}
          <button
            onClick={() => setActiveTab('radar')}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-slate-700/50 transition-all text-xs text-slate-200"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              <strong className="text-emerald-400">{directPeersCount}</strong> Direct •{' '}
              <strong className="text-teal-300">{relayedPeersCount}</strong> Relayed
            </span>
          </button>

          {/* Tab Switches */}
          <div className="flex items-center bg-[#202c33] p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'chats'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Chats</span>
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
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
            className="p-2 rounded-xl bg-[#202c33] hover:bg-emerald-950/60 hover:border-emerald-500/40 border border-slate-700/50 text-emerald-400 transition-all"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenDiagnostics}
            title="Off-Grid Mesh Diagnostics"
            className="p-2 rounded-xl bg-[#202c33] hover:bg-emerald-950/60 hover:border-emerald-500/40 border border-slate-700/50 text-teal-400 transition-all"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            title="Settings"
            className={`p-2 rounded-xl bg-[#202c33] border border-slate-700/50 transition-all ${
              activeTab === 'settings' ? 'text-emerald-400 border-emerald-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
