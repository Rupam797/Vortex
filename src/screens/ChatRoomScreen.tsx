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
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-[#43459b] whatsapp-pattern">
      
      {/* Header Bar */}
      <div className="bg-[#353782] px-4 py-3 border-b border-[#ff7f5d]/30 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl bg-[#2a2b69] hover:bg-[#ff7f5d]/20 text-white transition-all border border-[#ff7f5d]/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Peer Avatar */}
          <div
            style={{ backgroundColor: peer.avatarColor || '#ff7f5d' }}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md border border-white/20"
          >
            {peer.avatarSymbol}
          </div>

          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>{peer.displayName}</span>
              <span className="text-[10px] bg-[#ff7f5d]/20 text-[#ff7f5d] border border-[#ff7f5d]/40 px-1.5 py-0.2 rounded font-mono">
                {peer.fingerprint}
              </span>
            </h3>
            <div className="flex items-center space-x-2 text-[11px] text-[#b3b6e6]">
              <span className="flex items-center gap-1 text-[#ff7f5d] font-semibold">
                <Radio className="w-3 h-3 animate-pulse text-[#ff7f5d]" />
                {peer.hopsAway === 1 ? 'Direct Bluetooth' : `Relayed Mesh (${peer.hopsAway} Hops)`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-white">
                <ShieldCheck className="w-3 h-3 text-[#ff7f5d]" />
                E2EE Active
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostics Button */}
        <button
          onClick={onOpenDiagnostics}
          className="p-2 rounded-xl bg-[#2a2b69] hover:bg-[#ff7f5d]/20 text-[#ff7f5d] border border-[#ff7f5d]/30 text-xs flex items-center gap-1 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline text-white font-medium">Hop Metrics</span>
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        
        {/* Security Banner */}
        <div className="my-3 max-w-sm mx-auto bg-[#353782]/90 border border-[#ff7f5d]/40 rounded-2xl p-3 text-center text-xs text-white shadow-md">
          <ShieldCheck className="w-5 h-5 text-[#ff7f5d] mx-auto mb-1" />
          <p className="font-bold text-[#ff7f5d]">End-to-End Encrypted Off-Grid Session</p>
          <p className="text-[11px] text-[#b3b6e6] mt-0.5">
            Messages are encrypted using TweetNaCl curve25519. Intermediate mesh relay nodes cannot read content.
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center text-[#b3b6e6] py-12 text-xs font-mono">
            No messages sent yet. Start the off-grid P2P conversation!
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Input Footer */}
      <div className="bg-[#353782] p-3 border-t border-[#ff7f5d]/30 z-20">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          
          {/* Attachments */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleSendImage}
              title="Send P2P Compressed Photo"
              className="p-2.5 rounded-xl bg-[#2a2b69] hover:bg-[#ff7f5d]/20 text-white transition-all border border-[#ff7f5d]/20"
            >
              <ImageIcon className="w-4 h-4 text-[#ff7f5d]" />
            </button>
            <button
              type="button"
              onClick={handleSendVoiceNote}
              title="Send Off-Grid Voice Note"
              className="p-2.5 rounded-xl bg-[#2a2b69] hover:bg-[#ff7f5d]/20 text-white transition-all border border-[#ff7f5d]/20"
            >
              <Mic className="w-4 h-4 text-[#ff7f5d]" />
            </button>
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type encrypted mesh message..."
            className="flex-1 bg-[#2a2b69] border border-[#ff7f5d]/30 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-[#b3b6e6]/60 focus:outline-none focus:border-[#ff7f5d] transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-[#ff7f5d] hover:bg-[#e06847] text-white shadow-lg shadow-[#ff7f5d]/40 disabled:opacity-40 transition-all font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
