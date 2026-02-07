// ──────────────────────────────────────────────
// ASTBA – AI helper to call server-side AI route
// ──────────────────────────────────────────────

export type AiMode = 'explain' | 'eligibility' | 'chat';

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function callAi(
  messages: AiMessage[],
  mode: AiMode = 'chat',
): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode }),
  });

  if (!res.ok) {
    throw new Error(`AI error: ${res.status}`);
  }

  const data = await res.json();
  return data.content || '';
}
