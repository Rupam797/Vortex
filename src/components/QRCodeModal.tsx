import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck, Copy, Check, X, Camera } from 'lucide-react';
import { UserProfile } from '../types/mesh';

interface QRCodeModalProps {
  userProfile: UserProfile;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ userProfile, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<'my_qr' | 'scan'>('my_qr');
  const [scannedPeer, setScannedPeer] = useState<string | null>(null);

  const qrData = JSON.stringify({
    name: userProfile.displayName,
    fingerprint: userProfile.keys.fingerprint,
    boxPubKey: userProfile.keys.boxPublicKey,
    signPubKey: userProfile.keys.signPublicKey,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(userProfile.keys.fingerprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    setScannedPeer('VERIFIED_PEER_9F8A-33E1-77BC');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111b21] border border-emerald-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#202c33] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">In-Person Key Pairing</h3>
          <p className="text-xs text-slate-400 mb-4">
            Scan to exchange TweetNaCl public keys without internet
          </p>

          {/* Mode Tabs */}
          <div className="flex bg-[#0b141a] p-1 rounded-xl border border-slate-800 mb-5">
            <button
              onClick={() => setActiveMode('my_qr')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'my_qr'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My QR Code
            </button>
            <button
              onClick={() => setActiveMode('scan')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'scan'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Scan Peer QR
            </button>
          </div>

          {activeMode === 'my_qr' ? (
            <div className="flex flex-col items-center">
              {/* QR Container */}
              <div className="p-4 bg-white rounded-2xl shadow-xl mb-4 border-4 border-emerald-500/40">
                <QRCodeSVG value={qrData} size={180} level="H" includeMargin={true} />
              </div>

              <div className="w-full bg-[#0b141a] rounded-xl p-3 border border-slate-800 text-left mb-4">
                <span className="text-[10px] text-slate-400 block font-medium">ECC Key Fingerprint:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-emerald-400 text-xs font-bold">
                    {userProfile.keys.fingerprint}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-slate-300 text-xs flex items-center gap-1 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-48 h-48 rounded-2xl bg-[#0b141a] border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center p-4 relative overflow-hidden mb-4">
                <Camera className="w-10 h-10 text-emerald-400 mb-2 animate-bounce" />
                <span className="text-xs text-slate-400 text-center">
                  Align peer QR code within frame
                </span>
                <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400/80 animate-pulse"></div>
              </div>

              {scannedPeer ? (
                <div className="w-full bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <strong className="block font-bold">Key Pair Verified!</strong>
                    <span>Peer key fingerprint successfully added to local address book.</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSimulateScan}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition-all"
                >
                  Simulate QR Scan Match
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#202c33] text-slate-300 font-semibold text-xs hover:bg-[#2a3942] transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
