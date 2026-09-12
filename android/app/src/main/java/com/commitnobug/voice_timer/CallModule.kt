package com.commitnobug.voice_timer

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.telecom.TelecomManager
import androidx.core.content.ContextCompat

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class CallModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "CallModule"

    @ReactMethod
    fun makeCall(phoneNumber: String, promise: Promise) {
        val context: Context = reactApplicationContext

        val hasPermission = ContextCompat.checkSelfPermission(
            context, Manifest.permission.CALL_PHONE
        ) == PackageManager.PERMISSION_GRANTED

        if(!hasPermission) {
        promise.reject("NO_PERMISSION", "CALL_PHONE permission not granted")
        return
        }

        try {
            val telecomManager = context.getSystemService(Context.TELECOM_SERVICE) as TelecomManager
            val extras = Bundle()
            telecomManager.placeCall(Uri.parse("tel:$phoneNumber"), extras)
            promise.resolve(true)
        } catch (e: SecurityException) {
            promise.reject("NO_PERMISSION", "CALL_PHONE permission not granted")
        }
        catch (e: Exception) {
            promise.reject("CALL_FAILED", e.message)
        }
    }
}