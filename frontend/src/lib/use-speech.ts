'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * React hook for Web Speech API text-to-speech.
 * Auto-selects a voice matching the given locale (fr / ar).
 * Waits for voices to load asynchronously so Arabic works reliably.
 * Gracefully degrades on browsers without speech synthesis support.
 */
export function useSpeech(locale: string = 'fr') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices — they arrive asynchronously in most browsers
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const v = synth.getVoices();
      if (v.length > 0) setVoices(v);
    };

    loadVoices(); // may already be available
    synth.addEventListener('voiceschanged', loadVoices);
    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
      synth.cancel();
    };
  }, [supported]);

  /**
   * Pick the best voice for Arabic or French.
   * Arabic voices vary wildly by browser/OS:
   *   Chrome: "ar-SA", "ar-XA" (Google), Edge: "ar-SA", "ar-EG"
   *   Safari: "ar-001"
   * We try several codes so at least one matches.
   */
  const pickVoice = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      if (voices.length === 0) return null;

      if (lang === 'ar') {
        // Preferred Arabic locale codes, ordered by quality
        const preferred = ['ar-XA', 'ar-SA', 'ar-EG', 'ar-TN', 'ar-001', 'ar'];
        for (const code of preferred) {
          const v = voices.find(
            (v) => v.lang.toLowerCase() === code.toLowerCase() ||
                   v.lang.toLowerCase().startsWith(code.toLowerCase()),
          );
          if (v) return v;
        }
        // Last resort: any voice whose lang contains "ar"
        return voices.find((v) => v.lang.toLowerCase().includes('ar')) || null;
      }

      // French
      const preferred = ['fr-FR', 'fr-CA', 'fr'];
      for (const code of preferred) {
        const v = voices.find(
          (v) => v.lang.toLowerCase() === code.toLowerCase() ||
                 v.lang.toLowerCase().startsWith(code.toLowerCase()),
        );
        if (v) return v;
      }
      return voices.find((v) => v.lang.toLowerCase().includes('fr')) || null;
    },
    [voices],
  );

  /** Strip HTML tags and clean up text for speech */
  const cleanText = (html: string): string =>
    html
      .replace(/<[^>]+>/g, ' ')     // strip HTML tags
      .replace(/&[a-z]+;/gi, ' ')    // strip HTML entities
      .replace(/[#*_`~]/g, '')       // strip markdown
      .replace(/\s+/g, ' ')          // collapse whitespace
      .trim();

  /** Start speaking the given text */
  const speak = useCallback(
    (rawText: string) => {
      if (!supported || !rawText) return;
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const text = cleanText(rawText);
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      const isArabic = locale.startsWith('ar');

      // Set the BCP-47 lang tag — critical for the synth engine to pick
      // the right pronunciation model even if no matching voice is found
      utterance.lang = isArabic ? 'ar-SA' : 'fr-FR';
      utterance.rate = isArabic ? 0.88 : 0.92; // slightly slower for Arabic clarity
      utterance.pitch = 1;

      const voice = pickVoice(isArabic ? 'ar' : 'fr');
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; // sync lang to the actual voice
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [supported, locale, pickVoice],
  );

  /** Stop speaking */
  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  /** Toggle speech */
  const toggle = useCallback(
    (text: string) => {
      if (isSpeaking) {
        stop();
      } else {
        speak(text);
      }
    },
    [isSpeaking, speak, stop],
  );

  return { speak, stop, toggle, isSpeaking, supported };
}
