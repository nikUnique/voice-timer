package com.commitnobug.voice_timer

import android.content.Context
import android.database.ContentObserver
import android.media.AudioManager
import android.os.Handler

class VolumeObserver(
  handler: Handler,
  context: Context,
  private val onVolumeChange: (Int) -> Unit,
) : ContentObserver(handler) {

    private val audioManager: AudioManager = 
        context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    override fun onChange(selfChange: Boolean) {
        println("change")
        val volume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
        onVolumeChange(volume)
    }    
}