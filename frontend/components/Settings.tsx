import React, { useState, useEffect } from 'react';
import { Profile, Service, ThemeSettings, PrimaryColor, BackgroundColor } from '../types';
import Modal from './Modal';
// import * as XLSX from 'xlsx'; // Ya no es necesario
import { processFileWithAI } from '../services/geminiService'; // <-- 1. IMPORTAMOS EL SERVICIO DE IA
import { SettingsIcon } from './icons/SettingsIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { UploadIcon } from './icons/UploadIcon';
import { PaletteIcon } from './icons/PaletteIcon';

interface SettingsProps {
    profile: Profile;
    theme: ThemeSettings;
    onSaveProfile: (profile: Profile) => void;
    onSaveTheme: (theme: ThemeSettings) => void;
    services: Service[];
    onCreateService: (serviceData: Partial<Service>) => Promise<void>;
    onUpdateService: (serviceId: number, serviceData: Partial<Service>) => Promise<void>;
    onDeleteService: (serviceId: number) => Promise<void>;
    onAppointmentsImported: (data: any[]) => void;
    setIsLoading: (isLoading: boolean) => void; // <-- 2. AÑADIMOS LA PROP PARA EL SPINNER
}

const Settings: React.FC<SettingsProps> = ({ profile, theme, onSaveProfile, onSaveTheme, services, onCreateService, onUpdateService, onDeleteService, onAppointmentsImported, setIsLoading }) => {
    const [profileForm, setProfileForm] = useState<Profile>(profile);
    const [themeForm, setThemeForm] = useState<ThemeSettings>(theme);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceForm, setServiceForm] = useState({ name: '', price: '' });
    const [uploadError, setUploadError] = useState<string | null>(null); // Estado para errores de subida

    useEffect(() => {
        setProfileForm(profile);
        if (theme) {
            setThemeForm(theme);
        }
    }, [profile, theme]);
    
    useEffect(() => {
        if (editingService) {
            setServiceForm({ name: editingService.name, price: String(editingService.price) });
        }
    }, [editingService]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveProfile(profileForm);
    };

    const handleThemeChange = (key: keyof ThemeSettings, value: PrimaryColor | BackgroundColor) => {
        const newTheme = { ...themeForm, [key]: value };
        setThemeForm(newTheme);
        onSaveTheme(newTheme);
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

    // --- 3. REEMPLAZAMOS LA LÓGICA DE SUBIDA DE ARCHIVOS ---
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validamos el tipo de archivo permitido
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            setUploadError('Formato no válido. Sube una imagen (JPG, PNG) o un PDF.');
            return;
        }

        setIsLoading(true);
        setUploadError(null);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const dataUrl = e.target?.result as string;
                
                // Extraemos el tipo MIME y los datos en Base64
                const [header, base64Data] = dataUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1] || file.type;

                // Llamamos al nuevo servicio de IA para procesar el archivo
                const processedData = await processFileWithAI(base64Data, mimeType, services);
                
                onAppointmentsImported(processedData);
                alert(`${processedData.length} citas han sido importadas exitosamente desde el archivo.`);
            } catch (error) {
                console.error("Error en la importación:", error);
                setUploadError(error instanceof Error ? error.message : "Ocurrió un error desconocido.");
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            setIsLoading(false);
            setUploadError("Error al leer el archivo.");
        };

        // Leemos el archivo como una URL de datos para obtener el Base64
        reader.readAsDataURL(file);
    };
    
    const backgroundButtonColors: Record<string, { bg: string; text: string }> = {
        [BackgroundColor.Blanco]: { bg: '#FFFFFF', text: '#111827' },
        [BackgroundColor.Negro]: { bg: '#111827', text: '#FFFFFF' },
        [BackgroundColor.Azul]: { bg: '#172554', text: '#FFFFFF' },
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold flex items-center"><SettingsIcon className="w-8 h-8 mr-3" /> Ajustes</h1>

            <form onSubmit={handleSaveProfile} className="bg-card p-6 rounded-2xl shadow-lg border border-border">
    <h3 className="text-xl font-semibold mb-4 flex items-center"><UsersIcon className="w-6 h-6 mr-3"/> Perfil del Negocio</h3>
    <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium mb-1">Nombre del Salón</label>
            <input 
                name="salonName" 
                value={profileForm?.salonName || ''} 
                onChange={handleProfileChange} 
                className="w-full mt-1 p-2 border border-border rounded bg-input text-foreground"
                style={{ backgroundColor: 'hsl(var(--input))' }}
            />
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Cuenta de Banco (para transferencias)</label>
            <input 
                name="accountNumber" 
                value={profileForm?.accountNumber || ''} 
                onChange={handleProfileChange} 
                className="w-full mt-1 p-2 border border-border rounded bg-input text-foreground"
                style={{ backgroundColor: 'hsl(var(--input))' }}
                placeholder="Ej: Ahorros Bancolombia 123-456789-00"
            />
        </div>
        
        <button type="submit" className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg mt-2">Guardar Perfil</button>
    </div>
</form>
            
            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
                <h3 className="text-xl font-semibold mb-4 flex items-center"><PaletteIcon className="w-6 h-6 mr-3"/> Personalización de la Apariencia</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Color de Botones (Primario)</label>
                        <div className="flex flex-wrap gap-4">
                            {Object.values(PrimaryColor).map(color => (
                                <button key={color} type="button" onClick={() => handleThemeChange('primaryColor', color)} className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${themeForm?.primaryColor === color ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : ''}`}>
                                    <span className={`w-4 h-4 rounded-full border border-white/20`} style={{ backgroundColor: `var(--color-${color.toLowerCase()})` }}></span>
                                    <span>{color}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Color de Fondo</label>
                        <div className="flex flex-wrap gap-3">
                             {Object.keys(backgroundButtonColors).map(colorKey => {
                                const colorInfo = backgroundButtonColors[colorKey as BackgroundColor];
                                return (
                                    <button 
                                        key={colorKey} 
                                        type="button" 
                                        onClick={() => handleThemeChange('backgroundColor', colorKey as BackgroundColor)} 
                                        className={`px-4 py-2 rounded-lg font-semibold flex items-center justify-center border transition-all ${themeForm?.backgroundColor === colorKey ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : 'border-border'}`}
                                        style={{ backgroundColor: colorInfo.bg, color: colorInfo.text }}
                                    >
                                        {colorKey}
                                    </button>
                                );
                             })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center"><DollarSignIcon className="w-6 h-6 mr-3"/> Mis Servicios</h3>
                    <button onClick={handleOpenCreateModal} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg">Añadir Servicio</button>
                </div>
                <div className="space-y-2">
                    {services.map(service => (
                        <div key={service.id} className="flex justify-between items-center p-3 bg-accent rounded-lg">
                            <span>{service.name}</span>
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(service.price)}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEditModal(service)} className="p-2 text-blue-500"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeleteService(service.id)} className="p-2 text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
                <h3 className="text-xl font-semibold mb-4 flex items-center"><UploadIcon className="w-6 h-6 mr-3"/> Gestión de Datos</h3>
                <p className="text-muted-foreground mb-4">Sube una foto de tu agenda o un PDF para que la I.A. importe tus citas.</p>
                <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept="image/*,.pdf" 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
            </div>

            <Modal isOpen={isServiceModalOpen} onClose={handleCloseServiceModal} title={editingService ? "Editar Servicio" : "Nuevo Servicio"}>
    <form onSubmit={handleSaveService} className="space-y-4">
        <div>
            <label className="block text-sm font-medium mb-1">Nombre del Servicio</label>
            <input 
                name="name" 
                value={serviceForm.name} 
                onChange={handleServiceFormChange} 
                required 
                className="w-full mt-1 p-2 border border-border rounded text-foreground"
                style={{ backgroundColor: 'hsl(var(--input))' }}
            />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Precio (COP)</label>
            <input 
                type="number" 
                name="price" 
                value={serviceForm.price} 
                onChange={handleServiceFormChange} 
                required 
                className="w-full mt-1 p-2 border border-border rounded text-foreground"
                style={{ backgroundColor: 'hsl(var(--input))' }}
            />
        </div>
        <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={handleCloseServiceModal} className="px-4 py-2 bg-muted rounded-lg">Cancelar</button>
            <button type="submit" className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg">{editingService ? 'Guardar Cambios' : 'Crear Servicio'}</button>
        </div>
    </form>
</Modal>
        </div>
    );
};

export default Settings;