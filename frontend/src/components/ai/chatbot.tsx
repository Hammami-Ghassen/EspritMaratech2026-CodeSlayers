'use client';

import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpeakButton } from '@/components/ui/speak-button';
import { useAuth } from '@/lib/auth-provider';
import { callAi, type AiMessage } from '@/lib/ai-client';

interface ChatMessage extends AiMessage {
  id: string;
  timestamp: Date;
}

/**
 * Premium AI Chatbot — floating widget available on every page.
 * Context-aware: adapts greetings based on user role.
 * Bilingual: FR + ar-TN responses.
 */
export function AiChatbot() {
  const t = useTranslations('ai');
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const roleLabel = user?.roles?.[0]?.toLowerCase() || 'user';

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context-enriched messages for the AI
      const contextPrefix = `[User role: ${roleLabel}, name: ${user?.firstName || 'User'}] `;
      const aiMessages: AiMessage[] = messages
        .slice(-10) // Keep last 10 messages for context
        .map((m) => ({ role: m.role, content: m.content }));
      aiMessages.push({ role: 'user', content: contextPrefix + text });

      const response = await callAi(aiMessages, 'chat');

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: t('chatError'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, roleLabel, user, t]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${
          isOpen
            ? 'rotate-0 bg-gray-700 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500'
            : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 hover:shadow-xl hover:scale-105'
        }`}
        aria-label={isOpen ? t('closeChat') : t('openChat')}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <Sparkles className="absolute -end-1.5 -top-1.5 h-3.5 w-3.5 text-yellow-300" />
          </div>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 end-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 zoom-in-95 dark:border-gray-700/60 dark:bg-gray-800/95 sm:w-[420px]"
          role="dialog"
          aria-modal="false"
          aria-label={t('chatTitle')}
          style={{ height: 'min(560px, calc(100vh - 10rem))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200/60 bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-white dark:from-sky-600 dark:to-blue-700">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{t('chatTitle')}</h2>
                <p className="text-[11px] text-white/70">{t('chatSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label={t('clearChat')}
                  title={t('clearChat')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            role="log"
            aria-live="polite"
            aria-label={t('chatMessages')}
          >
            {messages.length === 0 ? (
              /* Welcome screen */
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30">
                  <Sparkles className="h-8 w-8 text-sky-500 dark:text-sky-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {t('chatWelcome', { name: user?.firstName || '' })}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('chatWelcomeDesc')}
                  </p>
                </div>
                {/* Quick suggestions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {getSuggestions(roleLabel, t).map((suggestion) => (
                    <button
                      key={suggestion.key}
                      onClick={() => {
                        setInput(suggestion.text);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:border-sky-600 dark:hover:bg-sky-900/30 dark:hover:text-sky-300"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                        msg.role === 'user'
                          ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400'
                          : 'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-400'
                      }`}
                      aria-hidden="true"
                    >
                      {msg.role === 'user' ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-sky-500 text-white dark:bg-sky-600'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700/70 dark:text-gray-200'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div
                          className="prose prose-xs max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0 prose-headings:text-sm prose-headings:mt-2 prose-headings:mb-1"
                          dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.role === 'assistant' && (
                        <div className="mt-1.5 flex justify-end">
                          <SpeakButton text={msg.content} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2.5">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
                      <Bot className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-700/70">
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200/60 bg-gray-50/50 px-3 py-3 dark:border-gray-700/60 dark:bg-gray-850/50">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chatPlaceholder')}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-sky-500 dark:focus:ring-sky-500"
                style={{ maxHeight: '100px' }}
                aria-label={t('chatPlaceholder')}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md hover:from-sky-400 hover:to-blue-500 disabled:opacity-50"
                aria-label={t('send')}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-gray-400 dark:text-gray-500">
              {t('chatDisclaimer')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/** Role-based quick suggestions */
function getSuggestions(role: string, t: (key: string) => string) {
  const common = [
    { key: 'nav', text: t('suggestNav') },
  ];

  switch (role) {
    case 'admin':
      return [
        ...common,
        { key: 'users', text: t('suggestManageUsers') },
        { key: 'roles', text: t('suggestRoles') },
      ];
    case 'manager':
      return [
        ...common,
        { key: 'cert', text: t('suggestCertificates') },
        { key: 'enroll', text: t('suggestEnrollment') },
      ];
    case 'trainer':
      return [
        ...common,
        { key: 'attendance', text: t('suggestAttendance') },
        { key: 'report', text: t('suggestReport') },
      ];
    default:
      return [
        ...common,
        { key: 'help', text: t('suggestHelp') },
      ];
  }
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
