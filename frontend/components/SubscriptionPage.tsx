

import React, { useState } from 'react';
import { Business, Subscription, Plan, Payment, SubscriptionStatus } from '../types';
import { DiamondIcon } from './icons/DiamondIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import Modal from './Modal';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface SubscriptionPageProps {
    business: Business;
    subscription?: Subscription;
    plan?: Plan;
    allPlans: Plan[];
    paymentHistory: Payment[];
    onRenew: (businessId: number) => void;
    onChangePlan: (businessId: number, newPlanId: number) => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ business, subscription, plan, allPlans, paymentHistory, onRenew, onChangePlan }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    
    const [planToChangeTo, setPlanToChangeTo] = useState<Plan | null>(null);

    if (!subscription || !plan) {
        return (
            <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border text-center">
                <DiamondIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-card-foreground mb-2">Sin Suscripción Activa</h2>
                <p className="text-muted-foreground mb-6">
                    Este negocio aún no tiene un plan de suscripción asignado.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    Por favor, contacta al SuperAdmin para asignar y activar un plan.
                </p>
            </div>
        );
    }

    const handleRenewClick = () => {
        setIsPaymentModalOpen(true);
        setPaymentSuccess(false);
    };

    const handleConfirmPayment = () => {
        setIsProcessing(true);
        // Simulate API call
        setTimeout(() => {
            onRenew(business.id);
            setIsProcessing(false);
            setPaymentSuccess(true);
            setTimeout(() => setIsPaymentModalOpen(false), 2000);
        }, 2000);
    };

    const handleChangePlanClick = (newPlan: Plan) => {
        setPlanToChangeTo(newPlan);
        setIsChangePlanModalOpen(true);
    };
    
    const handleConfirmChangePlan = () => {
        if (!planToChangeTo) return;
        setIsProcessing(true);
        setTimeout(() => {
            onChangePlan(business.id, planToChangeTo.id);
            setIsProcessing(false);
            setPlanToChangeTo(null);
            setIsChangePlanModalOpen(false);
        }, 1500);
    };
    
    const getStatusInfo = () => {
        switch(subscription.status) {
            case SubscriptionStatus.Active:
                return {
                    text: 'Activa',
                    color: 'text-green-500',
                    icon: <CheckCircleIcon className="w-8 h-8 mr-3" />
                };
            case SubscriptionStatus.Expired:
                return {
                    text: 'Vencida',
                    color: 'text-red-500',
                    icon: <AlertTriangleIcon className="w-8 h-8 mr-3" />
                };
            case SubscriptionStatus.Suspended:
                return {
                    text: 'Suspendida',
                    color: 'text-yellow-500',
                    icon: <AlertTriangleIcon className="w-8 h-8 mr-3" />
                };
            case SubscriptionStatus.Cancelled:
                return { 
                    text: 'Cancelada', 
                    color: 'text-gray-500', 
                    icon: <AlertTriangleIcon className="w-8 h-8 mr-3" /> 
                };
            case SubscriptionStatus.PaymentPending:
                return { 
                    text: 'Falta Pago', 
                    color: 'text-orange-500', 
                    icon: <AlertTriangleIcon className="w-8 h-8 mr-3" /> 
                };
            default:
                 return {
                    text: 'Desconocido',
                    color: 'text-gray-500',
                    icon: <AlertTriangleIcon className="w-8 h-8 mr-3" />
                };
        }
    };
    
    const statusInfo = getStatusInfo();
    const isExpired = subscription.status !== SubscriptionStatus.Active;

    return (
        <div className="space-y-8">
            <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
                 <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center">
                    <DiamondIcon className="w-7 h-7 mr-3 text-primary" />
                    Mi Suscripción
                 </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Plan Details */}
                    <div className="lg:col-span-2 bg-accent p-6 rounded-xl">
                        <h3 className="text-xl font-semibold text-accent-foreground mb-4">Tu Plan Actual</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Plan</span>
                                <span className="font-bold text-lg text-primary">{plan.name}</span>
                            </div>
                             <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">Precio Mensual</span>
                                <span className="font-bold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(plan.price)}</span>
                            </div>
                             <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                                <span className="text-muted-foreground">{isExpired ? 'Venció el' : 'Vence el'}</span>
                                <span className={`font-bold ${isExpired ? 'text-red-500' : ''}`}>{new Date(subscription.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className={`p-6 rounded-xl flex flex-col items-center justify-center ${isExpired ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                        <div className={`flex items-center text-2xl font-bold ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span>{statusInfo.text}</span>
                        </div>
                        <p className={`mt-2 text-center text-sm ${isExpired ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                           {isExpired ? 'Renueva para recuperar el acceso.' : '¡Todo en orden! Gracias por estar al día.'}
                        </p>
                        <button
                           onClick={handleRenewClick}
                           className="mt-4 bg-primary text-primary-foreground font-bold py-2 px-6 rounded-lg shadow hover:bg-primary-hover transition-colors"
                        >
                           {isExpired ? 'Renovar Ahora' : 'Renovar'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Change Plan Section */}
            <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
                <h3 className="text-xl font-semibold text-card-foreground mb-6">Cambiar de Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {allPlans.map(p => {
                        const isCurrentPlan = p.id === plan.id;
                        const isUpgrade = p.price > plan.price;
                        return (
                            <div key={p.id} className={`p-6 rounded-lg flex flex-col justify-between transition-all ${isCurrentPlan ? 'border-2 border-primary bg-primary/5' : 'bg-accent border-2 border-transparent'}`}>
                                <div>
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-xl text-primary">{p.name}</h3>
                                        {isCurrentPlan && <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">PLAN ACTUAL</span>}
                                    </div>
                                    <p className="text-3xl font-extrabold my-2 text-card-foreground">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.price)} <span className="text-sm font-normal text-muted-foreground">/ mes</span></p>
                                    <ul className="space-y-2 text-sm text-muted-foreground mt-4 flex-grow">
                                        {p.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button 
                                    onClick={() => handleChangePlanClick(p)}
                                    disabled={isCurrentPlan}
                                    className={`mt-6 w-full font-bold py-2 px-4 rounded-lg transition-colors ${isCurrentPlan ? 'bg-muted text-muted-foreground cursor-not-allowed' : isUpgrade ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
                                >
                                    {isCurrentPlan ? 'Plan Actual' : isUpgrade ? 'Subir de Plan' : 'Bajar de Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-card p-4 md:p-8 rounded-2xl shadow-lg border border-border">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">Historial de Pagos</h3>
                <div className="overflow-x-auto responsive-table">
                     <table className="min-w-full bg-card">
                        <thead className="bg-accent">
                            <tr>
                                <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Fecha</th>
                                <th className="py-3 px-6 text-left text-sm font-semibold text-accent-foreground">Plan</th>
                                <th className="py-3 px-6 text-right text-sm font-semibold text-accent-foreground">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="text-card-foreground">
                            {paymentHistory.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => (
                                <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                                    <td data-label="Fecha" className="py-4 px-6">
                                        {new Date(payment.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td data-label="Plan" className="py-4 px-6">{payment.planName}</td>
                                    <td data-label="Monto" className="py-4 px-6 text-right md:text-right font-medium">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(payment.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
             <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Confirmar Renovación">
                {!paymentSuccess ? (
                    <div>
                        <p className="text-center text-card-foreground mb-4">
                            Estás a punto de renovar tu <strong>{plan.name}</strong> por un valor de:
                        </p>
                        <p className="text-center text-4xl font-bold text-primary mb-6">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(plan.price)}
                        </p>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent" disabled={isProcessing}>
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
                         <h2 className="text-2xl font-bold text-card-foreground mb-2">¡Pago Exitoso!</h2>
                         <p className="text-muted-foreground">Tu suscripción ha sido renovada. ¡Gracias!</p>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isChangePlanModalOpen} onClose={() => setIsChangePlanModalOpen(false)} title="Confirmar Cambio de Plan">
                 <div>
                    <p className="text-center text-card-foreground mb-4">
                        Confirmas que quieres cambiar al plan <strong>{planToChangeTo?.name}</strong> por un valor de:
                    </p>
                    <p className="text-center text-4xl font-bold text-primary mb-2">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(planToChangeTo?.price || 0)}
                    </p>
                    <p className="text-xs text-center text-muted-foreground mb-6">/mes</p>
                    <p className="text-sm text-center text-muted-foreground">Tu ciclo de facturación se reiniciará y se te cobrará este monto inmediatamente (simulado).</p>
                    <div className="mt-6 flex justify-center space-x-4">
                        <button type="button" onClick={() => setIsChangePlanModalOpen(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent" disabled={isProcessing}>
                            Cancelar
                        </button>
                        <button 
                            type="button" 
                            onClick={handleConfirmChangePlan}
                            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary-hover flex items-center justify-center"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Cambiando...
                                </>
                            ) : 'Sí, Cambiar de Plan'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SubscriptionPage;