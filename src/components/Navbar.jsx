import React, { useState } from 'react';
import { Shield, Car, User, Settings, Wallet, LogOut, LogIn, KeyRound } from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  activePage, 
  setActivePage, 
  driver, 
  currentUser, 
  onLogout 
}) {
  const [isSecretOpen, setIsSecretOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');

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
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white">Driver<span className="text-green-500">SaaS</span></span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/30 rounded-md">
                PJ Shield
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none">Taxa Zero • Contrato Eletrônico</p>
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          
          {/* Se logado como motorista: mostra o saldo */}
          {currentUser && currentRole === 'driver' && (
            <button
              onClick={() => setActivePage('wallet')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-green-500/40 text-xs font-medium text-white transition-colors"
            >
              <Wallet className="w-4 h-4 text-green-400" />
              <span className="hidden sm:inline text-zinc-400">Saldo:</span>
              <span className="font-bold text-green-400">
                R$ {(driver?.wallet?.available_balance ?? driver?.wallet_balance ?? 0).toFixed(2)}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentRole === 'driver') setActivePage('driver_profile');
                  else if (currentRole === 'admin') setActivePage('admin_dashboard');
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-white"
                title="Meu Perfil"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                  {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline font-medium text-zinc-300 max-w-[120px] truncate">
                  {currentUser.name}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition-colors"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
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
