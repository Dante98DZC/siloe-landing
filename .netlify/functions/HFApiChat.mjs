import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_TOKEN,
});

export default async function handler(req, context) {
  // Verificar que la API key esté configurada
  if (!process.env.HUGGINGFACE_TOKEN) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
  // Manejo de CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  // Validar método HTTP
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Obtener el body de la request
    const body = await req.text();
    
    if (!body) {
      return new Response(JSON.stringify({ error: 'Request body is required' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    const { prompt } = JSON.parse(body);

    // Validar que existe el prompt
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required and must be a string' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    // Validar longitud del prompt
    if (prompt.length > 4000) {
      return new Response(JSON.stringify({ error: 'Prompt too long. Maximum 4000 characters.' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    const chatCompletion = await client.chat.completions.create({
      model: "HuggingFaceTB/SmolLM3-3B",
      messages: [
        {
          role: "user",
          content: prompt.trim(),
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
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
    
    // Manejar diferentes tipos de errores
    let status = 500;
    let errorMessage = 'Error interno del servidor';
    
    if (error.name === 'SyntaxError') {
      status = 400;
      errorMessage = 'Invalid JSON in request body';
    } else if (error.message?.includes('API key')) {
      status = 401;
      errorMessage = 'Error de autenticación';
    } else if (error.message?.includes('rate limit') || error.status === 429) {
      status = 429;
      errorMessage = 'Rate limit exceeded';
    } else if (error.status === 404) {
      status = 404;
      errorMessage = 'Model not found';
    } else if (error.status >= 400 && error.status < 500) {
      status = error.status;
      errorMessage = 'Client error';
    }

    return new Response(JSON.stringify({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), {
      status: status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}