import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Client, Service, Appointment, AppointmentStatus } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { UsersIcon } from './icons/UsersIcon';
import { GiftIcon } from './icons/GiftIcon';
import { HistoryIcon } from './icons/HistoryIcon';

interface DashboardProps {
    appointments: Appointment[];
    clients: Client[];
    services: Service[];
}

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

const Dashboard: React.FC<DashboardProps> = ({ appointments: rawAppointments, clients, services }) => {
    
    const appointments = useMemo(() => rawAppointments.map(app => {
        const client = clients.find(c => c.id === app.clientId);
        return { ...app, clientFirstName: client?.firstName, clientLastName: client?.lastName };
    }), [rawAppointments, clients]);

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
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo como inicio de semana
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado como fin de semana
    endOfWeek.setHours(23, 59, 59, 999);

    return clients.filter(client => {
        // Asegurarse de que la fecha de nacimiento existe y es un string
        if (!client.birthDate || typeof client.birthDate !== 'string') return false;

        // Dividimos el string 'YYYY-MM-DD' para evitar problemas de zona horaria
        const parts = client.birthDate.split('-');
        if (parts.length < 3) return false; // Validar que la fecha tiene el formato correcto

        const birthMonth = parseInt(parts[1], 10) - 1; // El mes en JavaScript es 0-indexado (Enero=0)
        const birthDay = parseInt(parts[2], 10);

        // Creamos la fecha del cumpleaños de este año en la zona horaria local
        const birthdayThisYear = new Date(today.getFullYear(), birthMonth, birthDay);

        // Comparamos si el cumpleaños de este año está dentro de la semana actual
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
        <div className="space-y-8">
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
    );
};

export default Dashboard;