import React, { useState } from 'react';
import { SalonLogoIcon } from './icons/SalonLogoIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { FrenchBulldogIcon } from './icons/FrenchBulldogIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { RegistrationData, Plan } from '../types';
import RegistrationModal from './RegistrationModal';

const SalonLogoIcon = ({ className, salonName }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M20,80 Q50,10 80,80 C70,95 30,95 20,80" stroke="url(#logoGradient)" strokeWidth="5" fill="none" />
    <circle cx="50" cy="50" r="10" fill="url(#logoGradient)" />
  </svg>
);

const CalendarIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const UsersIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const DollarSignIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);

const TrendingUpIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const FrenchBulldogIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 7h.01" />
    <path d="M8 7h.01" />
    <path d="M10 12c.5-1 1.5-1.5 3-1.5s2.5.5 3 1.5" />
    <path d="M12 18c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5Z" />
    <path d="M20 12c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8" />
    <path d="M2 12c0-3.3 2.7-6 6-6" />
    <path d="M22 12c0-3.3-2.7-6-6-6" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);


// --- Placeholder Types & Components (to fix import errors) ---

// Define placeholder types
const Plan = {};
const RegistrationData = {};

// Define placeholder RegistrationModal component
const RegistrationModal = ({ isOpen, onClose, onRegister, plans, onLoginClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[100]">
            <div className="bg-slate-800 text-white p-8 rounded-lg max-w-md w-full m-4 border border-slate-700 shadow-2xl shadow-purple-500/20">
                <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Crear Cuenta</h2>
                <p className="mb-6 text-slate-400 text-center">Únete a Kandy y lleva tu negocio al siguiente nivel.</p>
                {/* Simplified form */}
                <form onSubmit={(e) => { e.preventDefault(); alert('Registro de ejemplo!'); onClose(); }}>
                    <div className="mb-4">
                        <label className="block text-slate-400 text-sm font-bold mb-2" htmlFor="name">Nombre</label>
                        <input className="w-full bg-slate-700 border border-slate-600 rounded py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500" id="name" type="text" placeholder="Tu Nombre" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-slate-400 text-sm font-bold mb-2" htmlFor="email">Email</label>
                        <input className="w-full bg-slate-700 border border-slate-600 rounded py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500" id="email" type="email" placeholder="tu@email.com" />
                    </div>
                    <button type="submit" className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105">
                        Registrarse
                    </button>
                </form>
                <div className="text-center mt-4">
                  <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
                      Cancelar
                  </button>
                </div>
            </div>
        </div>
    );
};


