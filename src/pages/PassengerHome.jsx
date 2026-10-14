import React, { useState } from 'react';
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
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { INITIAL_FAVORITE_DRIVERS } from '../data/mockData';

export default function PassengerHome({ driver, setActivePage, setCurrentRide }) {
  const [origin, setOrigin] = useState('Av. Paulista, 1578 - Bela Vista, São Paulo');
  const [destination, setDestination] = useState('Shopping Ibirapuera - Moema, São Paulo');
  const [estimatedKm, setEstimatedKm] = useState(8.5);
  const [estimatedDuration, setEstimatedDuration] = useState(22);
  const [selectedDriverOption, setSelectedDriverOption] = useState('favorite_cascade'); // 'favorite_cascade', 'first_only', 'broadcast'
  
  // Waterfall Dispatch State
  const [isCalling, setIsCalling] = useState(false);
  const [dispatchStage, setDispatchStage] = useState(0); // 0: idle, 1: calling fav 1, 2: calling fav 2, 3: broadcast
  const [countdown, setCountdown] = useState(15);
  const [callSuccess, setCallSuccess] = useState(false);

  const estimatedPrice = (driver.base_price || 6.00) + (estimatedKm * (driver.price_per_km || 2.80));

  const handleStartDispatch = () => {
    setIsCalling(true);
    setDispatchStage(1);
    setCountdown(12);

    // Simulated Cascade Timer
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
        passenger_name: "Você (Passageiro)",
        passenger_phone: "(11) 99123-4567",
        origin,
        destination,
        distance_km: estimatedKm,
        duration_min: estimatedDuration,
        total_price: estimatedPrice,
        payment_method: "Pix Direto",
        date: new Date().toISOString()
      });
      setIsCalling(false);
      setDispatchStage(0);
      setActivePage('ride_in_progress');
    }, 1800);
  };

  const handleNextInWaterfall = () => {
    if (dispatchStage === 1) {
      setDispatchStage(2);
      setCountdown(10);
    } else if (dispatchStage === 2) {
      setDispatchStage(3);
      setCountdown(8);
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
          Chame seu motorista de confiança com contrato jurídico e preço justo sem taxa de app.
        </p>
      </div>

      {/* Origin and Destination Form */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        <div className="space-y-3">
          <div>
            <label className="text-[11px] uppercase font-bold text-zinc-400 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-green-400" />
              Ponto de Partida
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-zinc-400 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Destino
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Calculation Overview */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Distância: <strong className="text-white">{estimatedKm} km</strong></span>
            <span>•</span>
            <span>Tempo: <strong className="text-white">~{estimatedDuration} min</strong></span>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-green-400">R$ {estimatedPrice.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 block">Preço fechado</span>
          </div>
        </div>

      </div>

      {/* Motorista Preferencial / Cascata de Favoritos Section */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Seus Motoristas Favoritos (Em Cascata)
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Se o 1º não puder atender, o sistema chama o 2º automaticamente.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {INITIAL_FAVORITE_DRIVERS.map((fav) => (
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
                  <p className="text-[11px] text-zinc-400">{fav.car} • {fav.rides_with_passenger} viagens com você</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {fav.rating}
                </span>
                <span className="text-[10px] text-green-400 block font-medium">~{fav.eta_min} min</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dispatch Action */}
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
              Aguardando confirmação do motorista. Se o tempo expirar, a chamada avança na lista em cascata.
            </p>

            {/* Test Simulation Controls */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleSimulateAcceptFav1}
                className="px-4 py-2 rounded-xl bg-green-500 text-black font-extrabold text-xs shadow-md"
              >
                Simular Aceite do Motorista
              </button>

              <button
                onClick={handleNextInWaterfall}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-700"
              >
                Pular para Próximo na Cascata
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
          <strong className="text-white">Segurança Total:</strong> Você viaja com motoristas com CNPJ regularizado e contrato formal de transporte emitido pelo Código Civil.
        </div>
      </div>

    </div>
  );
}
