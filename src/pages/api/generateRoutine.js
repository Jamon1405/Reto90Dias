import { Configuration, OpenAIApi } from 'openai';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const routines = await prisma.routine.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json(routines);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, userId } = JSON.parse(req.body || '{}');

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = completion.choices[0].message.content.trim();

    const saved = await prisma.routine.create({
      data: {
        userId: userId || 'anonymous',
        description: text,
      },
    });

    return res.status(200).json(saved);
  } catch (error) {
    console.error('Error generating routine', error);
    return res.status(500).json({ error: 'Failed to generate routine' });
  }
}
