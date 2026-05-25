import { streamText, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { buildSystemPrompt } from '../../../lib/buildSystemPrompt';
import { getRagContext } from '../../../services/knowledgeBase';

export const maxDuration = 30;

export async function POST(req) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, language = 'ru', pageContent = '', url = '' } = await req.json();

    const VALID_LANGS = ['ru', 'en', 'uz'];
    const lang = VALID_LANGS.includes(language) ? language : 'en';

    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: buildSystemPrompt({
        language: lang,
        pageContent: pageContent.slice(0, 4000),
        url,
        ragContext: getRagContext(),
      }),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error('[/api/ask]', err);
    return new Response(JSON.stringify({ error: 'AI request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
