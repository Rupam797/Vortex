package com.meshchat.app

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.*
import java.nio.charset.StandardCharsets

/**
 * Native Android Module linking React Native JS to Google Nearby Connections API & BLE Mesh.
 * Uses P2P_CLUSTER strategy for multi-hop mesh network topologies.
 */
class NativeMeshModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val SERVICE_ID = "com.meshchat.app.SERVICE_ID"
    private var localPeerName = "MeshUser"

    override fun getName(): String = "NativeMeshModule"

    @ReactMethod
    fun startMeshService(displayName: String, promise: Promise) {
        this.localPeerName = displayName
        startAdvertising()
        startDiscovery()
        promise.resolve(true)
    }

    private fun startAdvertising() {
        val advertisingOptions = AdvertisingOptions.Builder()
            .setStrategy(Strategy.P2P_CLUSTER)
            .build()

        Nearby.getConnectionsClient(reactApplicationContext)
            .startAdvertising(localPeerName, SERVICE_ID, connectionLifecycleCallback, advertisingOptions)
            .addOnSuccessListener { sendEvent("onMeshServiceStatus", "Advertising Started") }
            .addOnFailureListener { e -> sendEvent("onMeshServiceError", e.localizedMessage) }
    }

    private fun startDiscovery() {
        val discoveryOptions = DiscoveryOptions.Builder()
            .setStrategy(Strategy.P2P_CLUSTER)
            .build()

        Nearby.getConnectionsClient(reactApplicationContext)
            .startDiscovery(SERVICE_ID, endpointDiscoveryCallback, discoveryOptions)
            .addOnSuccessListener { sendEvent("onMeshServiceStatus", "Discovery Started") }
            .addOnFailureListener { e -> sendEvent("onMeshServiceError", e.localizedMessage) }
    }

    @ReactMethod
    fun broadcastPacket(endpointId: String, rawJsonPayload: String, promise: Promise) {
        val bytes = rawJsonPayload.toByteArray(StandardCharsets.UTF_8)
        val payload = Payload.fromBytes(bytes)
        Nearby.getConnectionsClient(reactApplicationContext)
            .sendPayload(endpointId, payload)
            .addOnSuccessListener { promise.resolve(true) }
            .addOnFailureListener { e -> promise.reject("SEND_FAIL", e.localizedMessage) }
    }

    private val endpointDiscoveryCallback = object : EndpointDiscoveryCallback() {
        override fun onEndpointFound(endpointId: String, info: DiscoveredEndpointInfo) {
            val params = Arguments.createMap().apply {
                putString("peerId", endpointId)
                putString("displayName", info.endpointName)
            }
            sendEvent("onPeerDiscovered", params)
            // Auto accept & connect to form P2P mesh cluster
            Nearby.getConnectionsClient(reactApplicationContext)
                .requestConnection(localPeerName, endpointId, connectionLifecycleCallback)
        }

        override fun onEndpointLost(endpointId: String) {
            sendEvent("onPeerLost", endpointId)
        }
    }

    private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, info: ConnectionInfo) {
            Nearby.getConnectionsClient(reactApplicationContext).acceptConnection(endpointId, payloadCallback)
        }

        override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
            if (result.status.isSuccess) {
                sendEvent("onPeerConnected", endpointId)
            }
        }

        override fun onDisconnected(endpointId: String) {
            sendEvent("onPeerDisconnected", endpointId)
        }
    }

    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            if (payload.type == Payload.Type.BYTES) {
                val jsonStr = String(payload.asBytes()!!, StandardCharsets.UTF_8)
                val params = Arguments.createMap().apply {
                    putString("fromEndpointId", endpointId)
                    putString("rawPacketJson", jsonStr)
                }
                sendEvent("onMeshPacketReceived", params)
            }
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {}
    }

    private fun sendEvent(eventName: String, params: Any?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
