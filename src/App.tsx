import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, PeerNode, ChatMessage, ChatThread } from './types/mesh';
import { db } from './storage/database';
import { MeshEngine } from './mesh/MeshEngine';
import { Navbar } from './components/Navbar';
import { RadarView } from './components/RadarView';
import { QRCodeModal } from './components/QRCodeModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { ChatListScreen } from './screens/ChatListScreen';
import { ChatRoomScreen } from './screens/ChatRoomScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => db.getUserProfile());
  const [activeTab, setActiveTab] = useState<'chats' | 'radar' | 'settings'>('chats');
  const [selectedPeer, setSelectedPeer] = useState<PeerNode | null>(null);

  const [peers, setPeers] = useState<PeerNode[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeRoomMessages, setActiveRoomMessages] = useState<ChatMessage[]>([]);

  const [showQRModal, setShowQRModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  // Initialize Mesh Engine instance when user profile exists
  const meshEngine = useMemo(() => {
    if (!userProfile) return null;
    return new MeshEngine(userProfile);
  }, [userProfile]);

  useEffect(() => {
    if (!meshEngine) return;

    // Subscribe to Bluetooth Peer updates
    const unsubPeers = meshEngine.subscribePeers((updatedPeers) => {
      setPeers(updatedPeers);
      setThreads(db.getChatThreads());
    });

    // Subscribe to incoming messages
    const unsubMessages = meshEngine.subscribeMessages((msg) => {
      setThreads(db.getChatThreads());
      if (selectedPeer && (msg.senderId === selectedPeer.fingerprint || msg.recipientId === selectedPeer.fingerprint)) {
        setActiveRoomMessages(db.getThreadMessages(selectedPeer.fingerprint));
      }
    });

    return () => {
      unsubPeers();
      unsubMessages();
    };
  }, [meshEngine, selectedPeer]);

  // Load thread messages when selecting a peer chat room
  useEffect(() => {
    if (selectedPeer) {
      setActiveRoomMessages(db.getThreadMessages(selectedPeer.fingerprint));
    }
  }, [selectedPeer]);

  if (!userProfile) {
    return <OnboardingScreen onComplete={(profile) => setUserProfile(profile)} />;
  }

  const handleSelectPeer = (peer: PeerNode) => {
    setSelectedPeer(peer);
  };

  const handleSendMessage = (
    peer: PeerNode,
    text: string,
    attachmentType: 'text' | 'image' | 'voice' = 'text',
    attachmentUrl?: string
  ) => {
    if (!meshEngine) return;
    meshEngine.sendMessage(peer, text, attachmentType, attachmentUrl);
    setActiveRoomMessages(db.getThreadMessages(peer.fingerprint));
    setThreads(db.getChatThreads());
  };

  const handleAddVirtualPeer = (name: string) => {
    if (!meshEngine) return;
    const newPeer = meshEngine.addVirtualPeer(name);
    setSelectedPeer(newPeer);
  };

  const handleUpdatePeerPosition = (fingerprint: string, x: number, y: number, hopsAway: number) => {
    if (!meshEngine) return;
    meshEngine.updatePeerPosition(fingerprint, x, y, hopsAway);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#43459b] flex flex-col font-outfit">
      
      {/* Top Navbar Header */}
      <Navbar
        userProfile={userProfile}
        activePeers={peers}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedPeer(null);
          setActiveTab(tab);
        }}
        onOpenQRModal={() => setShowQRModal(true)}
        onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1">
        {selectedPeer ? (
          <ChatRoomScreen
            userProfile={userProfile}
            peer={selectedPeer}
            messages={activeRoomMessages}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedPeer(null)}
            onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
          />
        ) : (
          <>
            {activeTab === 'chats' && (
              <ChatListScreen
                userProfile={userProfile}
                threads={threads}
                activePeers={peers}
                onSelectThread={handleSelectPeer}
                onOpenRadar={() => setActiveTab('radar')}
              />
            )}

            {activeTab === 'radar' && (
              <RadarView
                userProfile={userProfile}
                peers={peers}
                onSelectPeer={handleSelectPeer}
                onAddVirtualPeer={handleAddVirtualPeer}
                onUpdatePeerPosition={handleUpdatePeerPosition}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen
                userProfile={userProfile}
                onOpenQR={() => setShowQRModal(true)}
                onOpenDiagnostics={() => setShowDiagnosticsModal(true)}
                onResetApp={() => {
                  setUserProfile(null);
                  setSelectedPeer(null);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* QR Code Security Pairing Modal */}
      {showQRModal && (
        <QRCodeModal userProfile={userProfile} onClose={() => setShowQRModal(false)} />
      )}

      {/* Diagnostics Modal */}
      {showDiagnosticsModal && (
        <DiagnosticsModal peers={peers} onClose={() => setShowDiagnosticsModal(false)} />
      )}

    </div>
  );
}
