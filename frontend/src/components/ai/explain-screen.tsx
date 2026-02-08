'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { HelpCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpeakButton } from '@/components/ui/speak-button';
import { callAi } from '@/lib/ai-client';
import { useLocale } from '@/lib/providers';

interface ExplainScreenProps {
  /** Unique screen identifier for context, e.g. "students-list", "certificates" */
  screenId: string;
  /** Brief description of what's on the screen (sent to AI) */
  screenContext: string;
}

/**
 * "Explain this screen" button — generates bilingual AI guidance.
 * Renders as a floating accessible button + expandable panel.
 */
export function ExplainScreen({ screenId, screenContext }: ExplainScreenProps) {
  const t = useTranslations('ai');
  const { locale } = useLocale();
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
      const result = await callAi(
        [
          {
            role: 'user',
            content: `Screen: "${screenId}". Context: ${screenContext}. Explain what the user can do here.`,
          },
        ],
        'explain',
        locale,
      );
      setContent(result);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [screenId, screenContext, content, locale]);

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExplain}
        className="gap-2 border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:hover:bg-sky-950"
        aria-label={t('explainScreen')}
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('explainScreen')}</span>
      </Button>

      {/* Explanation panel overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={t('explainScreen')}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="relative z-10 mx-4 mb-4 w-full max-w-xl animate-in slide-in-from-bottom-4 sm:mb-0">
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-800/95">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200/60 px-5 py-3 dark:border-gray-700/60">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {t('explainScreen')}
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

              {/* Content */}
              <div
                className="max-h-[60vh] overflow-y-auto px-5 py-4"
                tabIndex={0}
                role="document"
                aria-live="polite"
              >
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" aria-hidden="true" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('generating')}</p>
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

/** Minimal Markdown → HTML converter (no external dependency) */
function markdownToHtml(md: string): string {
  return md
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines
    .replace(/\n/g, '<br/>')
    // Wrap in paragraph
    .replace(/^(.+)/, '<p>$1</p>')
    // Clean empty paragraphs
    .replace(/<p><\/p>/g, '')
    // Emoji flags — keep as-is
    ;
}
