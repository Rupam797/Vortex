import React, { useState } from 'react';
import { Search, Radio, MessageSquare, CheckCheck, Users, Phone } from 'lucide-react';
import { ChatThread, PeerNode, UserProfile } from '../types/mesh';
import { requestAndFetchDeviceContacts } from '../storage/contactsManager';

interface ChatListScreenProps {
  userProfile: UserProfile;
  threads: ChatThread[];
  activePeers: PeerNode[];
  onSelectThread: (peer: PeerNode) => void;
  onOpenRadar: () => void;
  onRefreshPeers?: () => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  userProfile,
  threads,
  activePeers,
  onSelectThread,
  onOpenRadar,
  onRefreshPeers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  const filteredThreads = threads.filter((t) =>
    t.peer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.peer.fingerprint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.peer.phoneNumber && t.peer.phoneNumber.includes(searchQuery))
  );

  const handleSyncContacts = async () => {
    setSyncing(true);
    await requestAndFetchDeviceContacts();
    setSyncing(false);
    if (onRefreshPeers) onRefreshPeers();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] max-w-4xl mx-auto p-4 space-y-4 bg-[#ffffff]">
      
      {/* Search & Top Action */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#43459b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved contacts, numbers, key fingerprints..."
            className="w-full bg-[#ffffff] border-2 border-[#ff7f5d] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-[#43459b] placeholder-[#43459b]/60 focus:outline-none focus:border-[#43459b] font-semibold transition-all shadow-sm"
          />
        </div>
        
        <button
          onClick={handleSyncContacts}
          disabled={syncing}
          title="Import saved device contacts from phone"
          className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-[#43459b] hover:bg-[#303273] text-white font-bold text-xs shadow-md transition-all flex-shrink-0 disabled:opacity-50"
        >
          <Users className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Phone Contacts'}</span>
        </button>

        <button
          onClick={onOpenRadar}
          className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-[#ff7f5d] hover:bg-[#e06847] text-white font-bold text-xs shadow-lg transition-all flex-shrink-0"
        >
          <Radio className="w-4 h-4 animate-pulse text-white" />
          <span>BLE Radar</span>
        </button>
      </div>

      {/* Threads List */}
      <div className="flex-1 space-y-2.5">
        {filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[#ff7f5d] rounded-3xl border border-[#43459b]/20 p-6 shadow-xl text-white">
            <div className="w-14 h-14 rounded-2xl bg-[#43459b] flex items-center justify-center text-white mb-3 shadow-md">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No Active Mesh Contacts</h3>
            <p className="text-xs text-white/90 max-w-xs mt-1 mb-5 font-medium">
              Sync your phone's saved contacts or open the BLE Radar to discover offline peers nearby.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSyncContacts}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl bg-[#43459b] hover:bg-[#303273] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>{syncing ? 'Importing Phone Contacts...' : 'Import Device Contacts'}</span>
              </button>
              <button
                onClick={onOpenRadar}
                className="px-4 py-2.5 rounded-xl bg-white text-[#43459b] text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Radio className="w-4 h-4 text-[#ff7f5d]" />
                <span>BLE Radar</span>
              </button>
            </div>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const peer = thread.peer;
            const lastMsg = thread.lastMessage;

            return (
              <div
                key={thread.contactId}
                onClick={() => onSelectThread(peer)}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#ff7f5d] hover:bg-[#e06847] border border-[#43459b]/15 cursor-pointer transition-all shadow-md group text-white"
              >
                <div className="flex items-center space-x-3 min-w-0 w-full">
                  
                  {/* Peer Avatar with Online / Hop Badge */}
                  <div className="relative flex-shrink-0">
                    <div
                      style={{ backgroundColor: peer.avatarColor || '#43459b' }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-md border-2 border-white"
                    >
                      {peer.avatarSymbol}
                    </div>
                    {/* Hop Distance Badge */}
                    <span
                      className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold border border-[#ff7f5d] ${
                        peer.hopsAway === 1
                          ? 'bg-[#43459b] text-white'
                          : 'bg-white text-[#43459b]'
                      }`}
                      title={`${peer.hopsAway} Hop(s) Away`}
                    >
                      {peer.hopsAway}h
                    </span>
                  </div>

                  {/* Thread Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white truncate group-hover:underline flex items-center gap-2">
                        <span>{peer.displayName}</span>
                        {peer.phoneNumber && (
                          <span className="text-[10px] bg-[#43459b] text-white px-1.5 py-0.2 rounded font-mono font-normal">
                            {peer.phoneNumber}
                          </span>
                        )}
                      </h4>
                      {lastMsg && (
                        <span className="text-[11px] text-white/90 font-mono flex-shrink-0 font-medium">
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-white/90 truncate pr-2 flex items-center gap-1 font-medium">
                        {lastMsg ? (
                          <>
                            {lastMsg.isOutgoing && <CheckCheck className="w-3.5 h-3.5 text-white inline" />}
                            <span>{lastMsg.text}</span>
                          </>
                        ) : (
                          <span className="text-white font-mono text-[11px] font-semibold">
                            Saved Contact • {peer.fingerprint}
                          </span>
                        )}
                      </p>

                      {/* Unread Badge */}
                      {thread.unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#43459b] text-white text-[10px] font-extrabold shadow-sm flex-shrink-0">
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
