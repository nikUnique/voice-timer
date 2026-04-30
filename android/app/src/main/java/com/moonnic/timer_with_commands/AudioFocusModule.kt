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

private val TAG = "AudioFocusModule"


class AudioFocusModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AudioFocusModule"

    private val audioManager: AudioManager =
    reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private var focusRequest: AudioFocusRequest? = null
    private var scoReceiver: BroadcastReceiver? = null


    @ReactMethod
    fun requestAudioFocus() {
           Log.d(TAG, "requestAudioFocus called")
       
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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
            audioManager?.requestAudioFocus(
                null,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
            )
        }
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
    fun startBluetoothSco() {
        val devices = audioManager.getDevices(AudioManager.GET_DEVICES_INPUTS)
        val hasBluetooth = devices.any { it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO }
        if (hasBluetooth) {
            audioManager.mode = AudioManager.MODE_NORMAL  // force this BEFORE starting SCO
            audioManager.startBluetoothSco()
            audioManager.isBluetoothScoOn = true
            Log.d(TAG, "SCO started, mode kept NORMAL")
        }
    }
    
    @ReactMethod
    fun stopBluetoothSco() {
        audioManager.stopBluetoothSco()
        audioManager.isBluetoothScoOn = false
        Log.d(TAG, "Bluetooth SCO stopped")
    }
}