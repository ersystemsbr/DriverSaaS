import React, { useState } from 'react';
import { 
  Power, 
  Wallet, 
  TrendingUp, 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Check, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  Car,
  ChevronRight,
  Radio,
  Play
} from 'lucide-react';
import RadarMap from '../components/RadarMap';

export default function DriverDashboard({ driver, setDriver, setActivePage, setCurrentRide }) {
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRide, setIncomingRide] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');

  const isSubActive = driver.subscription_status === 'active';

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 3000);
  };

  const handleToggleOnline = () => {
    if (!isSubActive) {
      showToast('Sua assinatura está inativa. Renove seu plano para ficar online.');
      setActivePage('subscription');
      return;
    }

    const nextState = !isOnline;
    setIsOnline(nextState);
    showToast(nextState ? 'Você está ONLINE! Aguardando chamadas de passageiros...' : 'Você está offline.');
    
    // Auto-simulate an incoming ride when online after 3 seconds if none active
    if (nextState) {
      setTimeout(() => {
        triggerSimulatedRide();
      }, 2500);
    } else {
      setIncomingRide(null);
    }
  };

  const triggerSimulatedRide = () => {
    setIncomingRide({
      id: `ride_${Date.now().toString().slice(-4)}`,
      passenger_name: "Mariana Albuquerque",
      passenger_phone: "(11) 98877-6655",
      origin: "Av. Faria Lima, 3477 - Itaim Bibi, São Paulo",
      destination: "Aeroporto de Congonhas - Embarque",
      distance_km: 7.8,
      duration_min: 20,
      total_price: 38.50,
      payment_method: "Pix Direto",
      date: new Date().toISOString()
    });
  };

  const handleAcceptRide = () => {
    if (!incomingRide) return;
    setCurrentRide(incomingRide);
    setIncomingRide(null);
    showToast('Corrida aceita! Gerando contrato de transporte...');
    setActivePage('ride_in_progress');
  };

  const handleRejectRide = () => {
    setIncomingRide(null);
    showToast('Chamada recusada.');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-24">
      
      {/* Toast Notice */}
      {notificationMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-green-500/50 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Driver Header Profile Banner */}
      <section className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-lg shadow-inner">
              {driver.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">{driver.full_name}</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                  {driver.company_type} • CNPJ Ativo
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                <span>{driver.car_model}</span>
                <span>•</span>
                <span className="font-mono font-semibold text-zinc-300">{driver.car_plate}</span>
              </p>
            </div>
          </div>

          {/* Online Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOnline}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                isOnline
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 shadow-red-500/10'
                  : 'bg-green-500 text-black hover:bg-green-600 shadow-green-500/25 hover:scale-[1.02]'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOnline ? 'FICAR OFFLINE' : 'FICAR ONLINE'}</span>
            </button>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Subscription Status Alert */}
        {!isSubActive ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Sua assinatura está inativa ou expirou</h4>
                <p className="text-xs text-zinc-400">Ative seu plano para receber corridas particulares com taxa 0%.</p>
              </div>
            </div>
            <button
              onClick={() => setActivePage('subscription')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 whitespace-nowrap"
            >
              Ver Planos
            </button>
          </div>
        ) : (
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Assinatura <strong className="text-white">Plano Mensal</strong> ativa até {new Date(driver.subscription_expires_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <button
              onClick={() => setActivePage('subscription')}
              className="text-green-400 hover:text-green-300 font-semibold flex items-center gap-1"
            >
              Gerenciar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Radar Map Simulator */}
        <RadarMap 
          isOnline={isOnline} 
          driverName={driver.full_name} 
          carModel={driver.car_model} 
        />

        {/* Incoming Ride Card Modal Alert */}
        {incomingRide && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-green-500 shadow-2xl shadow-green-500/20 animate-float space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                Nova Corrida Solicitada! (Taxa 0%)
              </span>
              <span className="text-xs text-zinc-400 font-mono">100% seu lucro</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">{incomingRide.passenger_name}</h3>
                <p className="text-xs text-zinc-400">Passageiro Particular de Confiança ★ 4.9</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-green-400">R$ {incomingRide.total_price.toFixed(2)}</span>
                <p className="text-[11px] text-zinc-500">Via {incomingRide.payment_method}</p>
              </div>
            </div>

            <div className="space-y-2 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80 text-xs text-zinc-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Embarque:</span>
                  <p className="text-white font-medium">{incomingRide.origin}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Destino:</span>
                  <p className="text-white font-medium">{incomingRide.destination}</p>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-4 text-[11px] text-zinc-400">
                <span>Distância: <strong className="text-white">{incomingRide.distance_km} km</strong></span>
                <span>•</span>
                <span>Tempo estimado: <strong className="text-white">{incomingRide.duration_min} min</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleRejectRide}
                className="flex-1 py-3.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4 text-red-400" />
                Recusar
              </button>
              
              <button
                onClick={handleAcceptRide}
                className="flex-2 py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-extrabold shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-black stroke-[3px]" />
                ACEITAR CORRIDA
              </button>
            </div>

          </div>
        )}

        {/* Digital Account / Wallet Quick Card */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-zinc-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-green-400" />
              Conta Digital DriverSaaS
            </span>
            <div className="text-3xl font-black text-white">
              R$ {driver.wallet.available_balance.toFixed(2)}
            </div>
            <p className="text-xs text-zinc-400">
              Chave Pix Ativa: <span className="font-mono text-zinc-300">{driver.cnpj}</span> (CNPJ da empresa)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActivePage('wallet')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              Extrato & Pix
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Corridas Hoje</span>
            <span className="text-2xl font-black text-white">{driver.today_rides}</span>
            <span className="text-[10px] text-green-400 block mt-1">+2 vs ontem</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Faturamento Hoje</span>
            <span className="text-2xl font-black text-green-400">R$ {driver.today_earnings.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">100% livre de taxas</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Total Acumulado</span>
            <span className="text-2xl font-black text-white">R$ {(driver.total_earnings / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Total de {driver.total_rides} corridas</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Sua Avaliação</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-white">{driver.rating}</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-[10px] text-zinc-500 block mt-1">Motorista Elite</span>
          </div>

        </div>

        {/* Simulator Helper button for testing */}
        {!incomingRide && isOnline && (
          <div className="text-center pt-2">
            <button
              onClick={triggerSimulatedRide}
              className="text-xs text-zinc-500 hover:text-green-400 underline transition-colors"
            >
              Testar recepção imediata de nova corrida
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