interface LandingPageProps {
  onLoginClick: () => void;
  onRegister: (data: RegistrationData) => void;
  plans: Plan[];
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegister, plans }) => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm transition-transform hover:scale-105 hover:border-purple-500">
        <div className="text-purple-400 mb-4">{icon}</div>
        <h3 className="font-bold text-xl text-white mb-2">{title}</h3>
        <p className="text-slate-400">{children}</p>
    </div>
  );

  return (
    <>
    <div className="bg-[#0b1120] text-slate-300 font-sans" style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-lg border-b border-slate-800">
    <div className="container mx-auto px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        {/* 👇 ESTA ES LA LÍNEA QUE CAMBIAS 👇 */}
        <img 
            src="/imageKandyAi.png" 
            alt="Kandy Logo" 
            className="w-8 h-8 rounded-full"
        />
        <span className="text-white font-bold text-xl" style={{fontFamily: "'Poppins', sans-serif"}}>Kandy</span>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={onLoginClick} className="text-slate-300 hover:text-white transition-colors text-sm font-semibold">
          Iniciar Sesión
        </button>
        <button onClick={() => setIsRegisterModalOpen(true)} className="hidden sm:block bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 text-sm">
          Registrarse
        </button>
      </div>
    </div>
</header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120] via-[#0b1120] to-slate-900 z-0"></div>
             <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{backgroundImage: `radial-gradient(circle at top left, rgba(168, 85, 247, 0.3), transparent 40%), radial-gradient(circle at bottom right, rgba(219, 39, 119, 0.3), transparent 40%)`}}></div>

            <div className="container mx-auto px-6 z-10 grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4" style={{fontFamily: "'Poppins', sans-serif"}}>
                        El software que tu negocio necesita para <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">crecer</span>.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-xl mx-auto md:mx-0">
                        Organiza tus citas, clientes y finanzas en un solo lugar. Kandy es la herramienta definitiva para barberías, salones y manicuristas modernos.
                    </p>
                    <button onClick={() => setIsRegisterModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 inline-block">
                        Prueba Gratis por 14 días
                    </button>
                </div>
                <div className="hidden md:flex justify-center items-center">
                    <img 
                        src="/imageLandingPage1.png" 
                        alt="Barbero profesional atendiendo a un cliente en un salón moderno"
                        className="rounded-xl shadow-2xl w-full h-auto object-cover max-h-[500px] border-4 border-slate-800"
                    />
                </div>
            </div>
        </section>
        
        {/* Registration CTA Section */}
        <section id="register-cta" className="py-20 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{fontFamily: "'Poppins', sans-serif"}}>Empieza a organizar tu negocio hoy</h2>
                    <p className="text-slate-400 mb-8">Crea tu cuenta gratis y descubre por qué cientos de negocios nos prefieren.</p>
                       <button 
                         onClick={() => setIsRegisterModalOpen(true)}
                         className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105"
                     >
                         Crear Cuenta Gratis
                     </button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-slate-900 to-[#0b1120]">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: "'Poppins', sans-serif"}}>Todo lo que necesitas en un solo lugar</h2>
                    <p className="text-slate-400 mt-4">Simplifica tu día a día con herramientas diseñadas para ti.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon={<CalendarIcon className="w-8 h-8"/>} title="Agenda Inteligente">
                        Organiza tus citas por día, semana y profesional. Evita cruces de horarios y envía recordatorios automáticos.
                    </FeatureCard>
                    <FeatureCard icon={<UsersIcon className="w-8 h-8"/>} title="Gestión de Clientes">
                        Crea perfiles para tus clientes, guarda su historial de servicios, preferencias y datos de contacto.
                    </FeatureCard>
                    <FeatureCard icon={<DollarSignIcon className="w-8 h-8"/>} title="Pagos y Facturación">
                        Registra cada servicio, acepta pagos en línea y mantén un control claro de tus ingresos y deudas.
                    </FeatureCard>
                    <FeatureCard icon={<TrendingUpIcon className="w-8 h-8"/>} title="Reportes de Ventas">
                        Visualiza el rendimiento de tu negocio con reportes fáciles de entender sobre tus servicios más populares y ganancias.
                    </FeatureCard>
                </div>
            </div>
        </section>

        {/* Benefits & Mockups Section */}
        <section className="py-20 bg-[#0b1120] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side: Content */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Descubre por qué los mejores negocios usan nuestra plataforma
                        </h2>
                        <p className="text-slate-400 mt-4 mb-8">
                            Todo lo que necesitas para llevar tu negocio al siguiente nivel, con el poder de la inteligencia artificial.
                        </p>
                        
                        <ul className="space-y-4 text-left mb-8">
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Control total de la agenda:</strong> Organiza tu negocio y el de tus profesionales fácilmente.</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Reducción de inasistencias:</strong> Envía recordatorios automáticos a tus clientes y disminuye las citas perdidas.</span>
                            </li>
                             <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Facturación y pagos simplificados:</strong> Controla tus ingresos y registra pagos de forma sencilla.</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                                <span><strong>Reportes claros para mejorar finanzas:</strong> Toma decisiones inteligentes con datos precisos sobre tu rendimiento.</span>
                            </li>
                        </ul>

                        <div className="bg-slate-800/50 ...">
                            <div className="flex items-center mb-3">
                                {/* 👇 AQUÍ HACEMOS EL CAMBIO 👇 */}
                                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mr-4">
                                    <img 
                                        src="/imageKandyAi.png" 
                                        alt="Kandy AI Logo" 
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                </div>
                                <h4 className="font-bold text-xl text-white">Potenciado por Kandy AI</h4>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Nuestro asistente virtual automatiza el agendamiento, da seguimiento a clientes y te guía para optimizar tus finanzas a través de un chat intuitivo.
                            </p>
                        </div>

                        <p className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
                            Nuestros clientes aumentan sus ingresos en un 82%
                        </p>

                        <button onClick={() => setIsRegisterModalOpen(true)} className="w-full text-center block sm:inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105">
                            Prueba Gratis Hoy
                        </button>
                    </div>

                    {/* Right side: Mockups */}
                    <div className="relative h-[500px] lg:h-[600px]">
                        {/* Tablet Mockup */}
                        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[70%] max-w-[400px] lg:w-[80%] lg:max-w-none lg:left-0 z-10">
                            <div className="relative aspect-[4/3] bg-slate-800 rounded-2xl p-2 border-4 border-slate-700 shadow-2xl">
                                <div className="bg-slate-900 w-full h-full rounded-lg overflow-hidden">
                                    <img src="/Thebarber.png" alt="Vista de la agenda de la aplicación en una tablet" className="w-full h-full object-cover object-left-top"/>
                                </div>
                            </div>
                        </div>
                        {/* Phone Mockup */}
                        <div className="absolute top-1/2 right-0 -translate-y-[40%] w-[35%] max-w-[200px] lg:w-[40%] lg:max-w-none z-20">
                            <div className="relative aspect-[9/16] bg-slate-800 rounded-2xl p-2 border-4 border-slate-700 shadow-2xl transform lg:rotate-3">
                                 <div className="absolute top-4 left-1/2 -translate-x-1/2 h-1 w-8 bg-slate-600 rounded-full z-10"></div>
                                 <div className="bg-slate-900 w-full h-full rounded-lg overflow-hidden">
                                     <img src="/barbero.png" alt="Vista de la agenda de la aplicación en un móvil" className="w-full h-full object-cover"/>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Image Gallery Section */}
        <section className="py-20 bg-gradient-to-b from-[#0b1120] to-slate-900">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: "'Poppins', sans-serif"}}>Adaptado a tu Negocio</h2>
                    <p className="text-slate-400 mt-4">Desde salones de manicura hasta barberías de alta gama, Kandy se ajusta a ti.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <img src="/imageLandingPage3.png" alt="Manicurista profesional trabajando en las uñas de una clienta" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-[4/5] overflow-hidden rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                         <img src="https://images.pexels.com/photos/2061820/pexels-photo-2061820.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Barbero detallando un corte de pelo con una navaja" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-[4/5] overflow-hidden rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                         <img src="/imageLandingPage2.png" alt="Estilista trabajando en el cabello de una clienta en un salón de belleza luminoso" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: "'Poppins', sans-serif"}}>Planes para cada tamaño de negocio</h2>
                    <p className="text-slate-400 mt-4">Elige el plan que se adapte a tus necesidades. Sin contratos a largo plazo.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Plan Básico */}
                    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex flex-col">
                        <h3 className="text-xl font-bold text-purple-400">Básico</h3>
                        <p className="text-4xl font-extrabold text-white my-4">$9.999 <span className="text-lg font-medium text-slate-400">/mes</span></p>
                        <p className="text-slate-400 mb-6">Ideal para profesionales independientes.</p>
                        <ul className="space-y-3 text-slate-300 flex-grow">
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Agenda y Citas</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Hasta 50 Clientes</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>1 Profesional</li>
                        </ul>
                        <button onClick={() => setIsRegisterModalOpen(true)} className="mt-8 w-full text-center bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors">Empezar ahora</button>
                    </div>
                    {/* Plan Premium */}
                    <div className="bg-slate-800 p-8 rounded-xl border-2 border-purple-500 flex flex-col relative shadow-2xl shadow-purple-500/20">
                         <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">MÁS POPULAR</span>
                         <h3 className="text-xl font-bold text-purple-400">Pro</h3>
                        <p className="text-4xl font-extrabold text-white my-4">$16.900 <span className="text-lg font-medium text-slate-400">/mes</span></p>
                        <p className="text-slate-400 mb-6">Perfecto para negocios en crecimiento.</p>
                        <ul className="space-y-3 text-slate-300 flex-grow">
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Todo lo del plan Básico</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Pagos y Facturación</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Reportes de Ventas</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Asistente Kandy AI</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Hasta 5 Profesionales</li>
                        </ul>
                        <button onClick={() => setIsRegisterModalOpen(true)} className="mt-8 w-full text-center bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-shadow">Elegir Pro</button>
                    </div>
                    {/* Plan Empresarial */}
                    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex flex-col">
                        <h3 className="text-xl font-bold text-purple-400">Empresa</h3>
                        <p className="text-4xl font-extrabold text-white my-4">$49.999</p>
                        <p className="text-slate-400 mb-6">Para salones con múltiples locales.</p>
                        <ul className="space-y-3 text-slate-300 flex-grow">
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Todo lo del plan Pro</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Profesionales Ilimitados</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Soporte Prioritario</li>
                        </ul>
                        <button onClick={() => setIsRegisterModalOpen(true)} className="mt-8 w-full text-center bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors">Contactar Ventas</button>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-[#0b1120]">
             <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: "'Poppins', sans-serif"}}>Amado por profesionales como tú</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <p className="text-slate-300 mb-4">"Kandy transformó mi negocio. Ahora tengo todo bajo control y mis clientes aman los recordatorios automáticos. ¡La mejor inversión!"</p>
                        <div className="font-bold text-white">Ana María</div>
                        <div className="text-sm text-purple-400">Gabi Nails</div>
                    </div>
                     <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <p className="text-slate-300 mb-4">"El asistente Kandy AI es increíble. Me ayuda a saber mis ingresos del día al instante. ¡Es como tener un administrador personal!"</p>
                        <div className="font-bold text-white">Carlos el Barbero</div>
                        <div className="text-sm text-purple-400">La Barbería</div>
                    </div>
                     <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <p className="text-slate-300 mb-4">"Pasé de una agenda de papel a Kandy y la diferencia es abismal. Mis clientas están más felices y yo tengo más tiempo libre."</p>
                        <div className="font-bold text-white">Jessica M.</div>
                        <div className="text-sm text-purple-400">Jess Salon</div>
                    </div>
                </div>
             </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
    <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    {/* 👇 ESTA ES LA LÍNEA QUE CAMBIAS 👇 */}
                    <img 
                        src="/imageKandyAi.png" 
                        alt="Kandy Logo" 
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white font-bold text-xl" style={{fontFamily: "'Poppins', sans-serif"}}>Kandy</span>
                </div>
                <p className="text-slate-400 text-sm">El software todo-en-uno para tu negocio de belleza.</p>
            </div>
               <div>
                    <h4 className="font-bold text-white mb-4">Producto</h4>
                    <ul className="space-y-2 text-slate-400 text-sm">
                        <li><a href="#" className="hover:text-white">Características</a></li>
                        <li><a href="#" className="hover:text-white">Precios</a></li>
                        <li><a href="#" className="hover:text-white">Kandy AI</a></li>
                    </ul>
               </div>
               <div>
                    <h4 className="font-bold text-white mb-4">Compañía</h4>
                    <ul className="space-y-2 text-slate-400 text-sm">
                        <li><a href="#" className="hover:text-white">Sobre Nosotros</a></li>
                        <li><a href="#" className="hover:text-white">Contacto</a></li>
                    </ul>
               </div>
               <div>
                    <h4 className="font-bold text-white mb-4">Soporte</h4>
                    <ul className="space-y-2 text-slate-400 text-sm">
                        <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                        <li><a href="#" className="hover:text-white">Términos de Servicio</a></li>
                        <li><a href="#" className="hover:text-white">Política de Privacidad</a></li>
                    </ul>
               </div>
            </div>
             <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center">
                <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} Kandy AI. Todos los derechos reservados.</p>
                <div className="flex space-x-4 mt-4 sm:mt-0">
                    <a href="#" className="text-slate-500 hover:text-white"><i className="fab fa-twitter"></i></a>
                    <a href="#" className="text-slate-500 hover:text-white"><i className="fab fa-instagram"></i></a>
                    <a href="#" className="text-slate-500 hover:text-white"><i className="fab fa-facebook"></i></a>
                </div>
            </div>
        </div>
      </footer>
    </div>
    <RegistrationModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={onRegister}
        plans={plans}
        onLoginClick={onLoginClick}
      />
    </>
  );
};

export default LandingPage;