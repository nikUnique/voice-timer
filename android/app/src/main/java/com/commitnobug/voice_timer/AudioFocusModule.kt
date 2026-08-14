package com.commitnobug.voice_timer

import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log
import android.media.AudioDeviceInfo
import android.content.Context
import android.content.BroadcastReceiver
import android.content.Intent
import android.content.IntentFilter
import com.facebook.react.bridge.Callback
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.NativeModule
import android.media.AudioRecord
import android.media.audiofx.AcousticEchoCanceler
import android.media.audiofx.NoiseSuppressor
import com.facebook.react.bridge.Promise
import android.media.AudioRecordingConfiguration
import androidx.annotation.RequiresApi
import android.os.Process
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.Manifest
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.pm.PackageManager
import android.telecom.TelecomManager
import android.view.KeyEvent
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments






private val TAG = "AudioFocusModule"
private var hasFocus = false




class AudioFocusModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AudioFocusModule"

    private val audioManager: AudioManager =
    reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var focusRequest: AudioFocusRequest? = null
    private var scoReceiver: BroadcastReceiver? = null
    private var callback: AudioManager.AudioRecordingCallback? = null
    private var scoTimeoutRunnable: Runnable? = null
    private var previousAudioMode: Int? = null


     

    private var scoReceiverRegistered = false
    private var pendingStartCallback: ((Boolean) -> Unit)? = null

    private val scoStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val state = intent.getIntExtra(AudioManager.EXTRA_SCO_AUDIO_STATE, -1)
            when (state) {
                AudioManager.SCO_AUDIO_STATE_CONNECTED -> {
                    pendingStartCallback?.invoke(true)
                    pendingStartCallback = null
                }
                AudioManager.SCO_AUDIO_STATE_ERROR -> {
                    // Fail fast instead of waiting the full 15s on a known error
                    pendingStartCallback?.invoke(false)
                    pendingStartCallback = null
                }
            }
        }
    }

private fun hasConnectedBluetoothMic(callback: (Boolean) -> Unit) {
    val bluetoothManager =
        reactApplicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    val adapter = bluetoothManager.adapter

    if (adapter == null || !adapter.isEnabled) {
        callback(false)
        return
    }

    adapter.getProfileProxy(
        reactApplicationContext,
        object : BluetoothProfile.ServiceListener {
            override fun onServiceConnected(profile: Int, proxy: BluetoothProfile) {
                val connected = proxy.connectedDevices.isNotEmpty()
                adapter.closeProfileProxy(profile, proxy)
                callback(connected)
            }

            override fun onServiceDisconnected(profile: Int) {
                callback(false)
            }
        },
        BluetoothProfile.HEADSET
    )
}

private fun hasWiredMic(): Boolean {
    val devices = audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS)
    return devices.any {
        it.type == AudioDeviceInfo.TYPE_WIRED_HEADSET ||
        it.type == AudioDeviceInfo.TYPE_USB_HEADSET ||
        it.type == AudioDeviceInfo.TYPE_USB_DEVICE
    }
}


