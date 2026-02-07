'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, X, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpeakButton } from '@/components/ui/speak-button';
import { callAi } from '@/lib/ai-client';

interface WhyNotEligibleProps {
  /** Training title (non-sensitive) */
  trainingTitle: string;
  /** Total sessions in the training (usually 24) */
  totalSessions: number;
  /** Number of sessions attended */
  attendedCount: number;
  /** List of missing session numbers, e.g. [5, 8, 14, 22] */
  missingSessions: number[];
  /** Student first name only (for friendly message) */
  studentFirstName?: string;
}

/**
 * "Why not eligible?" button + explanation panel.
 * Sends only non-sensitive training data to AI, never full student identity.
 */
export function WhyNotEligible({
  trainingTitle,
  totalSessions,
  attendedCount,
  missingSessions,
  studentFirstName,
}: WhyNotEligibleProps) {
  const t = useTranslations('ai');
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleExplain = useCallback(async () => {
    if (content) {
      setIsOpen(true);
      return;
    }
    setIsOpen(true);
    setIsLoading(true);
    setError(false);
    try {
      const prompt = `Training: "${trainingTitle}"
Total sessions: ${totalSessions}
Attended: ${attendedCount}
Missing sessions: ${missingSessions.length > 0 ? missingSessions.join(', ') : 'none specifically identified'}
${studentFirstName ? `Student first name: ${studentFirstName}` : ''}

Explain why this student is not yet eligible for a certificate, and what they need to do.`;

      const result = await callAi(
        [{ role: 'user', content: prompt }],
        'eligibility',
      );
      setContent(result);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [trainingTitle, totalSessions, attendedCount, missingSessions, studentFirstName, content]);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExplain}
        className="gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-950"
        aria-label={t('whyNotEligible')}
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-xs">{t('whyNotEligible')}</span>
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={t('whyNotEligible')}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 mx-4 mb-4 w-full max-w-lg animate-in slide-in-from-bottom-4 sm:mb-0">
            <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-amber-800/60 dark:bg-gray-800/95">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-amber-200/60 bg-amber-50/50 px-5 py-3 dark:border-amber-800/60 dark:bg-amber-950/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {t('whyNotEligible')}
                  </h2>
                  {content && <SpeakButton text={content} size="sm" />}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  aria-label={t('close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick stats banner */}
              <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-2.5 text-xs dark:border-gray-700/60">
                <span className="font-medium text-gray-700 dark:text-gray-300">{trainingTitle}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {attendedCount}/{totalSessions} {t('sessionsAttended')}
                </span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {totalSessions - attendedCount} {t('sessionsMissing')}
                </span>
              </div>

              {/* AI Content */}
              <div
                className="max-h-[50vh] overflow-y-auto px-5 py-4"
                tabIndex={0}
                role="document"
                aria-live="polite"
              >
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" aria-hidden="true" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('analyzing')}</p>
                  </div>
                ) : error ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-red-500">{t('error')}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setContent(''); handleExplain(); }}
                      className="mt-2"
                    >
                      {t('retry')}
                    </Button>
                  </div>
                ) : (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-base prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-0.5"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^(.+)/, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}
