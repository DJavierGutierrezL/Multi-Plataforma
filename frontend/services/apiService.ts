import { RegistrationData, User, Business, Profile, Prices, ThemeSettings, SubscriptionStatus, Appointment, Client, Product, Plan, Subscription, Payment } from '../types';

// ✅ Aseguramos que la URL siempre termine con /api
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') + '/api';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error: ${response.statusText}` }));
        throw new Error(errorData.message || 'API request failed');
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {};
};

// --- AUTH ---
export const login = async (username: string, password: string): Promise<{ user: User, token: string }> => {
    return fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const register = async (data: RegistrationData): Promise<{ user: User, token: string }> => {
    return fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const verifyToken = async (): Promise<{ user: User }> => {
    return fetchWithAuth('/auth/me');
};

// --- DATA FETCHING ---
export const getSuperAdminDashboardData = async (): Promise<{ businesses: Business[], users: User[], plans: Plan[], subscriptions: Subscription[], payments: Payment[] }> => {
    return fetchWithAuth('/admin/dashboard');
};

export const getBusinessData = async (businessId: number): Promise<{ business: Business, plans: Plan[], subscriptions: Subscription[], payments: Payment[] }> => {
    return fetchWithAuth(`/businesses/${businessId}/data`);
};


// --- DATA MUTATION ---

// Business Settings
export const updateProfile = async (businessId: number, profile: Profile): Promise<Profile> => {
    return fetchWithAuth(`/businesses/${businessId}/profile`, { method: 'PUT', body: JSON.stringify(profile) });
};

export const updatePrices = async (businessId: number, prices: Prices): Promise<Prices> => {
    return fetchWithAuth(`/businesses/${businessId}/prices`, { method: 'PUT', body: JSON.stringify(prices) });
};

export const updateThemeSettings = async (businessId: number, settings: ThemeSettings): Promise<ThemeSettings> => {
    return fetchWithAuth(`/businesses/${businessId}/theme`, { method: 'PUT', body: JSON.stringify(settings) });
};

// Business Data Sync (simple approach for now)
export const syncAppointments = async (businessId: number, appointments: Appointment[]): Promise<Appointment[]> => {
    return fetchWithAuth(`/businesses/${businessId}/appointments`, { method: 'PUT', body: JSON.stringify(appointments) });
};

export const syncClients = async (businessId: number, clients: Client[]): Promise<Client[]> => {
    return fetchWithAuth(`/businesses/${businessId}/clients`, { method: 'PUT', body: JSON.stringify(clients) });
};

export const syncProducts = async (businessId: number, products: Product[]): Promise<Product[]> => {
    return fetchWithAuth(`/businesses/${businessId}/products`, { method: 'PUT', body: JSON.stringify(products) });
};

// Subscriptions
export const updateSubscriptionStatus = async (subscriptionId: number, status: SubscriptionStatus): Promise<Subscription> => {
    return fetchWithAuth(`/subscriptions/${subscriptionId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
};

export const changePlan = async (businessId: number, newPlanId: number): Promise<{ updatedSubscription: Subscription, newPayment: Payment }> => {
    return fetchWithAuth(`/subscriptions/change-plan`, { method: 'POST', body: JSON.stringify({ businessId, newPlanId }) });
};

export const renewSubscription = async (businessId: number): Promise<{ updatedSubscription: Subscription, newPayment: Payment }> => {
    return fetchWithAuth(`/subscriptions/renew`, { method: 'POST', body: JSON.stringify({ businessId }) });
};
