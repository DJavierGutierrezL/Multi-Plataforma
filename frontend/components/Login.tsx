import React, { useState } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onBackToLanding: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const KandyTitleAnimation = () => (
    <div className="kandy-title-box">
        <div className="title-anim">
            <span className="block"></span>
            <h1>Kandy AI.</h1>
        </div>
        <div className="role">
            <span className="block"></span>
            <p>Asistente Virtual</p>
        </div>
    </div>
);

const Login: React.FC<LoginProps> = ({ onLogin, onBackToLanding }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await onLogin(username.trim(), password);
        } catch (err: any) {
            setError('Credenciales inválidas.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0b1120] to-[#1a2333] p-4 text-white">
            <div className="absolute top-8 left-8">
                <KandyTitleAnimation />
            </div>

            <div className="max-w-md w-full">
                <div className="form-bounce">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200/50">
                        <h2 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h2>
                        <p className="text-center text-gray-500 text-sm mt-2 mb-6">Ingresa tus credenciales para continuar</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                            <button
                                type="submit"
                                className="w-full text-white font-bold py-3 mt-4 rounded-lg shadow-md bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    </div>
                    <div className="shadow-bounce"></div>
                </div>

                <div className="text-center mt-8">
                    <button 
                        onClick={onBackToLanding}
                        className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center justify-center mx-auto"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Volver a la página principal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;