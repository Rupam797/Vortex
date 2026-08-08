import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, ShieldCheck, Mic, Image as ImageIcon, Radio, Activity } from 'lucide-react';
import { ChatMessage, PeerNode, UserProfile } from '../types/mesh';
import { MessageBubble } from '../components/MessageBubble';

interface ChatRoomScreenProps {
  userProfile: UserProfile;
  peer: PeerNode;
  messages: ChatMessage[];
  onSendMessage: (peer: PeerNode, text: string, attachmentType?: 'text' | 'image' | 'voice', attachmentUrl?: string) => void;
  onBack: () => void;
  onOpenDiagnostics: () => void;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({
  userProfile,
  peer,
  messages,
  onSendMessage,
  onBack,
  onOpenDiagnostics,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(peer, inputText.trim());
      setInputText('');
    }
  };

  const handleSendVoiceNote = () => {
    onSendMessage(peer, '🎤 Off-Grid Voice Note (0.14s)', 'voice');
  };

  const handleSendImage = () => {
    onSendMessage(peer, '📷 Off-Grid Compressed Image Payload', 'image');
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-[#ffffff] whatsapp-pattern">
      
      {/* Header Bar */}
      <div className="bg-[#ff7f5d] px-4 py-3 border-b border-[#43459b]/20 flex items-center justify-between shadow-md z-20 text-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl bg-[#43459b] hover:bg-[#303273] text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Peer Avatar */}
          <div
            style={{ backgroundColor: peer.avatarColor || '#43459b' }}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md border-2 border-white"
          >
            {peer.avatarSymbol}
          </div>

          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>{peer.displayName}</span>
              <span className="text-[10px] bg-[#43459b] text-white border border-white/30 px-1.5 py-0.2 rounded font-mono">
                {peer.fingerprint}
              </span>
            </h3>
            <div className="flex items-center space-x-2 text-[11px] text-white/90">
              <span className="flex items-center gap-1 text-white font-bold">
                <Radio className="w-3 h-3 animate-pulse text-white" />
                {peer.hopsAway === 1 ? 'Direct Bluetooth' : `Relayed Mesh (${peer.hopsAway} Hops)`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-white font-medium">
                <ShieldCheck className="w-3 h-3 text-white" />
                E2EE Active
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostics Button */}
        <button
          onClick={onOpenDiagnostics}
          className="p-2 rounded-xl bg-[#43459b] hover:bg-[#303273] text-white text-xs flex items-center gap-1 transition-all shadow-sm font-bold"
        >
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline">Hop Metrics</span>
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#ffffff]">
        
        {/* Security Banner */}
        <div className="my-3 max-w-sm mx-auto bg-[#ff7f5d] border border-[#43459b]/20 rounded-2xl p-3 text-center text-xs text-white shadow-md">
          <ShieldCheck className="w-5 h-5 text-white mx-auto mb-1" />
          <p className="font-bold text-white">End-to-End Encrypted Off-Grid Session</p>
          <p className="text-[11px] text-white/90 mt-0.5 font-medium">
            Messages are encrypted using TweetNaCl curve25519. Intermediate mesh relay nodes cannot read content.
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center text-[#43459b] py-12 text-xs font-mono font-semibold">
            No messages sent yet. Start the off-grid P2P conversation!
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Input Footer */}
      <div className="bg-[#ff7f5d] p-3 border-t border-[#43459b]/20 z-20">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          
          {/* Attachments */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleSendImage}
              title="Send P2P Compressed Photo"
              className="p-2.5 rounded-xl bg-[#43459b] hover:bg-[#303273] text-white transition-all shadow-sm"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSendVoiceNote}
              title="Send Off-Grid Voice Note"
              className="p-2.5 rounded-xl bg-[#43459b] hover:bg-[#303273] text-white transition-all shadow-sm"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type encrypted mesh message..."
            className="flex-1 bg-[#ffffff] border border-[#43459b]/30 rounded-2xl px-4 py-2.5 text-sm text-[#43459b] placeholder-[#43459b]/60 focus:outline-none focus:border-[#43459b] font-semibold transition-all shadow-sm"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-[#43459b] hover:bg-[#303273] text-white shadow-lg disabled:opacity-40 transition-all font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
