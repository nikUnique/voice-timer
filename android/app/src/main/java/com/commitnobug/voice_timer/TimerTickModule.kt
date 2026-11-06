package com.commitnobug.voice_timer

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper
import android.os.PowerManager
import android.content.Context

class TimerTickModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "TimerTick"

  private val handlerThread = HandlerThread("TimerTick").apply { start() }
  private val handler = Handler(handlerThread.looper)
  private var ticking = false
  private var wakeLock: PowerManager.WakeLock? = null

  private val tickRunnable = object : Runnable {
    override fun run() {
      if (!ticking) return
      reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("TimerTick", null)
      handler.postDelayed(this, 1000)
    }
  }

  private var activeCount = 0

  @ReactMethod
  fun startTicking() {
    activeCount++
    if (ticking) return
    ticking = true
    val pm = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "voice_timer:TimerTick")
    wakeLock?.setReferenceCounted(false)
    wakeLock?.acquire()
    handler.post(tickRunnable)
  }

  @ReactMethod
  fun stopTicking() {
    activeCount = (activeCount - 1).coerceAtLeast(0)
    if (activeCount > 0) return
    ticking = false
    handler.removeCallbacks(tickRunnable)
    wakeLock?.let { if (it.isHeld) it.release() }
    wakeLock = null
  }

  @ReactMethod
  fun stopAll() {
    activeCount = 0
    ticking = false
    handler.removeCallbacks(tickRunnable)
    wakeLock?.let { if (it.isHeld) it.release() }
    wakeLock = null
  }

  @ReactMethod
  fun addListener(eventName: String) {}

  @ReactMethod
  fun removeListeners(count: Int) {}
}
