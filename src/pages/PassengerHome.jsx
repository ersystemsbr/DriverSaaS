import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import RealMap from '../components/RealMap';
import { getDeviceLocation, searchAddressNominatim, calculateRealRoute } from '../services/mapService';
import { createRideRequest, apiGetFavoriteDrivers } from '../services/supabase';

export default function PassengerHome({ driver, setActivePage, setCurrentRide, currentUser }) {
  const [favoriteDrivers, setFavoriteDrivers] = useState([]);
  
  // GPS e Coordenadas
  const [deviceCoords, setDeviceCoords] = useState({ lat: -23.561684, lng: -46.655981 });
  const [origin, setOrigin] = useState('Av. Paulista, 1578 - Bela Vista, São Paulo');
  const [originCoords, setOriginCoords] = useState({ lat: -23.561684, lng: -46.655981 });
  
  const [destination, setDestination] = useState('Shopping Ibirapuera - Moema, São Paulo');
  const [destCoords, setDestCoords] = useState({ lat: -23.610214, lng: -46.666872 });
  
  // Sugestões de Autocomplete
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  // Rota Real (OSRM)
  const [routeData, setRouteData] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Waterfall Dispatch State
  const [isCalling, setIsCalling] = useState(false);
  const [dispatchStage, setDispatchStage] = useState(0); // 0: idle, 1: calling fav 1, 2: calling fav 2, 3: broadcast
  const [countdown, setCountdown] = useState(15);
  const [callSuccess, setCallSuccess] = useState(false);

  // 1. Obter GPS real do passageiro no carregamento
  useEffect(() => {
    getDeviceLocation().then((coords) => {
      setDeviceCoords(coords);
      setOriginCoords(coords);
    });
  }, []);

  // 1.1 Carregar motoristas reais do Supabase
  useEffect(() => {
    apiGetFavoriteDrivers(currentUser?.id).then(drivers => {
      if (drivers && drivers.length > 0) {
        setFavoriteDrivers(drivers);
      }
    });
  }, [currentUser?.id]);

  // 2. Traçar rota real entre Origem e Destino sempre que as coordenadas mudarem
  useEffect(() => {
    if (originCoords && destCoords) {
      setIsCalculatingRoute(true);
      calculateRealRoute(originCoords, destCoords).then((res) => {
        setRouteData(res);
        setIsCalculatingRoute(false);
      });
    }
  }, [originCoords, destCoords]);

  // Busca de endereço de Origem
  const handleOriginChange = async (e) => {
    const val = e.target.value;
    setOrigin(val);
    if (val.length >= 3) {
      setIsSearchingOrigin(true);
      const results = await searchAddressNominatim(val);
      setOriginSuggestions(results);
      setIsSearchingOrigin(false);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleSelectOrigin = (item) => {
    setOrigin(item.short_name);
    setOriginCoords({ lat: item.lat, lng: item.lng });
    setOriginSuggestions([]);
  };

  // Busca de endereço de Destino
  const handleDestChange = async (e) => {
    const val = e.target.value;
    setDestination(val);
    if (val.length >= 3) {
      setIsSearchingDest(true);
      const results = await searchAddressNominatim(val);
      setDestSuggestions(results);
      setIsSearchingDest(false);
    } else {
      setDestSuggestions([]);
    }
  };

  const handleSelectDest = (item) => {
    setDestination(item.short_name);
    setDestCoords({ lat: item.lat, lng: item.lng });
    setDestSuggestions([]);
  };

  // Usar GPS atual como origem
  const handleUseCurrentGPS = async () => {
    const coords = await getDeviceLocation();
    setDeviceCoords(coords);
    setOriginCoords(coords);
    setOrigin('Minha Localização Atual (GPS)');
  };

  // Cálculo de Preço (Base + Preço/Km da Tabela do Motorista)
  const distanceKm = routeData?.distanceKm || 8.5;
  const durationMin = routeData?.durationMin || 22;
  const estimatedPrice = (driver?.base_price || 6.00) + (distanceKm * (driver?.price_per_km || 2.80));

  // Solicitar Corrida (Despacho Realtime e Cascata)
  const handleStartDispatch = async () => {
    setIsCalling(true);
    setDispatchStage(1);
    setCountdown(15);

    // Cria a corrida no Supabase / Canal em Tempo Real
    await createRideRequest({
      passenger_name: currentUser?.name || "Mariana Albuquerque",
      passenger_phone: currentUser?.phone || "(11) 98877-6655",
      origin_address: origin,
      destination_address: destination,
      distance_km: distanceKm,
      duration_min: durationMin,
      total_price: estimatedPrice,
      payment_method: "Pix Direto"
    });

    // Temporizador de contagem regressiva
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

  const handleSimulateAcceptFav1 = () => {
    setCallSuccess(true);
    setTimeout(() => {
      setCurrentRide({
        id: `ride_${Date.now().toString().slice(-4)}`,
        contract_number: `DS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        passenger_name: currentUser?.name || "Você (Passageiro)",
        passenger_phone: currentUser?.phone || "(11) 99123-4567",
        origin,
        destination,
        distance_km: distanceKm,
        duration_min: durationMin,
        total_price: estimatedPrice,
        payment_method: "Pix Direto",
        date: new Date().toISOString()
      });
      setIsCalling(false);
      setDispatchStage(0);
      setActivePage('ride_in_progress');
    }, 1600);
  };

  const handleNextInWaterfall = () => {
    if (dispatchStage === 1) {
      setDispatchStage(2);
      setCountdown(12);
    } else if (dispatchStage === 2) {
      setDispatchStage(3);
      setCountdown(10);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-24 max-w-2xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="pt-2">
        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
          <UserCheck className="w-4 h-4" />
          Área do Passageiro • Transporte Particular Seguro
        </span>
        <h1 className="text-2xl font-bold text-white mt-0.5">
          Para onde você vai hoje?
        </h1>
        <p className="text-xs text-zinc-400">
          Chame seu motorista de confiança com rota real, contrato jurídico e sem taxas abusivas.
        </p>
      </div>

      {/* MAPA REAL LEAFLET COM ROTA */}
      <div className="relative">
        <RealMap
          center={[deviceCoords.lat, deviceCoords.lng]}
          zoom={13}
          originCoords={originCoords}
          destCoords={destCoords}
          routeCoordinates={routeData?.coordinates}
          height="280px"
        />

        <button
          onClick={handleUseCurrentGPS}
          className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs font-semibold text-green-400 flex items-center gap-1.5 shadow-lg backdrop-blur-md"
        >
          <Navigation className="w-3.5 h-3.5" />
          Usar Meu GPS
        </button>
      </div>

      {/* Inputs com Busca Real e Autocomplete */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        <div className="space-y-3 relative">
          
          {/* Ponto de Partida */}
          <div className="relative">
            <label className="text-[11px] uppercase font-bold text-zinc-400 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-green-400" />
              Ponto de Partida (Embarque)
            </label>
            <div className="relative">
              <input
                type="text"
                value={origin}
                onChange={handleOriginChange}
                placeholder="Digite a rua, bairro ou número..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 pr-8"
              />
              {isSearchingOrigin && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin absolute right-3 top-3" />}
            </div>

            {/* Sugestões de Origem */}
            {originSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden divide-y divide-zinc-800">
                {originSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOrigin(item)}
                    className="w-full text-left px-4 py-2.5 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span className="truncate">{item.short_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destino Final */}
          <div className="relative">
            <label className="text-[11px] uppercase font-bold text-zinc-400 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Destino Final
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={handleDestChange}
                placeholder="Digite o local de destino..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 pr-8"
              />
              {isSearchingDest && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin absolute right-3 top-3" />}
            </div>

            {/* Sugestões de Destino */}
            {destSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden divide-y divide-zinc-800">
                {destSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDest(item)}
                    className="w-full text-left px-4 py-2.5 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{item.short_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calculation Overview em Tempo Real */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-zinc-400">
            {isCalculatingRoute ? (
              <span className="flex items-center gap-1.5 text-green-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Calculando rota real...
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
            <span className="text-[10px] text-zinc-500 block">Preço Fechado PJ</span>
          </div>
        </div>

      </div>

      {/* Cascata de Motoristas Favoritos */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Seus Motoristas de Confiança (Despacho em Cascata)
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            O chamado é enviado primeiro ao seu preferencial. Se não responder, avança na fila.
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
              <span>Nenhum motorista favorito cadastrado ainda. A chamada será enviada para motoristas ativos da região.</span>
            </div>
          )}
        </div>

        {/* Botão de Solicitação ou Painel de Chamada Ativa */}
        {!isCalling ? (
          <button
            onClick={handleStartDispatch}
            className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-black text-sm font-extrabold shadow-xl shadow-green-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <Car className="w-5 h-5 text-black stroke-[2.5px]" />
            SOLICITAR TRANSPORTE PARTICULAR
          </button>
        ) : (
          <div className="p-5 rounded-2xl bg-zinc-900 border-2 border-green-500/50 text-center space-y-3 animate-fade-in">
            
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400">
              <Radio className="w-4 h-4 animate-pulse" />
              {dispatchStage === 1 && "Chamando 1º Preferencial: Carlos Alberto Silva..."}
              {dispatchStage === 2 && "1º ocupado. Chamando 2º Favorito: Fernando Mendonça..."}
              {dispatchStage === 3 && "Favoritos ocupados. Buscando motoristas na região..."}
            </div>

            <div className="text-2xl font-black text-white font-mono">
              00:{countdown.toString().padStart(2, '0')}
            </div>

            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Notificação enviada em tempo real para o celular do motorista.
            </p>

            {/* Test Simulation Controls */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleSimulateAcceptFav1}
                className="px-4 py-2 rounded-xl bg-green-500 text-black font-extrabold text-xs shadow-md"
              >
                Confirmar Viagem (Aceite)
              </button>

              <button
                onClick={handleNextInWaterfall}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-700"
              >
                Pular na Cascata
              </button>
            </div>

            {callSuccess && (
              <div className="p-3 bg-green-500/20 text-green-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                Motorista confirmou a viagem! Abrindo rota...
              </div>
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
