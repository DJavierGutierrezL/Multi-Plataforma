import React, { useState, useEffect } from 'react';
import { Client, Service } from '../types';
import Modal from './Modal';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

// Definimos un tipo para las citas que vienen con datos del cliente
interface AppointmentWithClient extends Appointment {
    clientFirstName?: string;
    clientLastName?: string;
}

interface AppointmentsProps {
    appointments: AppointmentWithClient[];
    clients: Client[];
    services: Service[];
    onCreateAppointment: (appointmentData: any) => Promise<void>;
    onDeleteAppointment: (appointmentId: number) => Promise<void>;
    onUpdateAppointment: (appointmentId: number, updatedData: any) => Promise<void>;
}

const Appointments: React.FC<AppointmentsProps> = ({ appointments, clients, services, onCreateAppointment, onDeleteAppointment, onUpdateAppointment }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingAppointment, setViewingAppointment] = useState<AppointmentWithClient | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [formState, setFormState] = useState({
        clientId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00',
        serviceIds: [] as number[],
        notes: ''
    });

    const [editFormState, setEditFormState] = useState<any | null>(null);

    // Efecto para inicializar el formulario de edición cuando se abre el modal
    useEffect(() => {
        if (viewingAppointment) {
            setEditFormState({
                clientId: viewingAppointment.clientId || '',
                appointmentDate: viewingAppointment.appointmentDate ? viewingAppointment.appointmentDate.split('T')[0] : '',
                appointmentTime: viewingAppointment.appointmentTime || '',
                serviceIds: viewingAppointment.serviceIds || [],
                notes: viewingAppointment.notes || '',
                status: viewingAppointment.status || 'Scheduled',
                cost: viewingAppointment.cost || 0
            });
        } else {
            setEditFormState(null);
        }
    }, [viewingAppointment]);

    // Efecto para calcular el costo total dinámicamente en el modal de edición
    useEffect(() => {
        if (editFormState && services.length > 0) {
            const totalCost = editFormState.serviceIds.reduce((total: number, serviceId: number) => {
                const service = services.find(s => s.id === serviceId);
                return total + (service ? Number(service.price) : 0);
            }, 0);
            setEditFormState((prev: any) => ({ ...prev, cost: totalCost }));
        }
    }, [editFormState?.serviceIds, services]);


    // --- Lógica de calendario y helpers ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); 
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const calendarDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
    });

    const formatTime12h = (time24h: string): string => {
        if (!time24h) return '';
        const [hoursStr, minutes] = time24h.split(':');
        let hours = parseInt(hoursStr, 10);
        const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    };
    
    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'bg-pink-600';
            case 'Completed': return 'bg-green-600';
            case 'Canceled': return 'bg-red-600';
            case 'Pending': return 'bg-yellow-500 text-black';
            default: return 'bg-gray-500';
        }
    };
    
    const getStatusTextClasses = (status: string) => {
        return (status === 'Pending') ? 'text-black' : 'text-white';
    }

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setViewingAppointment(null);
        setFormState({ clientId: '', appointmentDate: new Date().toISOString().split('T')[0], appointmentTime: '10:00', serviceIds: [], notes: '' });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (editFormState) {
            setEditFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleServiceChange = (serviceId: number, isEditForm: boolean = false) => {
        const stateUpdater = isEditForm ? setEditFormState : setFormState;
        stateUpdater((prev: any) => {
            const currentServiceIds = prev.serviceIds || [];
            const newServiceIds = currentServiceIds.includes(serviceId)
                ? currentServiceIds.filter((id: number) => id !== serviceId)
                : [...currentServiceIds, serviceId];
            return { ...prev, serviceIds: newServiceIds };
        });
    };
    
    const handleSaveAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.clientId || formState.serviceIds.length === 0) {
            alert('Por favor, selecciona un cliente y al menos un servicio.');
            return;
        }
        await onCreateAppointment({ ...formState, clientId: parseInt(formState.clientId) });
        handleCloseModal();
    };

    const handleUpdateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (viewingAppointment && editFormState) {
            const dataToUpdate = {
                ...editFormState,
                clientId: parseInt(editFormState.clientId),
            };
            await onUpdateAppointment(viewingAppointment.id, dataToUpdate);
            handleCloseModal();
        }
    };

    const handleDeleteFromModal = () => {
        if (viewingAppointment && window.confirm('¿Seguro que quieres eliminar esta cita? Esta acción no se puede deshacer.')) {
            onDeleteAppointment(viewingAppointment.id);
            handleCloseModal();
        }
    };
    
    const filterAndSortAppointments = (apps: AppointmentWithClient[], date: Date) => {
        return apps
            .filter(app => {
                const dateValue = app.appointmentDate;
                if (!dateValue) return false;
                const appDate = dateValue.split('T')[0];
                const filterDate = date.toISOString().split('T')[0];
                return appDate === filterDate;
            })
            .sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''));
    };

    const selectedDayAppointments = filterAndSortAppointments(appointments, selectedDate);

    // --- RENDERIZADO DEL COMPONENTE ---
    // (Tu JSX aquí, sin cambios, ya que la lógica del estado es lo que se corrige)
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Agenda de Citas</h1>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary/90 flex items-center transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Agendar Cita
                </button>
            </div>

            <div className="bg-card p-4 md:p-6 rounded-2xl shadow-lg border border-border">
                <h3 className="text-xl font-semibold mb-4">Calendario Semanal</h3>
                <div className="grid grid-cols-7 gap-2 text-center">
                    {weekDays.map(day => <div key={day} className="font-bold text-muted-foreground text-sm md:text-base">{day}</div>)}
                    {calendarDays.map((day, index) => {
                        const dayAppointments = filterAndSortAppointments(appointments, day);
                        const isSelected = day.toDateString() === selectedDate.toDateString();
                        return (
                            <div key={index} onClick={() => setSelectedDate(day)} className={`p-2 border rounded-lg min-h-[100px] md:min-h-32 cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-accent'}`}>
                                <div className="font-bold text-right text-sm md:text-base">{day.getDate()}</div>
                                <div className="space-y-1 mt-1">
                                    {dayAppointments.slice(0, 3).map(app => (
                                        <button key={app.id} onClick={(e) => { e.stopPropagation(); setViewingAppointment(app); }} className={`w-full text-white text-xs rounded p-1 truncate text-left ${getStatusClasses(app.status)}`}>
                                            {formatTime12h(app.appointmentTime)} - {app.clientFirstName}
                                        </button>
                                    ))}
                                    {dayAppointments.length > 3 && <div className="text-xs text-muted-foreground text-center">+ {dayAppointments.length - 3} más</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="bg-card p-4 md:p-6 rounded-2xl shadow-lg border border-border">
                <h3 className="text-xl font-semibold mb-4">
                    Citas para el {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <div className="space-y-3">
                    {selectedDayAppointments.length > 0 ? (
                        selectedDayAppointments.map((app) => (
                            <button key={app.id} onClick={() => setViewingAppointment(app)} className={`w-full text-left p-4 rounded-lg hover:opacity-90 transition-opacity text-white ${getStatusClasses(app.status)}`}>
                                <p className="font-bold">{app.clientFirstName} {app.clientLastName}</p>
                                <p className="text-sm">{formatTime12h(app.appointmentTime)}</p>
                            </button>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">No hay citas programadas para este día.</div>
                    )}
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={handleCloseModal} title="Agendar Nueva Cita">
    <form onSubmit={handleSaveAppointment} className="space-y-4">
        <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select name="clientId" value={formState.clientId} onChange={handleFormChange} required className="w-full p-2 border rounded-lg bg-input text-foreground">
                <option value="" disabled>Selecciona un cliente</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
                ))}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Servicios</label>
            <div className="max-h-40 overflow-y-auto p-2 border rounded-lg space-y-2 bg-input">
                {services.map(service => (
                    <label key={service.id} className="flex items-center space-x-2 text-foreground">
                        <input type="checkbox" checked={formState.serviceIds.includes(service.id)} onChange={() => handleServiceChange(service.id, false)} className="form-checkbox h-4 w-4 text-primary rounded bg-card focus:ring-primary" />
                        <span>{service.name}</span>
                    </label>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input name="appointmentDate" type="date" value={formState.appointmentDate} onChange={handleFormChange} required className="w-full p-2 border rounded-lg bg-input text-foreground"/>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Hora</label>
                <input name="appointmentTime" type="time" value={formState.appointmentTime} onChange={handleFormChange} required className="w-full p-2 border rounded-lg bg-input text-foreground"/>
            </div>
        </div>
        <textarea name="notes" value={formState.notes} onChange={handleFormChange} placeholder="Notas (opcional)" className="w-full p-2 border rounded-lg bg-input text-foreground" />
        <div className="flex justify-end pt-2 space-x-4">
             <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
             <button type="submit" className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg hover:bg-primary/90">Guardar Cita</button>
        </div>
    </form>
</Modal>
            
            <Modal isOpen={!!viewingAppointment} onClose={handleCloseModal} title="Editar Cita">
                {viewingAppointment && editFormState && (
                    <form onSubmit={handleUpdateAppointment} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Cliente</label>
                            <select name="clientId" value={editFormState.clientId} onChange={handleEditFormChange} required className="w-full p-2 border rounded-lg bg-input text-foreground">
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Servicios</label>
                            <div className="max-h-40 overflow-y-auto p-2 border rounded-lg space-y-2 bg-input">
                                {services.map(service => (
                                    <label key={service.id} className="flex items-center space-x-2 text-foreground">
                                        <input type="checkbox" checked={editFormState.serviceIds.includes(service.id)} onChange={() => handleServiceChange(service.id, true)} className="form-checkbox h-4 w-4 text-primary rounded bg-card focus:ring-primary"/>
                                        <span>{service.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha</label>
                                <input name="appointmentDate" type="date" value={editFormState.appointmentDate} onChange={handleEditFormChange} required className="w-full p-2 border rounded-lg bg-input text-foreground"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Hora</label>
                                <input name="appointmentTime" type="time" value={editFormState.appointmentTime} onChange={handleEditFormChange} required className="w-full p-2 border rounded-lg bg-input text-foreground"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Estado</label>
                            <select name="status" value={editFormState.status} onChange={handleEditFormChange} className={`w-full p-2 border rounded-lg font-semibold ${getStatusClasses(editFormState.status)} ${getStatusTextClasses(editFormState.status)}`}>
                                <option value="Scheduled" style={{ backgroundColor: '#202020', color: 'white' }}>Agendada</option>
                                <option value="Completed" style={{ backgroundColor: '#202020', color: 'white' }}>Completada</option>
                                <option value="Canceled" style={{ backgroundColor: '#202020', color: 'white' }}>Cancelada</option>
                            </select>
                        </div>
                        <textarea name="notes" value={editFormState.notes} onChange={handleEditFormChange} placeholder="Notas (opcional)" className="w-full p-2 border rounded-lg bg-input text-foreground" />
                        
                        <div className="flex justify-between items-center pt-4">
                            <button type="button" onClick={handleDeleteFromModal} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors">
                                <TrashIcon className="w-5 h-5" /> Eliminar
                            </button>
                            <div className="flex gap-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">Cancelar</button>
                                <button type="submit" className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">Guardar Cambios</button>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Appointments;