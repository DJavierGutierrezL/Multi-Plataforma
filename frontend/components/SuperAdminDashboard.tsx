import React, { useState } from 'react';
import {
  Business,
  User,
  UserRole,
  BusinessType,
  PrimaryColor,
  BackgroundColor,
  Plan,
  Subscription,
  SubscriptionStatus,
} from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { LogOutIcon } from './icons/LogOutIcon';
import Modal from './Modal';

interface SuperAdminDashboardProps {
  businesses: Business[];
  setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  onUpdateSubscriptionStatus: (subscriptionId: number, newStatus: SubscriptionStatus) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onImpersonate: (businessId: number) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  businesses,
  setBusinesses,
  users,
  setUsers,
  plans,
  setPlans,
  subscriptions,
  setSubscriptions,
  onUpdateSubscriptionStatus,
  onLogout,
  theme,
  onThemeChange,
  onImpersonate,
}) => {
  const defaultBusiness: Business = {
    id: 0,
    subscriptionId: 0,
    type: BusinessType.NailSalon,
    profile: { salonName: '', ownerName: '', accountNumber: '' },
    prices: { 'Manos Semipermanente': 0 },
    clients: [],
    appointments: [],
    products: [],
    themeSettings: { primaryColor: PrimaryColor.Pink, backgroundColor: BackgroundColor.White },
  };

  const defaultUser: User = {
    id: 0,
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    phone: '',
    role: UserRole.User,
    businessId: undefined,
  };

  const defaultPlan: Partial<Plan> = {
    id: 0,
    name: '',
    price: 0,
    features: '',
  };

  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteBusinessModalOpen, setIsDeleteBusinessModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState(false);

  const [currentBusiness, setCurrentBusiness] = useState<Business>(defaultBusiness);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Partial<Plan>>(defaultPlan);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // ----- Modals -----
  const handleOpenBusinessModal = (business?: Business) => {
    setCurrentBusiness(business || defaultBusiness);
    setIsBusinessModalOpen(true);
  };

  const handleOpenUserModal = (user?: User) => {
    setCurrentUser(user ? { ...user, password: '' } : defaultUser);
    setIsUserModalOpen(true);
  };

  const handleOpenPlanModal = (plan?: Partial<Plan>) => {
    setCurrentPlan(plan || defaultPlan);
    setIsPlanModalOpen(true);
  };

  const handleOpenDeleteBusinessModal = (business: Business) => {
    setBusinessToDelete(business);
    setIsDeleteBusinessModalOpen(true);
  };

  const handleOpenDeleteUserModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteUserModalOpen(true);
  };

  const handleOpenDeletePlanModal = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsDeletePlanModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsBusinessModalOpen(false);
    setIsUserModalOpen(false);
    setIsDeleteBusinessModalOpen(false);
    setIsDeleteUserModalOpen(false);
    setIsPlanModalOpen(false);
    setIsDeletePlanModalOpen(false);
    setCurrentBusiness(defaultBusiness);
    setCurrentUser(defaultUser);
    setBusinessToDelete(null);
    setUserToDelete(null);
    setCurrentPlan(defaultPlan);
    setPlanToDelete(null);
  };

  // ----- Save Handlers -----
  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness.profile.salonName || !currentBusiness.type) {
      alert('Completa el nombre y tipo de negocio.');
      return;
    }

    if (currentBusiness.id) {
      setBusinesses(
        businesses.map((b) => (b.id === currentBusiness.id ? currentBusiness : b))
      );
    } else {
      setBusinesses([...businesses, { ...currentBusiness, id: Date.now() }]);
    }
    handleCloseModals();
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.firstName || !currentUser.lastName || !currentUser.username) {
      alert('Completa nombre, apellido y usuario.');
      return;
    }

    if (!currentUser.password && currentUser.id === 0) {
      alert('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    if (currentUser.id) {
      setUsers(users.map((u) => (u.id === currentUser.id ? currentUser : u)));
    } else {
      setUsers([...users, { ...currentUser, id: Date.now() }]);
    }
    handleCloseModals();
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan.name || currentPlan.price === undefined) {
      alert('Completa nombre y precio del plan.');
      return;
    }

    if (currentPlan.id) {
      setPlans(plans.map((p) => (p.id === currentPlan.id ? currentPlan as Plan : p)));
    } else {
      setPlans([...plans, { ...currentPlan, id: Date.now() } as Plan]);
    }
    handleCloseModals();
  };

  // ----- Delete Handlers -----
  const handleDeleteBusinessConfirm = () => {
    if (!businessToDelete) return;
    setBusinesses(businesses.filter((b) => b.id !== businessToDelete.id));
    setUsers(users.filter((u) => u.businessId !== businessToDelete.id && u.role !== UserRole.SuperAdmin));
    handleCloseModals();
  };

  const handleDeleteUserConfirm = () => {
    if (!userToDelete) return;
    setUsers(users.filter((u) => u.id !== userToDelete.id));
    handleCloseModals();
  };

  const handleDeletePlanConfirm = () => {
    if (!planToDelete) return;
    setPlans(plans.filter((p) => p.id !== planToDelete.id));
    handleCloseModals();
  };

  return (
    <div className="super-admin-dashboard">
      <header>
        <button onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        <button onClick={onLogout}>
          <LogOutIcon /> Logout
        </button>
      </header>

      <section>
        <h2>Usuarios</h2>
        <button onClick={() => handleOpenUserModal()}>Agregar Usuario</button>
        <ul>
          {users.filter(u => u.role !== UserRole.SuperAdmin).map(u => {
            const assignedBusiness = businesses.find(b => b.id === u.businessId);
            return (
              <li key={u.id}>
                {u.firstName} {u.lastName} - {u.username} - {assignedBusiness?.profile?.salonName || 'Ninguno'}
                <button onClick={() => handleOpenUserModal(u)}>Editar</button>
                <button onClick={() => handleOpenDeleteUserModal(u)}>Eliminar</button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2>Negocios</h2>
        <button onClick={() => handleOpenBusinessModal()}>Agregar Negocio</button>
        <ul>
          {businesses.map(b => (
            <li key={b.id}>
              {b.profile?.salonName || 'Sin nombre'} - {b.type}
              <button onClick={() => handleOpenBusinessModal(b)}>Editar</button>
              <button onClick={() => handleOpenDeleteBusinessModal(b)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Planes</h2>
        <button onClick={() => handleOpenPlanModal()}>Agregar Plan</button>
        <ul>
          {plans.map(p => (
            <li key={p.id}>
              {p.name} - ${p.price}
              <button onClick={() => handleOpenPlanModal(p)}>Editar</button>
              <button onClick={() => handleOpenDeletePlanModal(p)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Modals */}
      {isBusinessModalOpen && currentBusiness && (
        <Modal title="Negocio" onClose={handleCloseModals}>
          <form onSubmit={handleSaveBusiness}>
            <input
              type="text"
              placeholder="Nombre del salón"
              value={currentBusiness.profile?.salonName || ''}
              onChange={(e) =>
                setCurrentBusiness(prev => ({
                  ...prev!,
                  profile: { ...prev!.profile, salonName: e.target.value },
                }))
              }
            />
            <select
              value={currentBusiness.type}
              onChange={e => setCurrentBusiness(prev => ({ ...prev!, type: e.target.value as BusinessType }))}
            >
              <option value={BusinessType.NailSalon}>Nail Salon</option>
              <option value={BusinessType.BarberShop}>Barber Shop</option>
            </select>
            <button type="submit">Guardar</button>
          </form>
        </Modal>
      )}

      {isUserModalOpen && currentUser && (
        <Modal title="Usuario" onClose={handleCloseModals}>
          <form onSubmit={handleSaveUser}>
            <input
              type="text"
              placeholder="Nombre"
              value={currentUser.firstName}
              onChange={e => setCurrentUser(prev => ({ ...prev!, firstName: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Apellido"
              value={currentUser.lastName}
              onChange={e => setCurrentUser(prev => ({ ...prev!, lastName: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Usuario"
              value={currentUser.username}
              onChange={e => setCurrentUser(prev => ({ ...prev!, username: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={currentUser.password}
              onChange={e => setCurrentUser(prev => ({ ...prev!, password: e.target.value }))}
            />
            <select
              value={currentUser.businessId || ''}
              onChange={e => setCurrentUser(prev => ({ ...prev!, businessId: Number(e.target.value) }))}
            >
              <option value="">Sin asignar</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.profile?.salonName || 'Sin nombre'}</option>
              ))}
            </select>
            <button type="submit">Guardar</button>
          </form>
        </Modal>
      )}

      {isPlanModalOpen && currentPlan && (
        <Modal title="Plan" onClose={handleCloseModals}>
          <form onSubmit={handleSavePlan}>
            <input
              type="text"
              placeholder="Nombre del plan"
              value={currentPlan.name || ''}
              onChange={e => setCurrentPlan(prev => ({ ...prev!, name: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Precio"
              value={currentPlan.price || 0}
              onChange={e => setCurrentPlan(prev => ({ ...prev!, price: Number(e.target.value) }))}
            />
            <textarea
              placeholder="Características (una por línea)"
              value={(currentPlan.features as unknown as string) || ''}
              onChange={e => setCurrentPlan(prev => ({ ...prev!, features: e.target.value }))}
            />
            <button type="submit">Guardar</button>
          </form>
        </Modal>
      )}

      {isDeleteBusinessModalOpen && businessToDelete && (
        <Modal title="Eliminar Negocio" onClose={handleCloseModals}>
          <p>¿Eliminar {businessToDelete.profile?.salonName || 'este negocio'}?</p>
          <button onClick={handleDeleteBusinessConfirm}>Eliminar</button>
        </Modal>
      )}

      {isDeleteUserModalOpen && userToDelete && (
        <Modal title="Eliminar Usuario" onClose={handleCloseModals}>
          <p>¿Eliminar {userToDelete.firstName} {userToDelete.lastName}?</p>
          <button onClick={handleDeleteUserConfirm}>Eliminar</button>
        </Modal>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
