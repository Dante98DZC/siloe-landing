// chatbot.js

class SiloeChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;
    this.init();

    // Respuestas predefinidas más específicas
    this.responses = {
      precios: [
        "Nuestro servicio se cobra por cesto de ropa. El precio base depende del volumen y la distancia para domicilio.",
        "Cobramos por cantidad de cestos. Los complementos premium cuestan $300 adicionales.",
        "El precio varía según los cestos y si incluyes complementos como suavizantes o perlas de olor ($300 extra).",
      ],
      tiempo: [
        "La entrega es entre 24 y 48 horas, dependiendo del clima y la energía eléctrica.",
        "Tu ropa estará lista en 1-2 días máximo. Te avisamos cuando esté lista para recoger.",
        "Trabajamos en 24-48 horas. El tiempo puede variar por condiciones externas.",
      ],
      domicilio: [
        "Ofrecemos servicio a domicilio de 8:00 AM a 6:00 PM. El precio depende de la distancia.",
        "Recogemos y entregamos en tu casa. Horario: 8AM-6PM. Coordina por WhatsApp.",
        "Servicio a domicilio disponible en horario de 8:00 AM a 6:00 PM. Precio según distancia.",
      ],
      contacto: [
        "Contáctanos al +53 50108881 por WhatsApp o llamada para coordinar tu servicio.",
        "Número de contacto: +53 50108881. Disponible para WhatsApp y llamadas.",
        "Comunícate al +53 50108881 para agendar recogida o resolver dudas.",
      ],
      pago: [
        "Aceptamos efectivo y transferencias bancarias. Elige el método más cómodo.",
        "Métodos de pago: efectivo al momento o transferencia bancaria.",
        "Puedes pagar en efectivo o transferencia. Como prefieras.",
      ],
      restricciones: [
        "No aceptamos: ropa interior, medias, cuero, gamuza ni materiales delicados.",
        "Por políticas de higiene no lavamos ropa interior ni medias. Tampoco cuero o gamuza.",
        "No procesamos: ropa interior, medias, prendas de cuero, gamuza o materiales delicados.",
      ],
      complementos: [
        "Complementos premium por $300: blanqueadores, suavizantes y perlas de olor.",
        "Ofrecemos extras por $300: suavizantes, blanqueadores y perlas aromáticas.",
        "Complementos disponibles (+$300): blanqueadores, suavizantes, perlas de olor.",
      ],
      horario: [
        "Servicio a domicilio: 8:00 AM a 6:00 PM. Coordina tu cita por WhatsApp.",
        "Horarios de recogida y entrega: 8AM-6PM. Agenda con anticipación.",
        "Atendemos domicilios de 8:00 AM a 6:00 PM. Llama para coordinar.",
      ],
      normas: [
        "Tienes máximo 72 horas para recoger tras nuestra notificación.",
        "No garantizamos eliminación total de manchas persistentes. Evaluamos prendas con daños previos.",
        "Cancelación sin costo si no hemos iniciado el lavado. Respeta los horarios acordados.",
      ],
      edredones: [
        "Los edredones y prendas voluminosas se evalúan por separado del precio por cesto.",
        "Prendas grandes como edredones tienen tarifa especial. Te cotizamos al verlas.",
        "Edredones requieren evaluación individual. No entran en el precio por cesto.",
      ],
    };
  }

  init() {
    this.createChatWidget();
    this.addEventListeners();
    this.addInitialMessage();
  }

  createChatWidget() {
    // Crear el contenedor principal del chat
    const chatContainer = document.createElement("div");
    chatContainer.id = "siloe-chatbot";
    chatContainer.innerHTML = `
      <!-- Chatbot -->
    <div id="siloe-chatbot">
        <!-- Botón flotante -->
        <div class="chat-toggle" id="chatToggle">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            <div class="chat-notification" id="chatNotification">1</div>
        </div>

        <!-- Ventana del chat -->
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar">S</div>
                    <div>
                        <div class="chat-title">Asistente Siloé</div>
                        <div class="chat-status">
                            <div class="status-indicator"></div>
                            En línea
                        </div>
                    </div>
                </div>
                <button class="chat-close" id="chatClose">×</button>
            </div>

            <div class="chat-messages" id="chatMessages">
                <div class="welcome-message">
                    ¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?
                </div>
                <div class="quick-actions">
                    <div class="quick-action" onclick="sendQuickMessage('¿Cuáles son sus servicios?')">
                        Servicios
                    </div>
                    <div class="quick-action" onclick="sendQuickMessage('¿Cuál es su horario?')">
                        Horarios
                    </div>
                    <div class="quick-action" onclick="sendQuickMessage('¿Cómo puedo contactarlos?')">
                        Contacto
                    </div>
                </div>
            </div>

            <div class="chat-input-container">
                <input type="text" id="chatInput" placeholder="Escribe tu mensaje..." maxlength="500">
                <button id="chatSend" class="chat-send-btn">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    `;

    document.body.appendChild(chatContainer);
  }
  // Clase SiloeChatbot integrada con el nuevo diseño

  initResponses() {
    return {
      precios: [
        "El lavado y secado cuesta $700 por cesto. ¿Te gustaría más información sobre nuestros servicios?",
        "Nuestro servicio completo de lavado y secado es de $700 por cesto. ¡Muy conveniente!",
        "Por $700 lavamos y secamos tu ropa en un cesto. ¿Necesitas servicio a domicilio?",
      ],
      tiempo: [
        "Tu ropa estará lista en 24-48 horas. ¿Te parece bien este tiempo de entrega?",
        "El tiempo de entrega es entre 1 a 2 días. ¡Trabajamos rápido y con calidad!",
        "En máximo 48 horas tendrás tu ropa limpia y lista. ¿Algo más que necesites saber?",
      ],
      domicilio: [
        "¡Sí! Ofrecemos servicio a domicilio. Te recogemos y entregamos la ropa en tu casa.",
        "Tenemos servicio de recogida y entrega a domicilio. ¡Muy cómodo para ti!",
        "Con nuestro servicio a domicilio no tienes que salir de casa. ¡Nosotros nos encargamos!",
      ],
      contacto: [
        "Puedes contactarnos al +53 50108881. ¡Estamos disponibles para ayudarte!",
        "Nuestro número de contacto es +53 50108881. ¡Llámanos cuando gustes!",
        "Contáctanos al +53 50108881 para más información o para programar tu servicio.",
      ],
      pago: [
        "Aceptamos efectivo y transferencias. ¡El método que te sea más cómodo!",
        "Puedes pagar en efectivo o por transferencia. ¡Como prefieras!",
        "Manejamos pago en efectivo y transferencias bancarias. ¡Muy flexible!",
      ],
      restricciones: [
        "No lavamos ropa interior ni medias por temas de higiene. ¡Todo lo demás sí!",
        "Por políticas de higiene no aceptamos ropa interior ni medias. ¿Alguna otra consulta?",
        "No procesamos ropa interior ni medias. El resto de prendas sí las lavamos perfectamente.",
      ],
      complementos: [
        "Sí, podemos usar suavizante y perlas aromáticas si lo deseas. ¡Tu ropa quedará perfecta!",
        "¡Por supuesto! Podemos agregar suavizante y perlas para un aroma especial.",
        "Ofrecemos suavizante y perlas aromáticas como complementos. ¡Tu ropa olerá increíble!",
      ],
      horario: [
        "Nuestro horario es de lunes a domingo. ¡Estamos aquí para servirte!",
        "Trabajamos todos los días para tu comodidad. ¡Contáctanos cuando necesites!",
        "Atendemos de lunes a domingo. ¡Siempre disponibles para ti!",
      ],
    };
  }

  addEventListeners() {
    const toggle = document.getElementById("chatToggle");
    const close = document.getElementById("chatClose");
    const input = document.getElementById("chatInput");
    const send = document.getElementById("chatSend");

    toggle.addEventListener("click", () => this.toggleChat());
    close.addEventListener("click", () => this.closeChat());
    send.addEventListener("click", () => this.sendMessage());

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Event listener para acciones rápidas
    window.sendQuickMessage = (message) => {
      document.getElementById("chatInput").value = message;
      this.sendMessage();
    };
  }

  toggleChat() {
    const window = document.getElementById("chatWindow");
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      window.classList.add("open");
      document.getElementById("chatInput").focus();
      this.hideNotification();
    } else {
      window.classList.remove("open");
    }
  }

  closeChat() {
    document.getElementById("chatWindow").classList.remove("open");
    this.isOpen = false;
  }

  addInitialMessage() {
    // Remover mensaje de bienvenida estático y agregar el dinámico
    setTimeout(() => {
      const welcomeMsg = document.querySelector(".welcome-message");
      if (welcomeMsg) {
        welcomeMsg.style.display = "none";
      }
      const welcomeMessage =
        "¡Hola! Soy el asistente de Lavandería Siloé. ¿En qué puedo ayudarte? Pregúntame sobre precios, servicios o cualquier duda. 😊";
      this.addMessage(welcomeMessage, "bot");
    }, 100);
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;

    const time = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageDiv.innerHTML = `
                    ${text}
                    <div class="message-time">${time}</div>
                `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTyping() {
    const messagesContainer = document.getElementById("chatMessages");
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.id = "typingIndicator";
    typingDiv.innerHTML = `
                    <span>Escribiendo</span>
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
    const typing = document.getElementById("typingIndicator");
    if (typing) typing.remove();
  }

  detectIntent(message) {
    const msg = message.toLowerCase();

    if (
      msg.includes("precio") ||
      msg.includes("costo") ||
      msg.includes("tarifa") ||
      msg.includes("cobr")
    ) {
      return "precios";
    }
    if (
      msg.includes("tiempo") ||
      msg.includes("demora") ||
      msg.includes("entrega") ||
      msg.includes("cuanto tard")
    ) {
      return "tiempo";
    }
    if (
      msg.includes("domicilio") ||
      msg.includes("casa") ||
      msg.includes("recoge") ||
      msg.includes("entreg")
    ) {
      return "domicilio";
    }
    if (
      msg.includes("contacto") ||
      msg.includes("teléfono") ||
      msg.includes("whatsapp") ||
      msg.includes("llamar")
    ) {
      return "contacto";
    }
    if (
      msg.includes("pago") ||
      msg.includes("pagar") ||
      msg.includes("efectivo") ||
      msg.includes("transferencia")
    ) {
      return "pago";
    }
    if (
      msg.includes("ropa interior") ||
      msg.includes("medias") ||
      msg.includes("cuero") ||
      msg.includes("gamuza") ||
      msg.includes("no accept")
    ) {
      return "restricciones";
    }
    if (
      msg.includes("suavizante") ||
      msg.includes("perlas") ||
      msg.includes("blanqueador") ||
      msg.includes("complement") ||
      msg.includes("premium")
    ) {
      return "complementos";
    }
    if (
      msg.includes("horario") ||
      msg.includes("hora") ||
      msg.includes("cuando") ||
      msg.includes("abierto")
    ) {
      return "horario";
    }
    if (
      msg.includes("normas") ||
      msg.includes("reglas") ||
      msg.includes("política") ||
      msg.includes("plazo") ||
      msg.includes("recog")
    ) {
      return "normas";
    }
    if (
      msg.includes("edredón") ||
      msg.includes("edredon") ||
      msg.includes("colcha") ||
      msg.includes("voluminoso") ||
      msg.includes("grande")
    ) {
      return "edredones";
    }

    return null;
  }

  getRandomResponse(intent) {
    const responses = this.responses[intent];
    if (!responses) return null;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  cleanAIResponse(text) {
    if (!text) return "";
    text = text.replace(/<think>.*?<\/think>/gis, "");
    text = text.replace(/^(Asistente:|Cliente:|Bot:|AI:|Assistant:)/gi, "");
    text = text.replace(/\*\*/g, "").replace(/\*/g, "");
    text = text.trim();
    if (text.length > 200) {
      text = text.substring(0, 200) + "...";
    }
    return text;
  }

  async sendMessage() {
    const input = document.getElementById("chatInput");
    const sendBtn = document.getElementById("chatSend");
    const message = input.value.trim();

    if (!message || this.isTyping) return;

    // Agregar mensaje del usuario
    this.addMessage(message, "user");
    input.value = "";

    // Deshabilitar input
    this.isTyping = true;
    sendBtn.disabled = true;

    // Mostrar indicador de escritura
    this.showTyping();

    // Intentar respuesta local primero
    const intent = this.detectIntent(message);
    const localResponse = this.getRandomResponse(intent);

    if (localResponse) {
      // Usar respuesta local
      setTimeout(() => {
        this.hideTyping();
        this.addMessage(localResponse, "bot");
        this.isTyping = false;
        sendBtn.disabled = false;
        input.focus();
      }, 800);
    } else {
      // Usar IA como fallback
      try {
        console.log("🔄 Enviando request a función Netlify...");

        // Reemplaza solo la variable prompt por esta:
        const prompt = `Eres el asistente de Lavandería Siloé en Cuba. Responde en máximo 30 palabras, de forma natural y amigable.

INFORMACIÓN DEL SERVICIO:
- Precio: Por cantidad de cestos de ropa
- Complementos premium: $300 (blanqueadores, suavizantes, perlas de olor)  
- Tiempo de entrega: 24-48 horas (depende de clima y energía)
- Servicio a domicilio: 8:00 AM - 6:00 PM (precio según distancia)
- Contacto: +53 50108881 (WhatsApp o llamada)
- Pago: Efectivo y transferencias bancarias
- NO aceptamos: ropa interior, medias, cuero, gamuza, materiales delicados
- Edredones: Se evalúan por separado
- Plazo recogida: Máximo 72 horas tras notificación
- No garantizamos eliminación total de manchas persistentes

Pregunta: ${message}
Respuesta:`;

        const response = await fetch("/.netlify/functions/HFApiChat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
          }),
        });

        console.log("📥 Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log("📥 Response text:", responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("❌ JSON Parse Error:", parseError);
          throw new Error(
            `Invalid JSON response: ${responseText.substring(0, 100)}...`
          );
        }

        if (data.error) {
          throw new Error(data.error);
        }

        let botResponse = this.cleanAIResponse(data.text);

        if (
          !botResponse ||
          botResponse.length < 5 ||
          botResponse.includes("no puedo")
        ) {
          botResponse =
            "Para más información específica, contáctanos al +53 50108881. ¡Estaremos felices de ayudarte!";
        }

        console.log("✅ Bot response:", botResponse);

        this.hideTyping();
        this.addMessage(botResponse, "bot");
      } catch (error) {
        console.error("❌ Error completo:", error);
        this.hideTyping();

        let fallbackMessage =
          "¡Gracias por tu mensaje! Para más información, contáctanos al +53 50108881.";

        if (error.message?.includes("405")) {
          fallbackMessage =
            "Estamos ajustando el sistema. Contáctanos al +53 50108881 para ayudarte mejor.";
        } else if (error.message?.includes("JSON")) {
          fallbackMessage =
            "Hay un problema técnico temporal. Puedes contactarnos directamente al +53 50108881.";
        } else if (error.message?.includes("fetch")) {
          fallbackMessage =
            "Error de conexión. Por favor contacta al +53 50108881 para ayudarte inmediatamente.";
        }

        this.addMessage(fallbackMessage, "bot");
      } finally {
        this.isTyping = false;
        sendBtn.disabled = false;
        input.focus();
      }
    }
  }

  setupNotifications() {
    const chatNotification = document.getElementById("chatNotification");

    // Simular notificación después de 5 segundos
    setTimeout(() => {
      if (!this.isOpen && chatNotification) {
        chatNotification.style.display = "flex";
      }
    }, 5000);
  }

  hideNotification() {
    const chatNotification = document.getElementById("chatNotification");
    if (chatNotification) {
      chatNotification.style.display = "none";
    }
  }

  setupAutoResize() {
    const chatInput = document.getElementById("chatInput");
    chatInput.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 100) + "px";
    });
  }
}

// Inicializar el chatbot cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new SiloeChatbot();
});
