import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "sandra", text: "Hola, soy Sandra 5.0, tu agente inmobiliaria virtual. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const avatarVideoRef = useRef(null);

  // Respuestas automáticas (puedes personalizarlas)
  const getResponse = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("hola")) return "¡Hola! Bienvenido. ¿Buscas una propiedad en venta o alquiler?";
    if (lowerText.includes("venta")) return "Tenemos casas y departamentos en venta. ¿Qué zona te interesa?";
    if (lowerText.includes("alquiler")) return "Claro, tenemos opciones desde 1 dormitorio. ¿Con presupuesto?";
    if (lowerText.includes("gracias")) return "A ti. Puedo ayudarte cuando quieras.";
    if (lowerText.includes("adiós")) return "Hasta pronto. Estaré aquí cuando me necesites.";
    return "Gracias por tu mensaje. Como agente inmobiliaria, puedo ayudarte con propiedades en venta o alquiler. ¿Qué buscas?";
  };

  // Empezar a escuchar con el micrófono
  const startListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Error en micrófono:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  // Enviar mensaje
  const handleSend = (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = { sender: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Respuesta de Sandra
    setTimeout(() => {
      const responseText = getResponse(text);
      const sandraMessage = { sender: "sandra", text: responseText };
      setMessages(prev => [...prev, sandraMessage]);

      // Activar voz
      speak(responseText);

      // Animar avatar
      if (avatarVideoRef.current) {
        avatarVideoRef.current.playbackRate = 1.5;
        avatarVideoRef.current.currentTime = 0.1;
        avatarVideoRef.current.play().catch(e => console.log("Video bloqueado"));
      }
    }, 600);
  };

  // Hablar con voz
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col">
      {/* Encabezado */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <div className="relative">
            <img
              src="https://placehold.co/40x40/6366f1/ffffff?text=SA"
              alt="Sandra"
              className="w-10 h-10 rounded-full shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Sandra 5.0</h1>
            <p className="text-sm text-gray-500">Agente Inmobiliaria Virtual</p>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col md:flex-row gap-6 px-4 py-6">
        {/* Avatar */}
        <div className="md:w-1/3 flex flex-col items-center">
          <div className="relative w-64 h-80 mb-4">
            <video
              ref={avatarVideoRef}
              className="w-full h-full object-cover rounded-2xl shadow-lg"
              src="https://cdn.dribbble.com/users/4991577/screenshots/15283574/media/5e8a9d5c7a2e4e5f8d3a4e5f8d3a4e5f.mp4"
              loop
              muted
              playsInline
            ></video>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
          <p className="text-sm text-gray-600 text-center max-w-xs">
            Sandra 5.0 — Inteligencia Artificial para gestión inmobiliaria
          </p>
        </div>

        {/* Chat */}
        <div className="md:w-2/3 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden flex-1">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-96">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={startListening}
                className={`px-4 py-2 rounded-full text-white font-medium transition-all ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 pulse"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isListening ? "⏹️" : "🎤"}
              </button>
              <button
                onClick={() => handleSend()}
                className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
              >
                ➝
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Haz clic en el micrófono para hablar con Sandra
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
