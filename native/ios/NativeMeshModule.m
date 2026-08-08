#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <MultipeerConnectivity/MultipeerConnectivity.h>

@interface NativeMeshModule : RCTEventEmitter <RCTBridgeModule, MCSessionDelegate, MCNearbyServiceAdvertiserDelegate, MCNearbyServiceBrowserDelegate>
@property (nonatomic, strong) MCPeerID *myPeerID;
@property (nonatomic, strong) MCSession *session;
@property (nonatomic, strong) MCNearbyServiceAdvertiser *advertiser;
@property (nonatomic, strong) MCNearbyServiceBrowser *browser;
@end

@implementation NativeMeshModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onPeerDiscovered", @"onPeerLost", @"onPeerConnected", @"onPeerDisconnected", @"onMeshPacketReceived", @"onMeshServiceStatus", @"onMeshServiceError"];
}

RCT_EXPORT_METHOD(startMeshService:(NSString *)displayName resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    self.myPeerID = [[MCPeerID alloc] initWithDisplayName:displayName];
    self.session = [[MCSession alloc] initWithPeer:self.myPeerID securityIdentity:nil encryptionPreference:MCEncryptionRequired];
    self.session.delegate = self;

    NSString *serviceType = @"meshchat-p2p";
    self.advertiser = [[MCNearbyServiceAdvertiser alloc] initWithPeer:self.myPeerID discoveryInfo:nil serviceType:serviceType];
    self.advertiser.delegate = self;
    [self.advertiser startAdvertisingPeer];

    self.browser = [[MCNearbyServiceBrowser alloc] initWithPeer:self.myPeerID serviceType:serviceType];
    self.browser.delegate = self;
    [self.browser startBrowsingForPeers];

    [self sendEventWithName:@"onMeshServiceStatus" body:@"iOS Multipeer Mesh Service Running"];
    resolve(@YES);
}

RCT_EXPORT_METHOD(broadcastPacket:(NSString *)rawJsonPayload resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSData *data = [rawJsonPayload dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error = nil;
    [self.session sendData:data toPeers:self.session.connectedPeers withMode:MCSessionSendDataReliable error:&error];
    if (error) {
        reject(@"SEND_ERROR", error.localizedDescription, error);
    } else {
        resolve(@YES);
    }
}

#pragma mark - MCSessionDelegate
- (void)session:(MCSession *)session peer:(MCPeerID *)peerID didChangeState:(MCSessionState)state {
    if (state == MCSessionStateConnected) {
        [self sendEventWithName:@"onPeerConnected" body:peerID.displayName];
    } else if (state == MCSessionStateNotConnected) {
        [self sendEventWithName:@"onPeerDisconnected" body:peerID.displayName];
    }
}

- (void)session:(MCSession *)session didReceiveData:(NSData *)data fromPeer:(MCPeerID *)peerID {
    NSString *jsonStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    [self sendEventWithName:@"onMeshPacketReceived" body:@{@"fromPeer": peerID.displayName, @"rawPacketJson": jsonStr}];
}

#pragma mark - MCNearbyServiceAdvertiserDelegate
- (void)advertiser:(MCNearbyServiceAdvertiser *)advertiser didReceiveInvitationFromPeer:(MCPeerID *)peerID withContext:(NSData *)context invitationHandler:(void (^)(BOOL accept, MCSession * _Nullable session))invitationHandler {
    invitationHandler(YES, self.session);
}

#pragma mark - MCNearbyServiceBrowserDelegate
- (void)browser:(MCNearbyServiceBrowser *)browser foundPeer:(MCPeerID *)peerID withDiscoveryInfo:(NSDictionary<NSString *,NSString *> *)info {
    [self sendEventWithName:@"onPeerDiscovered" body:@{@"peerId": peerID.displayName}];
    [browser invitePeer:peerID toSession:self.session withContext:nil timeout:30];
}

- (void)browser:(MCNearbyServiceBrowser *)browser lostPeer:(MCPeerID *)peerID {
    [self sendEventWithName:@"onPeerLost" body:peerID.displayName];
}

- (void)session:(MCSession *)session didReceiveStream:(NSInputStream *)stream withName:(NSString *)streamName fromPeer:(MCPeerID *)peerID {}
- (void)session:(MCSession *)session didStartReceivingResourceWithName:(NSString *)resourceName fromPeer:(MCPeerID *)peerID withProgress:(NSProgress *)progress {}
- (void)session:(MCSession *)session didFinishReceivingResourceWithName:(NSString *)resourceName fromPeer:(MCPeerID *)peerID atURL:(NSURL *)localURL withError:(NSError *)error {}

@end
