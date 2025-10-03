import React, { useState } from 'react';
import { Business, User, UserRole, BusinessType, Plan, Subscription, SubscriptionStatus } from '../types';
import * as apiService from '../services/apiService';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { LogOutIcon } from './icons/LogOutIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import Modal from './Modal';
import { DiamondIcon } from './icons/DiamondIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PencilIcon } from './icons/PencilIcon';


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
    onAssignPlanToBusiness: (businessId: number, planId: number) => void;
    onLogout: () => void;
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    onImpersonate: (businessId: number) => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ businesses, setBusinesses, users, setUsers, plans, setPlans, subscriptions, onUpdateSubscriptionStatus, onAssignPlanToBusiness, onLogout, theme, onThemeChange, onImpersonate }) => {
    const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isDeleteBusinessModalOpen, setIsDeleteBusinessModalOpen] = useState(false);
    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    
    const [currentBusiness, setCurrentBusiness] = useState<Partial<Business> | null>(null);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [currentPlan, setCurrentPlan] = useState<Partial<Plan> | null>(null);

    const handleOpenBusinessModal = (business: Partial<Business> | null = null) => {
        setCurrentBusiness(business || {});
        setIsBusinessModalOpen(true);
    };
    
    const handleOpenUserModal = (user: Partial<User> | null = null) => {
        setCurrentUser(user ? {...user, password: ''} : {});
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

    const handleCloseModals = () => {
        setIsBusinessModalOpen(false);
        setIsUserModalOpen(false);
        setIsDeleteBusinessModalOpen(false);
        setIsDeleteUserModalOpen(false);
        setIsPlanModalOpen(false);
        setCurrentBusiness(null);
        setCurrentUser(null);
        setBusinessToDelete(null);
        setUserToDelete(null);
        setCurrentPlan(null);
    };

    const handleSaveBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentBusiness || !currentBusiness.profile?.salonName || !currentBusiness.type) {
            alert("Por favor completa nombre y tipo de negocio.");
            return;
        }

        try {
            if (currentBusiness.id) {
                // Lógica de edición (si la implementas en el futuro)
                console.log("Editando negocio...");
            } else {
                const newBusinessData = {
                    salonName: currentBusiness.profile.salonName,
                    type: currentBusiness.type,
                };
                const newBusinessFromAPI = await apiService.createBusiness(newBusinessData);
                setBusinesses(prevBusinesses => [...prevBusinesses, newBusinessFromAPI]);
            }
            handleCloseModals();
        } catch (error) {
            console.error("Error al guardar el negocio:", error);
            alert("Hubo un error al guardar el negocio.");
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !currentUser.firstName || !currentUser.lastName || !currentUser.username) {
            alert("Por favor completa nombre, apellido y usuario.");
            return;
        }

        try {
            if (currentUser.id) {
                 // Lógica de edición (si la implementas en el futuro)
                console.log("Editando usuario...");
            } else {
                if (!currentUser.password) {
                    alert("La contraseña es obligatoria para nuevos usuarios.");
                    return;
                }
                const newUserFromAPI = await apiService.createUser(currentUser);
                setUsers(prevUsers => [...prevUsers, newUserFromAPI]);
            }
            handleCloseModals();
        } catch (error: any) {
            console.error("Error al guardar el usuario:", error);
            alert(`Hubo un error al guardar el usuario: ${error.message}`);
        }
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPlan || !currentPlan.name || currentPlan.price === undefined) {
            alert("Por favor completa nombre y precio del plan.");
            return;
        }

        try {
            const planToSave: Partial<Plan> = {
                ...currentPlan,
                features: (currentPlan.features as any)?.split('\n').filter((f: string) => f.trim() !== '') || []
            };

            if (planToSave.id) {
                // Lógica de edición
                console.log("Editando plan...");
            } else {
                const newPlanFromAPI = await apiService.createPlan(planToSave);
                setPlans(prevPlans => [...prevPlans, newPlanFromAPI]);
            }
            handleCloseModals();
        } catch (error: any) {
            console.error("Error al guardar el plan:", error);
            alert(`Hubo un error al guardar el plan: ${error.message}`);
        }
    };
    
    // --- INICIO DE LA CORRECCIÓN ---
    const handleDeleteBusinessConfirm = async () => {
        if (!businessToDelete) return;
        try {
            // 1. Llamamos a la API para borrar en el backend
            await apiService.deleteBusiness(businessToDelete.id);

            // 2. Si tiene éxito, actualizamos el estado del frontend
            setBusinesses(businesses.filter(b => b.id !== businessToDelete.id));
            setUsers(users.filter(u => u.businessId !== businessToDelete.id));
            alert('Negocio eliminado con éxito.');
        } catch (error) {
            console.error("Error al eliminar el negocio:", error);
            alert("Hubo un error al eliminar el negocio.");
        } finally {
            handleCloseModals();
        }
    };
    
    const handleDeleteUserConfirm = async () => {
        if (!userToDelete) return;
        try {
            // 1. Llamamos a la API para borrar el usuario en el backend
            await apiService.deleteUser(userToDelete.id);

            // 2. Si tiene éxito, actualizamos el estado del frontend
            setUsers(users.filter(u => u.id !== userToDelete.id));
            alert('Usuario eliminado con éxito.');
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
            alert("Hubo un error al eliminar el usuario.");
        } finally {
            handleCloseModals();
        }
    };
    // --- FIN DE LA CORRECCIÓN ---


    const BusinessTypeIcon = ({ type }: { type: BusinessType }) => {
        switch (type) {
            case BusinessType.NailSalon:
                return <img src="/logoManicuristas.png" alt="Logo de Salón de Uñas" className="w-10 h-10 object-contain" />;
            case BusinessType.Barbershop:
                return <img src="/logoTuboBarberia.png" alt="Logo de Barbería" className="w-10 h-10 object-contain rounded-md" />;
            default: 
                return <BuildingIcon className="w-8 h-8 text-gray-500" />;
        }
    };
    
    const getStatusBadge = (status?: SubscriptionStatus) => {
        const statuses: Record<SubscriptionStatus, {text: string, classes: string}> = {
            [SubscriptionStatus.Active]: {text: 'Activo', classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'},
            [SubscriptionStatus.Expired]: {text: 'Vencido', classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'},
            [SubscriptionStatus.Suspended]: {text: 'Suspendido', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'},
            [SubscriptionStatus.Cancelled]: {text: 'Cancelado', classes: 'bg-gray-500 text-white dark:bg-gray-600 dark:text-gray-100'},
            [SubscriptionStatus.PaymentPending]: {text: 'Falta Pago', classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'}
        };
        const statusInfo = statuses[status!] || {text: 'Sin Plan', classes: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'};
        return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.classes}`}>{statusInfo.text}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <header className="bg-white dark:bg-black shadow-md p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src="/logoAsistenteVirtual.gif" alt="Logo Kandy AI" className="w-10 h-10" />
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
            <main className="p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Businesses Section */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold flex items-center"><BriefcaseIcon className="w-8 h-8 mr-3" /> Negocios</h2>
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
                                                value={subscription?.planId || ''}
                                                onChange={(e) => onAssignPlanToBusiness(b.id, Number(e.target.value))}
                                                className="w-full text-xs p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                            >
                                                <option value="" disabled>Asignar Plan</option>
                                                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <select
                                                value={subscription?.status || ''}
                                                onChange={(e) => subscription && onUpdateSubscriptionStatus(subscription.id, e.target.value as SubscriptionStatus)}
                                                className="w-full text-xs p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                                disabled={!subscription}
                                            >
                                                <option value="" disabled>Estado</option>
                                                {Object.values(SubscriptionStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-end space-x-1 border-t border-gray-200 dark:border-gray-700 pt-3">
                                            <button onClick={() => onImpersonate(b.id)} title="Ver Negocio" className="text-green-500 hover:text-green-600 p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"><EyeIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleOpenBusinessModal(b)} title="Editar Negocio" className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"><PencilIcon className="w-5 h-5"/></button>
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
                            <h2 className="text-2xl md:text-3xl font-bold flex items-center"><UsersIcon className="w-8 h-8 mr-3" /> Usuarios</h2>
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
                                        <button onClick={() => handleOpenUserModal(u)} title="Editar Usuario" className="text-blue-500 hover:text-blue-700 p-2"><PencilIcon className="w-5 h-5" /></button>
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
                        <h2 className="text-2xl md:text-3xl font-bold flex items-center"><DiamondIcon className="w-8 h-8 mr-3" /> Planes</h2>
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
                                    <button onClick={() => handleOpenPlanModal(p)} title="Editar Plan" className="text-blue-500 hover:text-blue-700 p-2"><PencilIcon className="w-5 h-5"/></button>
                                    <button title="Eliminar Plan" className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Modals */}
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
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
                        <input type="text" id="username" value={currentUser?.username || ''} onChange={e => setCurrentUser(p => ({ ...p, username: e.target.value }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                        <input type="password" id="password" value={currentUser?.password || ''} onChange={e => setCurrentUser(p => ({ ...p, password: e.target.value }))} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required={!currentUser?.id} placeholder={currentUser?.id ? 'Dejar en blanco para no cambiar' : ''} />
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

            <Modal isOpen={isPlanModalOpen} onClose={handleCloseModals} title={currentPlan?.id ? "Editar Plan" : "Crear Plan"}>
                <form onSubmit={handleSavePlan} className="space-y-4">
                    <div>
                        <label htmlFor="planName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Plan</label>
                        <input
                            type="text"
                            id="planName"
                            value={currentPlan?.name || ''}
                            onChange={e => setCurrentPlan(p => ({ ...p, name: e.target.value }))}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="planPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio (COP)</label>
                        <input
                            type="number"
                            id="planPrice"
                            value={currentPlan?.price || ''}
                            onChange={e => setCurrentPlan(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                            min="0"
                        />
                    </div>
                    <div>
                        <label htmlFor="planFeatures" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Características (una por línea)</label>
                        <textarea
                            id="planFeatures"
                            rows={4}
                            value={(currentPlan?.features as any) || ''}
                            onChange={e => setCurrentPlan(p => ({ ...p, features: e.target.value as any }))}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="- Característica 1&#10;- Característica 2&#10;- Característica 3"
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600">Guardar Plan</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isDeleteBusinessModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        ¿Estás seguro de que quieres eliminar <strong>{businessToDelete?.profile.salonName}</strong>?
                    </p>
                    <p className="font-bold text-red-600 dark:text-red-400 mt-2">¡Todos sus datos y usuarios serán eliminados!</p>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                    <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                    <button type="button" onClick={handleDeleteBusinessConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg">Sí, Eliminar</button>
                </div>
            </Modal>

            <Modal isOpen={isDeleteUserModalOpen} onClose={handleCloseModals} title="Confirmar Eliminación">
                 <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        ¿Estás seguro de que quieres eliminar a <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
                    </p>
                 </div>
                <div className="mt-6 flex justify-center space-x-4">
                    <button type="button" onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                    <button type="button" onClick={handleDeleteUserConfirm} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg">Sí, Eliminar</button>
                </div>
            </Modal>
        </div>
    );
};

export default SuperAdminDashboard;
