import React, { useState, useEffect } from 'react';
import { Page, Profile, Prices, Appointment, Client, Product, User, Business, UserRole, BusinessType, ThemeSettings, PrimaryColor, BackgroundColor, Plan, Subscription, Payment, SubscriptionStatus, RegistrationData } from './types';
import { mockBusinesses, mockUsers, mockPlans, mockSubscriptions, mockPayments } from './data/mockData';

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
    // Provide default settings if none are available (e.g., on landing/login page)
    const defaultSettings: ThemeSettings = {
        primaryColor: PrimaryColor.Pink,
        backgroundColor: BackgroundColor.White,
    };
    const cssVariables = generateCssVariables(settings || defaultSettings, mode);
    return <style>{cssVariables}</style>;
};


const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // --- Multi-business State ---
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  
  // --- Auth & View State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatedBusinessId, setImpersonatedBusinessId] = useState<number | null>(null);
  const [viewState, setViewState] = useState<'landing' | 'login'>('landing');


  // --- Business App State (for logged-in user) ---
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

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
  const handleLogin = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      // The view will change automatically due to currentUser state change
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setImpersonatedBusinessId(null);
    setCurrentPage(Page.Dashboard);
    setViewState('landing'); // Return to landing page on logout
  };

  const handleRegister = (data: RegistrationData) => {
    const selectedPlan = plans.find(p => p.id === data.planId);
    if (!selectedPlan) {
        console.error("Selected plan not found during registration.");
        alert("Error: El plan seleccionado no es válido. Por favor, intenta de nuevo.");
        return;
    }
    
    const today = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(today.getDate() + 14); // 14-day free trial

    const newBusinessId = Date.now() + 1;

    const newSubscription: Subscription = {
        id: Date.now() + 2,
        businessId: newBusinessId,
        planId: selectedPlan.id,
        status: SubscriptionStatus.Active, // Trial is active
        startDate: today.toISOString(),
        endDate: trialEndDate.toISOString(),
    };

    const [firstName, ...lastNameParts] = data.fullName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const newBusiness: Business = {
        id: newBusinessId,
        subscriptionId: newSubscription.id,
        type: data.businessType,
        profile: { salonName: data.businessName, ownerName: data.fullName, accountNumber: '' },
        prices: data.businessType === BusinessType.NailSalon ? { 'Manos Semipermanente': 40000, 'Pies Semipermanente': 45000, 'Manos Tradicional': 25000, 'Pies Tradicional': 30000, 'Retoque': 20000, 'Blindaje': 10000 } : { 'Corte de Cabello': 25000, 'Barba': 15000 },
        clients: [],
        appointments: [],
        products: [],
        themeSettings: { primaryColor: data.businessType === BusinessType.NailSalon ? PrimaryColor.Pink : PrimaryColor.Blue, backgroundColor: BackgroundColor.White }
    };

    const newUser: User = {
        id: Date.now() + 3,
        firstName,
        lastName: lastName || '',
        phone: data.phone,
        username: data.username.toLowerCase(),
        password: data.password,
        role: UserRole.User,
        businessId: newBusiness.id,
    };

    setBusinesses(prev => [...prev, newBusiness]);
    setSubscriptions(prev => [...prev, newSubscription]);
    setUsers(prev => [...prev, newUser]);
    
    // Auto-login
    setCurrentUser(newUser);
  };
  
  const handleImpersonate = (businessId: number) => {
      if (currentUser?.role === UserRole.SuperAdmin) {
          setImpersonatedBusinessId(businessId);
      }
  };

  const handleExitImpersonation = () => {
      setImpersonatedBusinessId(null);
  };
  
  // --- Subscription Handlers ---
  const handleRenewSubscription = (businessId: number) => {
    const subscription = subscriptions.find(s => s.businessId === businessId);
    const plan = plans.find(p => p.id === subscription?.planId);

    if (subscription && plan) {
      const today = new Date();
      const nextMonth = new Date(today.setMonth(today.getMonth() + 1));

      setSubscriptions(subs => subs.map(s => s.id === subscription.id ? {
        ...s,
        status: SubscriptionStatus.Active,
        endDate: nextMonth.toISOString(),
      } : s));

      setPayments(pays => [...pays, {
        id: Date.now(),
        businessId,
        amount: plan.price,
        date: new Date().toISOString(),
        planName: plan.name,
      }]);
    }
    // No alert needed, the UI will update
  };
  
  const handleChangePlan = (businessId: number, newPlanId: number) => {
      const subscription = subscriptions.find(s => s.businessId === businessId);
      const newPlan = plans.find(p => p.id === newPlanId);

      if (subscription && newPlan) {
          const today = new Date();
          const nextMonth = new Date(new Date().setMonth(today.getMonth() + 1));

          // Update the subscription with the new plan and reset the billing cycle
          setSubscriptions(subs => subs.map(s => s.id === subscription.id ? {
              ...s,
              planId: newPlanId,
              status: SubscriptionStatus.Active,
              startDate: today.toISOString(),
              endDate: nextMonth.toISOString(),
          } : s));

          // Create a new payment record for the plan change
          setPayments(pays => [...pays, {
              id: Date.now(),
              businessId,
              amount: newPlan.price,
              date: today.toISOString(),
              planName: `Cambio a ${newPlan.name}`,
          }]);
      }
  };
  
  const handleUpdateSubscriptionStatus = (subscriptionId: number, newStatus: SubscriptionStatus) => {
    setSubscriptions(subs => subs.map(s => {
      if (s.id === subscriptionId) {
        const updatedSub = { ...s, status: newStatus };
        // If activating manually, also extend the date
        if (newStatus === SubscriptionStatus.Active) {
           const today = new Date();
           const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
           updatedSub.endDate = nextMonth.toISOString();
        }
        return updatedSub;
      }
      return s;
    }));
  };

  // --- Conditional Rendering based on Auth/Role ---

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
        return <Login users={users} onLogin={handleLogin} theme={theme} onThemeChange={setTheme} onBackToLanding={() => setViewState('landing')} />;
    }
  }

  if (currentUser.role === UserRole.SuperAdmin && !impersonatedBusinessId) {
    return <SuperAdminDashboard
      businesses={businesses}
      setBusinesses={setBusinesses}
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
  
  // Subscription check
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
  
  // --- State Update Handlers for the current business ---
  const updateCurrentBusiness = (updatedData: Partial<Business>) => {
    setBusinesses(prev =>
      prev.map(b =>
        b.id === currentBusiness.id ? { ...b, ...updatedData } : b
      )
    );
  };

  const handleSaveProfile = (newProfile: Profile) => {
    updateCurrentBusiness({ profile: newProfile });
    alert('Perfil guardado exitosamente!');
  };

  const handleSavePrices = (newPrices: Prices) => {
    updateCurrentBusiness({ prices: newPrices });
    alert('Precios guardados exitosamente!');
  };
  
  const handleSaveThemeSettings = (newThemeSettings: ThemeSettings) => {
    updateCurrentBusiness({ themeSettings: newThemeSettings });
    // No alert needed for theme changes as they are instant
  };

  const setAppointments = (newAppointments: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
    const updatedAppointments = typeof newAppointments === 'function'
        ? newAppointments(currentBusiness.appointments)
        : newAppointments;
    updateCurrentBusiness({ appointments: updatedAppointments });
  };
  
  const setClients = (newClients: Client[] | ((prev: Client[]) => Client[])) => {
      const updatedClients = typeof newClients === 'function'
          ? newClients(currentBusiness.clients)
          : newClients;
      updateCurrentBusiness({ clients: updatedClients });
  };

  const setProducts = (newProducts: Product[] | ((prev: Product[]) => Product[])) => {
      const updatedProducts = typeof newProducts === 'function'
          ? newProducts(currentBusiness.products)
          : newProducts;
      updateCurrentBusiness({ products: updatedProducts });
  };

  const handleAppointmentsImported = (importedData: any[]) => {
    const newAppointments: Appointment[] = importedData.map((item: any, index: number) => ({
      id: Date.now() + index,
      clientName: item.cliente,
      services: item.servicios,
      date: item.fecha,
      time: '12:00', // Default time, can be improved
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

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard appointments={currentBusiness.appointments} clients={currentBusiness.clients} prices={currentBusiness.prices} theme={theme} />;
      case Page.Appointments:
        return <Appointments appointments={currentBusiness.appointments} setAppointments={setAppointments} clients={currentBusiness.clients} prices={currentBusiness.prices} />;
      case Page.Clients:
        return <Clients clients={currentBusiness.clients} setClients={setClients} />;
      case Page.Inventory:
        return <Inventory products={currentBusiness.products} setProducts={setProducts} />;
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