import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { CalendarIcon } from './icons/CalendarIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { PieChartIcon } from './icons/PieChartIcon';
import { GiftIcon } from './icons/GiftIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { UsersIcon } from './icons/UsersIcon';

// --- 1. PROPS ACTUALIZADAS ---
// Quitamos 'prices' y añadimos 'services'
interface DashboardProps {
    appointments: any[];
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

const Dashboard: React.FC<DashboardProps> = ({ appointments, clients, services }) => {
    
    // --- Lógica de Fechas y Cálculos ---
    const today = new Date();
    const currentDay = today.getUTCDate();
    const currentMonth = today.getUTCMonth();
    const currentYear = today.getUTCFullYear();
    
    const isFirstFortnight = currentDay <= 15;
    
    const startOfFortnight = new Date(Date.UTC(currentYear, currentMonth, isFirstFortnight ? 1 : 16));
    const endOfFortnight = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
    
    const fortnightLabel = `${startOfFortnight.getUTCDate()} - ${endOfFortnight.getUTCDate()} de ${today.toLocaleDateString('es-ES', { month: 'long' })}`;

    const completedAppointmentsThisFortnight = useMemo(() =>
        appointments.filter(app => {
            if (app.status !== 'Completed' || !app.appointmentDate) return false;
            const appDateUTC = new Date(app.appointmentDate);
            return appDateUTC >= startOfFortnight && appDateUTC <= endOfFortnight;
        }),
    [appointments, startOfFortnight, endOfFortnight]);
    
    const totalFortnightRevenue = useMemo(() =>
        completedAppointmentsThisFortnight.reduce((total, app) => total + (parseFloat(app.cost) || 0), 0),
    [completedAppointmentsThisFortnight]);
    
    const revenueData = useMemo(() => {
        const dataMap = new Map<number, number>();
        for (let i = startOfFortnight.getUTCDate(); i <= endOfFortnight.getUTCDate(); i++) { dataMap.set(i, 0); }
        completedAppointmentsThisFortnight.forEach(app => {
            const day = new Date(app.appointmentDate).getUTCDate();
            dataMap.set(day, (dataMap.get(day) || 0) + parseFloat(app.cost));
        });
        return Array.from(dataMap.entries()).map(([day, revenue]) => ({ name: String(day), Ingresos: revenue }));
    }, [completedAppointmentsThisFortnight, startOfFortnight, endOfFortnight]);

    const statusPieData = useMemo(() => {
        const counts = appointments.reduce((acc, app) => {
            if (app.status) acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const colors: Record<string, string> = { Scheduled: '#facc15', Completed: '#60a5fa', Canceled: '#ef4444' };
        return Object.entries(counts).map(([name, value]) => ({ name, value, fill: colors[name] || '#9ca3af' }));
    }, [appointments]);

    return (
        <div className="space-y-8">
            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Ingresos (Quincena)"
                    value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalFortnightRevenue)} 
                    icon={<DollarSignIcon className="w-6 h-6 text-green-800" />} 
                    color="bg-green-200" 
                />
                <StatCard 
                    title="Citas Completadas (Quincena)" 
                    value={completedAppointmentsThisFortnight.length} 
                    icon={<CalendarIcon className="w-6 h-6 text-blue-800" />} 
                    color="bg-blue-200" 
                />
                <StatCard 
                    title="Total Clientes"
                    value={clients.length} 
                    icon={<UsersIcon className="w-6 h-6 text-purple-800" />} 
                    color="bg-purple-200" 
                />
            </div>

            {/* Gráficas */}
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
        </div>
    );
};

export default Dashboard;