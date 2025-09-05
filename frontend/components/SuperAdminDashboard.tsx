import React, { useState } from 'react';
import { Business, User, UserRole, BusinessType, PrimaryColor, BackgroundColor, Plan, Subscription, SubscriptionStatus } from '../types';
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

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ businesses, setBusinesses, users, setUsers, plans, setPlans, subscriptions, setSubscriptions, onUpdateSubscriptionStatus, onLogout, theme, onThemeChange, onImpersonate }) => {
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isDeleteBusinessModalOpen, setIsDeleteBusinessModalOpen] = useState(false);
    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState(false);
    
    const [currentBusiness, setCurrentBusiness] = useState<Partial<Business> | null>(null);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [currentPlan, setCurrentPlan] = useState<Partial<Plan> | null>(null);
    const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

    const handleOpenBusinessModal = (business: Partial<Business> | null = null) => {
        setCurrentBusiness(business || {});
        setIsBusinessModalOpen(true);
    };
    
    const handleOpenUserModal = (user: Partial<User> | null = null) => {
        setCurrentUser(user ? {...user, password: ''} : {}); // Clear password on edit
        setIsUserModalOpen(true);
    };

    const handleOpenPlanModal = (plan: Partial<Plan> | null = null) => {
        const planWithStringFeatures = plan ? { ...plan, features: plan.features?.join('\n') } : {};
        setCurrentPlan(planWithStringFeatures || {});
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

    const handleSaveBusiness = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentBusiness || !currentBusiness.profile?.salonName || !currentBusiness.type) {
            alert("Por favor completa nombre y tipo de negocio.");
            return;
        }

        if (currentBusiness.id) {
            // Edit
            setBusinesses(businesses.map(b => b.id === currentBusiness!.id ? currentBusiness as Business : b));
        } else {
            // Create
            const newBusiness: Business = {
                id: Date.now(),
                subscriptionId: 0, // No subscription yet
                type: currentBusiness.type,
                profile: { salonName: currentBusiness.profile.salonName, ownerName: '', accountNumber: '' },
                prices: currentBusiness.type === BusinessType.NailSalon ? { 'Manos Semipermanente': 0 } : { 'Corte de Cabello': 0 },
                clients: [],
                appointments: [],
                products: [],
                themeSettings: { primaryColor: currentBusiness.type === BusinessType.NailSalon ? PrimaryColor.Pink : PrimaryColor.Blue, backgroundColor: BackgroundColor.White }
            };
            setBusinesses([...businesses, newBusiness]);
        }
        handleCloseModals();
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !currentUser.firstName || !currentUser.lastName || !currentUser.username) {
            alert("Por favor completa nombre, apellido y usuario.");
            return;
        }

        if (currentUser.id) {
            // Edit
            const originalUser = users.find(u => u.id === currentUser.id);
            const userToSave = { ...originalUser, ...currentUser } as User;
            // Only update password if a new one was entered
            if (!currentUser.password) {
                userToSave.password = originalUser?.password;
            }
            setUsers(users.map(u => u.id === currentUser!.id ? userToSave : u));
        } else {
            // Create
            if (!currentUser.password) {
                alert("La contraseña es obligatoria para nuevos usuarios.");
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

    const handleSavePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPlan || !currentPlan.name || currentPlan.price === undefined) {
            alert("Por favor completa nombre y precio del plan.");
            return;
        }

        const planToSave: Partial<Plan> = {
            ...currentPlan,
            features: (currentPlan.features as unknown as string)?.split('\n').filter(f => f.trim() !== '') || []
        };

        if (planToSave.id) {
            setPlans(plans.map(p => p.id === planToSave.id ? planToSave as Plan : p));
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
    
    const handleDeleteBusinessConfirm = () => {
        if (!businessToDelete) return;
        setBusinesses(businesses.filter(b => b.id !== businessToDelete.id));
        setUsers(users.filter(u => u.businessId !== businessToDelete.id && u.role !== UserRole.SuperAdmin));
        handleCloseModals();
    };
    
    const handleDeleteUserConfirm = () => {
        if (!userToDelete) return;
        setUsers(users.filter(u => u.id !== userToDelete.id));
        handleCloseModals();
    };

    const handleDeletePlanConfirm = () => {
        if (!planToDelete) return;
        setPlans(plans.filter(p => p.id !== planToDelete.id));
        handleCloseModals();
    };

    const handleAssignPlanToBusiness = (businessId: number, planId: number) => {
        const existingSubscription = subscriptions.find(s => s.businessId === businessId);
        const today = new Date();
        const nextMonth = new Date(new Date().setMonth(today.getMonth() + 1));

        if (existingSubscription) {
            // Update existing subscription's plan, status, and end date
            setSubscriptions(prevSubs => prevSubs.map(sub => 
                sub.id === existingSubscription.id 
                ? { ...sub, planId, status: SubscriptionStatus.Active, endDate: nextMonth.toISOString(), startDate: today.toISOString() } 
                : sub
            ));
        } else {
            // Create a new subscription
            const newSubscription: Subscription = {
                id: Date.now(),
                businessId,
                planId,
                status: SubscriptionStatus.Active,
                startDate: today.toISOString(),
                endDate: nextMonth.toISOString(),
            };
            // Add the new subscription to the list
            setSubscriptions(prevSubs => [...prevSubs, newSubscription]);
            // Update the business to link to this new subscription
            setBusinesses(prevBizs => prevBizs.map(biz => 
                biz.id === businessId 
                ? { ...biz, subscriptionId: newSubscription.id } 
                : biz
            ));
        }
    };


    const BusinessTypeIcon = ({ type }: { type: BusinessType }) => {
        switch (type) {
            case BusinessType.NailSalon: return <AnimatedNailSalonLogo className="w-10 h-10 text-base" />;
            case BusinessType.Barbershop: return <BarberPoleIcon className="w-8 h-8" />;
            default: return <BuildingIcon className="w-8 h-8 text-gray-500" />;
        }
    };
    
    const getStatusBadge = (status?: SubscriptionStatus) => {
        switch (status) {
            case SubscriptionStatus.Active:
                return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Activo</span>;
            case SubscriptionStatus.Expired:
                 return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Vencido</span>;
            case SubscriptionStatus.Suspended:
                 return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Suspendido</span>;
            case SubscriptionStatus.Cancelled:
                return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-500 text-white dark:bg-gray-600 dark:text-gray-100">Cancelado</span>;
            case SubscriptionStatus.PaymentPending:
                return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">Falta Pago</span>;
            default:
                return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Sin Plan</span>;
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <SalonLogoIcon salonName="Kandy" className="w-8 h-8" />
                    <h1 className="text-2xl font-bold text-pink-600 dark:text-pink-400">Panel de SuperAdmin</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </button>
                    <button onClick={onLogout} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400">
                        <LogOutIcon className="w-6 h-6 mr-2" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </header>
            <main className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Businesses Section */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold flex items-center"><BriefcaseIcon className="w-8 h-8 mr-3" /> Negocios</h2>
                            <button onClick={() => handleOpenBusinessModal()} className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-pink-600 transition-colors flex items-center">
                                <PlusIcon className="w-5 h-5 mr-2" /> Crear Negocio
                            </button>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {businesses.map(b => {
                                const subscription = subscriptions.find(s => s.businessId === b.id);
                                const plan = plans.find(p => p.id === subscription?.planId);
                                return (
                                <div key={b.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between transition-transform hover:scale-105 hover:shadow-pink-500/10">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <BusinessTypeIcon type={b.type} />
                                            <div>
                                                <p className="font-bold text-xl text-gray-800 dark:text-gray-100">{b.profile.salonName}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{b.type}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Estado:</span>
                                                {getStatusBadge(subscription?.status)}
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Plan:</span>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">{plan?.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Vence:</span>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {subscription ? new Date(subscription.endDate).toLocaleDateString('es-ES') : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-center space-x-2">
                                             <select
                                                value={plan?.id || ''}
                                                onChange={(e) => {
                                                    const planId = Number(e.target.value);
                                                    if (planId) {
                                                        handleAssignPlanToBusiness(b.id, planId);
                                                    }
                                                }}
                                                className="w-full text-xs p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                            >
                                                <option value="" disabled>Asignar Plan</option>
                                                {plans.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={subscription?.status || ''}
                                                onChange={(e) => subscription && onUpdateSubscriptionStatus(subscription.id, e.target.value as SubscriptionStatus)}
                                                className="w-full text-xs p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                                disabled={!subscription}
                                            >
                                                <option value="" disabled>Estado</option>
                                                {Object.values(SubscriptionStatus).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-end space-x-1 border-t border-gray-200 dark:border-gray-700 pt-3">
                                            <button onClick={() => onImpersonate(b.id)} title="Ver Negocio" className="text-green-500 hover:text-green-600 p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"><EyeIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleOpenBusinessModal(b)} title="Editar Negocio" className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleOpenDeleteBusinessModal(b)} title="Eliminar Negocio" className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </section>

                    {/* Users Section */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold flex items-center"><UsersIcon className="w-8 h-8 mr-3" /> Usuarios</h2>
                            <button onClick={() => handleOpenUserModal()} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-colors flex items-center">
                                <UserPlusIcon className="w-5 h-5 mr-2" /> Crear Usuario
                            </button>
                        </div>
                        <div className="space-y-4">
                            {users.filter(u => u.role !== UserRole.SuperAdmin).map(u => (
                                <div key={u.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg">{u.firstName} {u.lastName}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Usuario: {u.username} | Asignado a: {businesses.find(b => b.id === u.businessId)?.profile.salonName || 'Ninguno'}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleOpenUserModal(u)} title="Editar Usuario" className="text-blue-500 hover:text-blue-700 p-2"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => handleOpenDeleteUserModal(u)} title="Eliminar Usuario" className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                 {/* Plans Section */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold flex items-center"><DiamondIcon className="w-8 h-8 mr-3" /> Planes y Suscripciones</h2>
                        <button onClick={() => handleOpenPlanModal()} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-600 transition-colors flex items-center">
                            <PlusIcon className="w-5 h-5 mr-2" /> Crear Plan
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {plans.map(p => (
                            <div key={p.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-xl text-green-600 dark:text-green-400">{p.name}</h3>
                                    <p className="text-3xl font-extrabold my-2">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.price)} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ mes</span></p>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mt-4">
                                        {p.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex items-center space-x-2 mt-6">
                                    <button onClick={() => handleOpenPlanModal(p)} title="Editar Plan" className="text-blue-500 hover:text-blue-700 p-2"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => handleOpenDeletePlanModal(p)} title="Eliminar Plan" className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Business Modal */}
            <Modal isOpen={isBusinessModalOpen} onClose={handleCloseModals} title={currentBusiness?.id ? "Editar Negocio" : "Crear Negocio"}>
                <form onSubmit={handleSaveBusiness} className="space-y-4">
                    <div>
                        <label htmlFor="salonName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Negocio</label>
                        <input type="text" id="salonName" value={currentBusiness?.profile?.salonName || ''} onChange={e => setCurrentBusiness(p => ({ ...p, profile: { ...p?.profile, salonName: e.target.value } as any }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Negocio</label>
                        <select id="businessType" value={currentBusiness?.type || ''} onChange={e => setCurrentBusiness(p => ({ ...p, type: e.target.value as BusinessType }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                            <option value="" disabled>Selecciona un tipo</option>
                            {Object.values(BusinessType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-pink-500 text-white font-bold rounded-lg shadow hover:bg-pink-600">Guardar Negocio</button>
                    </div>
                </form>
            </Modal>

            {/* User Modal */}
            <Modal isOpen={isUserModalOpen} onClose={handleCloseModals} title={currentUser?.id ? "Editar Usuario" : "Crear Usuario"}>
                 <form onSubmit={handleSaveUser} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                            <input type="text" id="firstName" value={currentUser?.firstName || ''} onChange={e => setCurrentUser(p => ({ ...p, firstName: e.target.value }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido</label>
                            <input type="text" id="lastName" value={currentUser?.lastName || ''} onChange={e => setCurrentUser(p => ({ ...p, lastName: e.target.value }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Celular</label>
                        <input type="tel" id="phone" value={currentUser?.phone || ''} onChange={e => setCurrentUser(p => ({ ...p, phone: e.target.value }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
                            <input type="text" id="username" value={currentUser?.username || ''} onChange={e => setCurrentUser(p => ({ ...p, username: e.target.value }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                            <input type="password" id="password" value={currentUser?.password || ''} onChange={e => setCurrentUser(p => ({ ...p, password: e.target.value }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required={!currentUser?.id} placeholder={currentUser?.id ? 'Dejar en blanco para no cambiar' : ''} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="userBusiness" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignar a Negocio</label>
                        <select id="userBusiness" value={currentUser?.businessId || ''} onChange={e => setCurrentUser(p => ({ ...p, businessId: Number(e.target.value) }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="">Sin Asignar</option>
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.profile.salonName}</option>)}
                        </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600">Guardar Usuario</button>
                    </div>
                </form>
            </Modal>

            {/* Plan Modal */}
            <Modal isOpen={isPlanModalOpen} onClose={handleCloseModals} title={currentPlan?.id ? "Editar Plan" : "Crear Plan"}>
                <form onSubmit={handleSavePlan} className="space-y-4">
                    <div>
                        <label htmlFor="planName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Plan</label>
                        <input type="text" id="planName" value={currentPlan?.name || ''} onChange={e => setCurrentPlan(p => ({ ...p, name: e.target.value }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="planPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Mensual (COP)</label>
                        <input type="number" id="planPrice" value={currentPlan?.price ?? ''} onChange={e => setCurrentPlan(p => ({ ...p, price: Number(e.target.value) }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required min="0" />
                    </div>
                    <div>
                        <label htmlFor="planFeatures" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Características (una por línea)</label>
                        <textarea id="planFeatures" rows={5} value={(currentPlan?.features as any) || ''} onChange={e => setCurrentPlan(p => ({ ...p, features: e.target.value as any }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600">Guardar Plan</button>
                    </div>
                </form>
            </Modal>
            
            {/* Delete Business Modal */}
            <Modal isOpen={isDeleteBusinessModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        ¿Estás seguro de que quieres eliminar el negocio <strong>{businessToDelete?.profile.salonName}</strong>?
                    </p>
                    <p className="font-bold text-red-600 dark:text-red-400 mt-2">¡Todos los usuarios asignados a este negocio también serán eliminados!</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer.</p>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                    <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                    <button type="button" onClick={handleDeleteBusinessConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">Sí, Eliminar</button>
                </div>
            </Modal>

            {/* Delete User Modal */}
            <Modal isOpen={isDeleteUserModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        ¿Estás seguro de que quieres eliminar al usuario <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer.</p>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                    <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                    <button type="button" onClick={handleDeleteUserConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">Sí, Eliminar</button>
                </div>
            </Modal>

             {/* Delete Plan Modal */}
            <Modal isOpen={isDeletePlanModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        ¿Estás seguro de que quieres eliminar el plan <strong>{planToDelete?.name}</strong>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer.</p>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                    <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                    <button type="button" onClick={handleDeletePlanConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">Sí, Eliminar</button>
                </div>
            </Modal>
        </div>
    );
};

export default SuperAdminDashboard;
