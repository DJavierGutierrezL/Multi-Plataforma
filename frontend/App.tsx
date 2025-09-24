import React, { useState, useEffect } from 'react';
import { Page, Profile, Prices, Appointment, Client, Product, User, Business, UserRole, BusinessType, ThemeSettings, PrimaryColor, BackgroundColor, Plan, Subscription, Payment, SubscriptionStatus, RegistrationData, Service } from './types';
import * as apiService from './services/apiService';

// Import Pages/Views
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import SubscriptionExpired from './components/SubscriptionExpired';

// Import Business Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import Clients from './components/Clients';
import Inventory from './components/Inventory';
import Marketing from './components/Marketing';
import Settings from './components/Settings';
import SubscriptionPage from './components/SubscriptionPage';
import KandyAI from './components/KandyAI';

// Import Icons
import { MenuIcon } from './components/icons/MenuIcon';

const generateCssVariables = (settings: ThemeSettings, mode: 'light' | 'dark'): string => {
  const primaryColors: Record<PrimaryColor, { base: string, hover: string, foreground: string }> = {
    [PrimaryColor.Rosa]: { base: '340 82% 52%', hover: '340 82% 47%', foreground: '0 0% 100%' },
    [PrimaryColor.Dorado]: { base: '45 93% 47%', hover: '45 93% 42%', foreground: '25 95% 15%' },
    [PrimaryColor.Verde]: { base: '145 63% 42%', hover: '145 63% 37%', foreground: '0 0% 100%' },
    [PrimaryColor.Rojo]: { base: '0 72% 51%', hover: '0 72% 46%', foreground: '0 0% 100%' },
    [PrimaryColor.Azul]: { base: '221 83% 53%', hover: '221 83% 48%', foreground: '0 0% 100%' },
    [PrimaryColor.Beige]: { base: '37 28% 68%', hover: '37 28% 63%', foreground: '38 33% 20%' },
  };

  const selectedPrimary = primaryColors[settings.primaryColor] || primaryColors[PrimaryColor.Rosa];

  let background, foreground, card, cardForeground, muted, mutedForeground, accent, border;

  switch (settings.backgroundColor) {
    case BackgroundColor.Negro:
      background = '0 0% 3.9%';
      foreground = '0 0% 98%';
      card = '0 0% 7%';
      cardForeground = '0 0% 98%';
      muted = '0 0% 15%';
      mutedForeground = '0 0% 63%';
      accent = '0 0% 15%';
      border = '0 0% 15%';
      break;
    case BackgroundColor.Azul:
      background = '222 83% 4.9%';
      foreground = '210 40% 98%';
      card = '222 83% 9%';
      cardForeground = '210 40% 98%';
      muted = '217 33% 17%';
      mutedForeground = '215 20% 65%';
      accent = '217 33% 17%';
      border = '217 33% 17%';
      break;
    case BackgroundColor.Blanco:
    default:
      background = '0 0% 100%';
      foreground = '222 47% 11%';
      card = '0 0% 100%';
      cardForeground = '222 47% 11%';
      muted = '210 40% 96.1%';
      mutedForeground = '215 28% 45%';
      accent = '210 40% 96.1%';
      border = '214 32% 91.4%';
      break;
  }

  // Mapa de colores para los botones en Settings.tsx
  const colorMapCss = `
    :root {
      --color-rosa: hsl(340 82% 52%);
      --color-dorado: hsl(45 93% 47%);
      --color-verde: hsl(145 63% 42%);
      --color-rojo: hsl(0 72% 51%);
      --color-azul: hsl(221 83% 53%);
      --color-beige: hsl(37 28% 68%);
    }
  `;

  return `
    ${colorMapCss}
    :root {
      --background: ${background};
      --foreground: ${foreground};
      --card: ${card};
      --card-foreground: ${cardForeground};
      --muted: ${muted};
      --muted-foreground: ${mutedForeground};
      --accent: ${accent};
      --accent-foreground: ${foreground};
      --border: ${border};
      --input: ${border};
      --ring: ${selectedPrimary.base};
      --primary: ${selectedPrimary.base};
      --primary-hover: ${selectedPrimary.hover};
      --primary-foreground: ${selectedPrimary.foreground};
    }
  `;
};

