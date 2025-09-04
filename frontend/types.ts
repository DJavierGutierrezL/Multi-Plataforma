export enum AppointmentStatus {
  Pending = 'Pendiente',
  Confirmed = 'Confirmada',
  Completed = 'Completada',
  Cancelled = 'Cancelada',
  PaymentPending = 'Falta Pago',
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email:string;
  birthDate: string;
  serviceHistory: string[];
  preferences: string;
  isNew: boolean;
}

export interface Appointment {
  id: number;
  clientName: string;
  services: string[];
  date: string; 
  time: string;
  status: AppointmentStatus;
  cost?: number;
}

export interface Product {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
}

export interface Profile {
  salonName: string;
  ownerName: string;
  accountNumber: string;
}

export type Prices = Record<string, number>;

export enum Page {
  Dashboard = 'Dashboard',
  Appointments = 'Appointments',
  Clients = 'Clients',
  Inventory = 'Inventario',
  VirtualAssistant = 'Asistente virtual',
  Subscription = 'Suscripción',
  Settings = 'Settings',
}

export interface KandyAIMessage {
  sender: 'user' | 'kandy';
  text: string;
}

// --- Multi-business Types ---

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  User = 'User',
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  username: string;
  password?: string;
  role: UserRole;
  businessId?: number; // Optional for SuperAdmin
}

export enum BusinessType {
  NailSalon = 'Manicurista',
  Barbershop = 'Barbería',
  Other = 'Otro',
}

// --- Theme Customization Types ---
export enum PrimaryColor {
  Gold = 'dorado',
  Green = 'verde',
  Red = 'rojo',
  Blue = 'azul',
  Pink = 'rosa',
  Beige = 'beige',
}

export enum BackgroundColor {
  Black = 'negro',
  Blue = 'azul',
  White = 'blanco',
}

export interface ThemeSettings {
  primaryColor: PrimaryColor;
  backgroundColor: BackgroundColor;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  features: string[];
}

// --- Subscription Types ---
export enum SubscriptionStatus {
    Active = 'activo',
    Expired = 'vencido',
    Suspended = 'suspendido',
}

export interface Subscription {
    id: number;
    businessId: number;
    planId: number;
    status: SubscriptionStatus;
    startDate: string; // ISO String
    endDate: string; // ISO String
}

export interface Payment {
    id: number;
    businessId: number;
    amount: number;
    date: string; // ISO String
    planName: string;
}


export interface Business {
  id: number;
  type: BusinessType;
  profile: Profile;
  prices: Prices;
  clients: Client[];
  appointments: Appointment[];
  products: Product[];
  themeSettings: ThemeSettings;
  subscriptionId: number;
}