import React, { useState } from 'react';
import { Radio, ShieldCheck, Zap, UserPlus } from 'lucide-react';
import { PeerNode, UserProfile } from '../types/mesh';

interface RadarViewProps {
  userProfile: UserProfile;
  peers: PeerNode[];
  onSelectPeer: (peer: PeerNode) => void;
  onAddVirtualPeer: (name: string) => void;
  onUpdatePeerPosition: (fingerprint: string, x: number, y: number, hopsAway: number) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  userProfile,
  peers,
  onSelectPeer,
  onAddVirtualPeer,
  onUpdatePeerPosition,
}) => {
  const [selectedPeer, setSelectedPeer] = useState<PeerNode | null>(null);
  const [newPeerName, setNewPeerName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddPeerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPeerName.trim()) {
      onAddVirtualPeer(newPeerName.trim());
      setNewPeerName('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between p-4 max-w-4xl mx-auto min-h-[calc(100vh-80px)]">
      
      {/* Top Bar Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#ff7f5d] animate-pulse" />
            Nearby Bluetooth Discovery Radar
          </h2>
          <p className="text-xs text-[#b3b6e6]">
            Real-time BLE advert & multi-hop peer topology scanner
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#ff7f5d] hover:bg-[#e06847] text-white font-bold text-xs shadow-lg shadow-[#ff7f5d]/30 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Simulate Peer Node</span>
        </button>
      </div>

      {/* Radar Canvas / Visual Container */}
      <div className="relative w-full max-w-lg aspect-square bg-[#353782] rounded-3xl border border-[#ff7f5d]/40 p-4 shadow-2xl flex items-center justify-center overflow-hidden whatsapp-pattern">
        
        {/* Concentric Signal Rings */}
        <div className="absolute inset-4 rounded-full border border-[#ff7f5d]/30"></div>
        <div className="absolute inset-16 rounded-full border border-[#ff7f5d]/40 border-dashed"></div>
        <div className="absolute inset-28 rounded-full border border-[#ff7f5d]/30"></div>
        <div className="absolute inset-40 rounded-full border border-[#ff7f5d]/50 border-dotted"></div>

        {/* Pulse Animations */}
        <div className="absolute inset-20 rounded-full bg-[#ff7f5d]/10 animate-radar-pulse"></div>

        {/* Radar Sweep Line */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="w-full h-full animate-radar-sweep bg-gradient-to-r from-transparent via-[#ff7f5d]/20 to-transparent"></div>
        </div>

        {/* Center Node (Local User) */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff7f5d] to-[#ff9e85] p-1 shadow-lg shadow-[#ff7f5d]/40 animate-pulse-glow flex items-center justify-center">
            <div className="w-full h-full bg-[#43459b] rounded-full flex items-center justify-center font-bold text-white text-sm border border-white/30">
              YOU
            </div>
          </div>
          <span className="mt-1 text-[11px] font-bold text-white bg-[#2a2b69] px-2.5 py-0.5 rounded-full border border-[#ff7f5d]/40 shadow-sm">
            {userProfile.displayName}
          </span>
        </div>

        {/* Peer Nodes Plotting */}
        {peers.map((peer) => {
          const isDirect = peer.hopsAway === 1;
          const posX = peer.x !== undefined ? peer.x : 50;
          const posY = peer.y !== undefined ? peer.y : 50;

          return (
            <div
              key={peer.fingerprint}
              onClick={() => setSelectedPeer(peer)}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-30 group cursor-pointer transition-all duration-500"
            >
              <div className="relative flex flex-col items-center">
                
                {/* Node Avatar Indicator */}
                <div
                  style={{ backgroundColor: peer.avatarColor || '#ff7f5d' }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md border-2 transition-transform group-hover:scale-110 ${
                    isDirect ? 'border-[#ff7f5d] shadow-[#ff7f5d]/40' : 'border-white/60 shadow-black/20'
                  }`}
                >
                  {peer.avatarSymbol}
                </div>

                {/* Badge (Direct vs Relayed) */}
                <span
                  className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-md border transition-all ${
                    isDirect
                      ? 'bg-[#ff7f5d] text-white border-[#ff7f5d]'
                      : 'bg-[#2a2b69] text-white border-[#ff7f5d]/40'
                  }`}
                >
                  {isDirect ? 'Direct (1 Hop)' : `Relayed (${peer.hopsAway} Hops)`}
                </span>

                {/* Signal Strength Rings on Hover */}
                <div className="absolute -inset-2 rounded-full border border-[#ff7f5d]/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Stats Bar */}
      <div className="w-full mt-4 flex items-center justify-between bg-[#353782] p-3 rounded-2xl border border-[#ff7f5d]/30 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff7f5d] border border-white"></span>
            <span className="text-white">Direct Range BLE (&lt; 10m)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2a2b69] border border-[#ff7f5d]"></span>
            <span className="text-white">Multi-Hop Relayed Node</span>
          </div>
        </div>

        <span className="text-[#b3b6e6] font-mono text-[11px]">
          Total Mesh Peers: <strong className="text-[#ff7f5d]">{peers.length}</strong>
        </span>
      </div>

      {/* Selected Peer Inspector Drawer Modal */}
      {selectedPeer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#353782] border border-[#ff7f5d]/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div
                style={{ backgroundColor: selectedPeer.avatarColor || '#ff7f5d' }}
                className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg border-2 border-white mb-3"
              >
                {selectedPeer.avatarSymbol}
              </div>
              <h3 className="text-lg font-bold text-white">{selectedPeer.displayName}</h3>
              <p className="text-xs text-[#b3b6e6] font-mono mb-4">{selectedPeer.fingerprint}</p>

              {/* Hop & Connection Info */}
              <div className="w-full bg-[#2a2b69] rounded-2xl p-3 border border-[#ff7f5d]/30 space-y-2 text-xs text-left mb-5">
                <div className="flex justify-between">
                  <span className="text-[#b3b6e6]">Connection Mode:</span>
                  <span className="font-bold text-[#ff7f5d]">
                    {selectedPeer.hopsAway === 1 ? 'Direct Bluetooth BLE' : 'Multi-Hop Relay Mesh'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b3b6e6]">Hop Distance:</span>
                  <span className="font-bold text-white">{selectedPeer.hopsAway} Hops</span>
                </div>
                {selectedPeer.relayedVia && (
                  <div className="flex justify-between">
                    <span className="text-[#b3b6e6]">Relayed Via Node:</span>
                    <span className="font-bold text-[#ff9e85]">{selectedPeer.relayedVia}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#b3b6e6]">Signal RSSI:</span>
                  <span className="font-bold text-white">{selectedPeer.rssi} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b3b6e6]">Security Verification:</span>
                  <span className="font-bold text-[#ff7f5d] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#ff7f5d]" />
                    {selectedPeer.isVerified ? 'Verified E2EE Key' : 'Unverified Peer'}
                  </span>
                </div>
              </div>

              {/* Interactive Hop Distance Tester Controls */}
              <div className="w-full mb-5 text-left">
                <label className="text-[11px] font-medium text-[#b3b6e6] mb-1 block">
                  Simulate Distance / Hop Relaying:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onUpdatePeerPosition(selectedPeer.fingerprint, 30, 30, 1);
                      setSelectedPeer({ ...selectedPeer, hopsAway: 1, rssi: -48 });
                    }}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedPeer.hopsAway === 1
                        ? 'bg-[#ff7f5d] text-white border-[#ff7f5d]'
                        : 'bg-[#2a2b69] text-white border-[#ff7f5d]/30'
                    }`}
                  >
                    1 Hop (Direct)
                  </button>
                  <button
                    onClick={() => {
                      onUpdatePeerPosition(selectedPeer.fingerprint, 80, 25, 2);
                      setSelectedPeer({ ...selectedPeer, hopsAway: 2, rssi: -82, relayedVia: 'Kaelen Vance' });
                    }}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedPeer.hopsAway === 2
                        ? 'bg-[#ff7f5d] text-white border-[#ff7f5d]'
                        : 'bg-[#2a2b69] text-white border-[#ff7f5d]/30'
                    }`}
                  >
                    2 Hops
                  </button>
                  <button
                    onClick={() => {
                      onUpdatePeerPosition(selectedPeer.fingerprint, 15, 80, 3);
                      setSelectedPeer({ ...selectedPeer, hopsAway: 3, rssi: -94, relayedVia: 'Elena Rostova' });
                    }}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedPeer.hopsAway === 3
                        ? 'bg-[#ff7f5d] text-white border-[#ff7f5d]'
                        : 'bg-[#2a2b69] text-white border-[#ff7f5d]/30'
                    }`}
                  >
                    3 Hops
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 w-full">
                <button
                  onClick={() => setSelectedPeer(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2a2b69] text-white font-medium text-xs hover:bg-[#ff7f5d]/20 transition-all border border-[#ff7f5d]/30"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onSelectPeer(selectedPeer);
                    setSelectedPeer(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#ff7f5d] hover:bg-[#e06847] text-white font-bold text-xs shadow-lg shadow-[#ff7f5d]/40 transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  Open Encrypted Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Virtual Peer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#353782] border border-[#ff7f5d]/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Simulate Bluetooth Mesh Node</h3>
            <p className="text-xs text-[#b3b6e6] mb-4">
              Add a new virtual offline device node to test P2P mesh relaying.
            </p>

            <form onSubmit={handleAddPeerSubmit}>
              <input
                type="text"
                value={newPeerName}
                onChange={(e) => setNewPeerName(e.target.value)}
                placeholder="Enter Peer Display Name (e.g. Sarah Connor)"
                className="w-full bg-[#2a2b69] border border-[#ff7f5d]/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff7f5d] mb-5 placeholder-[#b3b6e6]/60"
                autoFocus
              />

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2a2b69] text-white font-medium text-xs hover:bg-[#ff7f5d]/20 border border-[#ff7f5d]/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#ff7f5d] hover:bg-[#e06847] text-white font-bold text-xs shadow-lg"
                >
                  Add to Mesh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
