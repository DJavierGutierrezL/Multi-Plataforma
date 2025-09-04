import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { Appointment, Client, Prices, AppointmentStatus } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { PieChartIcon } from './icons/PieChartIcon';
import { GiftIcon } from './icons/GiftIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface DashboardProps {
  appointments: Appointment[];
  clients: Client[];
  prices: Prices;
  theme: 'light' | 'dark';
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-md flex items-center transition-transform hover:scale-105 border border-border">
    <div className={`p-3 sm:p-4 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-card-foreground">{value}</p>
    </div>
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({ appointments, clients, prices, theme }) => {
    
    // Determine the current fortnight
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const isFirstFortnight = currentDay <= 15;
    
    const startOfFortnight = new Date(currentYear, currentMonth, isFirstFortnight ? 1 : 16);
    startOfFortnight.setHours(0, 0, 0, 0);

    const endOfFortnight = isFirstFortnight 
        ? new Date(currentYear, currentMonth, 15)
        : new Date(currentYear, currentMonth + 1, 0); // Last day of current month
    endOfFortnight.setHours(23, 59, 59, 999);
        
    const fortnightLabel = isFirstFortnight ? `1 - 15 de ${today.toLocaleDateString('es-ES', { month: 'long' })}` : `16 - ${endOfFortnight.getDate()} de ${today.toLocaleDateString('es-ES', { month: 'long' })}`;

    // Filter completed appointments for the current fortnight
    const completedAppointmentsThisFortnight = useMemo(() => {
        return appointments.filter(app => {
            const appDate = new Date(`${app.date}T00:00:00`);
            return app.status === AppointmentStatus.Completed && appDate >= startOfFortnight && appDate <= endOfFortnight;
        });
    }, [appointments, startOfFortnight, endOfFortnight]);

    // Total appointments with pending payment
    const paymentPendingCount = appointments.filter(
        a => a.status === AppointmentStatus.PaymentPending
    ).length;

    const calculateRevenue = (apps: Appointment[]) => {
        return apps.reduce((total, app) => {
            if (typeof app.cost === 'number') {
                return total + app.cost;
            }
            const servicesCost = app.services.reduce((sum, service) => sum + (prices[service] || 0), 0);
            return total + servicesCost;
        }, 0);
    };

    // Revenue data for the line chart (based on the fortnight)
    const revenueData = useMemo(() => {
        const startDay = startOfFortnight.getDate();
        const endDay = endOfFortnight.getDate();
        
        const fortnightData = Array.from({ length: endDay - startDay + 1 }, (_, i) => {
            const day = startDay + i;
            const dailyAppointments = completedAppointmentsThisFortnight.filter(app => 
                new Date(`${app.date}T00:00:00`).getDate() === day
            );
            return { name: day.toString(), Ingresos: calculateRevenue(dailyAppointments) };
        });

        return fortnightData;

    }, [completedAppointmentsThisFortnight, prices, startOfFortnight, endOfFortnight]);
    
    const totalFortnightRevenue = revenueData.reduce((sum, item) => sum + item.Ingresos, 0);
    
    const statusPieData = useMemo(() => {
        const counts = appointments.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {} as Record<AppointmentStatus, number>);

        const colors = {
            [AppointmentStatus.Pending]: '#facc15', // yellow-400
            [AppointmentStatus.Confirmed]: '#4ade80', // green-400
            [AppointmentStatus.Completed]: '#60a5fa', // blue-400
            [AppointmentStatus.Cancelled]: '#dc2626', // intense red (red-600)
            [AppointmentStatus.PaymentPending]: '#111827', // black (gray-900)
        };

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            fill: colors[name as AppointmentStatus] || '#9ca3af',
        }));
    }, [appointments]);

    const birthdaysThisWeek = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Set to Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const datesOfWeek = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            return { month: d.getMonth(), day: d.getDate() };
        });

        return clients
            .filter(client => {
                if (!client.birthDate) return false;
                const birthDate = new Date(`${client.birthDate}T00:00:00`);
                const birthMonth = birthDate.getMonth();
                const birthDay = birthDate.getDate();
                return datesOfWeek.some(d => d.month === birthMonth && d.day === birthDay);
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.birthDate}T00:00:00`);
                const dateB = new Date(`${b.birthDate}T00:00:00`);
                return dateA.getMonth() - dateB.getMonth() || dateA.getDate() - dateB.getDate();
            });
    }, [clients]);
    
    const monthlyHistoricalRevenue = useMemo(() => {
        const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.Completed);
        const data: { name: string; Ingresos: number }[] = [];
        const today = new Date();
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

        for (let i = 1; i <= 6; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = d.getMonth();
            const year = d.getFullYear();
            
            const monthlyAppointments = completedAppointments.filter(app => {
                const appDate = new Date(`${app.date}T00:00:00`);
                return appDate.getMonth() === month && appDate.getFullYear() === year;
            });

            const totalRevenue = calculateRevenue(monthlyAppointments);
            
            data.push({
                name: monthNames[month],
                Ingresos: totalRevenue
            });
        }
        
        return data.reverse();
    }, [appointments, prices]);


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            title="Ingresos (Quincena)"
            value={`${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalFortnightRevenue)}`} 
            icon={<DollarSignIcon className="w-6 h-6 text-green-800" />} 
            color="bg-green-200" 
        />
        <StatCard 
            title="Citas Completadas (Quincena)" 
            value={`${completedAppointmentsThisFortnight.length}`} 
            icon={<CalendarIcon className="w-6 h-6 text-blue-800" />} 
            color="bg-blue-200" 
        />
        <StatCard 
            title="Citas con Falta Pago" 
            value={`${paymentPendingCount}`} 
            icon={<DollarSignIcon className="w-6 h-6 text-yellow-800" />} 
            color="bg-yellow-200" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-card p-4 sm:p-6 rounded-2xl shadow-md border border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-xl font-semibold text-card-foreground mb-2 sm:mb-0">Análisis de Ingresos</h3>
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{fortnightLabel}</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}/>
                    <Legend />
                    <Line type="monotone" dataKey="Ingresos" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-card p-4 sm:p-6 rounded-2xl shadow-md border border-border">
            <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
                <PieChartIcon className="w-6 h-6 mr-2 text-purple-600" />
                Distribución de Citas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {statusPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}/>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-md border border-border">
                <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
                    <TrendingUpIcon className="w-6 h-6 mr-2 text-green-500" />
                    Ingresos Mensuales (Histórico)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyHistoricalRevenue} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${new Intl.NumberFormat('es-CO').format(value)}`} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--accent))' }}
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))', 
                                borderRadius: '8px' 
                            }}
                            formatter={(value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)}
                        />
                        <Legend />
                        <Bar dataKey="Ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-md border border-border">
                <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
                    <GiftIcon className="w-6 h-6 mr-2 text-primary" />
                    Cumpleaños de la Semana
                </h3>
                {birthdaysThisWeek.length > 0 ? (
                    <ul className="space-y-3">
                        {birthdaysThisWeek.map(client => (
                            <li key={client.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-accent rounded-lg">
                                <span className="font-medium text-accent-foreground mb-1 sm:mb-0">{client.name}</span>
                                <span className="text-sm text-primary font-semibold">
                                    {new Date(`${client.birthDate}T00:00:00`).toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground py-4">No hay cumpleaños esta semana.</p>
                )}
            </div>
      </div>
    </div>
  );
};

export default Dashboard;