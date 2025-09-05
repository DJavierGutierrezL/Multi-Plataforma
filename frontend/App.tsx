import React, { useState, useEffect } from 'react';
import {
  Page,
  Profile,
  Prices,
  Appointment,
  Client,
  Product,
  User,
  Business,
  UserRole,
  BusinessType,
  ThemeSettings,
  PrimaryColor,
  BackgroundColor,
  Plan,
  Subscription,
  Payment,
  SubscriptionStatus,
  RegistrationData,
} from './types';

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

// 👉 Debug API URL
console.log("🔗 API_URL desde App.tsx:", import.meta.env.VITE_API_URL);

const API_URL = import.meta.env.VITE_API_URL;

// ------------------- THEME -------------------
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
  } else {
    // White default
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

const ThemeStyleProvider: React.FC<{ settings?: ThemeSettings; mode: 'light' | 'dark' }> = ({ settings, mode }) => {
  const defaultSettings: ThemeSettings = { primaryColor: PrimaryColor.Pink, backgroundColor: BackgroundColor.White };
  const cssVariables = generateCssVariables(settings || defaultSettings, mode);
  return <style>{cssVariables}</style>;
};

// ------------------- APP -------------------
const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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

  // Load theme
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
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, businessesRes, plansRes, subscriptionsRes, paymentsRes] = await Promise.all([
          fetch(`${API_URL}/users`).then(r => r.json()),
          fetch(`${API_URL}/businesses`).then(r => r.json()),
          fetch(`${API_URL}/plans`).then(r => r.json()),
          fetch(`${API_URL}/subscriptions`).then(r => r.json()),
          fetch(`${API_URL}/payments`).then(r => r.json()),
        ]);

        setUsers(usersRes);
        setBusinesses(businessesRes);
        setPlans(plansRes);
        setSubscriptions(subscriptionsRes);
        setPayments(paymentsRes);
      } catch (err) {
        console.error("❌ Error cargando datos desde el backend:", err);
      }
    };
    fetchData();
  }, []);

  // ------------------- AUTH -------------------
  const handleLogin = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setImpersonatedBusinessId(null);
    setCurrentPage(Page.Dashboard);
    setViewState('landing');
  };

  const handleRegister = async (data: RegistrationData) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al registrar negocio");
      const newUser = await res.json();
      setCurrentUser(newUser);
    } catch (err) {
      console.error("❌ Error en registro:", err);
      alert("Error al registrar. Intenta de nuevo.");
    }
  };

  const handleImpersonate = (businessId: number) => {
    if (currentUser?.role === UserRole.SuperAdmin) setImpersonatedBusinessId(businessId);
  };

  const handleExitImpersonation = () => setImpersonatedBusinessId(null);

  // ------------------- Conditional Rendering -------------------
  if (!currentUser) {
    if (viewState === 'landing') {
      return (
        <>
          <ThemeStyleProvider mode={theme} />
          <LandingPage onLoginClick={() => setViewState('login')} onRegister={handleRegister} plans={plans} />
        </>
      );
    }
    if (viewState === 'login') {
      return (
        <Login
          users={users}
          onLogin={handleLogin}
          theme={theme}
          onThemeChange={setTheme}
          onBackToLanding={() => setViewState('landing')}
        />
      );
    }
  }

  if (currentUser?.role === UserRole.SuperAdmin && !impersonatedBusinessId) {
    return (
      <SuperAdminDashboard
        businesses={businesses}
        setBusinesses={setBusinesses}
        users={users}
        setUsers={setUsers}
        plans={plans}
        setPlans={setPlans}
        subscriptions={subscriptions}
        setSubscriptions={setSubscriptions}
        onUpdateSubscriptionStatus={() => {}}
        onLogout={handleLogout}
        theme={theme}
        onThemeChange={setTheme}
        onImpersonate={handleImpersonate}
      />
    );
  }

  // ... el resto del renderPage y flujo sigue igual
  return (
    <>
      <ThemeStyleProvider settings={businesses[0]?.themeSettings} mode={theme} />
      <div className="flex h-screen font-sans bg-background text-foreground">
        <Sidebar
          businessName={businesses[0]?.profile.salonName || ""}
          businessType={businesses[0]?.type || BusinessType.NailSalon}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onLogout={handleLogout}
          isImpersonating={!!impersonatedBusinessId}
          onExitImpersonation={handleExitImpersonation}
          subscriptionEndDate={subscriptions[0]?.endDate}
          planName={plans[0]?.name}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm md:hidden dark:bg-card/50">
            <button onClick={() => setIsSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
              <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-card-foreground">{currentPage}</h1>
            <div className="w-6"></div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
            {/* Aquí va renderPage() */}
          </main>
        </div>
        <KandyAI
          appointments={businesses[0]?.appointments || []}
          clients={businesses[0]?.clients || []}
          products={businesses[0]?.products || []}
          prices={businesses[0]?.prices || {}}
        />
      </div>
    </>
  );
};

export default App;
