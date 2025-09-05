
import React, { useState } from 'react';
import { Business, Subscription, Plan } from '../types';
import { LogOutIcon } from './icons/LogOutIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { DiamondIcon } from './icons/DiamondIcon';
import Modal from './Modal';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SubscriptionExpiredProps {
    business: Business;
    subscription?: Subscription;
    plan?: Plan;
    onRenew: (businessId: number) => void;
    onLogout: () => void;
}

const SubscriptionExpired: React.FC<SubscriptionExpiredProps> = ({ business, subscription, plan, onRenew, onLogout }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    
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
        // Simulate API call
        setTimeout(() => {
            onRenew(business.id);
            setIsProcessing(false);
            setPaymentSuccess(true);
             // The parent component will re-render and this component will disappear.
             // No need to close the modal here.
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
            <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">Suscripción Vencida</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    El acceso para <strong>{business.profile.salonName}</strong> ha sido suspendido. Por favor, renueva tu suscripción para continuar usando Kandy.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 text-left">
                    <h2 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Detalles de tu Plan</h2>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                        <span className="font-semibold">{plan.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Venció el:</span>
                        <span className="font-semibold">{new Date(subscription.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>

                <button 
                    onClick={handleRenewClick}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center text-lg"
                >
                    <DiamondIcon className="w-6 h-6 mr-3" />
                    Renovar Suscripción Ahora
                </button>
            </div>
            
            <button onClick={onLogout} className="mt-8 flex items-center text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <LogOutIcon className="w-5 h-5 mr-2" />
                Cerrar Sesión
            </button>

            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Confirmar Renovación">
                {!paymentSuccess ? (
                    <div>
                        <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
                            Estás a punto de renovar tu <strong>{plan.name}</strong> por un valor de:
                        </p>
                        <p className="text-center text-4xl font-bold text-primary mb-6">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(plan.price)}
                        </p>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" disabled={isProcessing}>
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleConfirmPayment} 
                                className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600 flex items-center justify-center"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Procesando...
                                    </>
                                ) : 'Pagar Ahora (Simulado)'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                         <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                         <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">¡Pago Exitoso!</h2>
                         <p className="text-gray-600 dark:text-gray-400">Tu suscripción ha sido renovada. Serás redirigido en un momento.</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SubscriptionExpired;
