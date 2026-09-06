package com.commitnobug.voice_timer

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.facebook.react.bridge.Arguments
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.media.AudioManager
import android.content.Context

class VolumeObserverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var volumeObserver: VolumeObserver? = null
    override fun getName() = "VolumeObserver"

    @ReactMethod
    fun startObserving() {
        println("change in VolumeObserverModule")
        val handler = Handler(Looper.getMainLooper())
        val onVolumeChange: (Int) -> Unit = { volume ->
            val params = Arguments.createMap()
            params.putInt("volume", volume)
            reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("volumeChanged", params)}

        volumeObserver = VolumeObserver(handler, reactApplicationContext.applicationContext, onVolumeChange)
        val uri = Settings.System.getUriFor("volume_music")

        volumeObserver?.let {observer -> 
        reactApplicationContext.applicationContext.contentResolver.registerContentObserver(uri, false, observer)
        }
    }

    @ReactMethod
    fun stopObserving() {
        volumeObserver?.let { observer ->
            reactApplicationContext.applicationContext.contentResolver.unregisterContentObserver(observer)
        }

        volumeObserver = null
    }
    
    @ReactMethod 
    fun addListener(eventName: String) {

    }

    @ReactMethod
    fun removeListeners(count: Int) {
        
    }

    @ReactMethod
    fun setVolume(volume: Int) {
        val audioManager = reactApplicationContext.applicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, volume, AudioManager.FLAG_SHOW_UI)
    }

}