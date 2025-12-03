import { NextRequest, NextResponse } from 'next/server';

const OPENAI_IMAGE_ENDPOINT = 'https://api.openai.com/v1/images/generations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: unknown = body?.prompt;
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Будь ласка, опиши сон для видива.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Візуалізація вимкнена: додайте OPENAI_API_KEY і перезапустіть застосунок.'
        },
        { status: 503 }
      );
    }

    const response = await fetch(OPENAI_IMAGE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
        prompt: prompt.trim(),
        size: '1024x1024',
        n: 1,
        quality: 'high'
      })
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      console.error('OpenAI image generation failed', errorPayload);
      return NextResponse.json(
        { error: 'Не вдалося намалювати сон. Спробуйте ще раз.' },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const first = payload?.data?.[0];
    const imageUrl = first?.url
      ? first.url
      : first?.b64_json
        ? `data:image/png;base64,${first.b64_json}`
        : null;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Сервіс не повернув зображення.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Visualize endpoint error', error);
    return NextResponse.json(
      { error: 'Візуалізація тимчасово недоступна. Спробуйте пізніше.' },
      { status: 500 }
    );
  }
}

