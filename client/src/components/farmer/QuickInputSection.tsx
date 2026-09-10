import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { VoiceInput } from './VoiceInput';

interface QuickInputSectionProps {
  onSubmit: (queryText: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export const QuickInputSection: React.FC<QuickInputSectionProps> = ({
  onSubmit,
  isLoading,
  error
}) => {
  const [inputText, setInputText] = useState('I have 2 tonnes of tomatoes, ready in 5 days');

  const presetExamples = [
    'I have 2 tonnes of tomatoes, ready in 5 days',
    '1.5 tonnes of onions ready today',
    '50 quintals of rice ready in 3 days',
    '3 tonnes of potatoes ready in 2 days'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSubmit(inputText.trim());
  };

  const handleVoiceTranscriptCaptured = (transcript: string) => {
    if (!transcript) return;
    setInputText(transcript);
    onSubmit(transcript);
  };

  return (
    <div className="glass-panel-gold rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        <div className="flex items-center space-x-3 mb-1">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Tell us what you have.</h2>
            <p className="text-sm text-slate-400">
              Speak in your language or type to instantly match your harvest to peak markets, prices, and buyers.
            </p>
          </div>
        </div>

        {/* Multilingual Voice Input Component */}
        <VoiceInput
          onTranscriptCaptured={handleVoiceTranscriptCaptured}
          disabled={isLoading}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. I have 2 tonnes of tomatoes, ready in 5 days"
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500/80 rounded-xl p-4 pr-36 text-white text-base sm:text-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none shadow-inner"
            />
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-semibold rounded-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Get Market Guidance</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Examples */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium mr-1">Quick examples:</span>
            {presetExamples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(ex);
                  onSubmit(ex);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-emerald-950/60 hover:text-emerald-300 border border-slate-700/60 text-slate-300 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
