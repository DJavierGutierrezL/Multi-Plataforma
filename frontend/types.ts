// types.ts

export enum Page {
  Dashboard = 'Dashboard',
  Appointments = 'Citas',
  Clients = 'Clientes',
  Inventory = 'Inventario',
  VirtualAssistant = 'Asistente IA',
  Settings = 'Ajustes',
  Subscription = 'Suscripción',
}

export enum AppointmentStatus {
  Pending = 'Pendiente',
  Confirmed = 'Confirmada',
  Completed = 'Completada',
  Cancelled = 'Cancelada',
  PaymentPending = 'Falta Pago',
}

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  User = 'User',
}

export enum BusinessType {
  NailSalon = 'Salón de Uñas',
  Barbershop = 'Barbería',
  BeautySalon = 'Salón de Belleza',
  Other = 'Otro',
}

export enum PrimaryColor {
    Pink = 'Pink',
    Gold = 'Gold',
    Green = 'Green',
    Red = 'Red',
    Blue = 'Blue',
    Beige = 'Beige',
}

export enum BackgroundColor {
    White = 'White',
    Black = 'Black',
    Blue = 'Blue',
}

export enum SubscriptionStatus {
    Active = 'Active',
    Expired = 'Expired',
    Suspended = 'Suspended',
    Cancelled = 'Cancelled',
    PaymentPending = 'PaymentPending'
}

export interface Profile {
  salonName: string;
  ownerName: string;
  accountNumber: string;
}

export interface Prices {
  [service: string]: number;
}

export interface ThemeSettings {
    primaryColor: PrimaryColor;
    backgroundColor: BackgroundColor;
}

export interface Appointment {
  id: number;
  clientName: string;
  services: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  cost?: number;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  birthDate?: string; // YYYY-MM-DD
  serviceHistory: string[];
  preferences?: string;
  isNew?: boolean;
}

export interface Product {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;   // usamos email como username
  role: string;    // admin, superadmin, etc.
}



export interface Plan {
    id: number;
    name: string;
    price: number;
    features: string[];
}

export interface Subscription {
    id: number;
    businessId: number;
    planId: number;
    status: SubscriptionStatus;
    startDate: string; // ISO Date
    endDate: string; // ISO Date
}

export interface Payment {
    id: number;
    businessId: number;
    amount: number;
    date: string; // ISO Date
    planName: string;
}

export interface Business {
  id: number;
  subscriptionId: number;
  type: BusinessType;
  profile: Profile;
  prices: Prices;
  clients: Client[];
  appointments: Appointment[];
  products: Product[];
  themeSettings: ThemeSettings;
}

export interface KandyAIMessage {
  sender: 'user' | 'kandy';
  text: string;
}

export interface RegistrationData {
    businessName: string;
    businessType: BusinessType;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    planId?: number;
}