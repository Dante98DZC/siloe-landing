// netlify/functions/HFApiChat.js
import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HUGGINGFACE_TOKEN,
});

// IMPORTANTE: Cambiar export default por exports.handler
export const handler = async (event, context) => {
  console.log('🔄 Function called with method:', event.httpMethod);
  console.log('🔄 Headers:', JSON.stringify(event.headers));
  
  // Verificar que la API key esté configurada
  if (!process.env.HUGGINGFACE_TOKEN) {
    console.log('❌ API key not configured');
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }
  
  // Manejo de CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ CORS preflight request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Validar método HTTP
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Obtener el body de la request
    const body = event.body;
    console.log('📥 Request body:', body?.substring(0, 100) + '...');
    
    if (!body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const { prompt } = JSON.parse(body);

    // Validar que existe el prompt
    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Prompt is required and must be a string' })
      };
    }

    // Validar longitud del prompt
    if (prompt.length > 2000) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Prompt too long. Maximum 2000 characters.' })
      };
    }

    console.log('🤖 Processing prompt:', prompt.substring(0, 50) + '...');

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

    console.log('✅ Generated response:', generated);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: generated,
        model: "SmolLM3-3B-Controlled",
        success: true,
        wordCount: generated.split(' ').length
      })
    };

  } catch (error) {
    console.error("❌ Error:", error);
    
    // Manejar diferentes tipos de errores
    let statusCode = 500;
    let errorMessage = 'Error interno del servidor';
    
    if (error.name === 'SyntaxError') {
      statusCode = 400;
      errorMessage = 'Invalid JSON in request body';
    } else if (error.message?.includes('API key')) {
      statusCode = 401;
      errorMessage = 'Error de autenticación';
    } else if (error.message?.includes('rate limit') || error.status === 429) {
      statusCode = 429;
      errorMessage = 'Rate limit exceeded';
    } else if (error.status === 404) {
      statusCode = 404;
      errorMessage = 'Model not found';
    } else if (error.status >= 400 && error.status < 500) {
      statusCode = error.status;
      errorMessage = 'Client error';
    }

    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

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
    'como asistente',
    'no tengo información',
    'lo siento, pero',
    'no puedo procesar',
    'error en la solicitud'
  ];
  
  const lowerText = text.toLowerCase();
  return !invalidPhrases.some(phrase => lowerText.includes(phrase));
}