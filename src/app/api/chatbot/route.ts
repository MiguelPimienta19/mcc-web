import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful meeting agenda assistant for MCC (a community organization). You help people:

1. Create structured meeting agendas
2. Brainstorm meeting topics
3. Organize discussion points
4. Suggest time allocations
5. Format agendas professionally

Keep responses helpful, concise, and focused on meeting planning. When creating agendas, use clear formatting with bullet points, time estimates, and logical flow.`
        },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return NextResponse.json({
      message: completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
