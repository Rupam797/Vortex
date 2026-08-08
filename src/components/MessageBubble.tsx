import React from 'react';
import { Clock, Send, RefreshCw, CheckCheck, ShieldCheck, Mic, Image as ImageIcon } from 'lucide-react';
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
          <span className="flex items-center text-white/80 gap-1 text-[10px]" title="⏱️ Pending Relay">
            <Clock className="w-3 h-3 animate-spin" />
            <span>⏱️ Pending</span>
          </span>
        );
      case 'sent_to_mesh':
        return (
          <span className="flex items-center text-white/90 gap-1 text-[10px]" title="↗️ Sent to Mesh">
            <Send className="w-3 h-3" />
            <span>↗️ Sent</span>
          </span>
        );
      case 'relayed':
        return (
          <span className="flex items-center text-white gap-1 text-[10px]" title="🔄 Relayed via Mesh Node">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>🔄 Relayed ({message.hopCount} Hops)</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center text-white gap-1 text-[10px]" title="✓✓ Delivered to Recipient">
            <CheckCheck className="w-3.5 h-3.5 text-white" />
            <span>✓✓ Delivered</span>
          </span>
        );
      default:
        return <CheckCheck className="w-3.5 h-3.5 text-white/60" />;
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex w-full my-1.5 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[82%] sm:max-w-[70%] px-3.5 py-2.5 rounded-2xl shadow-md text-sm transition-all ${
          isOutgoing
            ? 'bg-[#ff7f5d] text-white rounded-tr-xs border border-[#ff7f5d]'
            : 'bg-[#ffffff] text-[#43459b] rounded-tl-xs border-2 border-[#ff7f5d]'
        }`}
      >
        
        {/* Incoming Sender Name */}
        {!isOutgoing && (
          <div className="text-[11px] font-bold text-[#ff7f5d] mb-0.5 flex items-center justify-between gap-2">
            <span>{message.senderName}</span>
            <span className="text-[9px] font-semibold text-[#43459b]/70 font-mono">E2EE Encrypted</span>
          </div>
        )}

        {/* Attachment rendering */}
        {message.attachmentType === 'voice' && (
          <div className={`flex items-center space-x-3 py-1.5 px-2 rounded-xl mb-1 border ${
            isOutgoing ? 'bg-black/10 border-white/20' : 'bg-[#ff7f5d]/10 border-[#ff7f5d]/30'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isOutgoing ? 'bg-white text-[#ff7f5d]' : 'bg-[#ff7f5d] text-white'
            }`}>
              <Mic className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                <span className={`w-1 h-3 rounded-full animate-pulse ${isOutgoing ? 'bg-white' : 'bg-[#43459b]'}`}></span>
                <span className={`w-1 h-5 rounded-full animate-pulse ${isOutgoing ? 'bg-white/80' : 'bg-[#43459b]/80'}`}></span>
                <span className={`w-1 h-2 rounded-full ${isOutgoing ? 'bg-white/60' : 'bg-[#43459b]/60'}`}></span>
                <span className={`w-1 h-6 rounded-full animate-pulse ${isOutgoing ? 'bg-white' : 'bg-[#43459b]'}`}></span>
                <span className={`w-1 h-4 rounded-full ${isOutgoing ? 'bg-white/80' : 'bg-[#43459b]/80'}`}></span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${isOutgoing ? 'text-white/90' : 'text-[#43459b]'}`}>
                0:14 • Off-grid Audio
              </span>
            </div>
          </div>
        )}

        {message.attachmentType === 'image' && (
          <div className="mb-1.5 rounded-xl overflow-hidden border border-black/10 relative">
            <div className={`w-full h-36 flex items-center justify-center relative ${
              isOutgoing ? 'bg-black/10' : 'bg-[#ff7f5d]/10'
            }`}>
              <ImageIcon className={`w-8 h-8 ${isOutgoing ? 'text-white' : 'text-[#ff7f5d]'}`} />
              <span className="absolute bottom-2 left-2 text-[10px] bg-[#43459b] px-2 py-0.5 rounded-md text-white font-mono font-bold">
                P2P Image Payload
              </span>
            </div>
          </div>
        )}

        {/* Message Text */}
        <p className={`leading-relaxed whitespace-pre-wrap break-words font-outfit text-sm font-semibold ${
          isOutgoing ? 'text-white' : 'text-[#43459b]'
        }`}>
          {message.text}
        </p>

        {/* Footer Meta Details */}
        <div className={`flex items-center justify-end space-x-2 mt-1 pt-0.5 text-[10px] ${
          isOutgoing ? 'text-white/90' : 'text-[#43459b]/80'
        }`}>
          
          {/* Relayed Hops Badge */}
          {message.hopCount > 1 && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-0.5 ${
                isOutgoing ? 'bg-black/20 text-white' : 'bg-[#43459b] text-white'
              }`}
              title={`Relayed through ${message.hopCount} mesh nodes`}
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              {message.hopCount} Hops
            </span>
          )}

          {/* Timestamp */}
          <span className="font-mono font-semibold">{formattedTime}</span>

          {/* Status Indicator for Outgoing Messages */}
          {isOutgoing && renderStatusIcon()}
        </div>

      </div>
    </div>
  );
};
