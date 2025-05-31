package com.moonnic.timer_with_commands

import com.moonnic.timer_with_commands.NativeUtilsModule
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class NativeUtilsPackage : ReactPackage {
  override fun createNativeModules(reactContext : ReactApplicationContext) : List<NativeModule> {
    return listOf(NativeUtilsModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext) : List<ViewManager<*, *>> {
    return emptyList()
  }
}