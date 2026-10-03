package com.commitnobug.voice_timer

import com.facebook.react.bridge.*

class LogcatModule(ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  override fun getName() = "Logcat"
  @ReactMethod
  fun getLogs(maxLines: Int, minLevel: String, promise: Promise) {
      // if (!BuildConfig.LOGS_ENABLED) { promise.resolve(""); return }
      Thread {
          try {
              val pid = android.os.Process.myPid()
              val proc = Runtime.getRuntime().exec(
                  arrayOf(
                      "logcat", "-d", "-v", "time",
                      "--pid=$pid",
                      "-t", maxLines.toString(),
                      "*:$minLevel"
                  )
              )
              promise.resolve(proc.inputStream.bufferedReader().use { it.readText() })
          } catch (e: Exception) {
              promise.reject("LOGCAT_ERROR", e)
          }
      }.start()
  }
}