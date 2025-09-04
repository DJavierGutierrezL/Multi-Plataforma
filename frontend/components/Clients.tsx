import React, { useState } from 'react';
import { Client } from '../types';
import Modal from './Modal';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ClientsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const Clients: React.FC<ClientsProps> = ({ clients, setClients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client> | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

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

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;

    const { id, name, email, phone, birthDate } = currentClient;

    if (!name || !email || !phone) {
        alert('Por favor, rellena los campos de nombre, email y teléfono.');
        return;
    }
    
    if (id) {
        // Editing existing client
        setClients(clients.map(c => c.id === id ? { ...c, ...currentClient } as Client : c));
    } else {
        // Adding new client
        const newClient: Client = {
            id: Date.now(),
            name: currentClient.name!,
            phone: currentClient.phone!,
            email: currentClient.email!,
            birthDate: birthDate || '',
            serviceHistory: currentClient.serviceHistory || [],
            preferences: currentClient.preferences || '',
            isNew: true,
        };
        setClients([newClient, ...clients]);
    }
    handleCloseModals();
  };
  
  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      setClients(clients.filter(c => c.id !== clientToDelete.id));
    }
    handleCloseModals();
  };

  return (
    <>
    <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold text-card-foreground mb-4 md:mb-0">Gestión de Clientes (CRM)</h2>
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background placeholder-muted-foreground"
            />
            <button onClick={handleOpenAddModal} className="w-full md:w-auto bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-hover transition-colors">
                Añadir Cliente
            </button>
        </div>
      </div>

      <div className="overflow-x-auto responsive-table">
        <table className="min-w-full bg-card">
          <thead className="bg-accent">
            <tr>
              <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Nombre</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Contacto</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Fecha Nac.</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Último Servicio</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Preferencias</th>
              <th className="py-3 px-6 text-center text-sm font-semibold text-accent-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-card-foreground">
            {filteredClients.map((client) => (
              <tr key={client.id} className="border-b border-border hover:bg-accent">
                <td data-label="Nombre" className="py-4 px-6">
                    <div className="flex items-center justify-end md:justify-start">
                        {client.isNew && <span className="text-xs bg-green-200 text-green-800 font-semibold mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900/50 dark:text-green-300">Nuevo</span>}
                        {client.name}
                    </div>
                </td>
                <td data-label="Contacto" className="py-4 px-6">
                    <div>{client.phone}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                </td>
                <td data-label="Fecha Nac." className="py-4 px-6">{client.birthDate ? new Date(`${client.birthDate}T00:00:00`).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</td>
                <td data-label="Último Servicio" className="py-4 px-6">{client.serviceHistory[client.serviceHistory.length - 1] || 'N/A'}</td>
                <td data-label="Preferencias" className="py-4 px-6 text-sm max-w-xs truncate" title={client.preferences}>{client.preferences || 'N/A'}</td>
                <td data-label="Acciones" className="py-4 px-6 text-right md:text-center">
                  <button onClick={() => handleOpenEditModal(client)} className="text-blue-500 hover:text-blue-700 mr-4"><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleOpenDeleteModal(client)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    
    <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={currentClient?.id ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-1">Nombre Completo</label>
            <input type="text" name="name" id="name" value={currentClient?.name || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
          </div>
           <div>
            <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">Email</label>
            <input type="email" name="email" id="email" value={currentClient?.email || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-card-foreground mb-1">Teléfono</label>
            <input type="tel" name="phone" id="phone" value={currentClient?.phone || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
          </div>
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-card-foreground mb-1">Fecha de Nacimiento</label>
            <input type="date" name="birthDate" id="birthDate" value={currentClient?.birthDate || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" />
          </div>
          <div>
            <label htmlFor="preferences" className="block text-sm font-medium text-card-foreground mb-1">Preferencias y Notas</label>
            <textarea name="preferences" id="preferences" rows={3} value={currentClient?.preferences || ''} onChange={handleFormChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary-hover">Guardar Cliente</button>
          </div>
        </form>
    </Modal>

    <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        title="Confirmar Eliminación"
    >
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <p className="mt-4 text-card-foreground">
                ¿Estás seguro de que quieres eliminar a <strong>{clientToDelete?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
            <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">
                Cancelar
            </button>
            <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">
                Sí, Eliminar
            </button>
        </div>
    </Modal>
    </>
  );
};

export default Clients;