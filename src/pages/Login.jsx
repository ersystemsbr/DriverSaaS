import React, { useState } from 'react';
import { Car, User, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

export default function Login({ 
  onLogin, 
  setActivePage, 
  setCurrentRole, 
  initialRole = 'driver' 
}) {
  const [role, setRole] = useState(initialRole); // 'driver' | 'passenger'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Acesso Secreto Admin
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [isSecretAdminModalOpen, setIsSecretAdminModalOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Preencha seu e-mail e senha.');
      return;
    }

    // Login normal
    onLogin({
      email,
      role,
      name: role === 'driver' ? 'Carlos Alberto Silva' : 'Mariana Albuquerque'
    });

    if (role === 'driver') {
      setCurrentRole('driver');
      setActivePage('driver_dashboard');
    } else {
      setCurrentRole('passenger');
      setActivePage('passenger_home');
    }
  };

  // Gatilho secreto: 5 cliques no texto da versão ou no ícone do cadeado
  const handleSecretTrigger = () => {
    const nextCount = secretClickCount + 1;
    setSecretClickCount(nextCount);
    if (nextCount >= 5) {
      setIsSecretAdminModalOpen(true);
      setSecretClickCount(0);
    }
  };

  const handleAdminAccess = (e) => {
    e.preventDefault();
    // PIN Secreto do Admin: 'admin2026' ou '8844'
    if (adminPin === 'admin2026' || adminPin === '8844') {
      setIsSecretAdminModalOpen(false);
      setAdminPin('');
      setCurrentRole('admin');
      setActivePage('admin_dashboard');
    } else {
      setAdminError('Código de segurança incorreto.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-center px-4 py-12 max-w-md mx-auto">
      
      {/* Brand Logo */}
      <div className="text-center mb-8">
        <div 
          onClick={() => setActivePage('home')}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-400 text-black mb-3 shadow-xl shadow-green-500/20 cursor-pointer"
        >
          <Car className="w-8 h-8 text-black stroke-[2.2px]" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Acessar Driver<span className="text-green-500">SaaS</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {role === 'driver' ? 'Portal do Motorista Profissional' : 'Portal do Passageiro'}
        </p>
      </div>

      {/* Role Selector Tabs (Motorista ou Passageiro) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => {
            setRole('driver');
            setErrorMsg('');
          }}
          className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            role === 'driver'
              ? 'bg-green-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" />
          Sou Motorista
        </button>

        <button
          type="button"
          onClick={() => {
            setRole('passenger');
            setErrorMsg('');
          }}
          className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            role === 'passenger'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Sou Passageiro
        </button>
      </div>

      {/* Login Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">E-mail ou Telefone</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={role === 'driver' ? 'carlos@exemplo.com ou (11) 9...' : 'mariana@exemplo.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white pl-10 focus:outline-none focus:border-green-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">Senha de Acesso</label>
              <button 
                type="button" 
                onClick={() => alert('Instruções de recuperação foram enviadas para seu e-mail/WhatsApp.')}
                className="text-[11px] text-green-400 hover:underline"
              >
                Esqueci a senha
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white pl-10 focus:outline-none focus:border-green-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
              role === 'driver'
                ? 'bg-green-500 hover:bg-green-600 text-black shadow-green-500/20'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
            }`}
          >
            <span>Entrar na Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Register CTA */}
        <div className="pt-4 border-t border-zinc-800/80 text-center">
          <p className="text-xs text-zinc-400">
            Ainda não tem cadastro?{' '}
            <button
              onClick={() => {
                if (role === 'driver') {
                  setActivePage('onboarding');
                } else {
                  setActivePage('register_passenger');
                }
              }}
              className="text-white font-bold underline hover:text-green-400 transition-colors"
            >
              Criar Conta {role === 'driver' ? 'de Motorista' : 'de Passageiro'}
            </button>
          </p>
        </div>

      </div>

      {/* Secret Admin Access Trigger (Discreto no rodapé) */}
      <div className="mt-8 text-center text-xs text-zinc-600 select-none">
        <span 
          onClick={handleSecretTrigger} 
          className="cursor-pointer hover:text-zinc-500 transition-colors py-1 px-2"
          title="Segurança"
        >
          DriverSaaS • Sistema de Mobilidade Segura v1.0
        </span>
      </div>

      {/* Secret Admin Pin Modal */}
      {isSecretAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center gap-2.5 text-amber-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Acesso Restrito Admin</h3>
            </div>
            
            <p className="text-xs text-zinc-400">
              Digite a chave de segurança master para acessar o Painel Gerencial.
            </p>

            <form onSubmit={handleAdminAccess} className="space-y-3">
              <input
                type="password"
                autoFocus
                placeholder="PIN Secreto (ex: admin2026)"
                value={adminPin}
                onChange={(e) => {
                  setAdminPin(e.target.value);
                  setAdminError('');
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center text-sm font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
              />

              {adminError && (
                <p className="text-xs text-red-400 text-center">{adminError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSecretAdminModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-md"
                >
                  Desbloquear
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
