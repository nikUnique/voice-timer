package com.moonnic.timer_with_commands

import android.content.Context
import android.view.textservice.*
import com.facebook.react.bridge.*

class SpellCheckerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext),
    SpellCheckerSession.SpellCheckerSessionListener {

    private var spellCheckerSession: SpellCheckerSession? = null
    private var promise: Promise? = null

    init {
        val textServicesManager = reactContext.getSystemService(Context.TEXT_SERVICES_MANAGER_SERVICE) as TextServicesManager
        spellCheckerSession = textServicesManager.newSpellCheckerSession(null, null, this, true)
    }

    override fun getName(): String {
        return "SpellChecker"
    }

    @ReactMethod
    fun checkSpelling(word: String, promise: Promise) {
        this.promise = promise
        spellCheckerSession?.getSuggestions(TextInfo(word), 1)
    }

    override fun onGetSuggestions(suggestions: Array<out SuggestionsInfo>?) {
        val isCorrect = suggestions?.firstOrNull()?.suggestionsCount == 0
        promise?.resolve(isCorrect)
    }

    override fun onGetSentenceSuggestions(results: Array<out SentenceSuggestionsInfo>?) {}
}
