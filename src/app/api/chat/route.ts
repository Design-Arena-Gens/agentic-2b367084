import { NextRequest } from 'next/server';
import { simpleLLMStream } from '../../../lib/simple-llm';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const text = await simpleLLMStream(messages);

    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (e) {
    return new Response('Error', { status: 400 });
  }
}