@ReactMethod
fun startBluetoothMic(promise: Promise) {
    if (hasWiredMic()) {
        promise.reject("WIRED_MIC_PRESENT", "Wired/USB mic connected, skipping Bluetooth SCO")
        return
    }

    // Guard against overlapping calls stomping each other's callback
    if (pendingStartCallback != null) {
        promise.reject("ALREADY_STARTING", "A Bluetooth SCO start is already in progress")
        return
    }

    // Idempotent short-circuit if SCO is already up
    if (audioManager.isBluetoothScoOn && audioManager.mode == AudioManager.MODE_IN_COMMUNICATION) {
        promise.resolve(true)
        return
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
        ActivityCompat.checkSelfPermission(
            reactApplicationContext, Manifest.permission.BLUETOOTH_CONNECT
        ) != PackageManager.PERMISSION_GRANTED
    ) {
        promise.reject("PERMISSION_DENIED", "BLUETOOTH_CONNECT not granted")
        return
    }

    hasConnectedBluetoothMic { connected ->
        if (!connected) {
            promise.reject("NO_DEVICE_CONNECTED", "No Bluetooth headset currently connected")
            return@hasConnectedBluetoothMic
        }

        if (!audioManager.isBluetoothScoAvailableOffCall) {
            promise.reject("SCO_UNAVAILABLE", "Device does not support SCO off-call")
            return@hasConnectedBluetoothMic
        }

        // Save whatever mode we were in so stop() can restore it accurately
        previousAudioMode = audioManager.mode
        audioManager.mode = AudioManager.MODE_IN_COMMUNICATION

        if (!scoReceiverRegistered) {
            reactApplicationContext.registerReceiver(
                scoStateReceiver,
                IntentFilter(AudioManager.ACTION_SCO_AUDIO_STATE_UPDATED)
            )
            scoReceiverRegistered = true
        }

        pendingStartCallback = { connectedSco ->
            // Cancel the timeout the moment we get a real answer, success or failure
            scoTimeoutRunnable?.let { Handler(Looper.getMainLooper()).removeCallbacks(it) }
            scoTimeoutRunnable = null

            if (connectedSco) {
                promise.resolve(true)
            } else {
                // Roll back mode change on failure, don't leave the device stuck
                audioManager.mode = previousAudioMode ?: AudioManager.MODE_NORMAL
                promise.reject("SCO_FAILED", "Bluetooth SCO did not connect")
            }
        }

        try {
            audioManager.isBluetoothScoOn = true
            audioManager.startBluetoothSco()
        } catch (e: Exception) {
            audioManager.mode = previousAudioMode ?: AudioManager.MODE_NORMAL
            pendingStartCallback = null
            promise.reject("SCO_EXCEPTION", "startBluetoothSco threw: ${e.message}")
            return@hasConnectedBluetoothMic
        }

        scoTimeoutRunnable = Runnable {
            if (pendingStartCallback != null) {
                pendingStartCallback?.invoke(false)
                pendingStartCallback = null
            }
        }
        Handler(Looper.getMainLooper()).postDelayed(scoTimeoutRunnable!!, 15000)
    }
}
@ReactMethod
fun stopBluetoothMic() {
    audioManager.stopBluetoothSco()
    audioManager.mode = AudioManager.MODE_NORMAL
    audioManager.isBluetoothScoOn = false
    if (scoReceiverRegistered) {
        reactApplicationContext.unregisterReceiver(scoStateReceiver)
        scoReceiverRegistered = false
    }
}


  @ReactMethod
fun requestAudioFocus(callback: Callback) {

    val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        focusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build()
            )
            .setOnAudioFocusChangeListener { focusChange ->
                Log.d("AudioFocusModule", "Focus changed: $focusChange")
            }
            .build()
        audioManager?.requestAudioFocus(focusRequest!!)
    } else {
        @Suppress("DEPRECATION")
        audioManager?.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
    }

    val granted = result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
    Log.d("AudioFocusModule", "requestAudioFocus result: $result, granted: $granted")

    val delay = if (granted && isWiredHeadsetConnected()) 500L else 0L

    Handler(Looper.getMainLooper()).postDelayed({
        callback(granted)
    }, delay)
}
    @ReactMethod
    fun isWiredHeadsetConnected(): Boolean {
        val devices = audioManager?.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
        return devices?.any {
            it.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES ||
            it.type == AudioDeviceInfo.TYPE_WIRED_HEADSET
        } ?: false
    }

    @ReactMethod
    fun releaseAudioFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            focusRequest?.let { audioManager?.abandonAudioFocusRequest(it) }
              Log.d(TAG, "requestAudioFocus released")
        } else {
            @Suppress("DEPRECATION")
            audioManager?.abandonAudioFocus(null)
        }
    }


    @ReactMethod
    fun toggleMedia(callback: Callback) {
        hasFocus = !hasFocus
        callback(hasFocus)  // true = take focus, false = give it away
    }


    @ReactMethod
    fun isMediaPlaying(promise: Promise) {
        val audioManager = reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        promise.resolve(audioManager.isMusicActive)
    }

    @RequiresApi(Build.VERSION_CODES.N)
    @ReactMethod
    fun isMicInUse(promise: Promise) {
        val configs = audioManager.activeRecordingConfigurations
        promise.resolve(configs.size-1 > 0)
    }

    @RequiresApi(Build.VERSION_CODES.N)
    @ReactMethod
    fun isMicInUseByOtherApp(promise: Promise) {
        val configs = audioManager.activeRecordingConfigurations
        promise.resolve(configs.size > 0)
    }

    private fun sendEvent(eventName: String, params: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @RequiresApi(Build.VERSION_CODES.N) 
    private val recordingCallback = object : AudioManager.AudioRecordingCallback() {
        override fun onRecordingConfigChanged(configs: MutableList<AudioRecordingConfiguration>) {
            sendEvent("onMicStatusChanged", (configs.size - 1 > 0).toString())
        }
    }

    @RequiresApi(Build.VERSION_CODES.N)
    @ReactMethod
    fun startMicMonitoring(promise: Promise) {
        audioManager.registerAudioRecordingCallback(recordingCallback, null)
        promise.resolve(true)
    }

    @RequiresApi(Build.VERSION_CODES.N)
    @ReactMethod
    fun stopMicMonitoring(promise: Promise) {
        audioManager.unregisterAudioRecordingCallback(recordingCallback)
        promise.resolve(true)
    }



    
}