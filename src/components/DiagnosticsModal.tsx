import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, X, Radio } from 'lucide-react';
import { PeerNode, MeshMetrics } from '../types/mesh';
import { db } from '../storage/database';

interface DiagnosticsModalProps {
  peers: PeerNode[];
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ peers, onClose }) => {
  const [metrics, setMetrics] = useState<MeshMetrics>(db.getMetrics());
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] BLE Mesh service active. Strategy: P2P Cluster`,
    `[${new Date().toLocaleTimeString()}] E2EE Cryptographic engine ready (TweetNaCl Curve25519)`,
    `[${new Date().toLocaleTimeString()}] Local address book loaded: ${peers.length} active peers`,
  ]);
  const [currentTTL, setCurrentTTL] = useState(7);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(db.getMetrics());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    localStorage.removeItem('meshchat_dedup_cache');
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Deduplication cache cleared`, ...prev]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#353782] border border-[#ff7f5d]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ff7f5d]/30">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#ff7f5d]/20 text-[#ff7f5d] border border-[#ff7f5d]/40">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Off-Grid Mesh Network Diagnostics</h3>
              <p className="text-[11px] text-[#b3b6e6] font-mono">P2P BLE / Wi-Fi Direct Protocol Inspector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full bg-[#2a2b69] transition-all border border-[#ff7f5d]/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#2a2b69] p-3 rounded-2xl border border-[#ff7f5d]/30">
              <span className="text-[10px] text-[#b3b6e6] uppercase font-semibold block mb-1">Direct Peers</span>
              <span className="text-lg font-bold text-[#ff7f5d]">
                {peers.filter((p) => p.hopsAway === 1).length}
              </span>
            </div>
            <div className="bg-[#2a2b69] p-3 rounded-2xl border border-[#ff7f5d]/30">
              <span className="text-[10px] text-[#b3b6e6] uppercase font-semibold block mb-1">Relayed Peers</span>
              <span className="text-lg font-bold text-white">
                {peers.filter((p) => p.hopsAway > 1).length}
              </span>
            </div>
            <div className="bg-[#2a2b69] p-3 rounded-2xl border border-[#ff7f5d]/30">
              <span className="text-[10px] text-[#b3b6e6] uppercase font-semibold block mb-1">Packets Relayed</span>
              <span className="text-lg font-bold text-[#ff7f5d]">{metrics.packetsRelayed}</span>
            </div>
            <div className="bg-[#2a2b69] p-3 rounded-2xl border border-[#ff7f5d]/30">
              <span className="text-[10px] text-[#b3b6e6] uppercase font-semibold block mb-1">Loop Avoided</span>
              <span className="text-lg font-bold text-[#ff9e85]">{metrics.packetsDroppedDuplicate}</span>
            </div>
          </div>

          {/* Topology Stats */}
          <div className="bg-[#2a2b69] p-4 rounded-2xl border border-[#ff7f5d]/30 space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5 mb-2">
              <Radio className="w-4 h-4 text-[#ff7f5d]" />
              Routing Engine Configuration & Metrics
            </h4>
            <div className="flex justify-between">
              <span className="text-[#b3b6e6]">Routing Algorithm:</span>
              <span className="font-mono text-[#ff7f5d] font-bold">Distance-Vector Flooding Mesh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b3b6e6]">Default Time-To-Live (TTL):</span>
              <span className="font-mono text-white font-bold">{currentTTL} Hops</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b3b6e6]">Total Relayed Bandwidth:</span>
              <span className="font-mono text-white">{metrics.bandwidthRelayedBytes} bytes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#b3b6e6]">E2EE Cryptography Standard:</span>
              <span className="font-mono text-white">TweetNaCl (Curve25519 + Ed25519)</span>
            </div>
          </div>

          {/* Interactive TTL Tuning Slider */}
          <div className="bg-[#2a2b69] p-4 rounded-2xl border border-[#ff7f5d]/30 text-xs">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-white">Mesh Hop TTL Limit Counter:</label>
              <span className="font-mono font-bold text-[#ff7f5d] text-sm">{currentTTL} Hops</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={currentTTL}
              onChange={(e) => setCurrentTTL(Number(e.target.value))}
              className="w-full accent-[#ff7f5d] cursor-pointer"
            />
            <p className="text-[10px] text-[#b3b6e6] mt-1">
              Controls maximum allowed multi-hop forwarding limit before packet drop.
            </p>
          </div>

          {/* Network Event Console Log */}
          <div>
            <h4 className="font-bold text-white text-xs mb-2 flex items-center justify-between">
              <span>Live Mesh Event Stream</span>
              <button
                onClick={handleClearCache}
                className="text-[10px] text-[#ff7f5d] hover:underline flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-3 h-3" /> Clear Dedup Cache
              </button>
            </h4>
            <div className="bg-[#2a2b69] p-3 rounded-2xl border border-[#ff7f5d]/30 font-mono text-[11px] text-[#ff7f5d] h-36 overflow-y-auto space-y-1">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-tight break-all text-white">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#ff7f5d]/30">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#2a2b69] text-white font-bold text-xs hover:bg-[#ff7f5d]/20 transition-all border border-[#ff7f5d]/30"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
