import React from 'react';
import { Mic, MicOff, Square, AlertCircle, Globe, Loader2 } from 'lucide-react';
import { useSpeechRecognition, VOICE_LANGUAGES } from '../../hooks/useSpeechRecognition';

interface VoiceInputProps {
  onTranscriptCaptured: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptCaptured,
  disabled = false,
  className = ''
}) => {
  const {
    isSupported,
    isListening,
    isProcessing,
    transcript,
    error,
    language,
    setLanguage,
    startListening,
    stopListening,
    reset
  } = useSpeechRecognition(onTranscriptCaptured);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (isListening) {
      stopListening();
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-700/60 rounded-xl p-3 sm:p-4">
        {/* Language Selector */}
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <label htmlFor="voice-language-select" className="text-xs sm:text-sm text-slate-300 font-medium whitespace-nowrap">
            Voice Language:
          </label>
          <select
            id="voice-language-select"
            aria-label="Voice input language selector"
            value={language}
            onChange={handleLanguageChange}
            disabled={disabled || isListening || isProcessing}
            className="bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors cursor-pointer"
          >
            {VOICE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label} ({lang.code})
              </option>
            ))}
          </select>
        </div>

        {/* Speak / Listening / Processing Controls */}
        <div className="flex items-center space-x-2">
          {!isSupported ? (
            <div
              tabIndex={0}
              role="status"
              className="flex items-center space-x-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5"
            >
              <MicOff className="w-4 h-4 flex-shrink-0" />
              <span>Voice unavailable in this browser</span>
            </div>
          ) : isListening ? (
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs sm:text-sm text-rose-300 font-medium animate-pulse">Listening...</span>
              <button
                type="button"
                onClick={stopListening}
                aria-label="Stop voice recognition"
                className="flex items-center space-x-1 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-medium text-xs rounded-lg transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center space-x-2 text-emerald-400 text-xs sm:text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Processing speech...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={disabled}
              aria-label="Start microphone voice input"
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>🎙 Speak</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 flex items-start justify-between gap-2 animate-fadeIn">
          <div>
            <span className="text-emerald-400 font-semibold block text-xs uppercase tracking-wider mb-1">
              You said:
            </span>
            <p className="italic text-slate-100 font-medium text-base">"{transcript}"</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors p-1"
            title="Clear transcript"
          >
            Clear
          </button>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div
          role="alert"
          className="flex items-center space-x-2 text-rose-400 text-xs sm:text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl p-3"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
