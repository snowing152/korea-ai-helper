// app/api/ask/route.js
import { streamText, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { buildSystemPrompt } from '../../../lib/buildSystemPrompt';
import { getRagContext } from '../../../services/knowledgeBase';

export const maxDuration = 30;

export async function POST(req) {
  const { messages, language = 'ru', pageContent = '', url = '' } = await req.json();

  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: buildSystemPrompt({
      language,
      pageContent: pageContent.slice(0, 4000),
      url,
      ragContext: getRagContext(),
    }),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
