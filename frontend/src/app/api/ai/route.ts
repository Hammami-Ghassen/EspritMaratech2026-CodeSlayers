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
    const { messages, mode, locale } = body as {
      messages: { role: string; content: string }[];
      mode?: 'explain' | 'eligibility' | 'chat';
      locale?: string;
    };

    const isArabic = locale?.startsWith('ar');

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Build system prompt based on mode
    let systemPrompt = '';
    switch (mode) {
      case 'explain':
        systemPrompt = isArabic
          ? `أنت مساعد إمكانية الوصول لمنصة ASTBA لإدارة التكوين (جمعية العلوم والتكنولوجيا بن عروس، تونس).
مهمتك: اشرح للمستخدم ما يمكنه فعله في هذه الصفحة.

القواعد:
- اكتب بالعربية الفصحى الواضحة فقط (لا تستخدم أي لهجة عامية)
- لا تكتب بالفرنسية إطلاقاً
- 6 خطوات كحد أقصى

التنسيق:
## شرح – [اسم الصفحة]
1. الخطوة...
2. الخطوة...
⌨️ اختصارات لوحة المفاتيح: ...
⚠️ أخطاء شائعة: ...

الطول الأقصى: 300 كلمة.`
          : `You are an accessibility assistant for ASTBA, a training management app for Association Sciences and Technology Ben Arous (Tunisia).
Your task: explain to the user what they can do on the current screen.

Rules:
- Write ONLY in French. Do NOT include any Arabic text.
- 6 steps maximum, concise and clear.

Format:
## Guide – [Nom de la page]
1. Étape...
2. Étape...
⌨️ Raccourcis clavier: ...
⚠️ Erreurs fréquentes: ...

Max 300 words.`;
        break;

      case 'eligibility':
        systemPrompt = isArabic
          ? `أنت مساعد لمنصة ASTBA لإدارة التكوين. التلميذ غير مؤهل للحصول على الشهادة.
مهمتك: اشرح السبب بلغة بسيطة ومشجعة.

القواعد:
- اكتب بالعربية الفصحى فقط، لا تكتب بالفرنسية
- استخدم أسلوباً إنسانياً مشجعاً

التنسيق:
## لماذا لم يتأهل بعد؟
[الشرح]
**الحصص الناقصة:** [قائمة]
**الخطوات القادمة:** [خطوات]

الطول الأقصى: 250 كلمة.`
          : `You are an assistant for ASTBA training management app. A student is NOT eligible for a certificate.
Your task: explain WHY in plain, friendly language — not technical jargon.

Rules:
- Write ONLY in French. Do NOT include any Arabic text.
- Be human, encouraging, and actionable.

Format:
## Pourquoi pas encore éligible ?
[Explanation]
**Séances manquantes:** [list]
**Prochaines étapes:** [steps]

Max 250 words.`;
        break;

      case 'chat':
      default:
        systemPrompt = isArabic
          ? `أنت مساعد ASTBA الذكي — مساعد محادثة مهني وودود لمنصة ASTBA لإدارة التكوين (جمعية العلوم والتكنولوجيا بن عروس، تونس).

القواعد:
1. أجب بالعربية الفصحى فقط، لا تستخدم الفرنسية أو العامية
2. كن موجزاً وشاملاً (400 كلمة كحد أقصى)
3. استخدم خطوات مرقمة عند شرح العمليات
4. كن مشجعاً وداعماً
5. إذا لم تعرف شيئاً عن ASTBA، قل ذلك بصراحة
6. لا تكشف تفاصيل تقنية داخلية
7. استخدم تنسيق markdown

معلومات عن ASTBA:
- تدير تكوينات من 4 مستويات × 6 حصص = 24 حصة لكل تكوين
- التلاميذ منظمون في مجموعات
- الأهلية للشهادة تتطلب حضور جميع الحصص الـ 24 (حاضر أو معذور)
- الأدوار: مسؤول (وصول كامل)، مدير (إدارة التلاميذ/التكوينات/الشهادات)، مكوّن (إدارة الحصص)`
          : `You are the ASTBA AI Assistant — a smart, friendly, and professional chatbot for the ASTBA training management platform (Association Sciences and Technology Ben Arous, Tunisia).

You help admins, managers, and trainers with:
- Understanding app features and navigation
- Student management, enrollments, groups
- Training sessions, attendance tracking
- Certificate eligibility rules
- Planning and scheduling
- Troubleshooting common issues

RULES:
1. Respond ONLY in French. Do NOT include any Arabic text.
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
- Roles: ADMIN (full access), MANAGER (manage students/trainings/certificates), TRAINER (conduct sessions)`;
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
