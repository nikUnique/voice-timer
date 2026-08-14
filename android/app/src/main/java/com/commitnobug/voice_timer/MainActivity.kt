package com.commitnobug.voice_timer

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.app.KeyguardManager
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.bridge.Callback
import android.net.Uri;
import android.app.AlarmManager;
import android.content.Intent
import android.provider.Settings
import com.asterinet.react.bgactions.RNBackgroundActionsTask
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import android.graphics.Color
import android.view.View
import android.media.AudioManager


import expo.modules.ReactActivityDelegateWrapper
// Import the NotifeeApiModule
import io.invertase.notifee.NotifeeApiModule;

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null)

    if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      val window = window
      window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
      window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)

      window.statusBarColor = Color.TRANSPARENT
      window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN  or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
    }


     val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
     val isLocked = keyguardManager.isDeviceLocked
    

   if (isLocked) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      System.out.println("Do you see me?")
        setShowWhenLocked(true)
        setTurnScreenOn(true)
    } else {
        window.addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )
    }
}

     

 

  }


// override fun onTrimMemory(level: Int) {
//     super.onTrimMemory(level)
//     if (level == TRIM_MEMORY_UI_HIDDEN) {
//         Log.d("MyApp", "UI is no longer visible — safe to start foreground service")
//         // start service here
//     }
// }
// override fun onUserLeaveHint() {
//     super.onUserLeaveHint()
//     Log.d("MyApp", "User swiped away or pressed home")
//     // You can trigger your foreground service here
// }


// override fun onResume() {
//     super.onResume()

//     if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
//         val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
//         if (!alarmManager.canScheduleExactAlarms()) {
//             val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
//                 data = Uri.parse("package:$packageName")
//             }
//             startActivity(intent)
//         }
//     }
// }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

   override fun getMainComponentName(): String {
        return NotifeeApiModule.getMainComponent("main")
    }
 /** override fun getMainComponentName(): String = "main"*/

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }




}


 
