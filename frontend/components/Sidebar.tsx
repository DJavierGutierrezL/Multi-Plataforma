import React from 'react';
import { Page, BusinessType } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BoxIcon } from './icons/BoxIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogOutIcon } from './icons/LogOutIcon';
import { LogInIcon } from './icons/LogInIcon';
import { AnimatedNailSalonLogo } from './icons/AnimatedNailSalonLogo';
import { BarberPoleIcon } from './icons/BarberPoleIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { DiamondIcon } from './icons/DiamondIcon';

interface SidebarProps {
  businessName: string;
  businessType: BusinessType;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  isImpersonating?: boolean;
  onExitImpersonation?: () => void;
  subscriptionEndDate?: string;
  planName?: string;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isAction?: boolean;
}> = ({ icon, label, isActive, onClick, isAction }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-md'
        : isAction 
        ? 'text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400'
        : 'text-card-foreground hover:bg-accent hover:text-primary'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ businessName, businessType, currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen, onLogout, isImpersonating, onExitImpersonation, subscriptionEndDate, planName }) => {
  const navItems = [
    { id: Page.Dashboard, icon: <DashboardIcon className="w-6 h-6" />, label: 'Dashboard' },
    { id: Page.Appointments, icon: <CalendarIcon className="w-6 h-6" />, label: 'Agenda' },
    { id: Page.Clients, icon: <UsersIcon className="w-6 h-6" />, label: 'Clientes' },
    { id: Page.Inventory, icon: <BoxIcon className="w-6 h-6" />, label: 'Inventario y Gastos' },
    { id: Page.VirtualAssistant, icon: <SparklesIcon className="w-6 h-6" />, label: 'Asistente IA' },
  ];
  
  const handleItemClick = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  }

  let daysRemaining: number | null = null;
  if (subscriptionEndDate) {
      const endDate = new Date(subscriptionEndDate);
      const today = new Date();
      // To ensure we count the last day fully, we compare against the end of the current day
      today.setHours(23, 59, 59, 999);
      const diffTime = endDate.getTime() - new Date().getTime(); // Compare with now for more accuracy
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-card/70 backdrop-blur-lg p-4 shadow-lg flex flex-col justify-between transform transition-transform duration-300 ease-in-out z-30 
        md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
           {isImpersonating && onExitImpersonation && (
              <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-lg text-center mb-4 border border-yellow-300 dark:border-yellow-700">
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">Navegando como Admin</p>
                <button
                  onClick={onExitImpersonation}
                  className="mt-2 w-full text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-1 px-2 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  <LogInIcon className="w-4 h-4" />
                  <span>Volver al Panel</span>
                </button>
              </div>
            )}
          
            <div className="flex items-center justify-start text-left my-4 p-2 flex-row gap-3">
                {/* --- INICIO DE LA CORRECCIÓN --- */}
                {/* Usamos un condicional para elegir el logo correcto según el tipo de negocio */}
                <img 
                    src={businessType === BusinessType.Barbershop ? "/logoTuboBarberia.png" : "/logoManicuristas.png"}
                    alt="Logo del negocio" 
                    className="w-10 h-10 object-contain"
                />
                {/* --- FIN DE LA CORRECCIÓN --- */}
                <div>
                    <h1 className="text-xl font-bold text-card-foreground leading-tight">{businessName}</h1>
                    <p className="text-sm text-muted-foreground">{businessType}</p>
                </div>
            </div>

          <nav>
            <ul>
              {navItems.map((item) => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={currentPage === item.id}
                  onClick={() => handleItemClick(item.id)}
                />
              ))}
            </ul>
          </nav>
        </div>
        
        <div>
            {planName && daysRemaining !== null && daysRemaining > 0 && (
              <div className="p-3 my-1 rounded-lg bg-primary/10 text-primary text-center">
                <p className="font-bold text-sm">Plan {planName}</p>
                <p className="text-xs">{daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'}</p>
              </div>
            )}
            {planName && daysRemaining !== null && daysRemaining <= 0 && (
                <div className="p-3 my-1 rounded-lg bg-red-500/10 text-red-500 text-center">
                    <p className="font-bold text-sm">Suscripción Vencida</p>
                </div>
            )}
          <hr className="my-4 border-border" />
          <ul>
               <NavItem
                  icon={<DiamondIcon className="w-6 h-6" />}
                  label="Suscripción"
                  isActive={currentPage === Page.Subscription}
                  onClick={() => handleItemClick(Page.Subscription)}
              />
              <NavItem
                  icon={<SettingsIcon className="w-6 h-6" />}
                  label="Ajustes"
                  isActive={currentPage === Page.Settings}
                  onClick={() => handleItemClick(Page.Settings)}
              />
              <NavItem
                  icon={<LogOutIcon className="w-6 h-6" />}
                  label="Cerrar Sesión"
                  isActive={false}
                  onClick={onLogout}
                  isAction={true}
              />
          </ul>
          <div className="mt-4 text-center text-muted-foreground/50 text-xs">
            <p>&copy; {new Date().getFullYear()} {businessName}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;