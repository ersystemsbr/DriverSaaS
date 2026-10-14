import React from 'react';
import { LayoutDashboard, Wallet, CreditCard, History, User } from 'lucide-react';

export default function BottomNav({ activePage, setActivePage, currentRole }) {
  if (currentRole !== 'driver') return null;

  const navItems = [
    { id: 'driver_dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'wallet', label: 'Carteira', icon: Wallet },
    { id: 'subscription', label: 'Planos', icon: CreditCard },
    { id: 'ride_history', label: 'Histórico', icon: History },
    { id: 'driver_profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-lg border-t border-zinc-800 pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
                isActive ? 'text-green-500 font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-green-500/15' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
