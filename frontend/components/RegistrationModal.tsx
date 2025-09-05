import React, { useState } from 'react';
import { BusinessType, Plan, RegistrationData } from '../types';
import Modal from './Modal';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { DiamondIcon } from './icons/DiamondIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (data: RegistrationData) => void;
    plans: Plan[];
    onLoginClick: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onRegister, plans, onLoginClick }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<RegistrationData>>({
        businessType: BusinessType.NailSalon,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setError('');
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.businessName || !formData.businessType) {
                setError('Por favor, completa todos los campos.');
                return false;
            }
        } else if (step === 2) {
            if (!formData.fullName || !formData.username || !formData.email || !formData.phone || !formData.password) {
                setError('Por favor, completa todos los campos.');
                return false;
            }
            if (formData.password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres.');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep()) return;
        
        setIsLoading(true);
        setError('');
        
        const basicPlan = plans.find(p => p.name.toLowerCase() === 'básico');
        if (!basicPlan) {
            setError("No se pudo encontrar el plan Básico. Por favor, contacta a soporte.");
            setIsLoading(false);
            return;
        }

        const finalData = {
            ...formData,
            planId: basicPlan.id,
        } as RegistrationData;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            onRegister(finalData);
            // The modal will close automatically as the parent component re-renders
        } catch (err) {
            setError("Hubo un error al registrar. Por favor, intenta de nuevo.");
            setIsLoading(false);
        }
    };

    const StepIcon: React.FC<{ icon: React.ReactNode, label: string, stepNumber: number }> = ({ icon, label, stepNumber }) => {
        const isActive = step === stepNumber;
        const isCompleted = step > stepNumber;
        return (
            <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-primary border-primary text-white' : isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-muted border-border text-muted-foreground'}`}>
                    {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : icon}
                </div>
                <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{label}</p>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crea tu Cuenta Gratis">
            <div className="w-full">
                {/* Stepper */}
                <div className="flex justify-between items-start mb-6 px-12">
                    <StepIcon icon={<BriefcaseIcon className="w-6 h-6"/>} label="Negocio" stepNumber={1} />
                    <div className={`flex-1 h-0.5 mt-6 ${step > 1 ? 'bg-primary' : 'bg-border'}`} />
                    <StepIcon icon={<UserPlusIcon className="w-6 h-6"/>} label="Tu Cuenta" stepNumber={2} />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Step 1: Business Info */}
                    {step === 1 && (
                         <div className="space-y-4 animate-fade-in">
                             <h3 className="font-semibold text-lg text-card-foreground text-center">Cuéntanos sobre tu negocio</h3>
                             <div>
                                 <label htmlFor="businessName" className="block text-sm font-medium text-card-foreground mb-1">Nombre del Negocio</label>
                                 <input type="text" name="businessName" id="businessName" value={formData.businessName || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
                             </div>
                             <div>
                                 <label htmlFor="businessType" className="block text-sm font-medium text-card-foreground mb-1">Tipo de Negocio</label>
                                 <select name="businessType" id="businessType" value={formData.businessType || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required>
                                     {Object.values(BusinessType).map(type => <option key={type} value={type}>{type}</option>)}
                                 </select>
                             </div>
                         </div>
                    )}
                    {/* Step 2: User Info */}
                    {step === 2 && (
                         <div className="space-y-4 animate-fade-in">
                            <h3 className="font-semibold text-lg text-card-foreground text-center">Crea tu cuenta de administrador</h3>
                             <div>
                                 <label htmlFor="fullName" className="block text-sm font-medium text-card-foreground mb-1">Nombre Completo</label>
                                 <input type="text" name="fullName" id="fullName" value={formData.fullName || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
                             </div>
                             <div>
                                <label htmlFor="username" className="block text-sm font-medium text-card-foreground mb-1">Nombre de Usuario</label>
                                <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" placeholder="Ej: tunombre123" required />
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">Email</label>
                                    <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
                                </div>
                                 <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-card-foreground mb-1">Teléfono</label>
                                    <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
                                </div>
                             </div>
                             <div>
                                <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-1">Contraseña</label>
                                <input type="password" name="password" id="password" value={formData.password || ''} onChange={handleInputChange} className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card" required />
                            </div>
                         </div>
                    )}

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    {/* Navigation */}
                    <div className="pt-4 flex justify-between items-center">
                        <div>
                           {step > 1 && (
                                <button type="button" onClick={handleBack} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent">
                                    Anterior
                                </button>
                           )}
                        </div>
                        <div>
                          {step < 2 ? (
                            <button type="button" onClick={handleNext} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary-hover">
                                Siguiente
                            </button>
                          ) : (
                             <button type="submit" className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 flex items-center" disabled={isLoading}>
                                 {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                                 {isLoading ? 'Creando Cuenta...' : 'Empezar Prueba de 14 días'}
                            </button>
                          )}
                        </div>
                    </div>
                </form>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    ¿Ya tienes una cuenta? <button onClick={() => { onClose(); onLoginClick(); }} className="font-semibold text-primary hover:underline">Inicia Sesión</button>
                </p>
            </div>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in {
                animation: fade-in 0.3s ease-out;
              }
            `}</style>
        </Modal>
    );
};

export default RegistrationModal;