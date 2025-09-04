import { GoogleGenAI } from "@google/genai";
import { Appointment, Client, Product, Prices, KandyAIMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Kandy AI calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface KandyAIContext {
    appointments: Appointment[];
    clients: Client[];
    products: Product[];
    prices: Prices;
}

const generateKandyAIPrompt = (history: KandyAIMessage[], context: KandyAIContext): string => {
    const chatHistoryString = history.map(msg => `${msg.sender === 'user' ? 'Usuario' : 'Kandy'}: ${msg.text}`).join('\n');
    
    return `
      Eres "Kandy AI", un asistente virtual profesional, amigable y eficiente para una aplicación de gestión de manicuristas.
      Tu tono es claro, conciso y servicial, usando un español neutro y amigable (similar al de Colombia). Te diriges al usuario de "tú".
      Tu objetivo es responder a las preguntas del usuario sobre su negocio utilizando los datos proporcionados en el contexto JSON y manteniendo el contexto de la conversación.

      **IMPORTANTE: Revisa el historial de la conversación para entender preguntas de seguimiento o referencias a temas anteriores (ej. si el usuario pregunta por "ella", mira el mensaje anterior para saber de quién habla).**

      **Historial de la Conversación Actual:**
      \`\`\`
      ${chatHistoryString}
      \`\`\`

      **Contexto Completo del Negocio (en formato JSON):**
      Aquí tienes acceso a toda la información de la aplicación: citas, clientes, productos en inventario y la lista de precios.
      \`\`\`json
      ${JSON.stringify(context, null, 2)}
      \`\`\`

      **Tarea:**
      1. Analiza la última pregunta del usuario en el contexto del **Historial de la Conversación Actual**.
      2. Utiliza la información detallada en el **Contexto Completo del Negocio** para encontrar la respuesta más precisa. Puedes cruzar datos entre listas.
      3. Basa tu respuesta ÚNICAMENTE en la información del contexto y en la fecha actual, que es ${new Date().toLocaleDateString('es-ES')}. No inventes información.
      4. Responde de forma clara y directa a la última pregunta del usuario. Si la información no se puede encontrar, indica amablemente que no tienes acceso a ese detalle.
      5. No incluyas botones de acción ni sugerencias de seguimiento. Solo proporciona la respuesta directa.

      Basado en el historial y el contexto, responde a la última pregunta del usuario.
    `;
}


export const getKandyAIResponse = async (history: KandyAIMessage[], context: KandyAIContext): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve("Lo siento, mi conexión con la IA no está configurada. Por favor, revisa la clave API.");
    }

    const lastUserMessage = [...history].reverse().find(m => m.sender === 'user');
    if (!lastUserMessage) {
        // Should not happen in normal flow, but as a fallback
        return Promise.resolve("Parece que hubo un problema. ¿Puedes repetir tu pregunta?");
    }

    const prompt = generateKandyAIPrompt(history, context);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for Kandy AI:", error);
        return "Lo siento, tuve un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.";
    }
};
