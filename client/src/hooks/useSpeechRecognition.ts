import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceLanguage {
  code: string;
  label: string;
}

export const VOICE_LANGUAGES: VoiceLanguage[] = [
  { code: 'en-IN', label: 'English' },
  { code: 'te-IN', label: 'తెలుగు' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ' },
  { code: 'mr-IN', label: 'మరాఠీ' }
];

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    item(index: number): {
      length: number;
      item(index: number): { transcript: string; confidence: number };
      [index: number]: { transcript: string; confidence: number };
    };
    [index: number]: {
      length: number;
      item(index: number): { transcript: string; confidence: number };
      [index: number]: { transcript: string; confidence: number };
    };
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ISpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognitionInstance;

function getSpeechRecognitionClass(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as Record<string, SpeechRecognitionConstructor | undefined>;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function useSpeechRecognition(onResultCallback?: (transcript: string) => void) {
  const SpeechRecognitionClass = getSpeechRecognitionClass();
  const isSupported = Boolean(SpeechRecognitionClass);

  const [language, setLanguage] = useState<string>('te-IN');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Cleanup ignore
        }
      }
    };
  }, []);

  const startListening = useCallback(
    (langOverride?: string) => {
      setError(null);
      setTranscript('');

      if (!SpeechRecognitionClass) {
        setError('Voice input is not supported by your browser. Please use manual input.');
        return;
      }

      const activeLang = langOverride || language;

      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // Ignore abort error
          }
        }

        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.lang = activeLang;

        recognition.onstart = () => {
          setIsListening(true);
          setIsProcessing(false);
          setError(null);
        };

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
          setIsProcessing(true);
          setIsListening(false);

          let finalTranscript = '';
          if (event.results && event.results.length > 0) {
            finalTranscript = event.results[0][0]?.transcript || '';
          }

          finalTranscript = finalTranscript.trim();
          setTranscript(finalTranscript);
          setIsProcessing(false);

          if (finalTranscript) {
            if (onResultCallback) {
              onResultCallback(finalTranscript);
            }
          } else {
            setError('No speech was detected. Please try speaking again.');
          }
        };

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
          setIsListening(false);
          setIsProcessing(false);

          const errType = event.error;
          if (errType === 'not-allowed' || errType === 'service-not-allowed') {
            setError('Microphone access was denied. Please allow microphone permission.');
          } else if (errType === 'no-speech') {
            setError('No speech was detected. Please try speaking again.');
          } else if (errType === 'audio-capture') {
            setError('No microphone was found. Please check your audio input hardware.');
          } else if (errType === 'network') {
            setError('Network error occurred during speech recognition.');
          } else if (errType === 'aborted') {
            setError('Speech recognition was stopped.');
          } else {
            setError(`Speech recognition error (${errType}). Please try again.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setIsProcessing(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        setIsListening(false);
        setIsProcessing(false);
        setError(err?.message || 'Could not start microphone recognition.');
      }
    },
    [SpeechRecognitionClass, language, onResultCallback]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
    setIsProcessing(false);
  }, []);

  const reset = useCallback(() => {
    stopListening();
    setTranscript('');
    setError(null);
  }, [stopListening]);

  return {
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
  };
}
