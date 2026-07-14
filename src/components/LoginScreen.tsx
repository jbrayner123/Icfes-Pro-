import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Shield, UserPlus, KeyRound, ArrowRight, UserCheck, Eye, EyeOff, Award } from "lucide-react";
import { motion } from "motion/react";
import { getStoredUsers, saveUsers } from "../data/userStorage";

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync with server on mount
  useEffect(() => {
    getStoredUsers();
  }, []);

  const getLocalUsers = (): User[] => {
    const stored = localStorage.getItem("engiexam_users");
    return stored ? JSON.parse(stored) : [];
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      setError("Por favor, rellena todos los campos.");
      return;
    }

    const users = getLocalUsers();

    if (isRegisterMode) {
      // Sign Up / Register mode
      const existingUser = users.find(u => u.username === cleanUsername);
      if (existingUser) {
        setError("Este nombre de usuario ya existe. Elige otro o inicia sesión.");
        return;
      }

      const newUser: User = {
        username: cleanUsername,
        password: password,
        role: cleanUsername === "admin" ? "admin" : "user", // Let admin be administrative
        createdAt: new Date().toISOString(),
        scores: {}
      };

      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      
      setSuccessMsg("¡Usuario creado con éxito! Iniciando sesión...");
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1000);
    } else {
      // Login mode
      const user = users.find(u => u.username === cleanUsername && u.password === password);
      if (!user) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }

      setSuccessMsg("¡Bienvenido al simulador!");
      setTimeout(() => {
        onLoginSuccess(user);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 antialiased font-inter text-brand-ink">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-brand-ink text-brand-bg mb-4 border border-brand-ink">
            <Award className="w-7 h-7 text-brand-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-brand-ink">Pro Icfes</h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-brand-ink/60 mt-1">Simulador de Competencias Pro Icfes</p>
        </div>

        {/* Card Body */}
        <div className="bg-white border border-brand-ink/15 p-6 sm:p-8 rounded-none">
          <h2 className="text-lg font-display font-bold uppercase tracking-wide text-brand-ink mb-1">
            {isRegisterMode ? "Crear Cuenta Nueva" : "Ingresar al Simulador"}
          </h2>
          <p className="text-xs text-brand-ink/60 mb-6 font-inter">
            {isRegisterMode 
              ? "Registra tus credenciales para guardar tu progreso y puntajes." 
              : "Inicia sesión para continuar tu entrenamiento."}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Username Input */}
            <div>
              <label htmlFor="input-username" className="block text-[10px] font-display font-bold text-brand-ink uppercase tracking-widest mb-1.5">
                Nombre de Usuario
              </label>
              <div className="relative">
                <input
                  id="input-username"
                  type="text"
                  placeholder="ej. brayner123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-bg/50 border border-brand-ink/15 rounded-none text-sm focus:outline-none focus:border-brand-ink transition-all font-medium text-brand-ink"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-ink/40">
                  <UserPlus className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="input-password" className="block text-[10px] font-display font-bold text-brand-ink uppercase tracking-widest mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="input-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-brand-bg/50 border border-brand-ink/15 rounded-none text-sm focus:outline-none focus:border-brand-ink transition-all font-medium text-brand-ink"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-ink/40">
                  <KeyRound className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-ink/40 hover:text-brand-ink transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Feedback messages */}
            {error && (
              <div className="p-3 bg-brand-accent/5 border border-brand-accent/20 text-brand-accent rounded-none text-xs font-mono uppercase tracking-wider">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-brand-bg border border-brand-ink/20 text-brand-ink rounded-none text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 shrink-0 text-brand-accent" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-auth-submit"
              type="submit"
              className="w-full py-3.5 px-4 bg-brand-ink hover:bg-brand-ink/95 text-brand-bg font-display font-bold text-xs uppercase tracking-wider rounded-none transition-all flex items-center justify-center gap-2 border border-brand-ink"
            >
              <span>{isRegisterMode ? "Crear Cuenta e Ingresar" : "Iniciar Sesión"}</span>
              <ArrowRight className="w-4 h-4 text-brand-accent" />
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="mt-6 pt-5 border-t border-brand-ink/10 text-center">
            <button
              id="btn-toggle-auth-mode"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError("");
                setSuccessMsg("");
              }}
              className="text-xs font-display font-bold uppercase tracking-wider text-brand-accent hover:underline transition-all focus:outline-none"
            >
              {isRegisterMode 
                ? "¿Ya tienes una cuenta? Iniciar sesión" 
                : "¿No tienes una cuenta? Crear cuenta nueva"}
            </button>
          </div>
        </div>

        {/* Credentials Tip Panel */}
        <div className="mt-4 bg-brand-bg border border-brand-ink/15 rounded-none p-4">
          <div className="flex gap-3">
            <Shield className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-wide text-brand-ink">Acceso Rápido Administrador</p>
              <p className="text-[11px] text-brand-ink/70 leading-relaxed font-inter mt-1">
                Ingresa con <span className="font-bold font-mono bg-brand-ink/5 px-1 py-0.5 border border-brand-ink/10 text-brand-ink">usuario: admin</span> y <span className="font-bold font-mono bg-brand-ink/5 px-1 py-0.5 border border-brand-ink/10 text-brand-ink">contraseña: admin</span> para ver las puntuaciones de todos los estudiantes registrados.
              </p>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
