import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import Modal from './Modal';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ClientsProps {}

const Clients: React.FC<ClientsProps> = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // --- Fetch clients from backend ---
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://multi-plataforma-backend.onrender.com/clients', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentClient(null);
    setClientToDelete(null);
  };

  const handleOpenAddModal = () => {
    setCurrentClient({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setCurrentClient(client);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentClient) {
      setCurrentClient({ ...currentClient, [e.target.name]: e.target.value });
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;

    const { id, name, email, phone, birthDate, preferences } = currentClient;

    if (!name || !email || !phone) {
      alert('Por favor, rellena los campos de nombre, email y teléfono.');
      return;
    }

    const token = localStorage.getItem('token');
    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `https://multi-plataforma-backend.onrender.com/clients/${id}`
      : 'https://multi-plataforma-backend.onrender.com/clients';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone, birthDate, preferences }),
      });
      const savedClient = await res.json();

      if (id) {
        setClients(clients.map(c => (c.id === savedClient.id ? savedClient : c)));
      } else {
        setClients([savedClient, ...clients]);
      }

      handleCloseModals();
    } catch (err) {
      console.error('Error saving client:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`https://multi-plataforma-backend.onrender.com/clients/${clientToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      handleCloseModals();
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  return (
    <>
      <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <h2 className="text-2xl font-bold text-card-foreground mb-4 md:mb-0">
            Gestión de Clientes (CRM)
          </h2>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background placeholder-muted-foreground"
            />
            <button
              onClick={handleOpenAddModal}
              className="w-full md:w-auto bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-hover transition-colors"
            >
              Añadir Cliente
            </button>
          </div>
        </div>

        <div className="overflow-x-auto responsive-table">
          <table className="min-w-full bg-card">
            <thead className="bg-accent">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">
                  Nombre
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">
                  Contacto
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">
                  Fecha Nac.
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">
                  Último Servicio
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">
                  Preferencias
                </th>
                <th className="py-3 px-6 text-center text-sm font-semibold text-accent-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="text-card-foreground">
              {filteredClients.map(client => (
                <tr key={client.id} className="border-b border-border hover:bg-accent">
                  <td data-label="Nombre" className="py-4 px-6">
                    <div className="flex items-center justify-end md:justify-start">
                      {client.isNew && (
                        <span className="text-xs bg-green-200 text-green-800 font-semibold mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900/50 dark:text-green-300">
                          Nuevo
                        </span>
                      )}
                      {client.name}
                    </div>
                  </td>
                  <td data-label="Contacto" className="py-4 px-6">
                    <div>{client.phone}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </td>
                  <td data-label="Fecha Nac." className="py-4 px-6">
                    {client.birthDate
                      ? new Date(`${client.birthDate}T00:00:00`).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </td>
                  <td data-label="Último Servicio" className="py-4 px-6">
                    {client.serviceHistory?.[client.serviceHistory.length - 1] || 'N/A'}
                  </td>
                  <td data-label="Preferencias" className="py-4 px-6 text-sm max-w-xs truncate" title={client.preferences}>
                    {client.preferences || 'N/A'}
                  </td>
                  <td data-label="Acciones" className="py-4 px-6 text-right md:text-center">
                    <button
                      onClick={() => handleOpenEditModal(client)}
                      className="text-blue-500 hover:text-blue-700 mr-4"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(client)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={currentClient?.id ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
      >
        <form onSubmit={handleSaveClient} className="space
