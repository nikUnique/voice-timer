package com.moonnic.timer_with_commands
import android.util.Log
import android.app.Activity
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import android.app.KeyguardManager
import android.content.Context
import android.provider.Settings
import android.net.Uri;
import android.app.AlarmManager;
import android.os.DeadObjectException;
import android.view.WindowManager;





class NativeUtilsModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

   override fun getName(): String {
    return "NativeUtilsModule"
   }

 @ReactMethod
fun getCurrentActivityName(promise: Promise) {
    val activity = currentActivity
    if (activity != null && activity is MainActivity) {
        promise.resolve("MainActivity")
    } else {
        promise.resolve("No activity")
    }
}


@ReactMethod
fun checkExactAlarmPermission(promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val alarmManager = reactApplicationContext
            .getSystemService(Context.ALARM_SERVICE) as AlarmManager
        promise.resolve(alarmManager.canScheduleExactAlarms())
    } else {
        promise.resolve(true)
    }
}

  @ReactMethod
    fun requestExactAlarmPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            if (!alarmManager.canScheduleExactAlarms()) {
                val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
            }
        }
    }

@ReactMethod
fun openNotificationChannel(channelId: String) {
    val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        Intent().apply {
            action = Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS
            putExtra(Settings.EXTRA_APP_PACKAGE, reactApplicationContext.packageName)
            putExtra(Settings.EXTRA_CHANNEL_ID, channelId)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    } else {
        // API 24–25: no channel settings screen, fall back to app notification settings
        Intent().apply {
            action = Settings.ACTION_APP_NOTIFICATION_SETTINGS
            putExtra("app_package", reactApplicationContext.packageName)
            putExtra("app_uid", reactApplicationContext.applicationInfo.uid)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }

    reactApplicationContext.startActivity(intent)
}

  @ReactMethod
fun permitShowingWhenLocked() {
  val activity = currentActivity

  if (activity != null && activity is MainActivity) {
    activity.run {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
        // Android 8.1+
        setShowWhenLocked(true)
        setTurnScreenOn(true)
      } else {
        // Android 7 and below
        window.addFlags(
          WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
      }
    }
  }
}

    @ReactMethod
    fun forbidShowingWhenLocked() {
    val activity = currentActivity

    activity?.runOnUiThread {
    if(activity !== null && activity is MainActivity && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
    activity.setShowWhenLocked(false)
    activity.setTurnScreenOn(false)
    }
    else if(activity !== null && activity is MainActivity ) {
      activity.window.clearFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
      )
    }
    }
 }
    @ReactMethod
    fun closeMainActivity() {
    val activity = currentActivity
   // ✅ clean version
  if (activity != null && activity is MainActivity) {
     activity?.runOnUiThread {
    activity.moveTaskToBack(true)
}
  }
    }

    @ReactMethod
    fun moveAppToBackground() {
    val activity = currentActivity

    val keyguardManager = reactApplicationContext?.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

    val isLocked = keyguardManager.isDeviceLocked
    if(activity !== null && activity is MainActivity && isLocked) {
  activity?.runOnUiThread {
    activity.moveTaskToBack(true)
}
    }
    }


@ReactMethod
fun isDeviceLocked(callback: Callback) {
    val keyguardManager = reactApplicationContext
        .getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

    callback.invoke(null, keyguardManager.isDeviceLocked)
}

    @ReactMethod
    fun isPhoneLocked(promise: Promise) {
    val keyguardManager = reactApplicationContext?.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager

    // val isLocked = keyguardManager.isDeviceLocked
    val isLocked = keyguardManager.isKeyguardLocked
    promise.resolve(isLocked)
    }

    @ReactMethod
    fun crashApp() {
        try {
            // Simulate a native crash by throwing a DeadObjectException
            throw DeadObjectException("Simulated DeadObjectException")
        } catch (e: DeadObjectException) {
            // Log the exception (optional)
            e.printStackTrace()
            
            // Force the app to terminate
            System.exit(0)  // This will terminate the app process completely
            // Alternatively, you can use Process.killProcess(Process.myPid()) to kill the process
        }

    }
}