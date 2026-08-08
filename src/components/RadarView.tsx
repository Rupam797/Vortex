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
    <div className="flex flex-col items-center justify-between p-4 max-w-4xl mx-auto min-h-[calc(100vh-80px)] bg-[#ffffff]">
      
      {/* Top Bar Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#43459b] flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#ff7f5d] animate-pulse" />
            Nearby Bluetooth Discovery Radar
          </h2>
          <p className="text-xs text-[#43459b]/80 font-medium">
            Real-time BLE advert & multi-hop peer topology scanner
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#ff7f5d] hover:bg-[#e06847] text-white font-bold text-xs shadow-lg transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Simulate Peer Node</span>
        </button>
      </div>

      {/* Radar Canvas / Visual Container */}
      <div className="relative w-full max-w-lg aspect-square bg-[#ff7f5d] rounded-3xl border-2 border-[#43459b]/20 p-4 shadow-2xl flex items-center justify-center overflow-hidden whatsapp-pattern">
        
        {/* Concentric Signal Rings */}
        <div className="absolute inset-4 rounded-full border border-[#43459b]/30"></div>
        <div className="absolute inset-16 rounded-full border border-[#43459b]/40 border-dashed"></div>
        <div className="absolute inset-28 rounded-full border border-[#43459b]/30"></div>
        <div className="absolute inset-40 rounded-full border border-[#43459b]/50 border-dotted"></div>

        {/* Pulse Animations */}
        <div className="absolute inset-20 rounded-full bg-[#43459b]/20 animate-radar-pulse"></div>

        {/* Radar Sweep Line */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="w-full h-full animate-radar-sweep bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        {/* Center Node (Local User) */}
        <div className="relative z-20 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[#43459b] p-1 shadow-lg animate-pulse-glow flex items-center justify-center border-2 border-white">
            <div className="w-full h-full bg-[#43459b] rounded-full flex items-center justify-center font-bold text-white text-sm">
              YOU
            </div>
          </div>
          <span className="mt-1 text-[11px] font-bold text-white bg-[#43459b] px-2.5 py-0.5 rounded-full shadow-md">
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
                  style={{ backgroundColor: peer.avatarColor || '#43459b' }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md border-2 transition-transform group-hover:scale-110 ${
                    isDirect ? 'border-white shadow-white/40' : 'border-[#43459b] shadow-black/20'
                  }`}
                >
                  {peer.avatarSymbol}
                </div>

                {/* Badge (Direct vs Relayed) */}
                <span
                  className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md border transition-all ${
                    isDirect
                      ? 'bg-[#43459b] text-white border-white'
                      : 'bg-white text-[#43459b] border-[#43459b]'
                  }`}
                >
                  {isDirect ? 'Direct (1 Hop)' : `Relayed (${peer.hopsAway} Hops)`}
                </span>

                {/* Signal Strength Rings on Hover */}
                <div className="absolute -inset-2 rounded-full border border-white/60 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Stats Bar */}
      <div className="w-full mt-4 flex items-center justify-between bg-[#ff7f5d] p-3.5 rounded-2xl border border-[#43459b]/20 text-xs text-white shadow-md font-semibold">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#43459b] border border-white"></span>
            <span>Direct Range BLE (&lt; 10m)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-white border border-[#43459b]"></span>
            <span>Multi-Hop Relayed Node</span>
          </div>
        </div>

        <span className="font-mono text-[11px]">
          Total Mesh Peers: <strong className="text-white font-extrabold">{peers.length}</strong>
        </span>
      </div>

      {/* Selected Peer Inspector Drawer Modal */}
      {selectedPeer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#ff7f5d] border-2 border-[#43459b] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-white">
            <div className="flex flex-col items-center text-center">
              <div
                style={{ backgroundColor: selectedPeer.avatarColor || '#43459b' }}
                className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg border-2 border-white mb-3"
              >
                {selectedPeer.avatarSymbol}
              </div>
              <h3 className="text-lg font-bold text-white">{selectedPeer.displayName}</h3>
              <p className="text-xs text-white/90 font-mono mb-4">{selectedPeer.fingerprint}</p>

              {/* Hop & Connection Info */}
              <div className="w-full bg-[#43459b] rounded-2xl p-3 border border-white/20 space-y-2 text-xs text-left mb-5">
                <div className="flex justify-between">
                  <span className="text-white/80">Connection Mode:</span>
                  <span className="font-bold text-white">
                    {selectedPeer.hopsAway === 1 ? 'Direct Bluetooth BLE' : 'Multi-Hop Relay Mesh'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Hop Distance:</span>
                  <span className="font-bold text-white">{selectedPeer.hopsAway} Hops</span>
                </div>
                {selectedPeer.relayedVia && (
                  <div className="flex justify-between">
                    <span className="text-white/80">Relayed Via Node:</span>
                    <span className="font-bold text-[#ff7f5d] bg-white px-1.5 rounded">{selectedPeer.relayedVia}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/80">Signal RSSI:</span>
                  <span className="font-bold text-white">{selectedPeer.rssi} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Security Verification:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    {selectedPeer.isVerified ? 'Verified E2EE Key' : 'Unverified Peer'}
                  </span>
                </div>
              </div>

              {/* Interactive Hop Distance Tester Controls */}
              <div className="w-full mb-5 text-left">
                <label className="text-[11px] font-bold text-white mb-1 block">
                  Simulate Distance / Hop Relaying:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onUpdatePeerPosition(selectedPeer.fingerprint, 30, 30, 1);
                      setSelectedPeer({ ...selectedPeer, hopsAway: 1, rssi: -48 });
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedPeer.hopsAway === 1
                        ? 'bg-[#43459b] text-white border-white'
                        : 'bg-white text-[#43459b] border-[#43459b]'
                    }`}
                  >
                    1 Hop (Direct)
                  </button>
                  <button
                    onClick={() => {
                      onUpdatePeerPosition(selectedPeer.fingerprint, 80, 25, 2);
                      setSelectedPeer({ ...selectedPeer, hopsAway: 2, rssi: -82, relayedVia: 'Kaelen Vance' });
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedPeer.hopsAway === 2
                        ? 'bg-[#43459b] text-white border-white'
                        : 'bg-white text-[#43459b] border-[#43459b]'
                    }`}
                  >
                    2 Hops
                  </button>
                  <button
                    onClick={() => {
                      onUpdatePeerPosition(selectedPeer.fingerprint, 15, 80, 3);
                      setSelectedPeer({ ...selectedPeer, hopsAway: 3, rssi: -94, relayedVia: 'Elena Rostova' });
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedPeer.hopsAway === 3
                        ? 'bg-[#43459b] text-white border-white'
                        : 'bg-white text-[#43459b] border-[#43459b]'
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
                  className="flex-1 py-2.5 rounded-xl bg-white text-[#43459b] font-bold text-xs hover:bg-white/90 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onSelectPeer(selectedPeer);
                    setSelectedPeer(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#43459b] hover:bg-[#303273] text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
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
          <div className="bg-[#ff7f5d] border-2 border-[#43459b] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-white">
            <h3 className="text-lg font-bold text-white mb-2">Simulate Bluetooth Mesh Node</h3>
            <p className="text-xs text-white/90 mb-4 font-medium">
              Add a new virtual offline device node to test P2P mesh relaying.
            </p>

            <form onSubmit={handleAddPeerSubmit}>
              <input
                type="text"
                value={newPeerName}
                onChange={(e) => setNewPeerName(e.target.value)}
                placeholder="Enter Peer Display Name (e.g. Sarah Connor)"
                className="w-full bg-[#ffffff] border border-[#43459b] rounded-xl px-4 py-2.5 text-sm text-[#43459b] focus:outline-none mb-5 placeholder-[#43459b]/60 font-semibold"
                autoFocus
              />

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white text-[#43459b] font-bold text-xs hover:bg-white/90"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#43459b] hover:bg-[#303273] text-white font-bold text-xs shadow-lg"
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
