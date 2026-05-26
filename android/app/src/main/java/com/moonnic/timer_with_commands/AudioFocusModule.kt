package com.moonnic.timer_with_commands

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

private val TAG = "AudioFocusModule"
private var hasFocus = false




class AudioFocusModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AudioFocusModule"

    private val audioManager: AudioManager =
    reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var focusRequest: AudioFocusRequest? = null
    private var scoReceiver: BroadcastReceiver? = null


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
                .build()
            audioManager?.requestAudioFocus(focusRequest!!)
        } else {
            @Suppress("DEPRECATION")
            audioManager?.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
        }

        val granted = result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
        val delay = if (granted && isWiredHeadsetConnected()) 500L else 0L

        Handler(Looper.getMainLooper()).postDelayed({
            callback(granted)
        }, delay)
    }

    private fun isWiredHeadsetConnected(): Boolean {
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
}