const ThemeStyleProvider: React.FC<{ settings?: ThemeSettings, mode: 'light' | 'dark' }> = ({ settings, mode }) => {
    const defaultSettings: ThemeSettings = {
        primaryColor: PrimaryColor.Pink,
        backgroundColor: BackgroundColor.White,
    };
    const cssVariables = generateCssVariables(settings || defaultSettings, mode);
    return <style>{cssVariables}</style>;
};


const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // --- Multi-business State ---
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // --- Auth & View State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatedBusinessId, setImpersonatedBusinessId] = useState<number | null>(null);
  const [viewState, setViewState] = useState<'landing' | 'login'>('landing');

  // --- Business App State (for logged-in user) ---
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Initial Load and Session Management ---
  useEffect(() => {
    const checkSession = async () => {
        try {
            const data = await apiService.verifyToken();
            if (data.user) {
                setCurrentUser(data.user);
            }
        } catch (error) {
            console.log("No active session.");
            localStorage.removeItem('authToken');
        } finally {
            setIsLoading(false);
        }
    };
    checkSession();

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);
  
  // --- Data Fetching on Auth Change ---
  useEffect(() => {
    const fetchData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
        if (currentUser.role === UserRole.SuperAdmin) {
            // --- INICIO DE LA CORRECCIÓN ---
            const data = await apiService.getSuperAdminDashboardData();
            // Guardamos los datos obtenidos en el estado de la aplicación
            setBusinesses(data.businesses || []);
            setUsers(data.users || []);
            setPlans(data.plans || []);
            setSubscriptions(data.subscriptions || []);
            // --- FIN DE LA CORRECCIÓN ---
        } else if (currentUser.businessId) {
            const data = await apiService.getBusinessData();
            setBusinesses([data.business]);
            setClients(data.clients || []);
            setServices(data.services || []);
            setAppointments(data.appointments || []);
            setPlans(data.plans || []);
            setSubscriptions(data.subscriptions || []);
            setPayments(data.payments || []);
        }
    } catch (error) {
        console.error("Failed to fetch data:", error);
        handleLogout();
    } finally {
        setIsLoading(false);
    }
};
    fetchData();
}, [currentUser]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- Auth Handlers (sin cambios) ---
  const handleLogin = async (username: string, password: string) => {
    const { user, token, business } = await apiService.login(username, password);
    localStorage.setItem('authToken', token);
    if (business) {
        setBusinesses([business]);
    }
    setCurrentUser(user);
  };

   const handleLogout = () => {
    // 1. Limpia el token del navegador
    localStorage.removeItem('authToken');

    // 2. Resetea todos los estados a sus valores iniciales
    setCurrentUser(null);
    setImpersonatedBusinessId(null);
    setCurrentPage(Page.Dashboard);
    setBusinesses([]);
    setUsers([]);
    setClients([]);
    setServices([]);
    setAppointments([]);
    setPlans([]);
    setSubscriptions([]);
    setProducts([]);
    setPayments([]);
  };

    const handleRegister = async (data: RegistrationData) => {
    try {
      const { user, token } = await apiService.register(data);
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("No se pudo completar el registro.");
    }
  };
  
  const handleImpersonate = (businessId: number) => {
      if (currentUser?.role === UserRole.SuperAdmin) {
          setImpersonatedBusinessId(businessId);
      }
  };

  const handleExitImpersonation = () => {
      setImpersonatedBusinessId(null);
  };

  const handleSaveThemeSettings = async (newThemeSettings: ThemeSettings) => {
    const businessId = currentUser?.role === UserRole.SuperAdmin ? impersonatedBusinessId : currentUser?.businessId;
    if (!businessId) return;

    try {
        // Llamamos a la API para guardar en el backend
        const updatedSettings = await apiService.updateThemeSettings(newThemeSettings);
        
        // Actualizamos el estado local para que los cambios se vean al instante
        setBusinesses(prev => prev.map(b => 
            b.id === businessId ? { ...b, themeSettings: updatedSettings } : b
        ));
    } catch (error) {
        console.error('Failed to save theme settings', error);
        alert('Error al guardar la configuración de apariencia.');
    }
  };
  
  const handleCreateAppointment = async (appointmentData: any) => {
    try {
        const newAppointmentFromAPI = await apiService.createAppointment(appointmentData);
        const client = clients.find(c => c.id === newAppointmentFromAPI.clientId);
        const newAppointmentWithDetails = { ...appointmentData, ...newAppointmentFromAPI, clientFirstName: client?.firstName, clientLastName: client?.lastName };
        setAppointments(prev => [...prev, newAppointmentWithDetails]);
        alert('Cita guardada con éxito');
    } catch (error: any) {
        console.error("Error al crear la cita:", error);
        alert(`Error al guardar la cita: ${error.message}`);
    }
  };

  const handleUpdateAppointment = async (appointmentId: number, updatedData: any) => {
    try {
        const updatedAppointment = await apiService.updateAppointment(appointmentId, updatedData);
        setAppointments(prevApps => prevApps.map(app => {
            if (app.id === appointmentId) {
                return { ...app, ...updatedData, ...updatedAppointment };
            }
            return app;
        }));
        alert('Cita actualizada con éxito.');
    } catch (error) {
        console.error("Error al actualizar la cita:", error);
        alert("Hubo un error al actualizar la cita.");
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
        await apiService.deleteAppointment(appointmentId);
        setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    } catch (error) {
        console.error("Error al eliminar la cita:", error);
        alert("Hubo un error al eliminar la cita.");
    }
  };
  
  const handleCreateService = async (serviceData: Partial<Service>) => {
    try {
        const newService = await apiService.createService(serviceData);
        setServices(prevServices => [...prevServices, newService]);
        alert('Servicio guardado con éxito');
    } catch (error: any) {
        console.error("Error al crear el servicio:", error);
        alert(`Error al guardar el servicio: ${error.message}`);
    }
  };

  const handleUpdateService = async (serviceId: number, serviceData: Partial<Service>) => {
    try {
        const updatedService = await apiService.updateService(serviceId, serviceData);
        setServices(prev => prev.map(s => s.id === serviceId ? updatedService : s));
        alert('Servicio actualizado con éxito.');
    } catch (error: any) {
        console.error("Error al actualizar el servicio:", error);
        alert(`Error al actualizar el servicio: ${error.message}`);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
        return;
    }
    try {
        await apiService.deleteService(serviceId);
        setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (error: any) {
        console.error("Error al eliminar el servicio:", error);
        alert(`Error al eliminar el servicio: ${error.message}`);
    }
  };

  const handleAssignPlanToBusiness = async (businessId: number, planId: number) => {
    try {
        const updatedSubscription = await apiService.assignPlanToBusiness(businessId, planId);
        setSubscriptions(prevSubs => {
            const existingSubIndex = prevSubs.findIndex(s => s.businessId === businessId);
            if (existingSubIndex > -1) {
                const newSubs = [...prevSubs];
                newSubs[existingSubIndex] = updatedSubscription;
                return newSubs;
            }
            return [...prevSubs, updatedSubscription];
        });
    } catch (error) {
        console.error("Error al asignar el plan:", error);
        alert('Error al asignar el plan.');
    }
  };

  const handleUpdateSubscriptionStatus = async (subscriptionId: number, newStatus: SubscriptionStatus) => {
      try {
          const updatedSubscription = await apiService.updateSubscriptionStatus(subscriptionId, newStatus);
          setSubscriptions(subs => subs.map(s => s.id === updatedSubscription.id ? updatedSubscription : s));
      } catch (error) {
          console.error('Error al actualizar la suscripción:', error);
          alert('Error al actualizar la suscripción.');
      }
  };

  const handleSaveProfile = async (newProfile: Profile) => {
    try {
        const updatedProfile = await apiService.updateProfile(newProfile);
        setBusinesses(prev => prev.map(b => 
            b.id === currentUser?.businessId ? { ...b, profile: updatedProfile } : b
        ));
        alert('Perfil guardado exitosamente!');
    } catch (error) {
        alert('Error al guardar el perfil.');
        console.error("Error al guardar perfil:", error);
    }
  };
  
  const handleCreateClient = async (clientData: Partial<Client>) => {
    try {
        const newClient = await apiService.createClient(clientData);
        setClients(prevClients => [...prevClients, newClient]);
        alert('Cliente guardado con éxito');
    } catch (error: any) {
        console.error("Error al crear el cliente en App.tsx:", error);
        alert(`Error al guardar el cliente: ${error.message}`);
    }
  };

  const handleUpdateClient = async (clientId: number, clientData: Partial<Client>) => {
    try {
        const updatedClient = await apiService.updateClient(clientId, clientData);
        setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        alert("Error al actualizar el cliente.");
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
        await apiService.deleteClient(clientId);
        setClients(prev => prev.filter(c => c.id !== clientId));
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        alert("Hubo un error al eliminar el cliente.");
    }
  };
  
  const handleAppointmentsImported = (importedData: any[]) => {
    const businessId = currentUser?.businessId;
    if (!businessId) return;

    const newAppointments: Appointment[] = importedData.map((item: any, index: number) => ({
      id: Date.now() + index, 
      clientName: item.cliente, 
      services: item.servicios, 
      date: item.fecha, 
      time: '12:00', 
      status: item.estado, 
      cost: item.costo,
      clientId: 0, // Debes resolver cómo asignar el clientId correcto
      businessId: businessId,
      appointmentDate: '',
      appointmentTime: '',
      notes: ''
    }));

    setAppointments(prev => [...prev, ...newAppointments]);
    alert(`${newAppointments.length} citas han sido importadas.`);
  };

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-screen bg-gray-900">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
          </div>
      );
  }

  if (!currentUser) {
    if (viewState === 'landing') {
        return ( 
            <LandingPage 
                onLoginClick={() => setViewState('login')} 
                onRegister={handleRegister} 
                plans={plans}
            /> 
        );
    }
    if (viewState === 'login') {
        return (
            <Login 
                onLogin={handleLogin} 
                theme={theme} 
                onThemeChange={setTheme} 
                onBackToLanding={() => setViewState('landing')} 
            />
        );
    }
  }

  if (currentUser.role === UserRole.SuperAdmin && !impersonatedBusinessId) {
    return <SuperAdminDashboard
      businesses={businesses} setBusinesses={setBusinesses} users={users} setUsers={setUsers} plans={plans} setPlans={setPlans}
      subscriptions={subscriptions} setSubscriptions={setSubscriptions}
      onUpdateSubscriptionStatus={handleUpdateSubscriptionStatus}
      onAssignPlanToBusiness={handleAssignPlanToBusiness}
      onLogout={handleLogout} theme={theme} onThemeChange={setTheme} onImpersonate={handleImpersonate}
    />
  }

  const businessIdToShow = currentUser.role === UserRole.SuperAdmin ? impersonatedBusinessId : currentUser.businessId;
  const currentBusiness = businesses.find(b => b.id === businessIdToShow);
  
  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-100 text-red-800 p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>No se encontró el negocio. Por favor, contacta al administrador.</p>
        <button onClick={handleLogout} className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors">Cerrar Sesión</button>
      </div>
    );
  }
  
   const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard: 
        return <Dashboard appointments={appointments} clients={clients} services={services} />;
      case Page.Appointments: 
        return <Appointments appointments={appointments} clients={clients} services={services} onCreateAppointment={handleCreateAppointment} onDeleteAppointment={handleDeleteAppointment} onUpdateAppointment={handleUpdateAppointment}/>;
      case Page.Clients: 
        return <Clients clients={clients} onCreateClient={handleCreateClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient}/>;
      case Page.Inventory: 
        return <Inventory products={products} setProducts={() => {}} />;

      // --- INICIO DE LA CORRECCIÓN ---
      // Añadimos el caso para el Asistente Virtual (IA)
      case Page.VirtualAssistant: 
        // Aseguramos que currentBusiness y profile existan antes de renderizar
        if (!currentBusiness?.profile) {
          return <div>Cargando perfil del negocio...</div>;
        }
        return <Marketing clients={clients} profile={currentBusiness.profile} />;
      // --- FIN DE LA CORRECCIÓN ---
      
      case Page.Subscription: 
        const currentSubscription = subscriptions.find(s => s.businessId === currentBusiness?.id);
        const currentPlan = plans.find(p => p.id === currentSubscription?.planId);
        return <SubscriptionPage business={currentBusiness} subscription={currentSubscription} plan={currentPlan} allPlans={plans} paymentHistory={payments.filter(p => p.businessId === currentBusiness?.id)} onRenew={() => {}} onChangePlan={() => {}} />;
      case Page.Settings: 
        if (!currentBusiness?.profile || !currentBusiness.themeSettings) {
          return <div>Cargando ajustes...</div>;
        }
        return <Settings 
            profile={currentBusiness.profile}
            theme={currentBusiness.themeSettings} // <-- Se pasa el tema
            onSaveProfile={handleSaveProfile} 
            onSaveTheme={handleSaveThemeSettings} // <-- Se pasa la función para guardar
            services={services} 
            onCreateService={handleCreateService} 
            onUpdateService={handleUpdateService} 
            onDeleteService={handleDeleteService} 
            onAppointmentsImported={handleAppointmentsImported} 
        />;
        return <Settings profile={currentBusiness.profile} onSaveProfile={handleSaveProfile} services={services} onCreateService={handleCreateService} onUpdateService={handleUpdateService} onDeleteService={handleDeleteService} onAppointmentsImported={handleAppointmentsImported} />;
      default: 
        return <Dashboard appointments={appointments} clients={clients} services={services} />;
    }
  };  
  return (
    <>
      <ThemeStyleProvider settings={currentBusiness.themeSettings} mode={theme} />
      <div className="flex h-screen font-sans bg-background text-foreground">
        <Sidebar 
          businessName={currentBusiness.profile.salonName} 
          businessType={currentBusiness.type} 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          onLogout={handleLogout} 
          isImpersonating={!!impersonatedBusinessId} 
          onExitImpersonation={handleExitImpersonation} 
          subscriptionEndDate={subscriptions.find(s => s.businessId === currentBusiness.id)?.endDate} 
          planName={plans.find(p => p.id === subscriptions.find(s => s.businessId === currentBusiness.id)?.planId)?.name} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm md:hidden dark:bg-card/50">
             <button onClick={() => setIsSidebarOpen(true)} className="text-muted-foreground hover:text-foreground"> <MenuIcon className="w-6 h-6" /> </button>
             <h1 className="text-lg font-bold text-card-foreground">{currentPage}</h1> <div className="w-6"></div>
          </header>
          <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8`}> {renderPage()} </main>
        </div>
        
        {/* 👇 AQUÍ AÑADES EL CHATBOT 👇 */}
        <KandyAI 
            appointments={appointments}
            clients={clients}
            products={products}
            services={services}
            prices={{}} // Puedes pasar tu lista de precios aquí si la tienes
        />
      </div>
    </>
  );
};

export default App;