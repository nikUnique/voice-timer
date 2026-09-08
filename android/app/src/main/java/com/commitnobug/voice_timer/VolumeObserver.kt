package com.commitnobug.voice_timer

import android.database.ContentObserver
import android.os.Handler

class VolumeObserver(
  handler: Handler,
  private val onVolumeChange: () -> Unit,
) : ContentObserver(handler) {

    override fun onChange(selfChange: Boolean) {
        onVolumeChange()
    }    
}