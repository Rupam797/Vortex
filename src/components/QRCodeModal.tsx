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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#ff7f5d] border-2 border-[#43459b] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white hover:text-white rounded-full bg-[#43459b] transition-all shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#43459b] flex items-center justify-center mx-auto mb-3 text-white shadow-md">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">In-Person Key Pairing</h3>
          <p className="text-xs text-white/90 mb-4 font-medium">
            Scan to exchange TweetNaCl public keys without internet
          </p>

          {/* Mode Tabs */}
          <div className="flex bg-[#43459b] p-1 rounded-xl mb-5 shadow-inner">
            <button
              onClick={() => setActiveMode('my_qr')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === 'my_qr'
                  ? 'bg-white text-[#43459b] shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              My QR Code
            </button>
            <button
              onClick={() => setActiveMode('scan')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === 'scan'
                  ? 'bg-white text-[#43459b] shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Scan Peer QR
            </button>
          </div>

          {activeMode === 'my_qr' ? (
            <div className="flex flex-col items-center">
              {/* Custom Vector QR Matrix Container */}
              <div className="p-3 bg-white rounded-2xl shadow-xl mb-4 border-4 border-[#43459b] inline-block">
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

              <div className="w-full bg-[#43459b] rounded-xl p-3 border border-white/20 text-left mb-4 text-white">
                <span className="text-[10px] text-white/80 block font-semibold">ECC Key Fingerprint:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-white text-xs font-bold">
                    {userProfile.keys.fingerprint}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white text-[#43459b] text-xs flex items-center gap-1 transition-all font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#ff7f5d]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-48 h-48 rounded-2xl bg-[#43459b] border-2 border-dashed border-white flex flex-col items-center justify-center p-4 relative overflow-hidden mb-4">
                <Camera className="w-10 h-10 text-white mb-2 animate-bounce" />
                <span className="text-xs text-white/90 text-center font-medium">
                  Align peer QR code within frame
                </span>
                <div className="absolute inset-x-0 top-0 h-1 bg-white animate-pulse"></div>
              </div>

              {scannedPeer ? (
                <div className="w-full bg-[#43459b] border border-white/30 rounded-xl p-3 text-xs text-white flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-white flex-shrink-0" />
                  <div>
                    <strong className="block font-bold">Key Pair Verified!</strong>
                    <span className="text-white/90">Peer key fingerprint successfully added to local address book.</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSimulateScan}
                  className="w-full py-2.5 rounded-xl bg-[#43459b] hover:bg-[#303273] text-white font-bold text-xs shadow-lg transition-all"
                >
                  Simulate QR Scan Match
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#43459b] text-white font-bold text-xs hover:bg-[#303273] transition-all shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
