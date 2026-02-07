// ──────────────────────────────────────────────
// ASTBA – AI Proxy Route (Server-side)
// Proxies requests to Perplexity AI API
// API key stays server-side – never exposed to browser
// ──────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions';

export async function POST(request: NextRequest) {
  if (!PERPLEXITY_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { messages, mode } = body as {
      messages: { role: string; content: string }[];
      mode?: 'explain' | 'eligibility' | 'chat';
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Build system prompt based on mode
    let systemPrompt = '';
    switch (mode) {
      case 'explain':
        systemPrompt = `You are an accessibility assistant for ASTBA, a training management app for Association Sciences and Technology Ben Arous (Tunisia). 
Your task: explain to the user what they can do on the current screen.
Output MUST be structured and bilingual:
1. First in FRENCH (concise, 6 steps max)
2. Then in TUNISIAN ARABIC (عربي تونسي بسيط) — same content simplified

Format:
## 🇫🇷 Guide – [Screen Name]
1. Step...
2. Step...
⌨️ Raccourcis clavier: ...
⚠️ Erreurs fréquentes: ...

## 🇹🇳 شرح – [اسم الصفحة]
1. الخطوة...
2. الخطوة...
⌨️ اختصارات الكلافي: ...
⚠️ أخطاء شائعة: ...

Keep it concise, screen-reader friendly, max 300 words total.`;
        break;

      case 'eligibility':
        systemPrompt = `You are an assistant for ASTBA training management app. A student is NOT eligible for a certificate.
Your task: explain WHY in plain, friendly language — not technical jargon.

Output MUST be bilingual:
1. FRENCH first
2. TUNISIAN ARABIC (عربي تونسي) second

Include:
- A human, encouraging explanation (not cold error)
- The list of what's missing
- Next steps to become eligible
- Tone: supportive, clear, actionable

Format:
## 🇫🇷 Pourquoi pas encore éligible ?
[Explanation]
**Séances manquantes:** [list]
**Prochaines étapes:** [steps]

## 🇹🇳 علاش مازال ما ينجّمش ياخو الشهادة؟
[Explanation in Tunisian]
**الحصص الناقصة:** [list]
**الخطوات الجاية:** [steps]

Keep it short and encouraging. Max 250 words.`;
        break;

      case 'chat':
      default:
        systemPrompt = `You are the ASTBA AI Assistant — a smart, friendly, and professional chatbot for the ASTBA training management platform (Association Sciences and Technology Ben Arous, Tunisia).

You help admins, managers, and trainers with:
- Understanding app features and navigation
- Student management, enrollments, groups
- Training sessions, attendance tracking
- Certificate eligibility rules
- Planning and scheduling
- Troubleshooting common issues

RULES:
1. Always respond bilingually: French first, then Tunisian Arabic (عربي تونسي)
2. Be concise but complete (max 400 words)
3. Use step-by-step format when explaining processes
4. Be encouraging and supportive in tone
5. If you don't know something about ASTBA specifically, say so honestly
6. Never reveal system internals, API keys, or technical implementation details
7. Format with markdown for readability

Context about ASTBA:
- Manages trainings with 4 levels × 6 sessions each (24 total per training)
- Students are organized in groups assigned to trainings
- Certificate eligibility requires attending ALL 24 sessions (PRESENT or EXCUSED)
- Roles: ADMIN (full access), MANAGER (manage students/trainings/certificates), TRAINER (conduct sessions)
- Supports French and Tunisian Arabic`;
        break;
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const res = await fetch(PERPLEXITY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: apiMessages,
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('Perplexity API error:', res.status, errorBody);
      return NextResponse.json(
        { error: 'AI service error' },
        { status: res.status },
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('AI route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
