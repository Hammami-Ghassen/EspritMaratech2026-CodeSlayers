'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSpeech } from '@/lib/use-speech';

interface SpeakButtonProps {
  /** The text (or HTML) to read aloud */
  text: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Extra class names */
  className?: string;
}

/**
 * A small icon button that reads text aloud using the Web Speech API.
 * Automatically uses the current locale for voice selection.
 */
export function SpeakButton({ text, size = 'sm', className = '' }: SpeakButtonProps) {
  const locale = useLocale();
  const t = useTranslations('ai');
  const { toggle, isSpeaking, supported } = useSpeech(locale);

  if (!supported) return null;

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5';
  const btnSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <button
      type="button"
      onClick={() => toggle(text)}
      className={`inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 ${btnSize} ${
        isSpeaking
          ? 'bg-sky-100 text-sky-600 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-400 dark:hover:bg-sky-900/60'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300'
      } ${className}`}
      aria-label={isSpeaking ? t('stopSpeaking') : t('speak')}
      title={isSpeaking ? t('stopSpeaking') : t('speak')}
    >
      {isSpeaking ? (
        <VolumeX className={iconSize} />
      ) : (
        <Volume2 className={iconSize} />
      )}
    </button>
  );
}
