import { RegistrationData, User, Business, Profile, Prices, ThemeSettings, SubscriptionStatus, Appointment, Client, Product, Plan, Subscription, Payment } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

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
        // El error de sintaxis suele estar en la siguiente línea por un paréntesis o llave mal puesto.
        const errorData = await response.json().catch(() => ({ message: `Error: ${response.statusText}` }));
        throw new Error(errorData.message || 'API request failed');
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {}; // Devuelve un objeto vacío si no hay contenido JSON
};

// --- AUTH ---
export const login = async (username: string, password: string): Promise<{ user: User, token: string, business: Business | null }> => {
    // Esta función NO debe usar fetchWithAuth
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error: ${response.statusText}` }));
        throw new Error(errorData.message || 'Login request failed');
    }
    return response.json();
};

// El resto de las funciones SÍ usan fetchWithAuth
export const verifyToken = async (): Promise<{ user: User }> => {
    return fetchWithAuth('/auth/me');
};

// --- DATA FETCHING ---
export const getSuperAdminDashboardData = async (): Promise<{ businesses: Business[], users: User[], plans: Plan[], subscriptions: Subscription[], payments: Payment[] }> => {
    return fetchWithAuth('/admin/dashboard');
};


// --- DATA MUTATION ---

// Business Settings
export const updateProfile = async (profile: Profile): Promise<Profile> => {
    return fetchWithAuth(`/businesses/profile`, { 
        method: 'PUT', 
        body: JSON.stringify(profile) 
    });
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
    return fetchWithAuth(`/subscriptions/${subscriptionId}/status`, { 
        method: 'PUT', 
        body: JSON.stringify({ status }) 
    });
};

export const changePlan = async (businessId: number, newPlanId: number): Promise<{ updatedSubscription: Subscription, newPayment: Payment }> => {
    return fetchWithAuth(`/subscriptions/change-plan`, { method: 'POST', body: JSON.stringify({ businessId, newPlanId }) });
};

export const renewSubscription = async (businessId: number): Promise<{ updatedSubscription: Subscription, newPayment: Payment }> => {
    return fetchWithAuth(`/subscriptions/renew`, { method: 'POST', body: JSON.stringify({ businessId }) });
};

export const createBusiness = async (businessData: { salonName: string, type: string }): Promise<Business> => {
    return fetchWithAuth('/businesses', {
        method: 'POST',
        body: JSON.stringify(businessData),
    });
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
    return fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

export const createPlan = async (planData: Partial<Plan>): Promise<Plan> => {
    return fetchWithAuth('/plans', {
        method: 'POST',
        body: JSON.stringify(planData),
    });
};

export const assignPlanToBusiness = async (businessId: number, planId: number): Promise<Subscription> => {
    return fetchWithAuth('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ businessId, planId }),
    });
};

export const deleteBusiness = async (businessId: number): Promise<void> => {
  return fetchWithAuth(`/businesses/${businessId}`, {
    method: 'DELETE',
  });
};

export const getBusinessData = async (): Promise<{ business: Business, plans: Plan[], subscriptions: Subscription[], payments: Payment[] }> => {
    return fetchWithAuth(`/businesses/my-data`);
};

export const getClients = async (): Promise<Client[]> => {
    return fetchWithAuth('/clients');
};

export const createClient = async (clientData: Partial<Client>): Promise<Client> => {
    return fetchWithAuth('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
    });
};

export const updateClient = async (clientId: number, clientData: Partial<Client>): Promise<Client> => {
    return fetchWithAuth(`/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
    });
};

export const deleteClient = async (clientId: number): Promise<void> => {
    return fetchWithAuth(`/clients/${clientId}`, {
        method: 'DELETE',
    });
};

export const getServices = async (): Promise<Service[]> => {
    return fetchWithAuth('/services');
};

export const createService = async (serviceData: Partial<Service>): Promise<Service> => {
    return fetchWithAuth('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
    });
};

export const updateService = async (id: number, data: Partial<Service>): Promise<Service> => {
    return fetchWithAuth(`/services/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(data) 
    });
};

export const deleteService = async (id: number): Promise<void> => {
    return fetchWithAuth(`/services/${id}`, { 
        method: 'DELETE' 
    });
};

export const getAppointments = async (): Promise<Appointment[]> => {
    return fetchWithAuth('/appointments');
};

export const createAppointment = async (appointmentData: any): Promise<Appointment> => {
    return fetchWithAuth('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
    });
};

export const deleteAppointment = async (appointmentId: number): Promise<void> => {
    return fetchWithAuth(`/appointments/${appointmentId}`, {
        method: 'DELETE',
    });
};

export const updateAppointment = async (appointmentId: number, appointmentData: any): Promise<any> => {
    return fetchWithAuth(`/appointments/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData),
    });
};

export const generateAiMessage = async (clientName: string, messageType: string, businessName: string): Promise<{ generatedMessage: string }> => {
    return fetchWithAuth('/ai/generate-message', {
        method: 'POST',
        body: JSON.stringify({ clientName, messageType, businessName }),
    });
}

