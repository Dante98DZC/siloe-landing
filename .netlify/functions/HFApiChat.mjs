import { OpenAI } from "openai";
import { Response } from '@netlify/functions';

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_TOKEN,
});

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  if (event.httpMethod !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const chatCompletion = await client.chat.completions.create({
      model: "HuggingFaceTB/SmolLM3-3B:hf-inference",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const generated = chatCompletion.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({
      text: generated.trim(),
      model: "SmolLM3-3B",
      success: true
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({
      error: 'Error interno',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
