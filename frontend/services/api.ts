const API_URL = import.meta.env.VITE_API_URL || "";

export async function getClients() {
  const res = await fetch(`${API_URL}/clientes`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export async function createClient(client) {
  const res = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to create client");
  return res.json();
}

export async function updateClient(id, client) {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to update client");
  return res.json();
}

export async function deleteClient(id) {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  if (!res.ok) throw new Error("Failed to delete client");
  return res.json();
}
