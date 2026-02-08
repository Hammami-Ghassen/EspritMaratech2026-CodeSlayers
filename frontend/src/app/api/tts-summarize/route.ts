// ──────────────────────────────────────────────
// ASTBA – TTS Summarize Route (Server-side)
// Sends page content to Perplexity AI for smart summarization
// Returns a clean, spoken-ready summary in the user's language
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
    const { pageContent, locale, pageTitle } = body as {
      pageContent: string;
      locale: string;
      pageTitle?: string;
    };

    if (!pageContent || typeof pageContent !== 'string') {
      return NextResponse.json({ error: 'Missing pageContent' }, { status: 400 });
    }

    const isArabic = locale?.startsWith('ar');

    const systemPrompt = isArabic
      ? `أنت مساعد صوتي لمنصة ASTBA لإدارة التكوين. مهمتك تلخّص محتوى الصفحة بش يتقرا بصوت عالي للمستعملين.

القواعد:
- لخّص المحتوى المهم الكل بالعربي الفصحى الواضح (مش عامية)
- ابدا بجملة ترحيب قصيرة: "مرحباً بكم في صفحة [اسم الصفحة]"
- اذكر العناصر المهمة: الأرقام، الإحصائيات، الأسماء، الحالات
- اذكر الإجراءات المتاحة (أزرار، روابط مهمة)
- لا تذكر تفاصيل تقنية (CSS, HTML, API)
- اجعل النص طبيعي للقراءة الصوتية (بدون رموز خاصة، نجوم، أو تنسيق ماركداون)
- الطول الأقصى: 300 كلمة
- لا تستعمل نقاط أو تعداد، اكتب فقرات مترابطة`
      : `Tu es un assistant vocal pour la plateforme ASTBA de gestion des formations. Ta mission : résumer le contenu de la page pour qu'il soit lu à voix haute.

Règles :
- Résume le contenu important en français clair et naturel
- Commence par une phrase d'accueil : "Bienvenue sur la page [nom de la page]"
- Mentionne les éléments clés : chiffres, statistiques, noms, états
- Mentionne les actions disponibles (boutons, liens importants)
- Ne mentionne AUCUN détail technique (CSS, HTML, API)
- Le texte doit être naturel pour la lecture vocale (pas de symboles spéciaux, étoiles, ou formatage markdown)
- Longueur max : 300 mots
- N'utilise pas de puces ou de listes, écris des paragraphes fluides`;

    const userMessage = pageTitle
      ? `Page : "${pageTitle}"\n\nContenu :\n${pageContent.slice(0, 6000)}`
      : `Contenu de la page :\n${pageContent.slice(0, 6000)}`;

    const res = await fetch(PERPLEXITY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('Perplexity TTS-summarize error:', res.status, errorBody);
      return NextResponse.json(
        { error: 'AI service error' },
        { status: res.status },
      );
    }

    const data = await res.json();
    const summary = data.choices?.[0]?.message?.content || '';

    // Clean up any markdown artifacts that might have slipped through
    const cleaned = summary
      .replace(/[#*_`~>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) → text
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return NextResponse.json({ summary: cleaned });
  } catch (error) {
    console.error('TTS-summarize route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
