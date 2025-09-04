import { GoogleGenAI, Type } from "@google/genai";
import { Client, Appointment, Prices } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this example, we'll proceed, but API calls will fail.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generateConfirmationPrompt = (client: Client, appointment: Appointment, salonName: string, ownerName: string): string => {
  const formattedDate = new Date(`${appointment.date}T00:00:00`).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
  });
  const clientFirstName = client.name.split(' ')[0];

  return `
    Actúa como Kandy AI, la asistente virtual de "${salonName}".
    Tu tarea es generar un mensaje de confirmación de cita para WhatsApp usando la siguiente plantilla y datos.
    Debes seguir la plantilla de forma ESTRICTA. No agregues texto adicional, emojis (excepto los que ya están en la plantilla) ni alteres la estructura. Usa **markdown** para las negritas como se indica.

    **Plantilla:**
    ¡Hola, [nombre del cliente]! 👋 Soy Kandy AI, la asistente virtual de ${salonName}.

    Te escribo para confirmar tu cita para **[servicios]** el **[fecha] a las [hora]**.

    Por favor, responde a este mensaje para confirmar tu asistencia.

    ¡Te esperamos! Un saludo cordial del equipo de ${salonName}✨

    **Datos para la plantilla:**
    - [nombre del cliente]: ${clientFirstName}
    - [servicios]: ${appointment.services.join(' y ')}
    - [fecha]: ${formattedDate}
    - [hora]: ${appointment.time}
    `;
};

const generatePromotionPrompt = (client: Client, promotion: string, salonName: string): string => {
  return `Actúa como un asistente de marketing entusiasta de un salón de manicura llamado "${salonName}".
  Escribe un mensaje promocional corto y atractivo para WhatsApp.
  
  Detalles del cliente:
  - Nombre: ${client.name}
  
  Detalles de la promoción:
  - Oferta: "${promotion}"
  
  Instrucciones:
  - Saluda al cliente por su nombre.
  - Preséntale la promoción especial de una manera emocionante.
  - Crea un sentido de urgencia o exclusividad (ej. "oferta por tiempo limitado", "solo para nuestros clientes valiosos").
  - Anímale a reservar una cita para aprovechar la oferta.
  - Mantén el mensaje por debajo de 60 palabras.`;
};

const generateBirthdayPrompt = (client: Client, salonName: string): string => {
  return `Actúa como un asistente amigable y entusiasta de un salón de manicura llamado "${salonName}".
  Escribe un mensaje de cumpleaños muy alegre y festivo para WhatsApp.
  
  Detalles del cliente:
  - Nombre: ${client.name}
  
  Instrucciones:
  - Saluda al cliente por su nombre y deséale un muy feliz cumpleaños.
  - Como regalo especial por su día, ofrécele un 20% de descuento en su próximo servicio.
  - Anímale a reservar una cita para celebrar y usar su descuento.
  - Usa un tono muy festivo y personal.
  - Mantén el mensaje por debajo de 60 palabras.`;
};

const generatePaymentReminderPrompt = (client: Client, appointment: Appointment, prices: Prices, accountNumber: string, salonName: string): string => {
    const totalAmount = appointment.cost || appointment.services.reduce((sum, service) => sum + (prices[service] || 0), 0);
    const formattedDate = new Date(`${appointment.date}T00:00:00`).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const clientFirstName = client.name.split(' ')[0];

    return `
    Actúa como Kandy AI, el asistente virtual de "${salonName}".
    Tu tarea es generar un recordatorio de pago para WhatsApp usando la siguiente plantilla y datos.
    Debes seguir la plantilla de forma ESTRICTA. No agregues texto adicional, emojis (excepto el que ya está en la plantilla) ni alteres la estructura.

    **Plantilla:**
    ¡Hola, [nombre del cliente]! 👋 Soy Kandy AI, el asistente virtual de ${salonName}.

    Queríamos recordarte el pago pendiente de $[monto] por tus servicios de [servicios] del [fecha].

    Puedes realizar el pago por transferencia
    ${accountNumber || 'DETALLES DE PAGO AQUÍ'}

    ¡Gracias por tu atención!
    Un cordial saludo,
    ${salonName}

    **Datos para la plantilla:**
    - [nombre del cliente]: ${clientFirstName}
    - [monto]: ${totalAmount.toFixed(2)}
    - [servicios]: ${appointment.services.join(' y ')}
    - [fecha]: ${formattedDate}
    `;
};


