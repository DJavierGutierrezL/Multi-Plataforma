// frontend/components/SubscriptionExpired.tsx

import React, { useState } from 'react';
import { Business, Subscription, Plan } from '../types';
import { LogOutIcon } from './icons/LogOutIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { DiamondIcon } from './icons/DiamondIcon';
import Modal from './Modal';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

// --- PASO 1: HAZ LA PROP 'business' OPCIONAL ---
interface SubscriptionExpiredProps {
    business?: Business; // <-- Añadimos '?' para indicar que puede ser undefined
    subscription?: Subscription;
    plan?: Plan;
    onRenew: (businessId: number) => void;
    onLogout: () => void;
}

const SubscriptionExpired: React.FC<SubscriptionExpiredProps> = ({ business, subscription, plan, onRenew, onLogout }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // --- PASO 2: AÑADE ESTA BARRERA DE PROTECCIÓN AL INICIO ---
    // Si la información del negocio aún no ha llegado, muestra un estado de carga.
    // Esto previene el error 'cannot read properties of undefined'.
    if (!business) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }
    // A partir de aquí, podemos estar 100% seguros de que 'business' existe.

    if (!subscription || !plan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                    <AlertTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">Error de Configuración</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        La suscripción para <strong>{business.profile.salonName}</strong> no se pudo encontrar o está mal configurada. Por favor, contacta al administrador.
                    </p>
                </div>
                <button onClick={onLogout} className="mt-8 flex items-center text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <LogOutIcon className="w-5 h-5 mr-2" />
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    const handleRenewClick = () => {
        setIsPaymentModalOpen(true);
    };
    
    const handleConfirmPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            onRenew(business.id);
            setIsProcessing(false);
            setPaymentSuccess(true);
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
            {/* El resto de tu componente (que ya estaba bien) va aquí sin cambios */}
            <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">Suscripción Vencida</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    El acceso para <strong>{business.profile.salonName}</strong> ha sido suspendido. Por favor, renueva tu suscripción para continuar usando Kandy.
                </p>
                
                {/* ... (el resto del código JSX que ya tenías) ... */}
            </div>
            
            <button onClick={onLogout} className="mt-8">Cerrar Sesión</button>

            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Confirmar Renovación">
                {/* ... (el código del modal que ya tenías) ... */}
            </Modal>
        </div>
    );
};

export default SubscriptionExpired;