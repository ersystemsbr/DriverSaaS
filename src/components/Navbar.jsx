import React, { useState, useEffect } from 'react';
import { Shield, Car, User, Settings, Wallet, LogOut, LogIn, KeyRound, Database } from 'lucide-react';
import { testSupabaseConnection, isSupabaseConfigured } from '../services/supabase';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  activePage, 
  setActivePage, 
  driver, 
  currentUser, 
  onLogout,
  onOpenSupabaseConfig,
  isDriverOnline,
  onToggleDriverOnline
}) {
  const [isSecretOpen, setIsSecretOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isConnected, setIsConnected] = useState(isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;
    testSupabaseConnection().then(res => {
      if (mounted) {
        setIsConnected(Boolean(res?.success));
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleAdminAccess = (e) => {
    e.preventDefault();
    if (adminPin === 'admin2026' || adminPin === '8844') {
      setIsSecretOpen(false);
      setAdminPin('');
      setCurrentRole('admin');
      setActivePage('admin_dashboard');
    } else {
      setAdminError('Código incorreto.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div 
          onClick={() => {
            if (currentUser) {
              if (currentRole === 'driver') setActivePage('driver_dashboard');
              else if (currentRole === 'passenger') setActivePage('passenger_home');
              else setActivePage('admin_dashboard');
            } else {
              setActivePage('home');
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5 text-black stroke-[2.2px]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white leading-tight block">Driver<span className="text-green-500">SaaS</span></span>
            {currentUser && (
              <span className="text-[11px] font-medium text-zinc-400 leading-none block mt-0.5">
                {currentRole === 'passenger' ? 'Passageiro' : currentRole === 'driver' ? 'Motorista' : 'Administrador'}
              </span>
            )}
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Botão Online/Offline no Topo no lugar do Conectado (apenas para Motorista) */}
          {currentUser && currentRole === 'driver' && (
            <button
              onClick={onToggleDriverOnline}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md flex-shrink-0 active:scale-95 ${
                isDriverOnline
                  ? 'bg-green-500 text-black shadow-green-500/25 hover:bg-green-400'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
              title={isDriverOnline ? 'Clique para ficar Offline' : 'Clique para ficar Online'}
            >
              <span className={`w-2 h-2 rounded-full ${isDriverOnline ? 'bg-black animate-pulse' : 'bg-zinc-600'}`} />
              <span>{isDriverOnline ? 'Online' : 'Offline'}</span>
            </button>
          )}

          {/* Admin diagnostic status */}
          {currentRole === 'admin' && onOpenSupabaseConfig && (
            <button
              onClick={onOpenSupabaseConfig}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-[11px] text-zinc-300 transition-colors"
              title="Status & Configuração Supabase (Admin)"
            >
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                {isConnected ? 'Supabase OK' : 'Supabase Off'}
              </span>
            </button>
          )}
          
          {/* Se logado como Admin: badge explicativo */}
          {currentUser && currentRole === 'admin' && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Painel Admin
            </span>
          )}

          {/* Usuário Logado vs Deslogado */}
          {currentUser ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-semibold text-zinc-300 hover:text-red-400 transition-all shadow-sm active:scale-95"
              title="Sair da Conta"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sair</span>
            </button>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-bold shadow-md shadow-green-500/20 transition-all"
            >
              <LogIn className="w-4 h-4 text-black" />
              <span>Entrar</span>
            </button>
          )}

        </div>

      </div>

      {/* Secret Admin Pin Modal */}
      {isSecretOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Acesso Restrito Admin</h3>
            </div>
            <p className="text-xs text-zinc-400">Digite a chave de segurança master para gerenciar a plataforma.</p>
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
              {adminError && <p className="text-xs text-red-400 text-center">{adminError}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSecretOpen(false)}
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
    </header>
  );
}
