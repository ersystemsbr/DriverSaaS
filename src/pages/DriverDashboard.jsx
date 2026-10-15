import React, { useState, useEffect } from 'react';
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
  Play,
  Navigation
} from 'lucide-react';
import RealMap from '../components/RealMap';
import { getDeviceLocation } from '../services/mapService';
import { subscribeToNewRides, updateRideStatus } from '../services/supabase';

export default function DriverDashboard({ 
  driver, 
  setDriver, 
  setActivePage, 
  setCurrentRide,
  isOnline: propIsOnline,
  setIsOnline: propSetIsOnline
}) {
  const [internalOnline, setInternalOnline] = useState(false);
  const isOnline = propIsOnline !== undefined ? propIsOnline : internalOnline;
  const setIsOnline = propSetIsOnline !== undefined ? propSetIsOnline : setInternalOnline;

  const [incomingRide, setIncomingRide] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [driverCoords, setDriverCoords] = useState({ lat: -23.561684, lng: -46.655981 });

  const isSubActive = driver?.subscription_status === 'active';

  // Áudio Context e Ringtone Contínuo (Toca até o motorista atender)
  const audioCtxRef = React.useRef(null);
  const ringIntervalRef = React.useRef(null);

  const initAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch (e) {}
  };

  const playChimeBurst = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const now = ctx.currentTime;
      // 3 tons harmônicos energéticos (Toque de Chamada do DriverSaaS)
      const freqs = [659.25, 880.00, 1174.66]; // E5, A5, D6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.45, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.3);
      });

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([350, 150, 350, 150, 450]);
      }
    } catch (e) {}
  };

  const startRinging = () => {
    playChimeBurst();
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    ringIntervalRef.current = setInterval(() => {
      playChimeBurst();
    }, 1400);
  };

  const stopRinging = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopRinging();
  }, []);

  // 1. Detectar GPS real do motorista no carregamento
  useEffect(() => {
    getDeviceLocation().then((coords) => {
      setDriverCoords(coords);
    });
  }, []);

  // 2. Escutar chamadas de passageiros em tempo real quando estiver online
  useEffect(() => {
    if (!isOnline) {
      stopRinging();
      setIncomingRide(null);
      return;
    }

    const unsubscribe = subscribeToNewRides((newRide) => {
      setIncomingRide({
        id: newRide.id || `ride_${Date.now()}`,
        contract_number: newRide.contract_number,
        passenger_name: newRide.passenger_name || "Passageiro Particular",
        passenger_phone: newRide.passenger_phone || "(11) 98877-6655",
        origin: newRide.origin_address || newRide.origin,
        destination: newRide.destination_address || newRide.destination,
        distance_km: parseFloat(newRide.distance_km || 8.5),
        duration_min: parseInt(newRide.duration_min || 20, 10),
        total_price: parseFloat(newRide.total_price || 42.00),
        payment_method: newRide.payment_method || "Pix Direto",
        date: newRide.created_at || newRide.date || new Date().toISOString()
      });

      // Começa a tocar repetidamente no celular
      startRinging();
    });

    return () => {
      stopRinging();
      if (unsubscribe) unsubscribe();
    };
  }, [isOnline]);

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 3000);
  };

  const handleToggleOnline = async () => {
    initAudio(); // Desbloqueia o áudio imediatamente com o clique do usuário

    if (!isSubActive) {
      showToast('Sua assinatura está inativa. Renove seu plano para ficar online.');
      setActivePage('subscription');
      return;
    }

    const nextState = !isOnline;
    setIsOnline(nextState);

    if (nextState) {
      const coords = await getDeviceLocation();
      setDriverCoords(coords);
      showToast('Você está ONLINE! Aguardando chamadas com alerta sonoro ativado...');
    } else {
      stopRinging();
      setIncomingRide(null);
      showToast('Você está offline.');
    }
  };

  const triggerSimulatedRide = () => {
    initAudio();
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
    startRinging();
  };

  const handleAcceptRide = async () => {
    if (!incomingRide) return;
    stopRinging();

    const acceptedRide = {
      ...incomingRide,
      status: 'accepted',
      driver_id: driver?.id,
      driver_name: driver?.full_name,
      driver_car: driver?.car_model,
      driver_plate: driver?.car_plate,
      driver_phone: driver?.phone,
      company_name: driver?.razao_social,
      cnpj: driver?.cnpj
    };

    // 1. Atualiza no Supabase para que o celular do passageiro receba o aceite
    try {
      await updateRideStatus(incomingRide.id, 'accepted', {
        driver_id: driver?.id,
        driver_name: driver?.full_name,
        driver_car: driver?.car_model,
        driver_plate: driver?.car_plate,
        driver_phone: driver?.phone,
        company_name: driver?.razao_social,
        cnpj: driver?.cnpj
      });
    } catch (e) {
      console.warn('Erro ao atualizar aceite da corrida no Supabase:', e);
    }

    setCurrentRide(acceptedRide);
    setIncomingRide(null);
    showToast('Corrida aceita! Abrindo rota de navegação...');
    setActivePage('ride_in_progress');
  };

  const handleRejectRide = () => {
    stopRinging();
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
      <section className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Botão Online/Offline menor e na frente dos dados do motorista */}
            <button
              onClick={handleToggleOnline}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md flex-shrink-0 active:scale-95 ${
                isOnline
                  ? 'bg-green-500 text-black shadow-green-500/25 hover:bg-green-400'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
              title={isOnline ? 'Clique para ficar Offline' : 'Clique para ficar Online'}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-black animate-pulse' : 'bg-zinc-600'}`} />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs sm:text-sm shadow-inner flex-shrink-0">
              {(driver?.full_name || 'MO').slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[220px]">
                  {driver?.full_name || 'Motorista'}
                </h2>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/30">
                  {driver?.company_type || 'PJ'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {driver?.car_model || 'Veículo'} • <span className="font-mono text-zinc-300">{driver?.car_plate || '---'}</span>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 space-y-5">

        {/* MAPA REAL LEAFLET COM RADAR E GPS (Altura Expandida) */}
        <div className="space-y-2">
          <RealMap 
            center={[driverCoords.lat, driverCoords.lng]}
            driverCoords={driverCoords}
            isOnline={isOnline}
            zoom={14}
            height="380px"
          />

          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-green-400" />
              GPS: {driverCoords.lat.toFixed(4)}, {driverCoords.lng.toFixed(4)}
            </span>
            <span>Status: <strong className={isOnline ? "text-green-400" : "text-zinc-500"}>{isOnline ? "Aguardando Passageiros" : "Desconectado"}</strong></span>
          </div>
        </div>

        {/* Incoming Ride Card Modal Alert */}
        {incomingRide && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-green-500 shadow-2xl shadow-green-500/20 animate-float space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                Nova Corrida em Tempo Real!
              </span>
              <span className="text-xs text-zinc-400 font-mono">100% Taxa Zero</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">{incomingRide.passenger_name}</h3>
                <p className="text-xs text-zinc-400">{incomingRide.passenger_phone} • Cliente Particular</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-green-400">R$ {parseFloat(incomingRide.total_price).toFixed(2)}</span>
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

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Corridas Hoje</span>
            <span className="text-2xl font-black text-white">{driver?.today_rides || 0}</span>
            <span className="text-[10px] text-green-400 block mt-1">Viagens realizadas</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Faturamento Hoje</span>
            <span className="text-2xl font-black text-green-400">R$ {(driver?.today_earnings || 0).toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">100% livre de taxas</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Total Acumulado</span>
            <span className="text-2xl font-black text-white">R$ {((driver?.total_earnings || 0) / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Total de {driver?.total_rides || 0} corridas</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Sua Avaliação</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-white">{driver?.rating || 5.0}</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-[10px] text-zinc-500 block mt-1">Motorista Credenciado</span>
          </div>

        </div>

        {/* Botão de teste rápido de recebimento */}
        {!incomingRide && isOnline && (
          <div className="text-center pt-2">
            <button
              onClick={triggerSimulatedRide}
              className="text-xs text-zinc-500 hover:text-green-400 underline transition-colors"
            >
              Testar alerta sonoro de nova chamada
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
