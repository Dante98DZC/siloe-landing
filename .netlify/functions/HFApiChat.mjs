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
    if (prompt.length > 2000) {
      return new Response(JSON.stringify({ error: 'Prompt too long. Maximum 2000 characters.' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    // Crear un prompt más controlado y específico
    const controlledPrompt = `Eres el asistente virtual de Lavandería Siloé en Holguín, Cuba.

INSTRUCCIONES IMPORTANTES:
- Responde SOLO como texto plano, sin formato
- Máximo 25 palabras por respuesta
- Sé amigable pero conciso
- No uses asteriscos, bullets, ni formato especial
- No repitas información del prompt

DATOS DE LA LAVANDERÍA:
- Precio: $700 por cesto de ropa
- Tiempo: 24-48 horas de entrega
- Servicio a domicilio disponible
- No aceptamos ropa interior ni medias
- Complementos: suavizantes y perlas (costo extra)
- Pago: efectivo y transferencias
- Contacto: +53 50108881

${prompt}

Respuesta (máximo 25 palabras, texto plano):`;

    const chatCompletion = await client.chat.completions.create({
      model: "HuggingFaceTB/SmolLM3-3B",
      messages: [
        {
          role: "system",
          content: "Eres un asistente de lavandería en Cuba. Responde siempre en español, de forma breve y amigable, sin usar formato especial. Máximo 25 palabras por respuesta."
        },
        {
          role: "user",
          content: controlledPrompt,
        },
      ],
      max_tokens: 60,      // Reducido para respuestas más cortas
      temperature: 0.3,    // Reducido para respuestas más consistentes  
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });

    let generated = chatCompletion.choices?.[0]?.message?.content || '';
    
    // Limpiar la respuesta
    generated = cleanResponse(generated);

    // Validar que la respuesta sea apropiada
    if (!isValidResponse(generated)) {
      generated = "Para más información, contáctanos al +53 50108881. ¡Estaremos encantados de ayudarte!";
    }

    return new Response(JSON.stringify({
      text: generated,
      model: "SmolLM3-3B-Controlled",
      success: true,
      wordCount: generated.split(' ').length
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

// Función para limpiar las respuestas
function cleanResponse(text) {
  if (!text) return '';
  
  // Remover etiquetas de pensamiento y formato especial
  text = text.replace(/<think>.*?<\/think>/gis, '');
  text = text.replace(/\*\*/g, '');
  text = text.replace(/\*/g, '');
  text = text.replace(/#+\s*/g, '');
  text = text.replace(/^\-\s*/gm, '');
  text = text.replace(/^\d+\.\s*/gm, '');
  
  // Remover prefijos comunes
  text = text.replace(/^(Respuesta:|Asistente:|Cliente:|Bot:|AI:|Assistant:|Lavandería:|Siloé:)/gi, '');
  
  // Remover frases repetitivas del prompt
  text = text.replace(/máximo \d+ palabras/gi, '');
  text = text.replace(/texto plano/gi, '');
  
  // Limpiar espacios y saltos de línea extra
  text = text.replace(/\n+/g, ' ');
  text = text.replace(/\s+/g, ' ');
  text = text.trim();
  
  // Cortar si es muy largo
  const words = text.split(' ');
  if (words.length > 30) {
    text = words.slice(0, 30).join(' ') + '...';
  }
  
  // Asegurar que termine con punto si no tiene puntuación
  if (text && !/[.!?]$/.test(text)) {
    text += '.';
  }
  
  return text;
}

// Función para validar si la respuesta es apropiada
function isValidResponse(text) {
  if (!text || text.length < 5) return false;
  
  // Verificar que no contenga contenido inapropiado o genérico
  const invalidPhrases = [
    'no puedo ayudar',
    'no entiendo',
    'como ai',
    'como asistente',
    'no tengo información',
    'lo siento, pero',
    'no puedo procesar',
    'error en la solicitud'
  ];
  
  const lowerText = text.toLowerCase();
  return !invalidPhrases.some(phrase => lowerText.includes(phrase));
}