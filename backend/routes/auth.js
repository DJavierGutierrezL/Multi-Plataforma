import React, { useState, useEffect } from "react";
import { User } from "../types";

interface LoginProps {
  onLogin: (user: User, token: string) => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
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

const Login: React.FC<LoginProps> = ({
  onLogin,
  theme,
  onThemeChange,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Usar la URL de tu backend
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:10000"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al iniciar sesión");
      }

      const data = await res.json();
      // data esperado desde el backend:
      // { id, name, email, role, token }

      const user: User = {
        id: data.id,
        firstName: data.name,  // usamos name en lugar de firstName/lastName
        lastName: "",
        email: data.email,
        role: data.role,
      };

      // Guardar token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      // Notificar al padre
      onLogin(user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <p id="title-Tag-Line">Ingresa tu correo y contraseña</p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="entry email"
              autoComplete="email"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="entry name"
              autoComplete="current-password"
              required
            />

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onBackToLanding();
              }}
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              &larr; Volver a la página principal
            </a>
          </p>
        </div>
        <div className="shadow"></div>
      </div>
    </section>
  );
};

export default Login;
