import { Client, Appointment, Product, User, Business, UserRole, BusinessType, AppointmentStatus, PrimaryColor, BackgroundColor, Plan, Subscription, SubscriptionStatus, Payment } from '../types';

// --- USERS ---
export const mockUsers: User[] = [
  { id: 1, firstName: 'Super', lastName: 'Admin', phone: 'N/A', username: 'admin', password: '54321', role: UserRole.SuperAdmin },
  { id: 101, firstName: 'Gabriela', lastName: 'Nails', phone: '3101112233', username: 'gabi', password: 'password1', role: UserRole.User, businessId: 1 },
  { id: 102, firstName: 'Jessica', lastName: 'M', phone: '3114445566', username: 'jess', password: 'password2', role: UserRole.User, businessId: 1 },
  { id: 201, firstName: 'Carlos', lastName: 'el Barbero', phone: '3207778899', username: 'carlosb', password: 'password3', role: UserRole.User, businessId: 2 },
  { id: 202, firstName: 'Miguel', lastName: 'C', phone: '3001234567', username: 'miguelc', password: 'password4', role: UserRole.User, businessId: 2 },
];

// --- PLANS ---
export const mockPlans: Plan[] = [
    {
        id: 1,
        name: 'Plan Básico',
        price: 75000,
        features: [
            'Gestión de Citas',
            'Base de Datos de Clientes (hasta 50)',
            'Recordatorios Básicos',
            'Soporte por Email'
        ]
    },
    {
        id: 2,
        name: 'Plan Premium',
        price: 150000,
        features: [
            'Todo lo del Plan Básico',
            'Clientes Ilimitados',
            'Asistente Virtual Kandy AI',
            'Módulo de Inventario',
            'Reportes Avanzados',
            'Soporte Prioritario por WhatsApp'
        ]
    }
];

// --- SUBSCRIPTIONS ---
const today = new Date();
const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

export const mockSubscriptions: Subscription[] = [
    {
        id: 1,
        businessId: 1, // Gabi Nails
        planId: 2, // Premium
        status: SubscriptionStatus.Active,
        startDate: today.toISOString(),
        endDate: oneMonthFromNow.toISOString(),
    },
    {
        id: 2,
        businessId: 2, // La Barbería
        planId: 1, // Básico
        status: SubscriptionStatus.Expired,
        startDate: oneMonthAgo.toISOString(),
        endDate: today.toISOString(),
    }
];

// --- PAYMENTS ---
export const mockPayments: Payment[] = [
    {
        id: 1,
        businessId: 1,
        amount: 150000,
        date: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString(),
        planName: 'Plan Premium'
    },
    {
        id: 2,
        businessId: 2,
        amount: 75000,
        date: new Date(today.getFullYear(), today.getMonth() - 2, today.getDate()).toISOString(),
        planName: 'Plan Básico'
    }
];


// --- BUSINESS DATA ---

// --- Business 1: Gabi Nails ---
const gabiNailsClients: Client[] = [
    { id: 1001, name: 'Ana María', phone: '+573101234567', email: 'ana@email.com', birthDate: '1995-07-20', serviceHistory: ['Manos Semipermanente'], preferences: 'Le gusta el color rojo', isNew: false },
    { id: 1002, name: 'Laura Pérez', phone: '+573117654321', email: 'laura@email.com', birthDate: '1990-12-15', serviceHistory: ['Pies Tradicional'], preferences: 'Diseños de flores', isNew: true },
];

const gabiNailsAppointments: Appointment[] = [
    { id: 10001, clientName: 'Ana María', services: ['Manos Semipermanente', 'Retoque'], date: '2024-07-28', time: '14:00', status: AppointmentStatus.Completed, cost: 75000 },
    { id: 10002, clientName: 'Laura Pérez', services: ['Pies Tradicional'], date: '2024-07-29', time: '11:00', status: AppointmentStatus.Confirmed },
    { id: 10003, clientName: 'Ana María', services: ['Manos Tradicional'], date: '2024-08-05', time: '16:00', status: AppointmentStatus.Pending },
];

const gabiNailsProducts: Product[] = [
    { id: 1, name: 'Esmalte Rojo Pasión', currentStock: 15, minStock: 5 },
    { id: 2, name: 'Base Coat Premium', currentStock: 4, minStock: 5 },
    { id: 3, name: 'Top Coat Brillo Intenso', currentStock: 20, minStock: 10 },
];

const gabiNailsPrices = {
    'Manos Semipermanente': 60000,
    'Pies Semipermanente': 70000,
    'Manos Tradicional': 25000,
    'Pies Tradicional': 30000,
    'Retoque': 15000,
    'Blindaje': 20000,
};


// --- Business 2: La Barbería ---
const laBarberiaClients: Client[] = [
    { id: 2001, name: 'Juan Rodriguez', phone: '+573009876543', email: 'juan@email.com', birthDate: '1988-03-10', serviceHistory: ['Corte de Cabello'], preferences: 'Corte clásico con máquina', isNew: false },
    { id: 2002, name: 'Pedro Gomez', phone: '+573201122334', email: 'pedro@email.com', birthDate: '2000-05-25', serviceHistory: ['Arreglo de Barba'], preferences: 'Barba bien perfilada', isNew: false },
];

const laBarberiaAppointments: Appointment[] = [
    { id: 20001, clientName: 'Juan Rodriguez', services: ['Corte de Cabello'], date: '2024-07-27', time: '17:00', status: AppointmentStatus.Completed, cost: 35000 },
    { id: 20002, clientName: 'Pedro Gomez', services: ['Arreglo de Barba', 'Ritual de Toalla Caliente'], date: '2024-07-30', time: '18:00', status: AppointmentStatus.Confirmed },
];

const laBarberiaProducts: Product[] = [
    { id: 1, name: 'Cera Moldeadora Fuerte', currentStock: 25, minStock: 10 },
    { id: 2, name: 'Aceite para Barba', currentStock: 8, minStock: 5 },
    { id: 3, name: 'Shampoo para Cabello', currentStock: 30, minStock: 15 },
];

const laBarberiaPrices = {
    'Corte de Cabello': 35000,
    'Arreglo de Barba': 25000,
    'Corte y Barba': 55000,
    'Ritual de Toalla Caliente': 20000,
    'Tintura de Cabello': 80000,
};

// --- ALL BUSINESSES ---
export const mockBusinesses: Business[] = [
  {
    id: 1,
    subscriptionId: 1,
    type: BusinessType.NailSalon,
    profile: { salonName: 'Gabi Nails', ownerName: 'Gabriela', accountNumber: 'Bancolombia Ahorros\n123-456789-01' },
    prices: gabiNailsPrices,
    clients: gabiNailsClients,
    appointments: gabiNailsAppointments,
    products: gabiNailsProducts,
    themeSettings: {
        primaryColor: PrimaryColor.Pink,
        backgroundColor: BackgroundColor.White,
    }
  },
  {
    id: 2,
    subscriptionId: 2,
    type: BusinessType.Barbershop,
    profile: { salonName: 'La Barbería', ownerName: 'Carlos', accountNumber: 'Davivienda Corriente\n098-765432-1' },
    prices: laBarberiaPrices,
    clients: laBarberiaClients,
    appointments: laBarberiaAppointments,
    products: laBarberiaProducts,
    themeSettings: {
        primaryColor: PrimaryColor.Blue,
        backgroundColor: BackgroundColor.White,
    }
  },
];