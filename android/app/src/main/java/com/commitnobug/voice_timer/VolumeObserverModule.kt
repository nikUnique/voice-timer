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

import kotlin.math.roundToInt

class VolumeObserverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var volumeObserver: VolumeObserver? = null
    private var lastMusicVolume = -1
    override fun getName() = "VolumeObserver"

    @ReactMethod
    fun startObserving() {
        val handler = Handler(Looper.getMainLooper())
        val audioManager = reactApplicationContext.applicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        
        lastMusicVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        val onVolumeChange: () -> Unit = { 
            val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)

            if (currentVolume != lastMusicVolume) {
                lastMusicVolume = currentVolume
                val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
                val normalizedVolume = currentVolume.toDouble() / maxVolume.toDouble()

                val params = Arguments.createMap()
                params.putDouble("volume", normalizedVolume)
                reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("volumeChanged", params)}
            }
        

        volumeObserver = VolumeObserver(handler, onVolumeChange)
        val uri = Settings.System.CONTENT_URI

        volumeObserver?.let {observer -> 
        reactApplicationContext.applicationContext.contentResolver.registerContentObserver(uri, true, observer)
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
    fun setVolume(volume: Double) {
        val audioManager = reactApplicationContext.applicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
        val streamVolume = (volume * maxVolume).roundToInt()
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, streamVolume, AudioManager.FLAG_SHOW_UI)
        lastMusicVolume = streamVolume
    }

}