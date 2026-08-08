import React, { useState } from 'react';
import { QrCode, ShieldCheck, Copy, Check, X, Camera } from 'lucide-react';
import { UserProfile } from '../types/mesh';
import { generateQRMatrix } from '../crypto/qrGenerator';

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

  const matrix = generateQRMatrix(qrData);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(userProfile.keys.fingerprint);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    setScannedPeer('VERIFIED_PEER_9F8A-33E1-77BC');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#353782] border border-[#ff7f5d]/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-[#2a2b69] transition-all border border-[#ff7f5d]/30"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#ff7f5d]/20 border border-[#ff7f5d]/40 flex items-center justify-center mx-auto mb-3 text-[#ff7f5d]">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">In-Person Key Pairing</h3>
          <p className="text-xs text-[#b3b6e6] mb-4">
            Scan to exchange TweetNaCl public keys without internet
          </p>

          {/* Mode Tabs */}
          <div className="flex bg-[#2a2b69] p-1 rounded-xl border border-[#ff7f5d]/30 mb-5">
            <button
              onClick={() => setActiveMode('my_qr')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === 'my_qr'
                  ? 'bg-[#ff7f5d] text-white shadow-md'
                  : 'text-[#b3b6e6] hover:text-white'
              }`}
            >
              My QR Code
            </button>
            <button
              onClick={() => setActiveMode('scan')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === 'scan'
                  ? 'bg-[#ff7f5d] text-white shadow-md'
                  : 'text-[#b3b6e6] hover:text-white'
              }`}
            >
              Scan Peer QR
            </button>
          </div>

          {activeMode === 'my_qr' ? (
            <div className="flex flex-col items-center">
              {/* Custom Vector QR Matrix Container */}
              <div className="p-3 bg-white rounded-2xl shadow-xl mb-4 border-4 border-[#ff7f5d] inline-block">
                <div className="grid grid-cols-25 gap-0.5 w-44 h-44 bg-white p-1">
                  {matrix.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`w-full h-full ${cell ? 'bg-[#43459b]' : 'bg-white'}`}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="w-full bg-[#2a2b69] rounded-xl p-3 border border-[#ff7f5d]/30 text-left mb-4">
                <span className="text-[10px] text-[#b3b6e6] block font-medium">ECC Key Fingerprint:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-[#ff7f5d] text-xs font-bold">
                    {userProfile.keys.fingerprint}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-[#353782] hover:bg-[#ff7f5d]/20 text-white text-xs flex items-center gap-1 transition-all border border-[#ff7f5d]/30"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#ff7f5d]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-48 h-48 rounded-2xl bg-[#2a2b69] border-2 border-dashed border-[#ff7f5d]/60 flex flex-col items-center justify-center p-4 relative overflow-hidden mb-4">
                <Camera className="w-10 h-10 text-[#ff7f5d] mb-2 animate-bounce" />
                <span className="text-xs text-[#b3b6e6] text-center">
                  Align peer QR code within frame
                </span>
                <div className="absolute inset-x-0 top-0 h-1 bg-[#ff7f5d] animate-pulse"></div>
              </div>

              {scannedPeer ? (
                <div className="w-full bg-[#2a2b69] border border-[#ff7f5d]/50 rounded-xl p-3 text-xs text-white flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#ff7f5d] flex-shrink-0" />
                  <div>
                    <strong className="block font-bold text-[#ff7f5d]">Key Pair Verified!</strong>
                    <span className="text-[#b3b6e6]">Peer key fingerprint successfully added to local address book.</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSimulateScan}
                  className="w-full py-2.5 rounded-xl bg-[#ff7f5d] hover:bg-[#e06847] text-white font-bold text-xs shadow-lg shadow-[#ff7f5d]/30 transition-all"
                >
                  Simulate QR Scan Match
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#2a2b69] text-white font-bold text-xs hover:bg-[#ff7f5d]/20 transition-all border border-[#ff7f5d]/30"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
