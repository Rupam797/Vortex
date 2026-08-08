import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, ShieldCheck, Mic, Paperclip, Image as ImageIcon, Radio, Activity, CheckCheck } from 'lucide-react';
import { ChatMessage, PeerNode, UserProfile } from '../types/mesh';
import { MessageBubble } from '../components/MessageBubble';
import { db } from '../storage/database';

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
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-[#0b141a] whatsapp-pattern">
      
      {/* Header Bar */}
      <div className="bg-[#111b21] px-4 py-3 border-b border-emerald-900/30 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-slate-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Peer Avatar */}
          <div
            style={{ backgroundColor: peer.avatarColor }}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md"
          >
            {peer.avatarSymbol}
          </div>

          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>{peer.displayName}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                {peer.fingerprint}
              </span>
            </h3>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                {peer.hopsAway === 1 ? 'Direct Bluetooth' : `Relayed Mesh (${peer.hopsAway} Hops)`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                E2EE Active
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostics Button */}
        <button
          onClick={onOpenDiagnostics}
          className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-teal-300 border border-slate-700/40 text-xs flex items-center gap-1 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline">Hop Metrics</span>
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        
        {/* Security Banner */}
        <div className="my-3 max-w-sm mx-auto bg-[#111b21]/90 border border-emerald-500/30 rounded-2xl p-3 text-center text-xs text-slate-300 shadow-md">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="font-semibold text-emerald-300">End-to-End Encrypted Off-Grid Session</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Messages are encrypted using TweetNaCl curve25519. Intermediate mesh relay nodes cannot read content.
          </p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-12 text-xs font-mono">
            No messages sent yet. Start the off-grid P2P conversation!
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Input Footer */}
      <div className="bg-[#111b21] p-3 border-t border-slate-800 z-20">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          
          {/* Attachments */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleSendImage}
              title="Send P2P Compressed Photo"
              className="p-2.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-slate-300 transition-all"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              type="button"
              onClick={handleSendVoiceNote}
              title="Send Off-Grid Voice Note"
              className="p-2.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-slate-300 transition-all"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type encrypted mesh message..."
            className="flex-1 bg-[#202c33] border border-slate-700/50 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
