import { User, Business, UserRole, Plan, Subscription, Payment } from '../types';

// --- USERS ---
// All mock users except the Super Admin have been removed to prepare for a real backend.
export const mockUsers: User[] = [
  { id: 1, firstName: 'Super', lastName: 'Admin', phone: 'N/A', username: 'admin', password: '54321', role: UserRole.SuperAdmin },
];

// --- PLANS ---
// Mock plans have been removed to prepare for a real backend.
export const mockPlans: Plan[] = [];

// --- SUBSCRIPTIONS ---
// Mock subscriptions have been removed to prepare for a real backend.
export const mockSubscriptions: Subscription[] = [];

// --- PAYMENTS ---
// Mock payments have been removed to prepare for a real backend.
export const mockPayments: Payment[] = [];

// --- BUSINESS DATA ---
// All mock business data has been removed to prepare for a real backend.
export const mockBusinesses: Business[] = [];
