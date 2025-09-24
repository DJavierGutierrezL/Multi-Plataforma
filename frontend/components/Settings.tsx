import React, { useState, useEffect } from 'react';
import { Profile, Service } from '../types';
import Modal from './Modal';
import * as XLSX from 'xlsx';
import { SettingsIcon } from './icons/SettingsIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { UploadIcon } from './icons/UploadIcon';

interface SettingsProps {
    profile: Profile;
    onSaveProfile: (profile: Profile) => void;
    services: Service[];
    onCreateService: (serviceData: Partial<Service>) => Promise<void>;
    onUpdateService: (serviceId: number, serviceData: Partial<Service>) => Promise<void>;
    onDeleteService: (serviceId: number) => Promise<void>;
    onAppointmentsImported: (data: any[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onSaveProfile, services, onCreateService, onUpdateService, onDeleteService, onAppointmentsImported }) => {
    const [profileForm, setProfileForm] = useState<Profile>(profile);
    
    // --- Lógica para Servicios (Corregida y Mejorada) ---
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceForm, setServiceForm] = useState({ name: '', price: '' });

    useEffect(() => {
        setProfileForm(profile);
    }, [profile]);
    
    useEffect(() => {
        if (editingService) {
            setServiceForm({
                name: editingService.name,
                price: String(editingService.price)
            });
        }
    }, [editingService]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveProfile(profileForm);
    };

    const handleOpenCreateModal = () => {
        setEditingService(null);
        setServiceForm({ name: '', price: '' });
        setIsServiceModalOpen(true);
    };

    const handleOpenEditModal = (service: Service) => {
        setEditingService(service);
        setIsServiceModalOpen(true);
    };

    const handleCloseServiceModal = () => {
        setIsServiceModalOpen(false);
        setEditingService(null);
        setServiceForm({ name: '', price: '' });
    };

    const handleServiceFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setServiceForm(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        const serviceData = {
            name: serviceForm.name,
            price: parseFloat(serviceForm.price) || 0,
        };

        if (editingService) {
            await onUpdateService(editingService.id, serviceData);
        } else {
            await onCreateService(serviceData);
        }
        handleCloseServiceModal();
    };

    // --- Lógica para Importar Excel ---
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            
            console.log("Datos del Excel:", json);
            onAppointmentsImported(json);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold flex items-center"><SettingsIcon className="w-8 h-8 mr-3" /> Ajustes</h1>

            {/* Perfil del Negocio (Restaurado) */}
            <form onSubmit={handleSaveProfile} className="bg-card p-6 rounded-2xl shadow-lg border">
                <h3 className="text-xl font-semibold mb-4 flex items-center"><UsersIcon className="w-6 h-6 mr-3"/> Perfil del Negocio</h3>
                <div className="space-y-4">
                    <div>
                        <label>Nombre del Salón</label>
                        <input name="salonName" value={profileForm.salonName} onChange={handleProfileChange} className="w-full mt-1 p-2 border rounded bg-input text-foreground" />
                    </div>
                    <button type="submit" className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg">Guardar Perfil</button>
                </div>
            </form>

            {/* Mis Servicios */}
            <div className="bg-card p-6 rounded-2xl shadow-lg border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center"><DollarSignIcon className="w-6 h-6 mr-3"/> Mis Servicios</h3>
                    <button onClick={handleOpenCreateModal} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg">Añadir Servicio</button>
                </div>
                <div className="space-y-2">
                    {services.map(service => (
                        <div key={service.id} className="flex justify-between items-center p-3 bg-accent rounded-lg">
                            <span>{service.name}</span>
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">${new Intl.NumberFormat('es-CO').format(service.price)}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEditModal(service)} className="p-2 text-blue-500"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeleteService(service.id)} className="p-2 text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gestión de Datos (Restaurado) */}
            <div className="bg-card p-6 rounded-2xl shadow-lg border">
                <h3 className="text-xl font-semibold mb-4 flex items-center"><UploadIcon className="w-6 h-6 mr-3"/> Gestión de Datos</h3>
                <p className="text-muted-foreground mb-4">Sube un archivo .xlsx o .xls para importar citas en bloque.</p>
                <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
            </div>

            {/* Modal para Editar/Crear Servicio (Corregido con botones) */}
            <Modal isOpen={isServiceModalOpen} onClose={handleCloseServiceModal} title={editingService ? "Editar Servicio" : "Nuevo Servicio"}>
                <form onSubmit={handleSaveService} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre del Servicio</label>
                        <input 
                            name="name"
                            value={serviceForm.name} 
                            onChange={handleServiceFormChange} 
                            required
                            className="w-full mt-1 p-2 border rounded bg-background text-foreground" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Precio ($)</label>
                        <input 
                            type="number" 
                            name="price"
                            value={serviceForm.price} 
                            onChange={handleServiceFormChange} 
                            required
                            className="w-full mt-1 p-2 border rounded bg-background text-foreground" 
                        />
                    </div>
                    <div className="flex justify-end pt-4 space-x-4">
                        <button type="button" onClick={handleCloseServiceModal} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg">
                            {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Settings;