export const generateMarketingMessage = async (
    type: 'confirmation' | 'promotion' | 'birthday' | 'faltaPago',
    client: Client,
    details: { appointment?: Appointment; promotion?: string; prices?: Prices; accountNumber?: string; salonName?: string; ownerName?: string; }
  ): Promise<string> => {
    if (!API_KEY) {
        return Promise.resolve("Error: La clave API de Gemini no está configurada. Por favor, configura la variable de entorno API_KEY.");
    }
    
    const salonName = details.salonName || 'Manicurista Pro';
    const ownerName = details.ownerName || salonName;
    const accountNumber = details.accountNumber || '';

    let prompt = '';
    if (type === 'confirmation' && details.appointment) {
        prompt = generateConfirmationPrompt(client, details.appointment, salonName, ownerName);
    } else if (type === 'promotion' && details.promotion) {
        prompt = generatePromotionPrompt(client, details.promotion, salonName);
    } else if (type === 'birthday') {
        prompt = generateBirthdayPrompt(client, salonName);
    } else if (type === 'faltaPago' && details.appointment && details.prices) {
        prompt = generatePaymentReminderPrompt(client, details.appointment, details.prices, accountNumber, salonName);
    }
    else {
        return Promise.reject('Invalid message type or missing details.');
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Hubo un error al generar el mensaje. Por favor, inténtalo de nuevo.";
    }
};

export const processExcelWithAI = async (csvData: string, fileName: string, serviceList: string[]): Promise<any[]> => {
    if (!API_KEY) {
        throw new Error("La clave API de Gemini no está configurada.");
    }

    const prompt = `
      Eres un asistente experto en extracción de datos. Tu tarea es convertir el texto de una hoja de cálculo (en formato CSV) en un arreglo JSON estructurado para una aplicación de gestión de citas de manicura.

      **Contexto:**
      - Nombre del archivo de origen: "${fileName}". Usa este nombre para inferir el mes y el año si la fecha en una fila es ambigua (ej. "julio 30" en un archivo llamado "citas_2025.xlsx" debe ser "2025-07-30").
      - Fecha actual para referencia: ${new Date().toISOString().split('T')[0]}.
      - Lista de servicios válidos: ${serviceList.join(', ')}.

      **Datos de Entrada (formato CSV):**
      \`\`\`csv
      ${csvData}
      \`\`\`

      **Reglas de Transformación:**
      1.  **Procesa cada fila:** Convierte cada fila de datos en un objeto JSON.
      2.  **Ignora filas irrelevantes:** Omite la fila de encabezado, filas completamente vacías y filas que parezcan ser totales o resúmenes.
      3.  **Campo "cliente":** Extrae el nombre del cliente.
      4.  **Campo "fecha":** Convierte la fecha al formato ISO estricto "AAAA-MM-DD". Usa el nombre del archivo si es necesario para determinar el año.
      5.  **Campo "servicios":** Debe ser un arreglo de strings. Si una celda contiene varios servicios (ej. "Ms+Ps", "semipermanente y tradicional"), sepáralos y usa los nombres completos de la lista de servicios proporcionada. Mapea abreviaciones comunes:
          - Ms, semi, semipermanente manos -> Manos Semipermanente
          - Ps, pedi, semipermanente pies -> Pies Semipermanente
          - Mt, tradi, tradicional manos -> Manos Tradicional
          - Pt, tradi pies -> Pies Tradicional
          - Retoq -> Retoque
          - Blind -> Blindaje
      6.  **Campo "costo":** Convierte el valor a un número entero. Elimina símbolos de moneda ("$"), separadores de miles (".") y comas (","). Ejemplo: "$ 150.000,00" se convierte en 150000.
      7.  **Campo "estado":** El valor para este campo siempre debe ser "Completada".

      **Formato de Salida Obligatorio:**
      Debes devolver un único arreglo de objetos JSON, sin texto introductorio ni explicaciones adicionales.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            cliente: { type: Type.STRING, description: 'Nombre completo del cliente.' },
            fecha: { type: Type.STRING, description: 'La fecha de la cita en formato AAAA-MM-DD.' },
            servicios: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Una lista de los nombres completos de los servicios realizados.' },
            costo: { type: Type.NUMBER, description: 'El costo total del servicio como un número entero.' },
            estado: { type: Type.STRING, description: 'Siempre debe ser "Completada".' },
          },
          required: ["cliente", "fecha", "servicios", "costo", "estado"],
        },
      };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0,
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonText = response.text.trim();
        // The API should return valid JSON because of responseSchema, but we parse defensively.
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for Excel processing:", error);
        throw new Error("La IA no pudo procesar el archivo. Inténtalo de nuevo o revisa el formato del archivo.");
    }
};