import React, { useState } from 'react';
import { Client } from '../types';
import Modal from './Modal';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ClientsProps {
  clients: Client[];
  onCreateClient: (clientData: Partial<Client>) => Promise<void>;
  onUpdateClient: (clientId: number, clientData: Partial<Client>) => Promise<void>;
  onDeleteClient: (clientId: number) => Promise<void>;
}

const Clients: React.FC<ClientsProps> = ({ clients, onCreateClient, onUpdateClient, onDeleteClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const handleOpenCreateModal = () => {
    setEditingClient({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    const formattedClient = {
        ...client,
        birthDate: client.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : ''
    };
    setEditingClient(formattedClient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingClient(null);
    setIsModalOpen(false);
    setClientToDelete(null);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.firstName) {
      alert('El nombre del cliente es obligatorio.');
      return;
    }

    const clientData = {
        ...editingClient,
        birthDate: editingClient.birthDate || null
    };

    if (editingClient.id) {
      await onUpdateClient(editingClient.id, clientData);
    } else {
      await onCreateClient(clientData);
    }
    handleCloseModal();
  };
  
  const handleDelete = () => {
    if (!clientToDelete) return;
    onDeleteClient(clientToDelete.id);
    handleCloseModal();
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center"><UsersIcon className="w-8 h-8 mr-3" /> Clientes</h1>
        <button onClick={handleOpenCreateModal} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary/90 flex items-center transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          Añadir Cliente
        </button>
      </div>

      <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
        {clients.length > 0 ? (
          <div className="space-y-4">
            {clients.map(client => (
              <div key={client.id} className="flex justify-between items-center p-4 bg-accent rounded-lg">
                <div>
                  <p className="font-bold text-lg text-card-foreground">{client.firstName} {client.lastName}</p>
                  <p className="text-sm text-muted-foreground">{client.phone || 'Sin teléfono'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleOpenEditModal(client)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full"><PencilIcon className="w-5 h-5"/></button>
                  <button onClick={() => setClientToDelete(client)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold">Aún no tienes clientes registrados</h3>
            <p className="mt-2">Haz clic en "Añadir Cliente" para empezar.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient?.id ? "Editar Cliente" : "Crear Nuevo Cliente"}>
        <form onSubmit={handleSaveClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre*</label>
                    <input name="firstName" value={editingClient?.firstName || ''} onChange={e => setEditingClient(c => ({...c, firstName: e.target.value}))} className="w-full p-2 border border-border rounded text-foreground" style={{ backgroundColor: 'hsl(var(--input))' }} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Apellido</label>
                    <input name="lastName" value={editingClient?.lastName || ''} onChange={e => setEditingClient(c => ({...c, lastName: e.target.value}))} className="w-full p-2 border border-border rounded text-foreground" style={{ backgroundColor: 'hsl(var(--input))' }} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Teléfono*</label>
                <input name="phone" type="tel" value={editingClient?.phone || ''} onChange={e => setEditingClient(c => ({...c, phone: e.target.value}))} className="w-full p-2 border border-border rounded text-foreground" style={{ backgroundColor: 'hsl(var(--input))' }} required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" value={editingClient?.email || ''} onChange={e => setEditingClient(c => ({...c, email: e.target.value}))} className="w-full p-2 border border-border rounded text-foreground" style={{ backgroundColor: 'hsl(var(--input))' }} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Fecha de Cumpleaños</label>
                <input name="birthDate" type="date" value={editingClient?.birthDate || ''} onChange={e => setEditingClient(c => ({...c, birthDate: e.target.value}))} className="w-full p-2 border border-border rounded text-foreground" style={{ backgroundColor: 'hsl(var(--input))' }} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Notas</label>
                <textarea name="notes" value={editingClient?.notes || ''} onChange={e => setEditingClient(c => ({...c, notes: e.target.value}))} rows={3} className="w-full p-2 border border-border rounded text-foreground" style={{ backgroundColor: 'hsl(var(--input))' }} />
            </div>
            <div className="flex justify-end pt-4 space-x-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
                <button type="submit" className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg">{editingClient?.id ? "Guardar Cambios" : "Crear Cliente"}</button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={!!clientToDelete} onClose={handleCloseModal} title="Confirmar Eliminación">
         <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-lg mt-4">¿Estás seguro de que quieres eliminar a <strong>{clientToDelete?.firstName} {clientToDelete?.lastName}</strong>?</p>
            <p className="text-sm text-red-500 mt-2">Esta acción también eliminará todas las citas asociadas a este cliente.</p>
            <div className="flex justify-center pt-6 space-x-4">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
                <button type="button" onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg">Sí, Eliminar</button>
            </div>
         </div>
      </Modal>

    </div>
  );
};

export default Clients;