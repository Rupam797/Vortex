import React, { useState } from 'react';
import { Search, Radio, MessageSquare, ShieldCheck, CheckCheck, UserPlus, Clock } from 'lucide-react';
import { ChatThread, PeerNode, UserProfile } from '../types/mesh';

interface ChatListScreenProps {
  userProfile: UserProfile;
  threads: ChatThread[];
  activePeers: PeerNode[];
  onSelectThread: (peer: PeerNode) => void;
  onOpenRadar: () => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  userProfile,
  threads,
  activePeers,
  onSelectThread,
  onOpenRadar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = threads.filter((t) =>
    t.peer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.peer.fingerprint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] max-w-4xl mx-auto p-4 space-y-4">
      
      {/* Search & Top Action */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts, key fingerprints..."
            className="w-full bg-[#111b21] border border-slate-700/50 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
        <button
          onClick={onOpenRadar}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition-all flex-shrink-0"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>BLE Radar</span>
        </button>
      </div>

      {/* Threads List */}
      <div className="flex-1 space-y-2">
        {filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[#111b21]/60 rounded-3xl border border-slate-800 p-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No Mesh Chats Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
              Connect to nearby Bluetooth mesh peers or open the radar to discover nearby devices.
            </p>
            <button
              onClick={onOpenRadar}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
            >
              Scan Nearby Bluetooth Peers
            </button>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const peer = thread.peer;
            const lastMsg = thread.lastMessage;

            return (
              <div
                key={thread.contactId}
                onClick={() => onSelectThread(peer)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#111b21] hover:bg-[#1a252c] border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  
                  {/* Peer Avatar with Online / Hop Badge */}
                  <div className="relative flex-shrink-0">
                    <div
                      style={{ backgroundColor: peer.avatarColor }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-md"
                    >
                      {peer.avatarSymbol}
                    </div>
                    {/* Hop Distance Badge */}
                    <span
                      className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold border border-[#111b21] ${
                        peer.hopsAway === 1
                          ? 'bg-emerald-500 text-black'
                          : 'bg-teal-400 text-black'
                      }`}
                      title={`${peer.hopsAway} Hop(s) Away`}
                    >
                      {peer.hopsAway}h
                    </span>
                  </div>

                  {/* Thread Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                        {peer.displayName}
                      </h4>
                      {lastMsg && (
                        <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-400 truncate pr-2 flex items-center gap-1">
                        {lastMsg ? (
                          <>
                            {lastMsg.isOutgoing && <CheckCheck className="w-3.5 h-3.5 text-emerald-400 inline" />}
                            <span>{lastMsg.text}</span>
                          </>
                        ) : (
                          <span className="text-emerald-400/80 font-mono text-[11px]">
                            E2EE Verified • {peer.fingerprint}
                          </span>
                        )}
                      </p>

                      {/* Unread Badge */}
                      {thread.unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold shadow-sm flex-shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
