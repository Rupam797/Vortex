import React from 'react';
import { Clock, Send, RefreshCw, CheckCheck, ShieldCheck, Mic, Image as ImageIcon, MapPin } from 'lucide-react';
import { ChatMessage } from '../types/mesh';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOutgoing = message.isOutgoing;

  // Status Icon Mapping per Prompt Requirements
  const renderStatusIcon = () => {
    switch (message.status) {
      case 'pending':
        return (
          <span className="flex items-center text-amber-300 gap-1 text-[10px]" title="⏱️ Pending Relay">
            <Clock className="w-3 h-3 animate-spin" />
            <span>⏱️ Pending</span>
          </span>
        );
      case 'sent_to_mesh':
        return (
          <span className="flex items-center text-emerald-300 gap-1 text-[10px]" title="↗️ Sent to Mesh">
            <Send className="w-3 h-3" />
            <span>↗️ Sent</span>
          </span>
        );
      case 'relayed':
        return (
          <span className="flex items-center text-teal-200 gap-1 text-[10px]" title="🔄 Relayed via Mesh Node">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>🔄 Relayed ({message.hopCount} Hops)</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center text-emerald-300 gap-1 text-[10px]" title="✓✓ Delivered to Recipient">
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>✓✓ Delivered</span>
          </span>
        );
      default:
        return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex w-full my-1.5 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[82%] sm:max-w-[70%] px-3.5 py-2 rounded-2xl shadow-md text-sm transition-all ${
          isOutgoing
            ? 'bg-[#005c4b] text-slate-100 rounded-tr-xs border border-emerald-600/30'
            : 'bg-[#202c33] text-slate-100 rounded-tl-xs border border-slate-700/40'
        }`}
      >
        
        {/* Incoming Sender Name */}
        {!isOutgoing && (
          <div className="text-[11px] font-bold text-emerald-400 mb-0.5 flex items-center justify-between gap-2">
            <span>{message.senderName}</span>
            <span className="text-[9px] font-normal text-slate-400 font-mono">E2EE Encrypted</span>
          </div>
        )}

        {/* Attachment rendering */}
        {message.attachmentType === 'voice' && (
          <div className="flex items-center space-x-3 py-1.5 px-2 bg-black/20 rounded-xl mb-1 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="w-1 h-5 bg-emerald-300 rounded-full animate-pulse"></span>
                <span className="w-1 h-2 bg-emerald-500 rounded-full"></span>
                <span className="w-1 h-6 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="w-1 h-4 bg-emerald-300 rounded-full"></span>
                <span className="w-1 h-2 bg-emerald-500 rounded-full"></span>
              </div>
              <span className="text-[10px] text-slate-300 font-mono">0:14 • Off-grid Audio</span>
            </div>
          </div>
        )}

        {message.attachmentType === 'image' && (
          <div className="mb-1.5 rounded-xl overflow-hidden border border-white/10 relative">
            <div className="w-full h-36 bg-slate-900 flex items-center justify-center relative">
              <ImageIcon className="w-8 h-8 text-emerald-400 opacity-60" />
              <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded-md text-emerald-300 font-mono">
                P2P Image Payload
              </span>
            </div>
          </div>
        )}

        {/* Message Text */}
        <p className="leading-relaxed whitespace-pre-wrap break-words text-slate-100 font-outfit text-sm">
          {message.text}
        </p>

        {/* Footer Meta Details (Timestamp + Relay Hop Badge + Status Icon) */}
        <div className="flex items-center justify-end space-x-2 mt-1 pt-0.5 text-[10px] text-slate-300">
          
          {/* Relayed Hops Badge */}
          {message.hopCount > 1 && (
            <span
              className="bg-black/30 px-1.5 py-0.5 rounded text-[9px] text-teal-300 font-mono flex items-center gap-0.5"
              title={`Relayed through ${message.hopCount} mesh nodes`}
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              {message.hopCount} Hops
            </span>
          )}

          {/* Timestamp */}
          <span className="text-slate-400 font-mono">{formattedTime}</span>

          {/* Status Indicator for Outgoing Messages */}
          {isOutgoing && renderStatusIcon()}
        </div>

      </div>
    </div>
  );
};
