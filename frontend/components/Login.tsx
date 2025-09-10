import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onBackToLanding: () => void;
}

const KandyTitleAnimation = () => (
    <div className="box">
        <div className="title-anim">
            <span className="block"></span>
            <h1>Kandy AI<span></span></h1>
        </div>
        <div className="role">
            <span className="block"></span>
            <p>Asistente Virtual</p>
        </div>
    </div>
);

const Login: React.FC<LoginProps> = ({ onLogin, theme, onThemeChange, onBackToLanding }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin(username.trim(), password);
      // Parent component will handle navigation on successful login
    } catch (err: any) {
      setError(err.message || 'Usuario o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="background w-full h-screen overflow-hidden relative">
        <div className="kandy-container absolute top-8 left-8 z-20">
            <KandyTitleAnimation />
        </div>

        <div className="wrapper">
            <div className="form">
                <h1 className="title">Iniciar Sesión</h1>
                <p id="title-Tag-Line">Ingresa tus credenciales para continuar</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="entry email"
                        autoComplete="username"
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="entry name"
                        autoComplete="current-password"
                        disabled={isLoading}
                    />
                    
                    <div className="h-5 my-2">
                        {error && <p className="error-message">{error}</p>}
                    </div>
                    
                    <button
                        type="submit"
                        className="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p className="mt-4 text-sm text-gray-600">
                    <a href="#" onClick={(e) => { e.preventDefault(); onBackToLanding(); }} className="font-medium text-purple-600 hover:text-purple-500">
                        &larr; Volver a la página principal
                    </a>
                </p>
            </div>
            <div className="shadow"></div>
        </div>

        {/* Kandy Title Animation Styles */}
        <style>{`
            .box { width: 250px; height: auto; position: relative; display: flex; justify-content: center; flex-direction: column; }
            .box .title-anim { width: 100%; position: relative; display: flex; align-items: center; height: 50px; }
            .box .title-anim .block { width: 0%; height: inherit; background: #c026d3; position: absolute; animation: mainBlock 2s cubic-bezier(0.74, 0.06, 0.4, 0.92) forwards; display: flex; }
            .box .title-anim h1 { font-family: 'Poppins'; color: #fff; font-size: 32px; animation: mainFadeIn 2s forwards; animation-delay: 1.6s; opacity: 0; display: flex; align-items: baseline; position: relative; }
            .box .title-anim h1 span { width: 0px; height: 0px; border-radius: 50%; background: #c026d3; animation: popIn 0.8s cubic-bezier(0.74, 0.06, 0.4, 0.92) forwards; animation-delay: 2s; margin-left: 5px; margin-top: -10px; position: absolute; bottom: 13px; right: -12px; }
            .box .role { width: 100%; position: relative; display: flex; align-items: center; height: 30px; margin-top: -10px; }
            .box .role .block { width: 0%; height: inherit; background: #3b82f6; position: absolute; animation: secBlock 2s cubic-bezier(0.74, 0.06, 0.4, 0.92) forwards; animation-delay: 2s; display: flex; }
            .box .role p { animation: secFadeIn 2s forwards; animation-delay: 3.2s; opacity: 0; font-weight: 400; font-family: 'Lato'; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 5px; }
            @keyframes mainBlock { 0% { width: 0%; left: 0; } 50% { width: 100%; left: 0; } 100% { width: 0; left: 100%; } }
            @keyframes secBlock { 0% { width: 0%; left: 0; } 50% { width: 100%; left: 0; } 100% { width: 0; left: 100%; } }
            @keyframes mainFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
            @keyframes popIn { 0% { width: 0px; height: 0px; background: #c026d3; border: 0px solid #ddd; opacity: 0; } 50% { width: 10px; height: 10px; background: #c026d3; opacity: 1; bottom: 45px; } 65% { width: 7px; height: 7px; bottom: 0px; width: 15px; } 80% { width: 10px; height: 10px; bottom: 20px; } 100% { width: 7px; height: 7px; background: #c026d3; border: 0px solid #222; bottom: 13px; } }
            @keyframes secFadeIn { 0% { opacity: 0; } 100% { opacity: 0.5; } }
        `}</style>
        
        {/* Login Form Styles */}
        <style>{`
          .title{
              margin: 0 auto;
              width: 100%;
              text-align: center;
              padding-bottom: 10px;
              font-size: 32px;
              font-weight: bold;
              color: #333;
          }

          #title-Tag-Line{
              font-size: 16px;
              color: #555;
          }

          .wrapper {
              width: 90%;
              max-width: 500px;
              margin: auto;
              position: absolute;
              top: 55%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: 10;
          }

          .form {
              background: rgba(235, 235, 235, 0.95);
              text-align: center; 
              box-shadow: 0px 0px 20px 5px rgba(0,0,0,0.3); 
              border-radius: 10px;  
              width: 100%;
              height: auto;
              min-height: 420px;
              padding: 20px 10px;  
              animation: bounce 1.5s infinite;
              display: flex;
              flex-direction: column;
              justify-content: center;
          }
          
          .form form {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-top: 20px;
          }

          .email {
            background-color: rgba(0, 0, 0, 0.4);
            border-bottom: 5px solid rgba(0, 0, 0, 0.6);
          }
          .email:hover{
            width: 90%;
            max-width: 350px;
          }
          
          .name { 
            background-color: rgba(0, 0, 0, 0.4);
            border-bottom: 5px solid rgba(0, 0, 0, 0.6);
          }
          .name:hover{
            width: 90%;
            max-width: 350px;
          }
          
          .error-message {
            color: #D32F2F;
            font-weight: bold;
          }

          .submit {
              border-radius: 8px;
              padding: 12px;
              width: 180px;
              color: white;
              background-image: linear-gradient(to right, #c026d3, #9333ea);
              border: none;
              margin-top: 10px;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(.25, .8, .25, 1);
              font-weight: bold;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              letter-spacing: 0.5px;
          }
          .submit:hover {
              transform: translateY(-2px) scale(1.05);
              box-shadow: 0 10px 20px rgba(192, 38, 211, 0.2), 0 6px 6px rgba(192, 38, 211, 0.2);
              background-image: linear-gradient(to right, #d946ef, #a855f7);
          }
          .submit:disabled {
            background-image: none;
            background-color: #9ca3af;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          .entry{
            display: block;
            margin: 20px auto;
            padding: 10px;
            border-radius: 5px;
            border: none;
            transition: all 0.5s ease 0s;
            box-shadow: 0px 0px 25px 2px #AAA;
            font-size: 20px;
            color: white;
            width: 80%;
            max-width: 300px;
          }
          
          .entry::placeholder { color: white; opacity: 0.8; }
          .entry::-webkit-input-placeholder { color: white; opacity: 0.8; }
          .entry:-ms-input-placeholder { color: white; opacity: 0.8; }
          .entry::-ms-input-placeholder { color: white; opacity: 0.8; }
          
          .shadow{
            box-shadow: 0px 0px 60px 5px rgba(0,0,0,0.4);
            opacity: 0.5;
            border-radius: 10px;
            width: 100%; 
            height: 20px;
            margin: -20px auto 0 auto;
            animation: shadow 1.5s infinite;
            position: relative;
          }

          @keyframes bounce{
            0%, 100% { transform: translateY(0); }
            50%{ transform: translateY(-10px); }
          }
          @keyframes shadow{
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50%{ transform: scale(0.9); opacity: 0.8; }
          }

          /* --- Mobile Styles --- */
          @media (max-width: 640px) {
            .kandy-container {
              transform: scale(0.7);
              top: 0;
              left: -20px;
            }
            .wrapper {
              width: 95%;
            }
            .form {
              height: auto;
              min-height: 400px;
              padding-top: 10px;
              padding-bottom: 10px;
            }
            .title {
              font-size: 28px;
            }
            .submit {
              margin-top: 15px;
            }
            .entry {
                margin: 15px auto;
            }
          }
        `}</style>
    </section>
  );
};

export default Login;
