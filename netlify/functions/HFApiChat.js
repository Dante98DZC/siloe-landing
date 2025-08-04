// netlify/functions/HFApiChat.js
exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
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

  try {
    const { prompt, options } = JSON.parse(event.body);
    
    // Token desde variables de entorno de Netlify
    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
    
    if (!HF_TOKEN) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Token de Hugging Face no configurado en variables de entorno' 
        })
      };
    }

    // Modelos disponibles con fallback
    const models = [
      'HuggingFaceTB/SmolLM3-3B',
      'microsoft/DialoGPT-medium'
    ];

    let response = null;
    let lastError = null;

    // Intentar con cada modelo hasta que uno funcione
    for (const model of models) {
      try {
        const apiResponse = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HF_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_new_tokens: options?.max_new_tokens || 150,
                temperature: options?.temperature || 0.7,
                do_sample: true,
                top_p: 0.9,
                repetition_penalty: 1.1
              },
              options: {
                wait_for_model: true,
                use_cache: false
              }
            })
          }
        );

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          
          // Procesar respuesta
          let generatedText = '';
          if (Array.isArray(data) && data[0]?.generated_text) {
            generatedText = data[0].generated_text;
          } else if (data.generated_text) {
            generatedText = data.generated_text;
          }

          // Limpiar respuesta
          generatedText = generatedText.replace(prompt, '').trim();
          generatedText = generatedText.replace(/^(Asistente:|Cliente:)/gi, '').trim();
          
          if (generatedText && generatedText.length > 10) {
            response = {
              text: generatedText,
              model: model,
              success: true
            };
            break;
          }
        } else if (apiResponse.status === 503) {
          lastError = `Modelo ${model} cargando...`;
          continue;
        } else if (apiResponse.status === 404) {
          lastError = `Modelo ${model} no encontrado`;
          continue;
        }
      } catch (error) {
        lastError = `Error con modelo ${model}: ${error.message}`;
        continue;
      }
    }

    if (!response) {
      return {
        statusCode: 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Todos los modelos no están disponibles',
          lastError: lastError,
          fallbackAvailable: true
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      })
    };
  }
};