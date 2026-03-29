'use client';

import { LoaderCircle, Mic } from 'lucide-react';
import { useRef, useState } from 'react';

type SpeechRecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function VoiceInputButton({
  onTranscript,
  disabled = false,
  label = 'Use voice',
  append = false
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  label?: string;
  append?: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);

  const startListening = () => {
    if (disabled) return;

    const ctor = (window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    }).SpeechRecognition || (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;

    if (!ctor) {
      setSupported(false);
      return;
    }

    const recognition = new ctor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      if (transcript) {
        onTranscript(append ? ` ${transcript}` : transcript);
      }
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={disabled || listening}
      className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2 text-xs font-semibold text-[#f3ddb1] hover:bg-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {listening ? <LoaderCircle size={14} className="animate-spin" /> : <Mic size={14} />}
      {supported ? (listening ? 'Listening...' : label) : 'Voice unavailable'}
    </button>
  );
}
