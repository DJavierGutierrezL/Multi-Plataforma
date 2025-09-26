import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Client, Service, Appointment, AppointmentStatus } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { UsersIcon } from './icons/UsersIcon';
import { GiftIcon } from './icons/GiftIcon';
import { HistoryIcon } from './icons/HistoryIcon';
// --- NUEVO: Asumimos que tienes un componente Modal reutilizable ---
import Modal from './Modal'; // Ajusta esta ruta si tu componente Modal está en otro lugar

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);


const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-lg flex items-center border border-border transition-transform hover:scale-105">
        <div className={`p-3 sm:p-4 rounded-full mr-4 ${color}`}>{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-card-foreground">{value}</p>
        </div>
    </div>
);

const getStatusBadge = (status?: string) => {
    switch (status) {
        case 'Completed': return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500 text-white">Completada</span>;
        case 'Scheduled': return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-400 text-gray-800">Agendada</span>;
        case 'Canceled': return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500 text-white">Cancelada</span>;
        case 'Falta Pago': return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-500 text-white">Falta Pago</span>;
        default: return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-500 text-white">N/A</span>;
    }
};

const Dashboard: React.FC<DashboardProps> = ({ appointments: rawAppointments, clients, services, onDeleteAppointment, onUpdateAppointment }) => {
    
    // --- NUEVO: Estado para manejar el modal de edición ---
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [editFormState, setEditFormState] = useState<Appointment | null>(null);

    useEffect(() => {
        // Sincroniza el estado del formulario cuando se selecciona una cita para editar
        if (editingAppointment) {
            setEditFormState(editingAppointment);
        }
    }, [editingAppointment]);

    // --- NUEVO: Funciones para controlar el modal ---
    const handleOpenEditModal = (appointmentId: string) => {
        const appointmentToEdit = rawAppointments.find(app => app.id === appointmentId);
        if (appointmentToEdit) {
            setEditingAppointment(appointmentToEdit);
        }
    };

    const handleCloseModal = () => {
        setEditingAppointment(null);
        setEditFormState(null);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!editFormState) return;
        const { name, value } = e.target;
        setEditFormState({ ...editFormState, [name]: value });
    };

    const handleServiceChange = (serviceId: string) => {
        if (!editFormState) return;
        const currentServiceIds = editFormState.serviceIds || [];
        const newServiceIds = currentServiceIds.includes(serviceId)
            ? currentServiceIds.filter(id => id !== serviceId)
            : [...currentServiceIds, serviceId];
        
        const updatedCost = services
            .filter(s => newServiceIds.includes(s.id))
            .reduce((total, s) => total + s.price, 0);

        setEditFormState({ ...editFormState, serviceIds: newServiceIds, cost: updatedCost });
    };

    const handleUpdateAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        if (editFormState) {
            // ✅ CÓDIGO CORRECTO CON .id
            onUpdateAppointment(editFormState.id, editFormState);
            handleCloseModal();
        }
    };

    const handleDeleteFromModal = () => {
        if (editFormState) {
            // Reutilizamos la función onDeleteAppointment que ya recibe el ID
             if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
                onDeleteAppointment(editFormState.id);
                handleCloseModal();
            }
        }
    };

     const handleDeleteFromTable = (appointmentId: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
            onDeleteAppointment(appointmentId);
        }
    };

    // --- FIN DE NUEVAS FUNCIONES ---

    const appointments = useMemo(() => rawAppointments.map(app => {
        const client = clients.find(c => c.id === app.clientId);
        return { ...app, clientFirstName: client?.firstName, clientLastName: client?.lastName };
    }), [rawAppointments, clients]);

    // ... (el resto de tu lógica de useMemo para los gráficos y filtros se mantiene igual)
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const isFirstFortnight = currentDay <= 15;
    const startOfFortnight = new Date(currentYear, currentMonth, isFirstFortnight ? 1 : 16, 0, 0, 0, 0);
    const endOfFortnight = isFirstFortnight 
        ? new Date(currentYear, currentMonth, 15, 23, 59, 59, 999)
        : new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const fortnightLabel = `${startOfFortnight.getDate()} - ${endOfFortnight.getDate()} de ${today.toLocaleDateString('es-ES', { month: 'long' })}`;

    const completedAppointmentsThisFortnight = useMemo(() =>
        appointments.filter(app => {
            if (app.status !== 'Completed' || !app.appointmentDate || !app.appointmentTime) return false;
            const appDate = new Date(`${app.appointmentDate}T${app.appointmentTime}`);
            return appDate >= startOfFortnight && appDate <= endOfFortnight;
        }), [appointments, startOfFortnight, endOfFortnight]);
    
    const totalFortnightRevenue = useMemo(() =>
        completedAppointmentsThisFortnight.reduce((total, app) => total + (Number(app.cost) || 0), 0), [completedAppointmentsThisFortnight]);
    
    const revenueData = useMemo(() => {
        const dataMap = new Map<number, number>();
        for (let d = new Date(startOfFortnight); d <= endOfFortnight; d.setDate(d.getDate() + 1)) { dataMap.set(d.getDate(), 0); }
        completedAppointmentsThisFortnight.forEach(app => {
            const day = new Date(`${app.appointmentDate}T${app.appointmentTime}`).getDate();
            dataMap.set(day, (dataMap.get(day) || 0) + Number(app.cost));
        });
        return Array.from(dataMap.entries()).map(([day, revenue]) => ({ name: String(day), Ingresos: revenue }));
    }, [completedAppointmentsThisFortnight, startOfFortnight, endOfFortnight]);

    const statusPieData = useMemo(() => {
        const counts = appointments.reduce((acc, app) => {
            if (app.status) acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const colors: Record<string, string> = {
            [AppointmentStatus.Scheduled]: '#ec4899',
            [AppointmentStatus.Completed]: '#60a5fa',
            [AppointmentStatus.Canceled]: '#ef4444',
            [AppointmentStatus.PaymentPending]: '#f97316'
        };
        
        return Object.entries(counts).map(([name, value]) => ({ name, value, fill: colors[name] || '#9ca3af' }));
    }, [appointments]);

    const clientsWithBirthdaysThisWeek = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); 
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return clients.filter(client => {
        if (!client.birthDate || typeof client.birthDate !== 'string') return false;
        const parts = client.birthDate.split('-');
        if (parts.length < 3) return false;

        const birthMonth = parseInt(parts[1], 10) - 1;
        const birthDay = parseInt(parts[2], 10);

        const birthdayThisYear = new Date(today.getFullYear(), birthMonth, birthDay);
        return birthdayThisYear >= startOfWeek && birthdayThisYear <= endOfWeek;
    });
}, [clients]);

    const [statusFilter, setStatusFilter] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const filteredAppointments = useMemo(() => {
        return appointments.filter(app => {
            const statusMatch = !statusFilter || app.status === statusFilter;
            const clientMatch = !clientFilter || String(app.clientId) === clientFilter;
            const monthMatch = !monthFilter || new Date(app.appointmentDate).getMonth() === parseInt(monthFilter);
            return statusMatch && clientMatch && monthMatch;
        }).sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
    }, [appointments, statusFilter, clientFilter, monthFilter]);

    return (
        <> {/* --- NUEVO: Envolvemos en un Fragment para poder añadir el Modal --- */}
            <div className="space-y-8">
                {/* ... (Todo tu JSX de los StatCards, gráficos y filtros se mantiene igual) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Ingresos (Quincena)"
                    value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalFortnightRevenue)} 
                    icon={<DollarSignIcon className="w-6 h-6" />} 
                    color="bg-green-100 text-green-800" 
                />
                <StatCard 
                    title="Citas Completadas (Quincena)" 
                    value={completedAppointmentsThisFortnight.length} 
                    icon={<CalendarIcon className="w-6 h-6" />} 
                    color="bg-blue-100 text-blue-800" 
                />
                <StatCard 
                    title="Total Clientes"
                    value={clients.length} 
                    icon={<UsersIcon className="w-6 h-6" />} 
                    color="bg-purple-100 text-purple-800" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-card p-6 rounded-2xl shadow-md border">
                    <h3 className="text-xl font-semibold">{`Análisis de Ingresos (${fortnightLabel})`}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis tickFormatter={(value) => `$${(value/1000)}k`} fontSize={12} />
                            <Tooltip formatter={(value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="Ingresos" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-md border">
                    <h3 className="text-xl font-semibold">Distribución de Citas</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {statusPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-md border">
                        <h3 className="text-xl font-semibold mb-4 flex items-center"><HistoryIcon className="w-6 h-6 mr-3"/> Historial de Servicios</h3>
                        {/* ... (Tus filtros de la tabla se mantienen igual) ... */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                        <select 
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)} 
                            className="w-full p-2 border border-border rounded text-foreground"
                            style={{ backgroundColor: 'hsl(var(--input))' }}
                        >
                            <option value="" style={{ backgroundColor: 'hsl(var(--card))' }}>Todo Estado</option>
                            <option value="Completed" style={{ backgroundColor: 'hsl(var(--card))' }}>Completada</option>
                            <option value="Scheduled" style={{ backgroundColor: 'hsl(var(--card))' }}>Agendada</option>
                            <option value="Canceled" style={{ backgroundColor: 'hsl(var(--card))' }}>Cancelada</option>
                            <option value="Falta Pago" style={{ backgroundColor: 'hsl(var(--card))' }}>Falta Pago</option>
                        </select>
                        <select 
                            value={clientFilter} 
                            onChange={e => setClientFilter(e.target.value)} 
                            className="w-full p-2 border border-border rounded text-foreground"
                            style={{ backgroundColor: 'hsl(var(--input))' }}
                        >
                            <option value="" style={{ backgroundColor: 'hsl(var(--card))' }}>Todo Cliente</option>
                            {clients.map(c => 
                                <option key={c.id} value={c.id} style={{ backgroundColor: 'hsl(var(--card))' }}>
                                    {c.firstName} {c.lastName}
                                </option>
                            )}
                        </select>
                        <select 
                            value={monthFilter} 
                            onChange={e => setMonthFilter(e.target.value)} 
                            className="w-full p-2 border border-border rounded text-foreground"
                            style={{ backgroundColor: 'hsl(var(--input))' }}
                        >
                            <option value="" style={{ backgroundColor: 'hsl(var(--card))' }}>Todo Mes</option>
                            {meses.map((mes, index) => 
                                <option key={index} value={index} style={{ backgroundColor: 'hsl(var(--card))' }}>
                                    {mes}
                                </option>
                            )}
                        </select>
                        <button onClick={() => { setStatusFilter(''); setClientFilter(''); setMonthFilter(''); }} className="bg-muted text-muted-foreground px-4 py-2 rounded hover:bg-accent transition-colors">
                            Limpiar
                        </button>
                    </div>

                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-accent sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Cliente</th>
                                        <th className="px-4 py-3">Servicios</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map(app => (
                                        <tr key={app.id} className="border-b border-border">
                                            <td className="px-4 py-2">{new Date(`${app.appointmentDate}T00:00:00-05:00`).toLocaleDateString('es-ES', {year: '2-digit', month: '2-digit', day: '2-digit'})}</td>
                                            <td className="px-4 py-2 font-medium">{app.clientFirstName} {app.clientLastName}</td>
                                            <td className="px-4 py-2">
                                                {app.serviceIds?.map(id => services.find(s => s.id === id)?.name).join(', ') || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2">{getStatusBadge(app.status)}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-center space-x-2">
                                                    {/* --- NUEVO: onClick actualizado --- */}
                                                    <button 
                                                        onClick={() => handleOpenEditModal(app.id)} 
                                                        className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                                                        aria-label="Editar cita"
                                                    >
                                                        <EditIcon />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteFromTable(app.id)} 
                                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                                        aria-label="Eliminar cita"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAppointments.length === 0 && <p className="text-center text-muted-foreground p-8">No se encontraron servicios con estos filtros.</p>}
                        </div>
                    </div>
                     <div className="bg-card p-6 rounded-2xl shadow-md border">
                    <h3 className="text-xl font-semibold mb-4 flex items-center"><GiftIcon className="w-6 h-6 mr-3 text-pink-400"/> Cumpleaños de la Semana</h3>
                    <div className="space-y-3">
                        {clientsWithBirthdaysThisWeek.length > 0 ? (
                            clientsWithBirthdaysThisWeek.map(client => (
                                <div key={client.id} className="p-3 bg-accent rounded-lg">
                                    <p className="font-semibold">{client.firstName} {client.lastName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(client.birthDate!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground p-8">Nadie cumple años esta semana.</p>
                        )}
                    </div>
                </div>
                </div>
            </div>

            {/* --- NUEVO: Renderizado del Modal de Edición --- */}
            <Modal isOpen={!!editingAppointment} onClose={handleCloseModal} title="Editar Cita">
                {editFormState && (
                    <form onSubmit={handleUpdateAppointment} className="space-y-4">
                        {/* El contenido del formulario es el que proporcionaste */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Cliente</label>
                            <select name="clientId" value={editFormState.clientId} onChange={handleEditFormChange} required className="w-full p-2 border border-border rounded-lg bg-input text-foreground">
                                {clients.map(client => (
                                    <option key={client.id} value={client.id} style={{ backgroundColor: 'hsl(var(--card))' }}>
                                        {client.firstName} {client.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Servicios</label>
                            <div className="max-h-40 overflow-y-auto p-2 border border-border rounded-lg space-y-2 bg-input">
                                {services.map(service => (
                                    <label key={service.id} className="flex items-center space-x-2 text-foreground">
                                        <input type="checkbox" checked={editFormState.serviceIds?.includes(service.id)} onChange={() => handleServiceChange(service.id)} className="form-checkbox h-4 w-4 text-primary rounded bg-card focus:ring-primary"/>
                                        <span>{service.name} (${new Intl.NumberFormat('es-CO').format(service.price)})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha</label>
                                <input name="appointmentDate" type="date" value={editFormState.appointmentDate} onChange={handleEditFormChange} required className="w-full p-2 border border-border rounded-lg bg-input text-foreground"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Hora</label>
                                <input name="appointmentTime" type="time" value={editFormState.appointmentTime} onChange={handleEditFormChange} required className="w-full p-2 border border-border rounded-lg bg-input text-foreground"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Estado</label>
                            <select name="status" value={editFormState.status} onChange={handleEditFormChange} className="w-full p-2 border rounded-lg font-semibold bg-input">
                                <option value={AppointmentStatus.Scheduled} style={{ backgroundColor: 'hsl(var(--card))'}}>Agendada</option>
                                <option value={AppointmentStatus.Completed} style={{ backgroundColor: 'hsl(var(--card))'}}>Completada</option>
                                <option value={AppointmentStatus.Canceled} style={{ backgroundColor: 'hsl(var(--card))'}}>Cancelada</option>
                                <option value={AppointmentStatus.PaymentPending} style={{ backgroundColor: 'hsl(var(--card))'}}>Falta Pago</option>
                            </select>
                        </div>
                        <textarea name="notes" value={editFormState.notes || ''} onChange={handleEditFormChange} placeholder="Notas (opcional)" className="w-full p-2 border border-border rounded-lg bg-input text-foreground"/>
                        
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
        </>
    );
};

export default Dashboard;