import React, { useState, useEffect } from 'react';

// --- Definiciones de Tipos y Componentes (para que el archivo compile) ---
export enum AppointmentStatus {
    Scheduled = 'Scheduled',
    Completed = 'Completed',
    Canceled = 'Canceled',
    PaymentPending = 'PaymentPending'
}
export interface Client { id: number; firstName: string; lastName?: string; }
export interface Service { id: number; name: string; price: number; }
export interface Appointment {
    id: number;
    clientId: number;
    appointmentDate: string;
    appointmentTime: string;
    serviceIds?: number[];
    notes: string;
    status: string;
    cost: number;
}
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card text-card-foreground rounded-2xl shadow-lg w-full max-w-md p-6 pb-24 sm:pb-8">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose}>&times;</button></div>
                {children}
            </div>
        </div>
    );
};
const createIcon = (path: React.ReactNode): React.FC<React.SVGProps<SVGSVGElement>> => ({ className = 'w-6 h-6', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{path}</svg>
);
const PlusIcon = createIcon(<path d="M5 12h14m-7-7v14" />);
const TrashIcon = createIcon(<path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />);
const CalendarIcon = createIcon(<><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></>);
const ClockIcon = createIcon(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>);
const UserIcon = createIcon(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>);
const SparklesIcon = createIcon(<path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9z" />);
const PencilIcon = createIcon(<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />);
// --- Fin de Definiciones ---


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
        notes: '',
        cost: 0
    });

    const [editFormState, setEditFormState] = useState<any | null>(null);

    useEffect(() => {
        if (viewingAppointment) {
            setEditFormState({
                clientId: viewingAppointment.clientId,
                appointmentDate: viewingAppointment.appointmentDate.split('T')[0],
                appointmentTime: viewingAppointment.appointmentTime,
                serviceIds: viewingAppointment.serviceIds || [],
                notes: viewingAppointment.notes || '',
                status: viewingAppointment.status || 'Scheduled',
            });
        }
    }, [viewingAppointment]);
    
    const calculateCost = (selectedServiceIds: number[]) => services
        .filter(s => selectedServiceIds.includes(s.id))
        .reduce((total, service) => total + Number(service.price), 0);

    useEffect(() => {
        setFormState(prev => ({ ...prev, cost: calculateCost(prev.serviceIds) }));
    }, [formState.serviceIds, services]);

    useEffect(() => {
        if (editFormState) {
            setEditFormState((prev: any) => ({ ...prev, cost: calculateCost(prev.serviceIds) }));
        }
    }, [editFormState?.serviceIds, services]);

    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - (selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1)); 
    
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const calendarDays = Array.from({ length: 6 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
    });

    const formatTime12h = (time24h: string): string => {
        if (!time24h) return '';
        const [h, m] = time24h.split(':');
        return new Date(0, 0, 0, Number(h), Number(m)).toLocaleTimeString('es-CO', { hour: 'numeric', minute: 'numeric', hour12: true });
    };
    
    const getStatusClasses = (status: string) => {
        const statuses: Record<string, string> = {
            [AppointmentStatus.Scheduled]: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            [AppointmentStatus.Completed]: 'bg-green-500/20 text-green-400 border-green-500/30',
            [AppointmentStatus.Canceled]: 'bg-red-600/20 text-red-400 border-red-500/30',
            [AppointmentStatus.PaymentPending]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        };
        return statuses[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setViewingAppointment(null);
    };

    const handleFormChange = (e: React.ChangeEvent<any>) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleEditFormChange = (e: React.ChangeEvent<any>) => setEditFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleServiceChange = (serviceId: number, isEdit = false) => {
        const updater = isEdit ? setEditFormState : setFormState;
        updater((prev: any) => ({ ...prev, serviceIds: prev.serviceIds.includes(serviceId) ? prev.serviceIds.filter((id: number) => id !== serviceId) : [...prev.serviceIds, serviceId] }));
    };
    const handleSaveAppointment = async (e: React.FormEvent) => { e.preventDefault(); await onCreateAppointment({ ...formState, clientId: parseInt(formState.clientId) }); handleCloseModal(); };
    const handleUpdateAppointment = async (e: React.FormEvent) => { e.preventDefault(); if (viewingAppointment) { await onUpdateAppointment(viewingAppointment.id, { ...editFormState, clientId: parseInt(editFormState.clientId) }); handleCloseModal(); } };
    const handleDeleteFromModal = () => { if (viewingAppointment && window.confirm('¿Eliminar cita?')) { onDeleteAppointment(viewingAppointment.id); handleCloseModal(); } };

    const filterAndSortAppointments = (date: Date) => appointments
        .filter(app => app.appointmentDate?.split('T')[0] === date.toISOString().split('T')[0])
        .sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''));

    const selectedDayAppointments = filterAndSortAppointments(selectedDate);
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Agenda de Citas</h1>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg shadow hover:bg-primary/90 flex items-center w-full sm:w-auto justify-center">
                    <PlusIcon className="w-5 h-5 mr-2" /> Agendar Cita
                </button>
            </div>

            <div className="bg-card p-4 md:p-6 rounded-2xl shadow-lg border border-border">
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Calendario Semanal</h3>
                <div className="grid grid-cols-6 gap-2 text-center">
                    {weekDays.map(day => <div key={day} className="font-bold text-muted-foreground text-sm">{day}</div>)}
                    {calendarDays.map((day, index) => {
                        const dayAppointments = filterAndSortAppointments(day);
                        const isSelected = day.toDateString() === selectedDate.toDateString();
                        
                        return (
                            <div 
                                key={index} 
                                onClick={() => setSelectedDate(day)} 
                                className={`border rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-start p-2 min-h-[120px]
                                    ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-accent border-border'}`}
                            >
                                <div className={`font-bold text-sm self-end ${isSelected ? 'text-primary' : 'text-foreground'}`}>{day.getDate()}</div>
                                <div className="space-y-1 w-full mt-1 overflow-y-auto">
                                    {dayAppointments.slice(0, 2).map(app => (
                                        <div key={app.id} className="bg-primary/80 text-primary-foreground text-xs rounded p-1 text-left truncate cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewingAppointment(app); }}>
                                            <span>{formatTime12h(app.appointmentTime)}</span> - <span>{app.clientFirstName}</span>
                                        </div>
                                    ))}
                                    {dayAppointments.length > 2 && <div className="text-xs text-muted-foreground text-center">...{dayAppointments.length - 2} más</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="space-y-4">
                 <h3 className="text-2xl font-bold text-card-foreground">
                    Citas para el {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                {selectedDayAppointments.length > 0 ? (
                    selectedDayAppointments.map(app => {
                        const appServices = services.filter(s => app.serviceIds?.includes(s.id));
                        return (
                            <div key={app.id} className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                                <div className="p-4 flex flex-col sm:flex-row gap-4">
                                    <div className="flex sm:flex-col items-center sm:justify-center sm:w-28 text-center border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-4">
                                        <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-0 sm:mb-1 mr-2 sm:mr-0"/>
                                        <span className="font-bold text-lg text-primary">{formatTime12h(app.appointmentTime)}</span>
                                    </div>
                                    <div className="flex-grow space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-muted-foreground flex items-center"><UserIcon className="w-4 h-4 mr-2"/>Cliente</p>
                                                <p className="font-bold text-lg text-card-foreground">{app.clientFirstName} {app.clientLastName}</p>
                                            </div>
                                            <div className={`text-xs font-bold py-1 px-3 rounded-full border ${getStatusClasses(app.status)}`}>{app.status}</div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground flex items-center"><SparklesIcon className="w-4 h-4 mr-2"/>Servicios</p>
                                            <ul className="text-sm text-card-foreground list-disc list-inside">
                                                {appServices.map(s => <li key={s.id}>{s.name}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col justify-between items-end sm:items-center sm:w-32 pt-3 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-border">
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Costo Total</p>
                                            <p className="font-bold text-xl text-primary">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(app.cost)}</p>
                                        </div>
                                        <button onClick={() => setViewingAppointment(app)} className="bg-accent text-accent-foreground p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center text-muted-foreground py-12 bg-card rounded-2xl border border-border">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50"/>
                        <p className="font-semibold">No hay citas programadas para este día.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={handleCloseModal} title="Agendar Nueva Cita">
    <form onSubmit={handleSaveAppointment} className="space-y-4">
        <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select name="clientId" value={formState.clientId} onChange={handleFormChange} required 
                className="w-full p-2 border border-border rounded-lg bg-input text-foreground"
                style={{ backgroundColor: 'hsl(var(--input))' }}
            >
                <option value="" disabled>Selecciona un cliente</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id} style={{ backgroundColor: 'hsl(var(--card))' }}>
                        {client.firstName} {client.lastName}
                    </option>
                ))}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Servicios</label>
            <div className="max-h-40 overflow-y-auto p-2 border border-border rounded-lg space-y-2 bg-input" style={{ backgroundColor: 'hsl(var(--input))' }}>
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
                <input name="appointmentDate" type="date" value={formState.appointmentDate} onChange={handleFormChange} required 
                    className="w-full p-2 border border-border rounded-lg bg-input text-foreground"
                    style={{ backgroundColor: 'hsl(var(--input))' }}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Hora</label>
                <input name="appointmentTime" type="time" value={formState.appointmentTime} onChange={handleFormChange} required 
                    className="w-full p-2 border border-border rounded-lg bg-input text-foreground"
                    style={{ backgroundColor: 'hsl(var(--input))' }}
                />
            </div>
        </div>
        <textarea name="notes" value={formState.notes} onChange={handleFormChange} placeholder="Notas (opcional)" 
            className="w-full p-2 border border-border rounded-lg bg-input text-foreground"
            style={{ backgroundColor: 'hsl(var(--input))' }}
        />
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
                <select name="clientId" value={editFormState.clientId} onChange={handleEditFormChange} required 
                    className="w-full p-2 border border-border rounded-lg bg-input text-foreground"
                    style={{ backgroundColor: 'hsl(var(--input))' }}
                >
                    {clients.map(client => (
                        <option key={client.id} value={client.id} style={{ backgroundColor: 'hsl(var(--card))' }}>
                            {client.firstName} {client.lastName}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Servicios</label>
                <div className="max-h-40 overflow-y-auto p-2 border border-border rounded-lg space-y-2 bg-input" style={{ backgroundColor: 'hsl(var(--input))' }}>
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
                    <input name="appointmentDate" type="date" value={editFormState.appointmentDate} onChange={handleEditFormChange} required 
                        className="w-full p-2 border border-border rounded-lg bg-input text-foreground"
                        style={{ backgroundColor: 'hsl(var(--input))' }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Hora</label>
                    <input name="appointmentTime" type="time" value={editFormState.appointmentTime} onChange={handleEditFormChange} required 
                        className="w-full p-2 border border-border rounded-lg bg-input text-foreground"
                        style={{ backgroundColor: 'hsl(var(--input))' }}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select name="status" value={editFormState.status} onChange={handleEditFormChange} className={`w-full p-2 border rounded-lg font-semibold ${getStatusClasses(editFormState.status)}`}>
                    <option value={AppointmentStatus.Scheduled} style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>Agendada</option>
                    <option value={AppointmentStatus.Completed} style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>Completada</option>
                    <option value={AppointmentStatus.Canceled} style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>Cancelada</option>
                    <option value={AppointmentStatus.PaymentPending} style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>Falta Pago</option>
                </select>
            </div>
            <textarea name="notes" value={editFormState.notes} onChange={handleEditFormChange} placeholder="Notas (opcional)" 
                className="w-full p-2 border border-border rounded-lg bg-input text-foreground"
                style={{ backgroundColor: 'hsl(var(--input))' }}
            />
            
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

