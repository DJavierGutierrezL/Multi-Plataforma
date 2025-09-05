import { User, Business, UserRole, Plan, Subscription, Payment } from '../types';

// --- USERS ---
// All mock users except the Super Admin have been removed to prepare for a real backend.
export const mockUsers: User[] = [
  { id: 1, firstName: 'Super', lastName: 'Admin', phone: 'N/A', username: 'admin', password: '54321', role: UserRole.SuperAdmin },
];

// --- PLANS ---
export const mockPlans: Plan[] = [
  { 
    id: 1, 
    name: 'Básico', 
    price: 9999, 
    features: [
      'Agenda y Citas',
      'Hasta 50 Clientes',
      '1 Profesional'
    ] 
  },
  { 
    id: 2, 
    name: 'Pro', 
    price: 16900, 
    features: [
      'Todo lo del plan Básico',
      'Pagos y Facturación',
      'Reportes de Ventas',
      'Asistente Kandy AI',
      'Hasta 5 Profesionales'
    ] 
  },
  { 
    id: 3, 
    name: 'Empresa', 
    price: 49999, 
    features: [
      'Todo lo del plan Pro',
      'Profesionales Ilimitados',
      'Soporte Prioritario'
    ] 
  },
];

// --- SUBSCRIPTIONS ---
// Mock subscriptions have been removed to prepare for a real backend.
export const mockSubscriptions: Subscription[] = [];

// --- PAYMENTS ---
// Mock payments have been removed to prepare for a real backend.
export const mockPayments: Payment[] = [];

// --- BUSINESS DATA ---
// All mock business data has been removed to prepare for a real backend.
export const mockBusinesses: Business[] = [];
