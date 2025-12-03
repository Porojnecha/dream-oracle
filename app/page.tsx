'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import InputBox from '@/components/InputBox';
import OutputCard from '@/components/OutputCard';

type OracleResult = {
  symbols: string[];
  interpretation: string;
  guidance: string;
};

type UILanguage = 'ua' | 'en' | 'ru';

type CopyVariant = {
  headline: string;
  placeholder: string;
};

type CopyBlock = {
  tag: string;
  srLabel: string;
  button: string;
  seeDreamLabel: string;
  visionLoading: string;
  closeVision: string;
  error: string;
  footer: string;
  cardTitle: string;
  dreamLabel: string;
  symbolsLabel: string;
  interpretationLabel: string;
  guidanceLabel: string;
  variants: CopyVariant[];
};

const uiCopy: Record<UILanguage, CopyBlock> = {
  ua: {
    tag: 'DreamOracle AI — проводимо крізь ліси бажань до дверей сну',
    srLabel: 'Поділися сном',
    button: 'Відкрити двері',
    seeDreamLabel: 'Побачити сон',
    visionLoading: 'Почекай, ми шукаємо ключі до твого сновидіння',
    closeVision: 'Закрити видиво',
    error: 'Оракул перезбирає сенси. Спробуй за мить.',
    footer: 'DreamOracle AI © 2025 — тихо тримаємо ключі до снів',
    cardTitle: 'м’який резонанс',
    dreamLabel: 'Сон',
    symbolsLabel: 'символи сну',
    interpretationLabel: 'інтерпретація',
    guidanceLabel: 'післясмак',
    variants: [
      {
        headline: 'Покажи щілину сну — ми підсунемо ключ',
        placeholder: 'Мені наснилось, як ліфти заспівали золотим тремоло...'
      },
      {
        headline: 'Поділися кадром з лісу бажань — ми назвемо дерева',
        placeholder: 'Мені наснилось, як вікна горіли світлом лазерів...'
      },
      {
        headline: 'Напиши шепіт ночі — він стане мапою',
        placeholder: 'Мені наснилось, що метро відчинило двері в сад туману...'
      },
      {
        headline: 'Згадаєш тінь — ми відкриємо двері',
        placeholder: 'Мені наснилось, ніби годинники виросли зі снігу...'
      },
      {
        headline: 'Принеси сонячну пляму з темряви — вона стане знаком',
        placeholder: 'Мені наснилось, що містова щогла шепотіла моє ім’я...'
      },
      {
        headline: 'Повернись із підземного базару — ми перекладемо символи',
        placeholder: 'Мені наснилось, як кава в небі ставала чорним морем...'
      },
      {
        headline: 'Опиши відблиск — він перетвориться на оберіг',
        placeholder: 'Мені наснилось, ніби дрон приносив листи від русалок...'
      },
      {
        headline: 'Скажи, що ховає сон — ми обрамимо сенс',
        placeholder: 'Мені наснилось, що літери падали замість дощу...'
      },
      {
        headline: 'Відчини історію сну — ми напишемо легенду',
        placeholder: 'Мені наснилось, як крижаний ліфт відкрив зоряні комори...'
      },
      {
        headline: 'Залиш кілька слів про ніч — далі говорить оракул',
        placeholder: 'Мені наснилось, що тіні зайшли в кімнату як гості...'
      }
    ]
  },
  en: {
    tag: 'DreamOracle AI — guiding modern hearts through their dream doors',
    srLabel: 'Share your dream',
    button: 'Open the door',
    seeDreamLabel: 'See the dream',
    visionLoading: 'Hold on, we are searching for the keys to your vision',
    closeVision: 'Close vision',
    error: 'The oracle is remixing signals. Try again in a moment.',
    footer: 'DreamOracle AI © 2025 — keeping the quiet keys for night stories',
    cardTitle: 'soft resonance',
    dreamLabel: 'Dream',
    symbolsLabel: 'key symbols',
    interpretationLabel: 'interpretation',
    guidanceLabel: 'afterglow',
    variants: [
      {
        headline: 'Share the secret scene — we’ll leave a key in the doorframe',
        placeholder: 'I dreamed the elevators sang in molten tremolo...'
      },
      {
        headline: 'Drop a line from the forest of wants — we’ll map the trails',
        placeholder: 'I dreamed windowpanes burned with laser light...'
      },
      {
        headline: 'Tell the moonlit glitch — it becomes a sigil',
        placeholder: 'I dreamed a subway tunnel bloomed into violet moss...'
      },
      {
        headline: 'Offer the echo of night — we’ll translate it to glow',
        placeholder: 'I dreamed coffee rained upward like stardust...'
      },
      {
        headline: 'Confess the hush in your chest — we’ll hang charms on it',
        placeholder: 'I dreamed my phone unlocked a cathedral forest...'
      },
      {
        headline: 'Send the coordinates of your dream — we’ll open the hatch',
        placeholder: 'I dreamed escalators whispered passwords...'
      },
      {
        headline: 'Sketch the shadow corridor — we’ll light its runes',
        placeholder: 'I dreamed the moon sold vinyl records...'
      },
      {
        headline: 'Whisper the surreal headline — we’ll publish the omen',
        placeholder: 'I dreamed the crosswalk turned into a river of foxes...'
      },
      {
        headline: 'Describe the soft apocalypse — we’ll hand you the password',
        placeholder: 'I dreamed umbrellas hovered like satellites...'
      },
      {
        headline: 'Type the doorway you saw — we’ll make it stay open',
        placeholder: 'I dreamed a drone delivered seashell weather...'
      }
    ]
  },
  ru: {
    tag: 'DreamOracle AI — проводим через лес желаний к дверям сна',
    srLabel: 'Опиши сон',
    button: 'Открыть дверь',
    seeDreamLabel: 'Увидеть сон',
    visionLoading: 'Подожди, мы ищем ключи к твоему сновидению',
    closeVision: 'Закрыть видение',
    error: 'Оракул пересобирает сигналы. Попробуй чуть позже.',
    footer: 'DreamOracle AI © 2025 — тихо бережём ключи от ночи',
    cardTitle: 'мягкий резонанс',
    dreamLabel: 'Сон',
    symbolsLabel: 'символы снов',
    interpretationLabel: 'интерпретация',
    guidanceLabel: 'послевкусие',
    variants: [
      {
        headline: 'Поделись щелью сна — мы оставим ключ в замке',
        placeholder: 'Мне приснилось, как лифты запели золотым тремоло...'
      },
      {
        headline: 'Пришли строку из леса желаний — мы отметим тропы',
        placeholder: 'Мне приснилось, как окна горели лазерным светом...'
      },
      {
        headline: 'Расскажи про глухой сигнал — он станет знаком',
        placeholder: 'Мне снилось, будто метро раскрыло двери в сад тумана...'
      },
      {
        headline: 'Опиши шёпот полуночи — мы переведём его в свет',
        placeholder: 'Мне снилось, как часы прорастали из снега...'
      },
      {
        headline: 'Сними маску с видения — мы подпишем легенду',
        placeholder: 'Мне снилось, что мачта моста шептала моё имя...'
      },
      {
        headline: 'Дай координаты тайной двери — мы приоткроем проём',
        placeholder: 'Мне снилось, как кофе в небе превращался в чёрное море...'
      },
      {
        headline: 'Расскажи о мятном коридоре — мы развесим талисманы',
        placeholder: 'Мне снилось, будто дрон доставлял письма от русалок...'
      },
      {
        headline: 'Напиши свой мягкий апокалипсис — мы расшифруем послание',
        placeholder: 'Мне снилось, как ледяной лифт открыл звёздные кладовые...'
      },
      {
        headline: 'Опиши светящийся лифт — он станет порталом',
        placeholder: 'Мне снилось, будто тени зашли в комнату как гости...'
      }
    ]
  }
};

