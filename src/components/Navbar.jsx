import React from 'react';
import { Shield, Car, User, Settings, Wallet, CheckCircle2 } from 'lucide-react';

export default function Navbar({ currentRole, setCurrentRole, activePage, setActivePage, driver, plans }) {
  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div 
          onClick={() => setActivePage('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white">Driver<span className="text-green-500">SaaS</span></span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/30 rounded-md">
                PJ Shield
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none">Taxa Zero • Escudo Jurídico</p>
          </div>
        </div>

        {/* Role Switcher (Motorista / Passageiro / Admin) */}
        <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => {
              setCurrentRole('driver');
              if (['admin', 'passenger'].includes(currentRole)) setActivePage('driver_dashboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'driver'
                ? 'bg-green-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Motorista
          </button>

          <button
            onClick={() => {
              setCurrentRole('passenger');
              setActivePage('passenger_home');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'passenger'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Passageiro
          </button>

          <button
            onClick={() => {
              setCurrentRole('admin');
              setActivePage('admin_dashboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'admin'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Painel Admin
          </button>
        </div>

        {/* Quick Actions / Balance */}
        <div className="flex items-center gap-2">
          {currentRole === 'driver' && (
            <button
              onClick={() => setActivePage('wallet')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-green-500/40 text-xs font-medium text-white transition-colors"
            >
              <Wallet className="w-4 h-4 text-green-400" />
              <span className="hidden md:inline text-zinc-400">Saldo:</span>
              <span className="font-bold text-green-400">
                R$ {driver.wallet.available_balance.toFixed(2)}
              </span>
            </button>
          )}

          <button
            onClick={() => setActivePage('driver_profile')}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300"
            title="Meu Perfil"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile Role Switcher Bar */}
      <div className="sm:hidden flex border-t border-zinc-800/80 bg-zinc-950 px-2 py-1.5 justify-around">
        <button
          onClick={() => {
            setCurrentRole('driver');
            setActivePage('driver_dashboard');
          }}
          className={`flex-1 py-1 text-center text-xs font-semibold rounded-md ${
            currentRole === 'driver' ? 'bg-green-500 text-black' : 'text-zinc-400'
          }`}
        >
          🚗 Motorista
        </button>
        <button
          onClick={() => {
            setCurrentRole('passenger');
            setActivePage('passenger_home');
          }}
          className={`flex-1 py-1 text-center text-xs font-semibold rounded-md ${
            currentRole === 'passenger' ? 'bg-blue-500 text-white' : 'text-zinc-400'
          }`}
        >
          👤 Passageiro
        </button>
        <button
          onClick={() => {
            setCurrentRole('admin');
            setActivePage('admin_dashboard');
          }}
          className={`flex-1 py-1 text-center text-xs font-semibold rounded-md ${
            currentRole === 'admin' ? 'bg-amber-500 text-black' : 'text-zinc-400'
          }`}
        >
          ⚙️ Admin
        </button>
      </div>
    </header>
  );
}
