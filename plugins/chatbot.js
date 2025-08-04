// chatbot.js - Chatbot para Lavandería Siloé
class SiloeChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;
    this.init();
  }

  init() {
    this.createChatWidget();
    this.addEventListeners();
    this.addInitialMessage();
  }

  createChatWidget() {
    // Crear el contenedor principal del chat
    const chatContainer = document.createElement('div');
    chatContainer.id = 'siloe-chatbot';
    chatContainer.innerHTML = `
      <!-- Botón flotante -->
      <div class="chat-toggle" id="chatToggle">
        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </div>

      <!-- Ventana del chat -->
      <div class="chat-window" id="chatWindow">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">
              <span style="background: var(--primary-gradient); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px;">S</span>
            </div>
            <div>
              <div class="chat-title">Asistente Siloé</div>
              <div class="chat-status">En línea</div>
            </div>
          </div>
          <button class="chat-close" id="chatClose">×</button>
        </div>
        
        <div class="chat-messages" id="chatMessages"></div>
        
        <div class="chat-input-container">
          <input type="text" id="chatInput" placeholder="Escribe tu mensaje..." maxlength="500">
          <button id="chatSend" class="chat-send-btn">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Agregar estilos CSS
    const styles = document.createElement('style');
    styles.textContent = `
      #siloe-chatbot {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        font-family: var(--font-primary, 'Inter', sans-serif);
      }

      .chat-toggle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: pulse 2s infinite;
      }

      .chat-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
      }

      @keyframes pulse {
        0%, 100% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); }
        50% { box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6), 0 0 0 10px rgba(102, 126, 234, 0.1); }
      }

      .chat-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 350px;
        height: 500px;
        background: rgba(15, 15, 35, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        display: none;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
      }

      .chat-window.open {
        display: flex;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .chat-header {
        padding: 16px 20px;
        background: var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: white;
      }

      .chat-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chat-title {
        font-weight: 600;
        font-size: 16px;
      }

      .chat-status {
        font-size: 12px;
        opacity: 0.9;
      }

      .chat-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .chat-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .chat-messages::-webkit-scrollbar {
        width: 4px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.3);
        border-radius: 2px;
      }

      .message {
        max-width: 85%;
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
        animation: messageSlide 0.3s ease-out;
      }

      @keyframes messageSlide {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .message.user {
        align-self: flex-end;
        background: var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
        color: white;
        border-bottom-right-radius: 6px;
      }

      .message.bot {
        align-self: flex-start;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        border-bottom-left-radius: 6px;
      }

      .typing-indicator {
        align-self: flex-start;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        padding: 12px 16px;
        border-radius: 18px;
        border-bottom-left-radius: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .typing-dots {
        display: flex;
        gap: 4px;
      }

      .typing-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(102, 126, 234, 0.7);
        animation: typingDot 1.4s infinite;
      }

      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typingDot {
        0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
        30% { opacity: 1; transform: scale(1); }
      }

      .chat-input-container {
        padding: 16px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 12px;
        align-items: center;
      }

      #chatInput {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        color: white;
        font-size: 14px;
        outline: none;
        transition: all 0.3s ease;
      }

      #chatInput::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      #chatInput:focus {
        border-color: var(--primary-color, #667eea);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      }

      .chat-send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .chat-send-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }

      .chat-send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .error-message {
        color: #ff6b6b;
        font-size: 12px;
        text-align: center;
        padding: 8px;
        background: rgba(255, 107, 107, 0.1);
        border-radius: 8px;
        margin: 8px 0;
      }

      @media (max-width: 768px) {
        #siloe-chatbot {
          bottom: 15px;
          right: 15px;
        }
        
        .chat-window {
          width: calc(100vw - 30px);
          max-width: 350px;
          height: 70vh;
          max-height: 500px;
        }
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(chatContainer);
  }

  addEventListeners() {
    const toggle = document.getElementById('chatToggle');
    const close = document.getElementById('chatClose');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('chatSend');

    toggle.addEventListener('click', () => this.toggleChat());
    close.addEventListener('click', () => this.closeChat());
    send.addEventListener('click', () => this.sendMessage());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  toggleChat() {
    const window = document.getElementById('chatWindow');
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      window.classList.add('open');
      document.getElementById('chatInput').focus();
    } else {
      window.classList.remove('open');
    }
  }

  closeChat() {
    document.getElementById('chatWindow').classList.remove('open');
    this.isOpen = false;
  }

  addInitialMessage() {
    const welcomeMessage = "¡Hola! Soy el asistente virtual de Lavandería Siloé. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre nuestros servicios, precios o cualquier duda que tengas. 😊";
    this.addMessage(welcomeMessage, 'bot');
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTyping() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      Escribiendo...
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  showError(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    messagesContainer.appendChild(errorDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSend');
    const message = input.value.trim();
    
    if (!message || this.isTyping) return;

    // Agregar mensaje del usuario
    this.addMessage(message, 'user');
    input.value = '';
    
    // Deshabilitar input
    this.isTyping = true;
    sendBtn.disabled = true;
    
    // Mostrar indicador de escritura
    this.showTyping();

    try {
      // Crear contexto para la IA
      const context = `Eres un asistente virtual amigable para Lavandería Siloé en Holguín, Cuba. 
Información clave:
- Servicio de lavado y secado por $700 por cesto (sin doblar ropa)
- Tiempo de entrega: 24-48 horas
- Servicio a domicilio disponible
- No aceptamos ropa interior ni medias
- Complementos: suavizantes y perlas de olor (costo adicional)
- Horario de atención: coordinar previamente
- Pago: efectivo y transferencias bancarias

Responde de forma breve, amigable y profesional. Si no sabes algo específico, sugiere contactar directamente.

Cliente: ${message}
Asistente:`;

      const response = await fetch('/.netlify/functions/HFApiChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: context,
          options: {
            max_new_tokens: 100,
            temperature: 0.7
          }
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Obtener respuesta y limpiarla
      let botResponse = data.text || 'Lo siento, no pude procesar tu mensaje.';
      
      // Limpiar respuesta
      botResponse = botResponse.replace(/^(Asistente:|Cliente:)/gi, '').trim();
      
      // Fallback si la respuesta es muy corta o genérica
      if (botResponse.length < 10 || botResponse.includes('no puedo') || botResponse.includes('no entiendo')) {
        botResponse = this.getFallbackResponse(message);
      }

      this.hideTyping();
      this.addMessage(botResponse, 'bot');

    } catch (error) {
      console.error('Error:', error);
      this.hideTyping();
      
      // Respuesta de fallback local
      const fallbackResponse = this.getFallbackResponse(message);
      this.addMessage(fallbackResponse, 'bot');
    } finally {
      this.isTyping = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  getFallbackResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('precio') || msg.includes('costo') || msg.includes('tarifa')) {
      return 'Nuestro servicio cuesta $700 por cesto de ropa. El precio se calcula según el volumen que ocupe tu ropa sin doblar.';
    }
    
    if (msg.includes('tiempo') || msg.includes('demora') || msg.includes('entrega')) {
      return 'El tiempo de entrega es de 24 a 48 horas, dependiendo de factores climáticos y energéticos.';
    }
    
    if (msg.includes('domicilio') || msg.includes('recoge') || msg.includes('entrega')) {
      return 'Sí, ofrecemos servicio a domicilio. Recogemos y entregamos tu ropa en la puerta de tu casa.';
    }
    
    if (msg.includes('contacto') || msg.includes('teléfono') || msg.includes('whatsapp')) {
      return 'Puedes contactarnos al +53 50108881 por WhatsApp o llamada. ¡Estaremos encantados de atenderte!';
    }
    
    if (msg.includes('ropa interior') || msg.includes('medias')) {
      return 'No aceptamos ropa interior ni medias por políticas de higiene.';
    }

    if (msg.includes('pago') || msg.includes('cobro')) {
      return 'Aceptamos pagos en efectivo y transferencias bancarias para tu comodidad.';
    }
    
    return 'Para más información específica, te recomiendo contactarnos directamente al +53 50108881. ¡Estaremos felices de ayudarte con cualquier consulta!';
  }
}

// Inicializar el chatbot cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new SiloeChatbot();
});