const API_LANGUAGE_MAP: Record<UILanguage, 'uk' | 'en' | 'ru'> = {
  ua: 'uk',
  en: 'en',
  ru: 'ru'
};

const isUiLanguage = (value: unknown): value is UILanguage =>
  value === 'ua' || value === 'en' || value === 'ru';

export default function Home() {
  const [oracleResult, setOracleResult] = useState<OracleResult | null>(null);
  const [lastDream, setLastDream] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('ua');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const copy = uiCopy[uiLanguage];
  const [variantIndex, setVariantIndex] = useState(0);
  const heroVariant = useMemo(() => {
    const variants = copy.variants;
    return variants[variantIndex] ?? variants[0];
  }, [copy, variantIndex]);

  useEffect(() => {
    const variants = uiCopy[uiLanguage].variants;
    const randomIndex = Math.floor(Math.random() * variants.length);
    setVariantIndex(randomIndex);
  }, [uiLanguage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem('dream-oracle-lang');
    if (stored && isUiLanguage(stored)) {
      setUiLanguage(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem('dream-oracle-lang', uiLanguage);
  }, [uiLanguage]);

  const handleDecode = useCallback(
    async (dream: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      setLastDream(dream);
      setOracleResult(null);
      setImageUrl(null);

      try {
        const response = await fetch('/api/decode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dream, language: API_LANGUAGE_MAP[uiLanguage] })
        });

        const data = await response.json();
        if (!response.ok) {
          setErrorMessage(data?.error ?? copy.error);
          throw new Error(data?.error ?? 'Oracle request failed');
        }

        const result: OracleResult | null = data?.result ?? null;
        if (!result) {
          throw new Error('Oracle returned no structured data');
        }

        setOracleResult(result);
      } catch (error) {
        console.error(error);
        setOracleResult(null);
        setErrorMessage((prev) => prev ?? copy.error);
      } finally {
        setIsLoading(false);
      }
    },
    [copy.error, uiLanguage]
  );

  const handleVisualize = useCallback(async () => {
    if (!lastDream.trim()) {
      return;
    }
    setIsVisualizing(true);
    setImageUrl(null);
    try {
      const response = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: lastDream })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Vision request failed');
      }
      if (!data?.imageUrl) {
        throw new Error('Vision returned no image');
      }
      setImageUrl(data.imageUrl);
    } catch (error) {
      console.error(error);
      setErrorMessage((prev) => prev ?? copy.error);
      setImageUrl(null);
    } finally {
      setIsVisualizing(false);
    }
  }, [copy.error, lastDream]);

  useEffect(() => {
    if (!oracleResult) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById('oracle-output');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [oracleResult]);

  return (
    <main className="flex min-h-screen flex-col justify-between bg-nocturne-gradient text-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-4 pb-44 pt-10 sm:pb-48 sm:pt-16">
        <div className="flex flex-col items-center space-y-14 px-2 text-center sm:space-y-16">
          <div className="flex flex-col items-center space-y-5">
            <p className="text-xs uppercase tracking-[0.6em] text-white/30">
              {copy.tag}
            </p>
            <h1 className="max-w-2xl text-balance text-4xl font-light text-white/90 sm:text-[2.75rem]">
              {heroVariant.headline}
            </h1>
          </div>

          <InputBox
            onDecode={handleDecode}
            isLoading={isLoading}
            placeholder={heroVariant.placeholder}
            srLabel={copy.srLabel}
            buttonLabel={copy.button}
          />

          {errorMessage && (
            <p className="text-sm text-violetAura/70">{errorMessage}</p>
          )}
        </div>
      </section>

      <OutputCard
        dream={lastDream}
        result={oracleResult}
        seeDreamLabel={copy.seeDreamLabel}
        onVisualize={handleVisualize}
        isVisualizing={isVisualizing}
        labels={{
          cardTitle: copy.cardTitle,
          dreamLabel: copy.dreamLabel,
          symbolsLabel: copy.symbolsLabel,
          interpretationLabel: copy.interpretationLabel,
          guidanceLabel: copy.guidanceLabel
        }}
      />

      <footer className="py-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/30 sm:py-8">
        {copy.footer}
      </footer>

      <div className="pointer-events-auto fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <div className="flex items-center gap-0.5 rounded-full border border-white/15 bg-white/[0.08] px-1.5 py-0.5 backdrop-blur backdrop-brightness-125">
          {(['ua', 'en', 'ru'] as UILanguage[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setUiLanguage(lang)}
              className={`rounded-full px-2.5 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] transition ${
                uiLanguage === lang ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
              aria-pressed={uiLanguage === lang}
              aria-label={`Switch to ${lang} language`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {(isVisualizing || imageUrl) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 text-center">
          {isVisualizing ? (
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-white/60">
                {copy.visionLoading}
              </p>
              <div className="ring-loader mx-auto" />
            </div>
          ) : (
            imageUrl && (
              <div className="space-y-4">
                <div className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-white/10 shadow-aurora">
                  <Image
                    src={imageUrl}
                    alt="Dream vision"
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover"
                    unoptimized={imageUrl.startsWith('data:')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-xs uppercase tracking-[0.4em] text-white/60 hover:text-white"
                >
                  {copy.closeVision}
                </button>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}

