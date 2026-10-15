import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  Car, 
  Star, 
  ShieldCheck, 
  UserCheck, 
  Radio, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Navigation,
  Loader2,
  X,
  Compass
} from 'lucide-react';
import RealMap from '../components/RealMap';
import { getDeviceLocation, searchAddressNominatim, calculateRealRoute, geocodeAddress } from '../services/mapService';
import { createRideRequest, apiGetFavoriteDrivers, subscribeToRide, updateRideStatus, apiGetDriverProfile } from '../services/supabase';

export default function PassengerHome({ driver, setActivePage, setCurrentRide, currentUser }) {
  const [favoriteDrivers, setFavoriteDrivers] = useState([]);
  
  // GPS e Coordenadas
  const [deviceCoords, setDeviceCoords] = useState({ lat: -23.561684, lng: -46.655981 });
  const [origin, setOrigin] = useState('Av. Paulista, 1578 - Bela Vista, São Paulo');
  const [originCoords, setOriginCoords] = useState({ lat: -23.561684, lng: -46.655981 });
  
  const [destination, setDestination] = useState('Aeroporto de Congonhas - Embarque, São Paulo');
  const [destCoords, setDestCoords] = useState({ lat: -23.627325, lng: -46.656534 });
  
  // Sugestões de Autocomplete
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  // Timers de debounce
  const originTimerRef = useRef(null);
  const destTimerRef = useRef(null);

  // Rota Real (OSRM)
  const [routeData, setRouteData] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Estado de Chamada em Tempo Real
  const [isCalling, setIsCalling] = useState(false);
  const [activeRideId, setActiveRideId] = useState(null);
  const [acceptedDriverInfo, setAcceptedDriverInfo] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [callSuccess, setCallSuccess] = useState(false);

  // 1. Obter GPS real do passageiro no carregamento
  useEffect(() => {
    getDeviceLocation().then((coords) => {
      setDeviceCoords(coords);
      setOriginCoords(coords);
    });
  }, []);

  // 1.1 Carregar motoristas favoritos do Supabase
  useEffect(() => {
    apiGetFavoriteDrivers(currentUser?.id).then(drivers => {
      if (drivers && drivers.length > 0) {
        setFavoriteDrivers(drivers);
      }
    });
  }, [currentUser?.id]);

  // 2. Traçar rota real entre Origem e Destino sempre que as coordenadas mudarem
  useEffect(() => {
    if (originCoords && destCoords && originCoords.lat && destCoords.lat) {
      setIsCalculatingRoute(true);
      calculateRealRoute(originCoords, destCoords).then((res) => {
        setRouteData(res);
        setIsCalculatingRoute(false);
      });
    }
  }, [originCoords?.lat, originCoords?.lng, destCoords?.lat, destCoords?.lng]);

  // 3. Escuta em tempo real da corrida quando o passageiro faz a chamada
  useEffect(() => {
    if (!activeRideId) return;

    const unsubscribe = subscribeToRide(activeRideId, async (updatedRide) => {
      if (updatedRide.status === 'accepted') {
        let driverData = {
          name: updatedRide.driver_name,
          car: updatedRide.driver_car,
          plate: updatedRide.driver_plate,
          phone: updatedRide.driver_phone
        };

        if ((!driverData.name || !driverData.car) && updatedRide.driver_id) {
          try {
            const prof = await apiGetDriverProfile(updatedRide.driver_id);
            if (prof) {
              driverData = {
                name: prof.full_name || driverData.name || 'Motorista Credenciado',
                car: prof.car_model || driverData.car || 'Veículo Particular',
                plate: prof.car_plate || driverData.plate || '---',
                phone: prof.phone || driverData.phone || '',
                razao_social: prof.razao_social,
                cnpj: prof.cnpj
              };
            }
          } catch (e) {}
        }

        setCallSuccess(true);
        setAcceptedDriverInfo({
          name: driverData.name || 'Motorista Credenciado',
          car: driverData.car || 'Veículo Particular',
          plate: driverData.plate || '---',
          phone: driverData.phone || ''
        });

        // Som de confirmação via Web Audio API
        playAcceptedChime();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 400]);
        }

        setTimeout(() => {
          setCurrentRide({
            ...updatedRide,
            origin: updatedRide.origin_address || origin,
            destination: updatedRide.destination_address || destination,
            origin_coords: originCoords,
            dest_coords: destCoords,
            driver_name: driverData.name,
            driver_car: driverData.car,
            driver_plate: driverData.plate,
            driver_phone: driverData.phone,
            company_name: driverData.razao_social,
            cnpj: driverData.cnpj
          });
          setIsCalling(false);
          setActivePage('ride_in_progress');
        }, 2200);
      } else if (updatedRide.status === 'cancelled') {
        setIsCalling(false);
        setActiveRideId(null);
        alert('A chamada foi encerrada ou cancelada.');
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeRideId]);

  const playAcceptedChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { // C5, E5, G5, C6
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } catch (e) {}
  };

  // --- Handlers de Origem com Debounce & Busca Imediata ---
  const handleOriginChange = (e) => {
    const val = e.target.value;
    setOrigin(val);

    if (originTimerRef.current) clearTimeout(originTimerRef.current);

    if (val.trim().length >= 2) {
      setIsSearchingOrigin(true);
      originTimerRef.current = setTimeout(async () => {
        const results = await searchAddressNominatim(val);
        setOriginSuggestions(results);
        setIsSearchingOrigin(false);
      }, 350);
    } else {
      setOriginSuggestions([]);
      setIsSearchingOrigin(false);
    }
  };

  const handleSelectOrigin = (item) => {
    setOrigin(item.short_name);
    setOriginCoords({ lat: item.lat, lng: item.lng });
    setOriginSuggestions([]);
  };

  const handleSearchOriginNow = async () => {
    if (!origin.trim()) return;
    setIsSearchingOrigin(true);
    const item = await geocodeAddress(origin);
    setIsSearchingOrigin(false);
    if (item) {
      handleSelectOrigin(item);
    }
  };

  // --- Handlers de Destino com Debounce & Busca Imediata ---
  const handleDestChange = (e) => {
    const val = e.target.value;
    setDestination(val);

    if (destTimerRef.current) clearTimeout(destTimerRef.current);

    if (val.trim().length >= 2) {
      setIsSearchingDest(true);
      destTimerRef.current = setTimeout(async () => {
        const results = await searchAddressNominatim(val);
        setDestSuggestions(results);
        setIsSearchingDest(false);
      }, 350);
    } else {
      setDestSuggestions([]);
      setIsSearchingDest(false);
    }
  };

  const handleSelectDest = (item) => {
    setDestination(item.short_name);
    setDestCoords({ lat: item.lat, lng: item.lng });
    setDestSuggestions([]);
  };

  const handleSearchDestNow = async () => {
    if (!destination.trim()) return;
    setIsSearchingDest(true);
    const item = await geocodeAddress(destination);
    setIsSearchingDest(false);
    if (item) {
      handleSelectDest(item);
    }
  };

  // Usar GPS atual como origem
  const handleUseCurrentGPS = async () => {
    const coords = await getDeviceLocation();
    setDeviceCoords(coords);
    setOriginCoords(coords);
    setOrigin('Minha Localização Atual (GPS)');
    setOriginSuggestions([]);
  };

  // Cálculo de Preço (Base + Preço/Km da Tabela do Motorista)
  const distanceKm = routeData?.distanceKm || 8.5;
  const durationMin = routeData?.durationMin || 22;
  const estimatedPrice = (driver?.base_price || 6.00) + (distanceKm * (driver?.price_per_km || 2.80));

  // Solicitar Corrida (Despacho Realtime e Notificação do Motorista)
  const handleStartDispatch = async () => {
    setIsCalling(true);
    setCallSuccess(false);
    setAcceptedDriverInfo(null);
    setCountdown(45);

    // 1. Cria a corrida no Supabase / Canal em Tempo Real
    const ride = await createRideRequest({
      passenger_name: currentUser?.name || "Mariana Albuquerque",
      passenger_phone: currentUser?.phone || "(11) 98877-6655",
      origin_address: origin,
      destination_address: destination,
      distance_km: distanceKm,
      duration_min: durationMin,
      total_price: estimatedPrice,
      payment_method: "Pix Direto",
      origin_coords: originCoords,
      dest_coords: destCoords
    });

    if (ride && ride.id) {
      setActiveRideId(ride.id);
    }

    // 2. Temporizador de contagem regressiva
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelDispatch = async () => {
    if (activeRideId) {
      await updateRideStatus(activeRideId, 'cancelled');
    }
    setIsCalling(false);
    setActiveRideId(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-24 max-w-2xl mx-auto space-y-6">
      
      {/* Inputs com Busca Real e Resposta Imediata no Mapa (Acima do Mapa) */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        {/* Título do Card de Endereços */}
        <div className="pb-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Para onde você vai hoje?
          </h1>
        </div>
        
        <div className="space-y-4 relative">
          
          {/* Ponto de Partida (Origem) */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-green-400" />
                Ponto de Partida (Embarque)
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Ponto A</span>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={origin}
                onChange={handleOriginChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchOriginNow(); }}
                placeholder="Ex: Av. Paulista, 1578 ou nome do local..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 pr-16 transition-colors"
              />

              <div className="absolute right-1.5 flex items-center gap-1">
                {isSearchingOrigin ? (
                  <Loader2 className="w-4 h-4 text-green-400 animate-spin mr-2" />
                ) : (
                  <button
                    type="button"
                    onClick={handleSearchOriginNow}
                    title="Buscar e Atualizar no Mapa"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-green-400 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sugestões de Origem */}
            {originSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden divide-y divide-zinc-800 max-h-52 overflow-y-auto">
                {originSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOrigin(item)}
                    className="w-full text-left px-4 py-2.5 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span className="truncate">{item.short_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Atalhos Rápidos de Origem */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={handleUseCurrentGPS}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-green-400 transition-colors flex items-center gap-1"
              >
                <Navigation className="w-2.5 h-2.5 text-green-400" />
                Meu GPS
              </button>
              <button
                type="button"
                onClick={() => handleSelectOrigin({ short_name: 'Av. Paulista, 1578 - Bela Vista, São Paulo', lat: -23.561684, lng: -46.655981 })}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                Av. Paulista
              </button>
              <button
                type="button"
                onClick={() => handleSelectOrigin({ short_name: 'Av. Brig. Faria Lima, 3477 - Itaim Bibi, São Paulo', lat: -23.586612, lng: -46.682613 })}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                Faria Lima
              </button>
            </div>
          </div>

          {/* Destino Final */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Destino Final
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Ponto B</span>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={destination}
                onChange={handleDestChange}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchDestNow(); }}
                placeholder="Ex: Aeroporto, Shopping, Bairro..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 pr-16 transition-colors"
              />

              <div className="absolute right-1.5 flex items-center gap-1">
                {isSearchingDest ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin mr-2" />
                ) : (
                  <button
                    type="button"
                    onClick={handleSearchDestNow}
                    title="Buscar e Atualizar no Mapa"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-400 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sugestões de Destino */}
            {destSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden divide-y divide-zinc-800 max-h-52 overflow-y-auto">
                {destSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDest(item)}
                    className="w-full text-left px-4 py-2.5 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{item.short_name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Atalhos Rápidos de Destino */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleSelectDest({ short_name: 'Aeroporto de Congonhas - Embarque, São Paulo', lat: -23.627325, lng: -46.656534 })}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                ✈️ Congonhas
              </button>
              <button
                type="button"
                onClick={() => handleSelectDest({ short_name: 'Shopping Ibirapuera - Moema, São Paulo', lat: -23.610214, lng: -46.666872 })}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                🛍️ Ibirapuera
              </button>
              <button
                type="button"
                onClick={() => handleSelectDest({ short_name: 'Aeroporto Internacional de Guarulhos (GRU)', lat: -23.435555, lng: -46.473055 })}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                ✈️ GRU
              </button>
              <button
                type="button"
                onClick={() => handleSelectDest({ short_name: 'Terminal Rodoviário Tietê, São Paulo', lat: -23.516245, lng: -46.624792 })}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                🚌 Tietê
              </button>
            </div>
          </div>
        </div>

        {/* Resumo da Rota Calculada em Tempo Real */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-zinc-400">
            {isCalculatingRoute ? (
              <span className="flex items-center gap-1.5 text-green-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Atualizando rota no mapa...
              </span>
            ) : (
              <>
                <span>Distância: <strong className="text-white">{distanceKm} km</strong></span>
                <span>•</span>
                <span>Tempo: <strong className="text-white">~{durationMin} min</strong></span>
              </>
            )}
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-green-400">R$ {estimatedPrice.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 block">Preço Fechado PJ (0% Taxa)</span>
          </div>
        </div>

      </div>

      {/* MAPA REAL LEAFLET COM ROTA (Abaixo do Card de Endereços) */}
      <div className="relative">
        <RealMap
          center={[originCoords?.lat || deviceCoords.lat, originCoords?.lng || deviceCoords.lng]}
          zoom={13}
          originCoords={originCoords}
          destCoords={destCoords}
          routeCoordinates={routeData?.coordinates}
          height="280px"
        />

        <button
          onClick={handleUseCurrentGPS}
          className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs font-semibold text-green-400 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          Usar Meu GPS
        </button>
      </div>

      {/* Cascata de Motoristas Favoritos */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Seus Motoristas de Confiança (Despacho em Cascata)
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            O chamado toca diretamente no celular do motorista via conexão em tempo real.
          </p>
        </div>

        <div className="space-y-2.5">
          {favoriteDrivers.length > 0 ? (
            favoriteDrivers.map((fav) => (
              <div
                key={fav.id}
                className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center ${
                    fav.priority === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    #{fav.priority}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      {fav.name}
                      {fav.priority === 1 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-green-500/20 text-green-400 font-bold">
                          Preferencial
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-zinc-400">{fav.car} • {fav.company || 'PJ Credenciado'}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {fav.rating || '5.0'}
                  </span>
                  <span className="text-[10px] text-green-400 block font-medium">~{fav.eta_min || 5} min</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center text-xs text-zinc-400">
              <Car className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
              <span>Nenhum motorista favorito cadastrado ainda. A chamada tocará para os motoristas online da região.</span>
            </div>
          )}
        </div>

        {/* Botão de Solicitação ou Painel de Chamada Ativa */}
        {!isCalling ? (
          <button
            onClick={handleStartDispatch}
            className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-black text-sm font-extrabold shadow-xl shadow-green-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
          >
            <Car className="w-5 h-5 text-black stroke-[2.5px]" />
            SOLICITAR TRANSPORTE PARTICULAR
          </button>
        ) : (
          <div className="p-6 rounded-3xl bg-zinc-900 border-2 border-green-500 shadow-2xl text-center space-y-4 animate-fade-in">
            
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Chamando motoristas online via Supabase Realtime...</span>
            </div>

            <div className="text-3xl font-black text-white font-mono tracking-wider">
              00:{countdown.toString().padStart(2, '0')}
            </div>

            <p className="text-xs text-zinc-300 max-w-sm mx-auto">
              O toque foi enviado para o celular do motorista. Assim que ele aceitar, sua tela abrirá a rota automaticamente.
            </p>

            {callSuccess && acceptedDriverInfo ? (
              <div className="p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-2xl text-sm font-bold flex flex-col items-center justify-center gap-2 animate-bounce">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{acceptedDriverInfo.name} aceitou sua corrida!</span>
                </div>
                <span className="text-xs text-zinc-300 font-normal">
                  Veículo: {acceptedDriverInfo.car} ({acceptedDriverInfo.plate}) • Abrindo viagem...
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCancelDispatch}
                className="px-5 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Cancelar Chamado
              </button>
            )}

          </div>
        )}

      </div>

      {/* Escudo Jurídico Info */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div>
          <strong className="text-white">Segurança Jurídica:</strong> Todo trajeto tem contrato emitido com base no Código Civil Brasileiro.
        </div>
      </div>

    </div>
  );
}
