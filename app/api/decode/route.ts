import { NextRequest, NextResponse } from 'next/server';

type OracleResult = {
  symbols: string[];
  interpretation: string;
  guidance: string;
};

type Language = 'uk' | 'en' | 'ru';

const CYRILLIC_REGEX = /[а-щьюяґіїє]/i;
const CYRILLIC_RU_REGEX = /[ёыэъЖжЁЫЭЪ]/i;
const WORD_REGEX = /[a-zA-Zа-щьюяґіїєёыэ]+/g;

const SYSTEM_PROMPT =
  'Дій як езотеричний оракул сновидінь. Використовуй метафори, окультні символи, архетипи та інтуїтивну поетичну мову.';

const FALLBACK_SYMBOLS: Record<Language, string[]> = {
  uk: ['Тіньовий храм', 'Нічний тролейбус', 'Місячна стежка'],
  en: ['Shadowed station', 'Neon ferry', 'Moonlit stair'],
  ru: ['Теневой купол', 'Неоновый трамвай', 'Лунная дорожка']
};

const FALLBACK_INTERPRETATION: Record<Language, string> = {
  uk: 'Сон натякає, що інтуїція вже тримає нитку між минулим і новим. Символи делікатно штовхають зняти старий шар тиші й почути справжній голос.',
  en: 'Your dream hints that intuition is already holding a thread between what was and what wants to arrive. The symbols nudge you to peel away the static and listen for the truer voice underneath.',
  ru: 'Сон намекает, что интуиция уже держит нить между прошлым и тем, что хочет проявиться. Символы мягко подталкивают снять лишний шум и услышать более честный голос.'
};

const FALLBACK_GUIDANCE: Record<Language, string> = {
  uk: 'Запиши перше відчуття після пробудження і помічай повторювані жести протягом дня.',
  en: 'Note the first feeling after waking and notice which gestures repeat through the day.',
  ru: 'Запиши первое ощущение после пробуждения и отметь, какие жесты повторяются в течение дня.'
};

const LANGUAGE_ERRORS: Record<Language, string> = {
  uk: 'Наразі не вдається зчитати символи. Спробуйте пізніше.',
  en: 'The symbols cannot be read right now. Please try again later.',
  ru: 'Сейчас не выходит считывать символы. Попробуйте чуть позже.'
};

const STOPWORDS: Record<Language, Set<string>> = {
  uk: new Set(['мій', 'твій', 'снів', 'сон', 'моє', 'своє', 'твоя', 'вона', 'він', 'вони', 'цього', 'того', 'цим']),
  en: new Set([
    'this',
    'that',
    'your',
    'mine',
    'dream',
    'with',
    'from',
    'into',
    'about',
    'just',
    'like'
  ]),
  ru: new Set(['сон', 'мой', 'твой', 'мне', 'тебе', 'этот', 'тот', 'как', 'что', 'где'])
};

const toSymbolCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const deriveSymbolList = (dream: string, language: Language): string[] => {
  const tokens = dream
    .toLowerCase()
    .match(WORD_REGEX)
    ?.filter((token) => token.length >= 4 && !STOPWORDS[language]?.has(token)) ?? [];

  const unique = Array.from(new Set(tokens));
  const derived = unique.slice(0, 3).map((word) => toSymbolCase(word));

  if (derived.length > 0) {
    return derived;
  }

  return FALLBACK_SYMBOLS[language];
};

const buildFallback = (dream: string, language: Language): OracleResult => ({
  symbols: deriveSymbolList(dream, language).slice(0, 3),
  interpretation: FALLBACK_INTERPRETATION[language],
  guidance: FALLBACK_GUIDANCE[language]
});

const extractJsonSegment = (content: string | null): OracleResult | null => {
  if (!content) {
    return null;
  }
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const target = jsonMatch ? jsonMatch[0] : content;
  try {
    const parsed = JSON.parse(target);
    const symbols = Array.isArray(parsed.symbols)
      ? parsed.symbols
          .map((entry: unknown) =>
            typeof entry === 'string' ? entry.trim() : String(entry ?? '').trim()
          )
          .filter(Boolean)
      : [];
    const interpretation =
      typeof parsed.interpretation === 'string' ? parsed.interpretation.trim() : '';
    const guidance = typeof parsed.guidance === 'string' ? parsed.guidance.trim() : '';

    if (!symbols.length && !interpretation && !guidance) {
      return null;
    }

    return {
      symbols,
      interpretation,
      guidance
    };
  } catch {
    return null;
  }
};

const callOpenAI = async (dream: string, language: Language): Promise<OracleResult | null> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const languageInstruction =
    language === 'uk'
      ? 'Відповідай українською, зберігаючи містичний і поетичний тон.'
      : language === 'en'
        ? 'Respond in English with a mystical, poetic tone.'
        : 'Отвечай по-русски в мягком мистическом, поэтичном тоне.';

const formatInstruction =
  'Return ONLY valid JSON with the keys "symbols" (array of up to 3 short phrases inspired directly by the dream imagery), "interpretation" (1-2 short paragraphs), and "guidance" (1-2 sentences with specific advice). Do not wrap the JSON in markdown.';

  const dreamPrompt =
    language === 'uk'
      ? `Сон:\n${dream}\n\n${languageInstruction}\n${formatInstruction}`
      : language === 'en'
        ? `Dream:\n${dream}\n\n${languageInstruction}\n${formatInstruction}`
        : `Сон:\n${dream}\n\n${languageInstruction}\n${formatInstruction}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.82,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: dreamPrompt }
      ]
    })
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content?.trim() ?? null;
  return extractJsonSegment(content);
};

const isLanguage = (value: unknown): value is Language =>
  value === 'uk' || value === 'en' || value === 'ru';

export async function POST(request: NextRequest) {
  let detectedLanguage: Language = 'uk';
  try {
    const body = await request.json();
    const dream: unknown = body?.dream;

    if (typeof dream !== 'string' || !dream.trim()) {
      return NextResponse.json(
        { error: 'Поділися сном, щоби оракул міг його розтлумачити.' },
        { status: 400 }
      );
    }

    let language: Language;
    if (isLanguage(body?.language)) {
      language = body.language;
    } else if (CYRILLIC_REGEX.test(dream)) {
      language = 'uk';
    } else if (CYRILLIC_RU_REGEX.test(dream)) {
      language = 'ru';
    } else {
      language = 'en';
    }
    detectedLanguage = language;
    let result: OracleResult | null = null;

    try {
      result = await callOpenAI(dream.trim(), language);
    } catch (err) {
      console.error('DreamOracle remote decode failed', err);
    }

    if (!result) {
      result = buildFallback(dream.trim(), language);
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('DreamOracle request error', error);
    return NextResponse.json({ error: LANGUAGE_ERRORS[detectedLanguage] }, { status: 500 });
  }
}

