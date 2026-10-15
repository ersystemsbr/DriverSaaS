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
  Navigation,
  LogOut
} from 'lucide-react';
import RealMap from '../components/RealMap';
import { getDeviceLocation, reverseGeocode, calculateMultiPointRoute, geocodeAddress } from '../services/mapService';
import { subscribeToNewRides, updateRideStatus } from '../services/supabase';

export default function DriverDashboard({ 
  driver, 
  setDriver, 
  setActivePage, 
  setCurrentRide,
  isOnline: propIsOnline,
  setIsOnline: propSetIsOnline,
  onLogout
}) {
  const [internalOnline, setInternalOnline] = useState(false);
  const isOnline = propIsOnline !== undefined ? propIsOnline : internalOnline;
  const setIsOnline = propSetIsOnline !== undefined ? propSetIsOnline : setInternalOnline;

  const [incomingRide, setIncomingRide] = useState(null);
  const [incomingRouteCoords, setIncomingRouteCoords] = useState(null);
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
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch (e) {}
  };

  // Desbloqueia áudio no primeiro clique ou toque do motorista na tela
  useEffect(() => {
    const unlockAudio = () => {
      initAudio();
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
    };
  }, []);

  const playChimeBurst = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

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
      const orig = newRide.origin_address || newRide.origin;
      setIncomingRide({
        id: newRide.id || `ride_${Date.now()}`,
        contract_number: newRide.contract_number,
        passenger_name: newRide.passenger_name,
        passenger_phone: newRide.passenger_phone,
        origin: orig || "Endereço de Embarque",
        destination: newRide.destination_address || newRide.destination || "Destino Final",
        distance_km: parseFloat(newRide.distance_km || 8.5),
        duration_min: parseInt(newRide.duration_min || 20, 10),
        total_price: parseFloat(newRide.total_price || 42.00),
        payment_method: newRide.payment_method || "Pix Direto",
        origin_coords: newRide.origin_coords,
        dest_coords: newRide.dest_coords,
        date: newRide.created_at || newRide.date || new Date().toISOString()
      });

      if (orig && (orig.includes('GPS') || orig.includes('Localização')) && newRide.origin_coords) {
        reverseGeocode(newRide.origin_coords).then((addr) => {
          if (addr) {
            setIncomingRide(prev => prev ? { ...prev, origin: addr } : null);
          }
        });
      }

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
      setIncomingRouteCoords(null);
      showToast('Você está offline.');
    }
  };

  // Traçar rota multi-ponto (Motorista -> Embarque -> Destino Final) quando houver chamada
  useEffect(() => {
    if (!incomingRide) {
      setIncomingRouteCoords(null);
      return;
    }

    let isMounted = true;

    const resolveIncomingRoute = async () => {
      let orig = incomingRide.origin_coords;
      let dest = incomingRide.dest_coords;

      if (!orig && incomingRide.origin) {
        const geoO = await geocodeAddress(incomingRide.origin);
        if (geoO) {
          orig = { lat: geoO.lat, lng: geoO.lng };
        }
      }
      if (!dest && incomingRide.destination) {
        const geoD = await geocodeAddress(incomingRide.destination);
        if (geoD) {
          dest = { lat: geoD.lat, lng: geoD.lng };
        }
      }

      if (orig && dest && isMounted) {
        const points = [
          driverCoords,
          orig,
          dest
        ];
        const res = await calculateMultiPointRoute(points);
        if (res && res.coordinates && isMounted) {
          setIncomingRouteCoords(res.coordinates);
        }
      }
    };

    resolveIncomingRoute();

    return () => {
      isMounted = false;
    };
  }, [incomingRide?.id, incomingRide?.origin, incomingRide?.destination, driverCoords.lat, driverCoords.lng]);

  const triggerSimulatedRide = () => {
    initAudio();
    setIncomingRide({
      id: `ride_${Date.now().toString().slice(-4)}`,
      origin: "Av. Brig. Faria Lima, 3477 - Itaim Bibi, São Paulo",
      destination: "Aeroporto de Congonhas - Embarque, São Paulo",
      origin_coords: { lat: -23.586612, lng: -46.682613 },
      dest_coords: { lat: -23.627325, lng: -46.656534 },
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
    setIncomingRouteCoords(null);

    const acceptedRide = {
      ...incomingRide,
      status: 'accepted',
      passenger_name: incomingRide.passenger_name || 'Passageiro Particular',
      passenger_phone: incomingRide.passenger_phone || '',
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
    setIncomingRouteCoords(null);
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

      {/* Main Content Area (Direto abaixo do topo) */}
      <main className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 space-y-4">

        {/* MAPA REAL LEAFLET COM RADAR, GPS E ROTA DA CHAMADA (Altura Expandida) */}
        <div className="space-y-2">
          <RealMap 
            center={[driverCoords.lat, driverCoords.lng]}
            driverCoords={driverCoords}
            isOnline={isOnline}
            originCoords={incomingRide?.origin_coords}
            destCoords={incomingRide?.dest_coords}
            routeCoordinates={incomingRouteCoords}
            zoom={14}
            height="450px"
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
        {incomingRide && (() => {
          const ridePrice = parseFloat(incomingRide.total_price || 0);
          const rideDistance = parseFloat(incomingRide.distance_km || 0);
          const rideDuration = parseInt(incomingRide.duration_min || 0, 10);
          const pricePerKm = rideDistance > 0 ? (ridePrice / rideDistance) : 0;
          const pricePerHour = rideDuration > 0 ? (ridePrice / (rideDuration / 60)) : 0;

          return (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-2 border-green-500 shadow-2xl shadow-green-500/25 animate-float space-y-4">
              
              {/* Topo da Chamada: Tag e Forma de Pagamento */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  Nova Chamada em Tempo Real
                </span>
                <span className="text-xs text-zinc-400 font-medium px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
                  {incomingRide.payment_method || 'Pix Direto'}
                </span>
              </div>

              {/* Valor da Corrida Aumentado e Centralizado */}
              <div className="text-center py-2 space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-green-400 tracking-tight">
                  R$ {ridePrice.toFixed(2)}
                </div>
                {/* Ganho por Km e Ganho por Hora */}
                <div className="text-xs sm:text-sm font-semibold text-zinc-300 flex items-center justify-center gap-2">
                  <span className="text-emerald-400 font-bold">R$ {pricePerKm.toFixed(2)}/km</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-emerald-400 font-bold">R$ {pricePerHour.toFixed(2)}/h</span>
                </div>
              </div>

              {/* Endereço de Embarque e Destino */}
              <div className="space-y-3 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 text-xs text-zinc-300">
                
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                  <span>Distância da rota: <strong className="text-white text-xs">{incomingRide.distance_km} km</strong></span>
                  <span>Tempo estimado: <strong className="text-white text-xs">~{incomingRide.duration_min} min</strong></span>
                </div>

                {/* Local de Embarque com Endereço em Destaque */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Embarque</span>
                    <p className="text-white font-semibold text-xs sm:text-sm break-words">
                      {incomingRide.origin || 'Endereço de Embarque'}
                    </p>
                  </div>
                </div>

                {/* Destino */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Destino</span>
                    <p className="text-white font-semibold text-xs sm:text-sm break-words">
                      {incomingRide.destination || 'Destino a definir'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Botões Cancelar e Aceitar no Mesmo Tamanho */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleRejectRide}
                  className="flex-1 py-3.5 rounded-2xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-red-400 text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <X className="w-4 h-4 text-red-400" />
                  <span>Cancelar</span>
                </button>
                
                <button
                  onClick={handleAcceptRide}
                  className="flex-1 py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-black text-sm font-black shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 hover:scale-[1.01]"
                >
                  <Check className="w-4 h-4 text-black stroke-[3px]" />
                  <span>ACEITAR</span>
                </button>
              </div>

            </div>
          );
        })()}

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
