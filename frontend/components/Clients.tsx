// frontend/components/Clients.tsx
import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import Modal from './Modal';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';

interface ClientsProps {
    clients: Client[];
    onCreateClient: (clientData: Partial<Client>) => Promise<void>;
    onUpdateClient: (clientId: number, clientData: Partial<Client>) => Promise<void>;
    onDeleteClient: (clientId: number) => Promise<void>;
}

const Clients: React.FC<ClientsProps> = ({ clients, onCreateClient, onUpdateClient, onDeleteClient }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    useEffect(() => {
        if (editingClient) {
            setIsFormModalOpen(true);
        }
    }, [editingClient]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editingClient) {
            setEditingClient({ ...editingClient, [e.target.name]: e.target.value });
        }
    };

    const handleOpenModalForNew = () => {
        setEditingClient({ firstName: '', lastName: '', phone: '', birthDate: '' });
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingClient(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClient) return;
        if (editingClient.id) {
            await onUpdateClient(editingClient.id, editingClient);
        } else {
            await onCreateClient(editingClient);
        }
        handleCloseFormModal();
    };

    const handleConfirmDelete = async () => {
        if (clientToDelete) {
            await onDeleteClient(clientToDelete.id);
            setClientToDelete(null); // Esto cierra el modal
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Clientes</h1>
                <button onClick={handleOpenModalForNew} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary-hover flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Añadir Cliente
                </button>
            </div>

            <div className="bg-card text-card-foreground p-5 rounded-xl shadow-lg border border-border">
                {clients.length > 0 ? (
                    clients.map(client => (
                        <div key={client.id} className="flex justify-between items-center p-3 border-b border-border last:border-b-0">
                            <div className="flex items-center gap-4">
                                <UsersIcon className="w-10 h-10 text-muted-foreground" />
                                <div>
                                    <p className="font-bold text-lg">{client.firstName} {client.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                                    {client.birthDate && (
                                        <p className="text-sm text-blue-400 mt-1">
                                            🎂 Cumpleaños: {new Date(client.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingClient(client)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => setClientToDelete(client)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground p-4">Aún no tienes clientes registrados.</p>
                )}
            </div>

            <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={editingClient?.id ? "Editar Cliente" : "Crear Nuevo Cliente"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... (Tu formulario de creación/edición va aquí) ... */}
                </form>
            </Modal>
            
            <Modal isOpen={!!clientToDelete} onClose={() => setClientToDelete(null)} title="Confirmar Eliminación">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        ¿Estás seguro de que quieres eliminar a <strong>{clientToDelete?.firstName} {clientToDelete?.lastName}</strong>?
                    </p>
                    <p className="font-bold text-red-600 dark:text-red-400 mt-2">
                        ¡Todos sus datos asociados (como citas) también serán eliminados!
                    </p>
                    <div className="mt-6 flex justify-center space-x-4">
                        <button type="button" onClick={() => setClientToDelete(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancelar</button>
                        <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg">Sí, Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Clients;