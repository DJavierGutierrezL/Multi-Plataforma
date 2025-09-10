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
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { AnimatedNailSalonLogo } from './icons/AnimatedNailSalonLogo';
import { BarberPoleIcon } from './icons/BarberPoleIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import Modal from './Modal';
import { SalonLogoIcon } from './icons/SalonLogoIcon';
import { DiamondIcon } from './icons/DiamondIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

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
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteBusinessModalOpen, setIsDeleteBusinessModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState(false);

  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [currentUser, setCurrentUser] = useState<User | Partial<User> | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Partial<Plan> | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // ----- Modals -----
  const handleOpenBusinessModal = (business: Business | null = null) => {
    setCurrentBusiness(
      business || {
        id: undefined,
        type: BusinessType.NailSalon,
        subscriptionId: 0,
        profile: { salonName: '', ownerName: '', accountNumber: '' },
        prices: { 'Manos Semipermanente': 0 },
        clients: [],
        appointments: [],
        products: [],
        themeSettings: { primaryColor: PrimaryColor.Pink, backgroundColor: BackgroundColor.White },
      }
    );
    setIsBusinessModalOpen(true);
  };

  const handleOpenUserModal = (user: User | Partial<User> | null = null) => {
    setCurrentUser(user ? { ...user, password: '' } : { firstName: '', lastName: '', username: '', password: '', businessId: undefined, phone: '', role: UserRole.User });
    setIsUserModalOpen(true);
  };

  const handleOpenPlanModal = (plan: Partial<Plan> | null = null) => {
    setCurrentPlan(plan ? { ...plan, features: plan.features?.join('\n') } : { name: '', price: 0, features: '' });
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
    setCurrentBusiness(null);
    setCurrentUser(null);
    setBusinessToDelete(null);
    setUserToDelete(null);
    setCurrentPlan(null);
    setPlanToDelete(null);
  };

  // ----- Save Business -----
  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness || !currentBusiness.profile?.salonName || !currentBusiness.type) {
      alert('Por favor completa nombre y tipo de negocio.');
      return;
    }

    if (currentBusiness.id) {
      setBusinesses(
        businesses.map((b) => (b.id === currentBusiness.id ? (currentBusiness as Business) : b))
      );
    } else {
      const newBusiness: Business = {
        id: Date.now(),
        subscriptionId: 0,
        type: currentBusiness.type,
        profile: {
          salonName: currentBusiness.profile?.salonName || '',
          ownerName: currentBusiness.profile?.ownerName || '',
          accountNumber: currentBusiness.profile?.accountNumber || '',
        },
        prices:
          currentBusiness.type === BusinessType.NailSalon
            ? { 'Manos Semipermanente': 0 }
            : { 'Corte de Cabello': 0 },
        clients: [],
        appointments: [],
        products: [],
        themeSettings: {
          primaryColor:
            currentBusiness.type === BusinessType.NailSalon ? PrimaryColor.Pink : PrimaryColor.Blue,
          backgroundColor: BackgroundColor.White,
        },
      };
      setBusinesses([...businesses, newBusiness]);
    }
    handleCloseModals();
  };

  // ----- Save User -----
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.firstName || !currentUser.lastName || !currentUser.username) {
      alert('Por favor completa nombre, apellido y usuario.');
      return;
    }

    if (currentUser.id) {
      const originalUser = users.find((u) => u.id === currentUser.id);
      const userToSave = { ...originalUser, ...currentUser } as User;
      if (!currentUser.password) {
        userToSave.password = originalUser?.password;
      }
      setUsers(users.map((u) => (u.id === currentUser.id ? userToSave : u)));
    } else {
      if (!currentUser.password) {
        alert('La contraseña es obligatoria para nuevos usuarios.');
        return;
      }
      const newUser: User = {
        id: Date.now(),
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone || '',
        username: currentUser.username,
        password: currentUser.password,
        role: UserRole.User,
        businessId: currentUser.businessId,
      };
      setUsers([...users, newUser]);
    }
    handleCloseModals();
  };

  // ----- Save Plan -----
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlan || !currentPlan.name || currentPlan.price === undefined) {
      alert('Por favor completa nombre y precio del plan.');
      return;
    }

    const planToSave: Partial<Plan> = {
      ...currentPlan,
      features:
        (currentPlan.features as unknown as string)?.split('\n').filter((f) => f.trim() !== '') ||
        [],
    };

    if (planToSave.id) {
      setPlans(plans.map((p) => (p.id === planToSave.id ? (planToSave as Plan) : p)));
    } else {
      const newPlan: Plan = {
        id: Date.now(),
        name: planToSave.name!,
        price: planToSave.price!,
        features: planToSave.features!,
      };
      setPlans([...plans, newPlan]);
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
          {users
            .filter((u) => u.role !== UserRole.SuperAdmin)
            .map((u) => {
              const assignedBusiness = businesses.find((b) => b.id === u.businessId);
              return (
                <li key={u.id}>
                  {u.firstName} {u.lastName} - {u.username} -{' '}
                  {assignedBusiness?.profile?.salonName || 'Ninguno'}
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
          {businesses.map((b) => (
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
          {plans.map((p) => (
            <li key={p.id}>
              {p.name} - ${p.price}
              <button onClick={() => handleOpenPlanModal(p)}>Editar</button>
              <button onClick={() => handleOpenDeletePlanModal(p)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Modal Components */}
      {isBusinessModalOpen && currentBusiness && (
        <Modal title="Negocio" onClose={handleCloseModals}>
          <form onSubmit={handleSaveBusiness}>
            <input
              type="text"
              value={currentBusiness.profile?.salonName || ''}
              onChange={(e) =>
                setCurrentBusiness((prev) => ({
                  ...prev!,
                  profile: { ...prev?.profile, salonName: e.target.value },
                }))
              }
              placeholder="Nombre del salón"
            />
            <select
              value={currentBusiness.type || ''}
              onChange={(e) =>
                setCurrentBusiness((prev) => ({ ...prev!, type: e.target.value as BusinessType }))
              }
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
              value={currentUser.firstName || ''}
              onChange={(e) => setCurrentUser((prev) => ({ ...prev!, firstName: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Apellido"
              value={currentUser.lastName || ''}
              onChange={(e) => setCurrentUser((prev) => ({ ...prev!, lastName: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Usuario"
              value={currentUser.username || ''}
              onChange={(e) => setCurrentUser((prev) => ({ ...prev!, username: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={currentUser.password || ''}
              onChange={(e) => setCurrentUser((prev) => ({ ...prev!, password: e.target.value }))}
            />
            <select
              value={currentUser.businessId || ''}
              onChange={(e) =>
                setCurrentUser((prev) => ({ ...prev!, businessId: Number(e.target.value) }))
              }
            >
              <option value="">Sin asignar</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.profile?.salonName || 'Sin nombre'}
                </option>
              ))}
            </select>
            <button type="submit">Guardar</button>
          </form>
        </Modal>
      )}

      {/* Delete Modals */}
      {isDeleteBusinessModalOpen && businessToDelete && (
        <Modal title="Eliminar Negocio" onClose={handleCloseModals}>
          <p>¿Estás seguro de eliminar {businessToDelete.profile?.salonName || 'este negocio'}?</p>
          <button onClick={handleDeleteBusinessConfirm}>Eliminar</button>
        </Modal>
      )}

      {isDeleteUserModalOpen && userToDelete && (
        <Modal title="Eliminar Usuario" onClose={handleCloseModals}>
          <p>
            ¿Estás seguro de eliminar {userToDelete.firstName} {userToDelete.lastName}?
          </p>
          <button onClick={handleDeleteUserConfirm}>Eliminar</button>
        </Modal>
      )}

      {isPlanModalOpen && currentPlan && (
        <Modal title="Plan" onClose={handleCloseModals}>
          <form onSubmit={handleSavePlan}>
            <input
              type="text"
              placeholder="Nombre del plan"
              value={currentPlan.name || ''}
              onChange={(e) => setCurrentPlan((prev) => ({ ...prev!, name: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Precio"
              value={currentPlan.price || 0}
              onChange={(e) =>
                setCurrentPlan((prev) => ({ ...prev!, price: Number(e.target.value) }))
              }
            />
            <textarea
              placeholder="Características (una por línea)"
              value={(currentPlan.features as unknown as string) || ''}
              onChange={(e) => setCurrentPlan((prev) => ({ ...prev!, features: e.target.value }))}
            />
            <button type="submit">Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
