import React, { useState } from 'react';
import { SalonLogoIcon } from './icons/SalonLogoIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { FrenchBulldogIcon } from './icons/FrenchBulldogIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
    
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Gracias por registrarte! Esta es una demostración. Serás redirigido a la página de inicio de sesión.');
    onLoginClick();
  };

  const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm transition-transform hover:scale-105 hover:border-purple-500">
        <div className="text-purple-400 mb-4">{icon}</div>
        <h3 className="font-bold text-xl text-white mb-2">{title}</h3>
        <p className="text-slate-400">{children}</p>
    </div>
  );

  return (
    <div className="bg-[#0b1120] text-slate-300 font-sans" style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-lg border-b border-slate-800">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SalonLogoIcon salonName="Kandy" className="w-8 h-8" />
            <span className="text-white font-bold text-xl" style={{fontFamily: "'Poppins', sans-serif"}}>Kandy</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={onLoginClick} className="text-slate-300 hover:text-white transition-colors text-sm font-semibold">
              Iniciar Sesión
            </button>
            <a href="#register-form" className="hidden sm:block bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 text-sm">
              Registrarse Gratis
            </a>
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
                    <a href="#register-form" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 inline-block">
                        Prueba Gratis por 14 días
                    </a>
                </div>
                <div className="hidden md:flex justify-center items-center">
                    <img 
                        src="https://images.pexels.com/photos/3998425/pexels-photo-3998425.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                        alt="Barbero profesional atendiendo a un cliente en un salón moderno"
                        className="rounded-xl shadow-2xl w-full h-auto object-cover max-h-[500px] border-4 border-slate-800"
                    />
                </div>
            </div>
        </section>
        
        {/* Registration Form Section */}
        <section id="register-form" className="py-20 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{fontFamily: "'Poppins', sans-serif"}}>Empieza a organizar tu negocio hoy</h2>
                    <p className="text-slate-400 mb-8">Crea tu cuenta gratis y descubre por qué cientos de negocios nos prefieren.</p>
                </div>
                <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">Nombre Completo</label>
                            <input type="text" id="fullName" name="fullName" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <input type="email" id="email" name="email" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
                        </div>
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">Teléfono</label>
                            <input type="tel" id="phone" name="phone" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
                        </div>
                        <div>
                            <label htmlFor="businessType" className="block text-sm font-medium text-slate-300 mb-2">Tipo de Negocio</label>
                            <select id="businessType" name="businessType" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                                <option>Manicurista</option>
                                <option>Barbería</option>
                                <option>Salón de Belleza</option>
                                <option>Otro</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="professionals" className="block text-sm font-medium text-slate-300 mb-2">Cantidad de Profesionales</label>
                             <select id="professionals" name="professionals" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                                <option>Yo solo/a</option>
                                <option>2-5 personas</option>
                                <option>6-10 personas</option>
                                <option>Más de 10</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                           <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105">
                                Crear Cuenta Gratis
                           </button>
                        </div>
                    </form>
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

                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm mb-8">
                            <div className="flex items-center mb-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mr-4">
                                    <FrenchBulldogIcon className="w-6 h-6 text-white" />
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

                        <a href="#register-form" className="w-full text-center block sm:inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105">
                            Prueba Gratis Hoy
                        </a>
                    </div>

                    {/* Right side: Mockups */}
                    <div className="relative h-[500px] lg:h-[600px]">
                        {/* Tablet Mockup */}
                        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[70%] max-w-[400px] lg:w-[80%] lg:max-w-none lg:left-0 z-10">
                            <div className="relative aspect-[4/3] bg-slate-800 rounded-2xl p-2 border-4 border-slate-700 shadow-2xl">
                                <div className="bg-slate-900 w-full h-full rounded-lg overflow-hidden">
                                    <img src="https://i.imgur.com/gK2xQ0u.png" alt="Vista de la agenda de la aplicación en una tablet" className="w-full h-full object-cover object-left-top"/>
                                </div>
                            </div>
                        </div>
                        {/* Phone Mockup */}
                        <div className="absolute top-1/2 right-0 -translate-y-[40%] w-[35%] max-w-[200px] lg:w-[40%] lg:max-w-none z-20">
                            <div className="relative aspect-[9/16] bg-slate-800 rounded-2xl p-2 border-4 border-slate-700 shadow-2xl transform lg:rotate-3">
                                 <div className="absolute top-4 left-1/2 -translate-x-1/2 h-1 w-8 bg-slate-600 rounded-full z-10"></div>
                                 <div className="bg-slate-900 w-full h-full rounded-lg overflow-hidden">
                                    <img src="https://i.imgur.com/uRk2b8U.png" alt="Vista de la agenda de la aplicación en un móvil" className="w-full h-full object-cover"/>
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
                        <img src="https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Manicurista profesional trabajando en las uñas de una clienta" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-[4/5] overflow-hidden rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                         <img src="https://images.pexels.com/photos/2061820/pexels-photo-2061820.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Barbero detallando un corte de pelo con una navaja" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-[4/5] overflow-hidden rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                         <img src="https://images.pexels.com/photos/3992870/pexels-photo-3992870.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Estilista trabajando en el cabello de una clienta en un salón de belleza luminoso" className="w-full h-full object-cover" />
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
                        <p className="text-4xl font-extrabold text-white my-4">$15 <span className="text-lg font-medium text-slate-400">/mes</span></p>
                        <p className="text-slate-400 mb-6">Ideal para profesionales independientes.</p>
                        <ul className="space-y-3 text-slate-300 flex-grow">
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Agenda y Citas</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Hasta 50 Clientes</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>1 Profesional</li>
                        </ul>
                        <a href="#register-form" className="mt-8 w-full text-center bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors">Empezar ahora</a>
                    </div>
                    {/* Plan Premium */}
                    <div className="bg-slate-800 p-8 rounded-xl border-2 border-purple-500 flex flex-col relative shadow-2xl shadow-purple-500/20">
                         <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">MÁS POPULAR</span>
                         <h3 className="text-xl font-bold text-purple-400">Premium</h3>
                        <p className="text-4xl font-extrabold text-white my-4">$29 <span className="text-lg font-medium text-slate-400">/mes</span></p>
                        <p className="text-slate-400 mb-6">Perfecto para negocios en crecimiento.</p>
                        <ul className="space-y-3 text-slate-300 flex-grow">
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Todo lo del plan Básico</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Pagos y Facturación</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Reportes de Ventas</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Asistente Kandy AI</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Hasta 5 Profesionales</li>
                        </ul>
                        <a href="#register-form" className="mt-8 w-full text-center bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-shadow">Elegir Premium</a>
                    </div>
                    {/* Plan Empresarial */}
                    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex flex-col">
                        <h3 className="text-xl font-bold text-purple-400">Empresarial</h3>
                        <p className="text-4xl font-extrabold text-white my-4">Contacto</p>
                        <p className="text-slate-400 mb-6">Para salones con múltiples locales.</p>
                        <ul className="space-y-3 text-slate-300 flex-grow">
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Todo lo del plan Premium</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Profesionales Ilimitados</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/>Soporte Prioritario</li>
                        </ul>
                        <a href="#register-form" className="mt-8 w-full text-center bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors">Contactar Ventas</a>
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
                        <SalonLogoIcon salonName="Kandy" className="w-8 h-8" />
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
  );
};

export default LandingPage;