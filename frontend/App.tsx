import React, { useState, useEffect } from 'react';
import { Page, Profile, Prices, Appointment, Client, Product, User, Business, UserRole, BusinessType, ThemeSettings, PrimaryColor, BackgroundColor, Plan, Subscription, Payment, SubscriptionStatus, RegistrationData } from './types';
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
    [PrimaryColor.Pink]: { base: '340 82% 52%', hover: '340 82% 47%', foreground: '0 0% 100%' },
    [PrimaryColor.Gold]: { base: '45 93% 47%', hover: '45 93% 42%', foreground: '25 95% 15%' },
    [PrimaryColor.Green]: { base: '145 63% 42%', hover: '145 63% 37%', foreground: '0 0% 100%' },
    [PrimaryColor.Red]: { base: '0 72% 51%', hover: '0 72% 46%', foreground: '0 0% 100%' },
    [PrimaryColor.Blue]: { base: '221 83% 53%', hover: '221 83% 48%', foreground: '0 0% 100%' },
    [PrimaryColor.Beige]: { base: '37 28% 68%', hover: '37 28% 63%', foreground: '38 33% 20%' },
  };

  const selectedPrimary = primaryColors[settings.primaryColor] || primaryColors[PrimaryColor.Pink];

  let background, foreground, card, cardForeground, muted, mutedForeground, accent, accentForeground, border, ring;

  if (settings.backgroundColor === BackgroundColor.Black) {
      background = '0 0% 3%';
      foreground = '0 0% 98%';
      card = '0 0% 7%';
      cardForeground = '0 0% 98%';
      muted = '0 0% 15%';
      mutedForeground = '0 0% 65%';
      accent = '0 0% 15%';
      accentForeground = '0 0% 98%';
      border = '0 0% 15%';
      ring = '0 0% 20%';
  } else if (settings.backgroundColor === BackgroundColor.Blue) {
      if (mode === 'light') {
          background = '217 91% 95%';
          foreground = '222 47% 11%';
          card = '217 91% 98%';
          cardForeground = '222 47% 11%';
          muted = '217 91% 90%';
          mutedForeground = '215 28% 40%';
          accent = '217 91% 90%';
          accentForeground = '222 47% 11%';
          border = '217 91% 85%';
          ring = '221 83% 53%';
      } else {
          background = '224 76% 12%';
          foreground = '210 40% 98%';
          card = '224 76% 18%';
          cardForeground = '210 40% 98%';
          muted = '224 76% 25%';
          mutedForeground = '215 40% 65%';
          accent = '224 76% 25%';
          accentForeground = '210 40% 98%';
          border = '224 76% 25%';
          ring = '221 83% 53%';
      }
  } else { // White default
      if (mode === 'light') {
          background = '0 0% 100%';
          foreground = '222 47% 11%';
          card = '0 0% 100%';
          cardForeground = '222 47% 11%';
          muted = '210 40% 96%';
          mutedForeground = '215 28% 45%';
          accent = '210 40% 96%';
          accentForeground = '222 47% 11%';
          border = '214 32% 91%';
          ring = '215 20% 65%';
      } else {
          background = '224 71% 4%';
          foreground = '210 40% 98%';
          card = '224 71% 8%';
          cardForeground = '210 40% 98%';
          muted = '215 28% 17%';
          mutedForeground = '215 20% 65%';
          accent = '215 28% 17%';
          accentForeground = '210 40% 98%';
          border = '215 28% 17%';
          ring = '215 28% 17%';
      }
  }

  return `
    :root {
      --background: ${background};
      --foreground: ${foreground};
      --card: ${card};
      --card-foreground: ${cardForeground};
      --muted: ${muted};
      --muted-foreground: ${mutedForeground};
      --accent: ${accent};
      --accent-foreground: ${accentForeground};
      --border: ${border};
      --ring: ${ring};
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
                  const data = await apiService.getSuperAdminDashboardData();
                  setBusinesses(data.businesses);
                  setUsers(data.users);
                  setPlans(data.plans);
                  setSubscriptions(data.subscriptions);
                  setPayments(data.payments);
              } else if (currentUser.businessId) {
                  const data = await apiService.getBusinessData(currentUser.businessId);
                  setBusinesses([data.business]);
                  setPlans(data.plans);
                  setSubscriptions(data.subscriptions);
                  setPayments(data.payments);
              }
          } catch (error) {
              console.error("Failed to fetch data:", error);
              // Maybe logout on critical fetch error
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

  // --- Auth Handlers ---
  const handleLogin = async (username: string, password: string) => {
    const { user, token } = await apiService.login(username, password);
    localStorage.setItem('authToken', token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setImpersonatedBusinessId(null);
    setCurrentPage(Page.Dashboard);
    setViewState('landing');
    // Clear all data
    setBusinesses([]);
    setUsers([]);
    setPlans([]);
    setSubscriptions([]);
    setPayments([]);
  };

  const handleRegister = async (data: RegistrationData) => {
    const { user, token } = await apiService.register(data);
    localStorage.setItem('authToken', token);
    setCurrentUser(user); // This will trigger data fetching useEffect
  };
  
  const handleImpersonate = (businessId: number) => {
      if (currentUser?.role === UserRole.SuperAdmin) {
          setImpersonatedBusinessId(businessId);
      }
  };

  const handleExitImpersonation = () => {
      setImpersonatedBusinessId(null);
  };
  
  // --- Data Mutation Handlers ---
  const updateCurrentBusiness = (updatedData: Partial<Business>) => {
    const businessId = currentUser?.role === UserRole.SuperAdmin ? impersonatedBusinessId : currentUser?.businessId;
    setBusinesses(prev =>
      prev.map(b =>
        b.id === businessId ? { ...b, ...updatedData } : b
      )
    );
  };

  const handleSaveProfile = async (newProfile: Profile) => {
    const businessId = currentUser?.role === UserRole.SuperAdmin ? impersonatedBusinessId : currentUser?.businessId;
    if (!businessId) return;
    try {
        const updatedProfile = await apiService.updateProfile(businessId, newProfile);
        updateCurrentBusiness({ profile: updatedProfile });
        alert('Perfil guardado exitosamente!');
    } catch (error) {
        alert('Error al guardar el perfil.');
    }
  };

  const handleSavePrices = async (newPrices: Prices) => {
    const businessId = currentUser?.role === UserRole.SuperAdmin ? impersonatedBusinessId : currentUser?.businessId;
    if (!businessId) return;
    try {
        const updatedPrices = await apiService.updatePrices(businessId, newPrices);
        updateCurrentBusiness({ prices: updatedPrices });
        alert('Precios guardados exitosamente!');
    } catch (error) {
        alert('Error al guardar los precios.');
    }
  };
  
  const handleSaveThemeSettings = async (newThemeSettings: ThemeSettings) => {
    const businessId = currentUser?.role === UserRole.SuperAdmin ? impersonatedBusinessId : currentUser?.businessId;
    if (!businessId) return;
    try {
        const updatedSettings = await apiService.updateThemeSettings(businessId, newThemeSettings);
        updateCurrentBusiness({ themeSettings: updatedSettings });
    } catch (error) {
        console.error('Failed to save theme settings', error);
    }
  };
  
  // A generic sync handler for nested arrays in the business object
  const createSyncHandler = <T extends keyof Business>(dataType: T, syncFn: (businessId: number, data: any[]) => Promise<any>) => {
    return async (newData: any[] | ((prev: any[]) => any[])) => {
        const businessId = currentUser?.role === UserRole.SuperAdmin ? impersonatedBusinessId : currentUser?.businessId;
        const currentBusiness = businesses.find(b => b.id === businessId);
        if (!businessId || !currentBusiness) return;
        
        const currentData = currentBusiness[dataType] as any[];
        const updatedData = typeof newData === 'function' ? newData(currentData) : newData;

        try {
            await syncFn(businessId, updatedData);
            updateCurrentBusiness({ [dataType]: updatedData } as Partial<Business>);
        } catch (error) {
            console.error(`Failed to sync ${dataType}:`, error);
            alert(`Error al guardar ${dataType}. Inténtalo de nuevo.`);
        }
    };
  };

  const setAppointments = createSyncHandler('appointments', apiService.syncAppointments);
  const setClients = createSyncHandler('clients', apiService.syncClients);
  const setProducts = createSyncHandler('products', apiService.syncProducts);
  
  const handleUpdateSubscriptionStatus = async (subscriptionId: number, newStatus: SubscriptionStatus) => {
      try {
          const updatedSubscription = await apiService.updateSubscriptionStatus(subscriptionId, newStatus);
          setSubscriptions(subs => subs.map(s => s.id === updatedSubscription.id ? updatedSubscription : s));
      } catch (error) {
          alert('Error al actualizar la suscripción.');
      }
  };

   const handleChangePlan = async (businessId: number, newPlanId: number) => {
      try {
          const { updatedSubscription, newPayment } = await apiService.changePlan(businessId, newPlanId);
          setSubscriptions(subs => subs.map(s => s.id === updatedSubscription.id ? updatedSubscription : s));
          setPayments(pays => [...pays, newPayment]);
      } catch (error) {
           alert('Error al cambiar el plan.');
      }
  };

  const handleRenewSubscription = async (businessId: number) => {
    try {
        const { updatedSubscription, newPayment } = await apiService.renewSubscription(businessId);
        setSubscriptions(subs => subs.map(s => s.id === updatedSubscription.id ? updatedSubscription : s));
        setPayments(pays => [...pays, newPayment]);
    } catch (error) {
        alert('Error al renovar la suscripción.');
    }
  };


  const handleAppointmentsImported = (importedData: any[]) => {
    const businessId = currentUser?.role === UserRole.SuperAdmin ? impersonatedBusinessId : currentUser?.businessId;
    const currentBusiness = businesses.find(b => b.id === businessId);
    if (!currentBusiness) return;

    const newAppointments: Appointment[] = importedData.map((item: any, index: number) => ({
      id: Date.now() + index,
      clientName: item.cliente,
      services: item.servicios,
      date: item.fecha,
      time: '12:00',
      status: item.estado,
      cost: item.costo,
    }));

    if (newAppointments.length === 0 && importedData.length > 0) {
      alert("Los datos procesados no pudieron ser interpretados. Por favor, revisa el formato.");
      return;
    }

    const updatedAppointments = [...newAppointments, ...currentBusiness.appointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });

    setAppointments(updatedAppointments);
    alert(`${newAppointments.length} citas han sido importadas y añadidas a la lista.`);
  };

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-screen bg-background">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
      );
  }

  if (!currentUser) {
    if (viewState === 'landing') {
        return (
            <>
                <ThemeStyleProvider mode={theme} />
                <LandingPage 
                  onLoginClick={() => setViewState('login')} 
                  onRegister={handleRegister}
                  plans={plans}
                />
            </>
        );
    }
    if (viewState === 'login') {
        return <Login onLogin={handleLogin} theme={theme} onThemeChange={setTheme} onBackToLanding={() => setViewState('landing')} />;
    }
  }

  if (currentUser.role === UserRole.SuperAdmin && !impersonatedBusinessId) {
    return <SuperAdminDashboard
      businesses={businesses}
      setBusinesses={setBusinesses} // SuperAdmin might need more granular API calls
      users={users}
      setUsers={setUsers}
      plans={plans}
      setPlans={setPlans}
      subscriptions={subscriptions}
      setSubscriptions={setSubscriptions}
      onUpdateSubscriptionStatus={handleUpdateSubscriptionStatus}
      onLogout={handleLogout}
      theme={theme}
      onThemeChange={setTheme}
      onImpersonate={handleImpersonate}
    />
  }

  // --- REGULAR USER OR IMPERSONATING ADMIN VIEW ---
  const businessIdToShow = currentUser.role === UserRole.SuperAdmin ? impersonatedBusinessId : currentUser.businessId;
  const currentBusiness = businesses.find(b => b.id === businessIdToShow);
  const currentSubscription = subscriptions.find(s => s.id === currentBusiness?.subscriptionId);
  const currentPlan = plans.find(p => p.id === currentSubscription?.planId);
  
  const isSubscriptionActive = currentSubscription?.status === SubscriptionStatus.Active && new Date(currentSubscription.endDate) >= new Date();

  if (currentUser.role !== UserRole.SuperAdmin && !isSubscriptionActive) {
      return (
          <SubscriptionExpired
              business={currentBusiness!}
              subscription={currentSubscription}
              plan={currentPlan}
              onRenew={handleRenewSubscription}
              onLogout={handleLogout}
          />
      );
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-100 text-red-800 p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Error de Asignación</h2>
        <p>El negocio asignado a tu usuario no fue encontrado. Por favor, contacta al administrador.</p>
        <button onClick={handleLogout} className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors">
          Cerrar Sesión
        </button>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard appointments={currentBusiness.appointments} clients={currentBusiness.clients} prices={currentBusiness.prices} theme={theme} />;
      case Page.Appointments:
        return <Appointments appointments={currentBusiness.appointments} setAppointments={setAppointments as any} clients={currentBusiness.clients} prices={currentBusiness.prices} />;
      case Page.Clients:
        return <Clients clients={currentBusiness.clients} setClients={setClients as any} />;
      case Page.Inventory:
        return <Inventory products={currentBusiness.products} setProducts={setProducts as any} />;
      case Page.VirtualAssistant:
        return <Marketing clients={currentBusiness.clients} appointments={currentBusiness.appointments} prices={currentBusiness.prices} profile={currentBusiness.profile} />;
      case Page.Subscription:
        return <SubscriptionPage
                  business={currentBusiness}
                  subscription={currentSubscription}
                  plan={currentPlan}
                  allPlans={plans}
                  paymentHistory={payments.filter(p => p.businessId === currentBusiness.id)}
                  onRenew={handleRenewSubscription}
                  onChangePlan={handleChangePlan}
               />;
      case Page.Settings:
        return <Settings profile={currentBusiness.profile} prices={currentBusiness.prices} onSaveProfile={handleSaveProfile} onSavePrices={handleSavePrices} theme={theme} onThemeChange={setTheme} onAppointmentsImported={handleAppointmentsImported} themeSettings={currentBusiness.themeSettings} onSaveThemeSettings={handleSaveThemeSettings} />;
      default:
        return <Dashboard appointments={currentBusiness.appointments} clients={currentBusiness.clients} prices={currentBusiness.prices} theme={theme} />;
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
          subscriptionEndDate={currentSubscription?.endDate}
          planName={currentPlan?.name}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm md:hidden dark:bg-card/50">
             <button onClick={() => setIsSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
               <MenuIcon className="w-6 h-6" />
             </button>
             <h1 className="text-lg font-bold text-card-foreground">{currentPage}</h1>
             <div className="w-6"></div>
          </header>
          <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent`}>
            {renderPage()}
          </main>
        </div>
        <KandyAI 
          appointments={currentBusiness.appointments}
          clients={currentBusiness.clients}
          products={currentBusiness.products}
          prices={currentBusiness.prices}
        />
      </div>
    </>
  );
};

export default App;
