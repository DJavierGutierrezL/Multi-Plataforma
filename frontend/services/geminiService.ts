import { Service } from '../types';

// La estructura de la cita que esperamos sigue siendo la misma
interface ProcessedAppointment {
    cliente: string;
    fecha: string; // Formato YYYY-MM-DD
    servicios: string[];
    costo: number;
    estado: 'Completada' | 'Pendiente';
}

/**
 * Procesa el contenido de un archivo (imagen o PDF) usando la API de Gemini para extraer y estructurar las citas.
 * @param base64Data El contenido del archivo codificado en Base64.
 * @param mimeType El tipo de archivo (ej. 'image/png', 'application/pdf').
 * @param serviceList La lista de servicios disponibles para que la IA pueda mapear.
 * @returns Una promesa que se resuelve con un arreglo de citas procesadas.
 */
export const processFileWithAI = async (
    base64Data: string,
    mimeType: string,
    serviceList: Service[]
): Promise<ProcessedAppointment[]> => {
    
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
    
    if (!API_KEY) {
        throw new Error("La clave API de Gemini no está configurada en .env.local (VITE_GEMINI_API_KEY).");
    }

    const validServiceNames = serviceList.map(s => s.name).join(', ');

    const systemPrompt = `
      Eres un asistente experto en extracción de datos. Tu tarea es analizar la imagen o PDF adjunto, que es una página de un cuaderno de citas o un registro digital, y convertir la información en un arreglo JSON estructurado.

      **Contexto:**
      - Fecha actual para referencia: ${new Date().toISOString().split('T')[0]}.
      - Lista de servicios válidos en el negocio: ${validServiceNames}.

      **Reglas de Transformación:**
      1.  **Procesa cada cita:** Convierte cada cita que encuentres en la imagen/PDF en un objeto JSON.
      2.  **Campo "cliente":** Extrae el nombre del cliente.
      3.  **Campo "fecha":** Convierte la fecha al formato ISO "YYYY-MM-DD". Si el año no está presente, asume el año actual.
      4.  **Campo "servicios":** Debe ser un arreglo de strings. Si ves varios servicios, sepáralos y usa los nombres completos de la lista de servicios válidos. Mapea abreviaciones comunes: "MS" -> "Manos Semipermanente", "PS" -> "Pies Semipermanente", etc.
      5.  **Campo "costo":** Convierte el valor a un número entero, eliminando símbolos.
      6.  **Campo "estado":** El valor para este campo siempre debe ser "Completada".

      **Formato de Salida Obligatorio:**
      Debes devolver un único arreglo de objetos JSON, sin texto introductorio.
    `;
    
    const responseSchema = { /* ... (El mismo esquema JSON que ya tenías) ... */ };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    
    const payload = {
        // La instrucción de sistema ahora va dentro de `contents` para peticiones multimodales
        contents: [
            { 
                parts: [
                    { text: systemPrompt },
                    { 
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data 
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);

        const result = await response.json();
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return JSON.parse(jsonText) as ProcessedAppointment[];

    } catch (error) {
        console.error("Error al procesar el archivo con Gemini:", error);
        throw new Error("La IA no pudo procesar el archivo. Revisa que la imagen sea clara.");
    }
};