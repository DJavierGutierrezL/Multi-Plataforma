import { Appointment, Client, Product, Prices, KandyAIMessage, Service } from '../types';

/**
 * Esta es la función principal que se conecta con la API de Google Gemini para generar respuestas conversacionales.
 * @param history - El historial de la conversación para mantener el contexto.
 * @param context - Los datos actuales del negocio (citas, clientes, etc.).
 * @returns Una cadena de texto con la respuesta generada por la IA.
 */
export const getKandyAIResponse = async (
    history: KandyAIMessage[],
    context: { appointments: Appointment[]; clients: Client[]; products: Product[]; services: Service[]; prices: Prices }
): Promise<string> => {
    
    // CORRECCIÓN 1: Leer la clave API correctamente en un entorno Vite/React
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
    
    if (!API_KEY) {
        return "Lo siento, mi conexión con la IA no está configurada. Por favor, revisa la clave API en tu archivo .env.local.";
    }

    const knowledgeBase = JSON.stringify(context, null, 2);
    
    const systemPrompt = `
      Eres "Kandy AI", un asistente virtual profesional y amigable para una aplicación de gestión de negocios de belleza y barberías.
      Tu objetivo es responder a las preguntas del usuario sobre su negocio utilizando los datos proporcionados en el contexto JSON y manteniendo el contexto del historial de la conversación.
      Basa tus respuestas ÚNICAMENTE en la información del contexto. No inventes información. Responde siempre en español.

      **Contexto del Negocio (JSON):**
      ${knowledgeBase}`;

    // CORRECCIÓN 2: Enviar el historial completo para que el chatbot tenga memoria
    const geminiHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    // El último mensaje es la consulta actual del usuario
    const currentUserQuery = geminiHistory.pop(); 
    if (!currentUserQuery) return "No hay nada que responder.";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
    
    const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        // Enviamos el historial de la conversación (sin el último mensaje)
        // y la consulta actual del usuario por separado.
        contents: [...geminiHistory, currentUserQuery] 
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Error en la API de Gemini:", errorBody);
            throw new Error(`Error en la API: ${response.statusText}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return text || "No pude procesar tu solicitud en este momento.";

    } catch (error) {
        console.error("Error al conectar con la API de Gemini:", error);
        return "Lo siento, tuve problemas para conectarme con mis servidores. Inténtalo de nuevo.";
    }
};