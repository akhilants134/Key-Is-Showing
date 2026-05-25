// backend/services/aiService.js
// This is the ONLY file that reads the OpenAI API key.
// The key lives in backend/.env and never leaves the server.

import 'dotenv/config';

const OPENAI_KEY = process.env.OPENAI_API_KEY;

export async function summarizeNotes(notes) {
  if (!OPENAI_KEY) {
    throw new Error('OPENAI_API_KEY is not set in the server environment.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a concise study note summariser. Return a bullet-point summary of the key concepts.',
        },
        {
          role: 'user',
          content: `Summarise these notes:\n\n${notes}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'OpenAI request failed');
  }

  const data = await response.json();
  // Return only the summary string — callers never see the raw OpenAI response
  return data.choices[0].message.content;
}
