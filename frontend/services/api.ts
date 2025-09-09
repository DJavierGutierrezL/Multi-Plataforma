const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("❌ VITE_API_URL no está definido. Revisa tus variables de entorno.");
}

// Función helper para agregar headers con JWT
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    // Puedes personalizar los mensajes según el status
    let errorMessage = "Error en la solicitud";
    if (res.status === 401) errorMessage = "No autorizado. Por favor inicia sesión.";
    if (res.status === 404) errorMessage = "Recurso no encontrado";
    if (res.status === 400) errorMessage = "Solicitud inválida";
    throw new Error(errorMessage);
  }
  return res.json();
}

// --- CLIENTES ---
export async function getClients() {
  return fetchWithAuth(`${API_URL}/clientes`, { method: "GET" });
}

export async function createClient(client: any) {
  return fetchWithAuth(`${API_URL}/clientes`, {
    method: "POST",
    body: JSON.stringify(client),
  });
}

export async function updateClient(id: number, client: any) {
  return fetchWithAuth(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(client),
  });
}

export async function deleteClient(id: number) {
  return fetchWithAuth(`${API_URL}/clientes/${id}`, { method: "DELETE" });
}
