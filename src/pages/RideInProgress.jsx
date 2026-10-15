import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Share2, 
  CheckCircle2, 
  Scale, 
  ExternalLink, 
  Car, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';
import RideContractModal from '../components/RideContractModal';
import RealMap from '../components/RealMap';

export default function RideInProgress({ currentRide, driver, setDriver, setRidesHistory, setActivePage }) {
  const [rideStage, setRideStage] = useState('on_the_way'); // 'on_the_way', 'in_trip', 'completed'
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Pix Direto');
  const [isFinished, setIsFinished] = useState(false);

  const ride = currentRide || {
    id: "ride_curr",
    contract_number: "DS-2026-9041",
    passenger_name: "Mariana Albuquerque",
    passenger_phone: "(11) 98877-6655",
    origin: "Av. Faria Lima, 3477 - Itaim Bibi, São Paulo",
    destination: "Aeroporto de Congonhas - Embarque",
    distance_km: 7.8,
    duration_min: 20,
    total_price: 38.50,
    payment_method: "Pix Direto",
    date: new Date().toISOString()
  };

  const handleOpenGoogleMaps = () => {
    const dest = encodeURIComponent(rideStage === 'on_the_way' ? ride.origin : ride.destination);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
  };

  const handleOpenWaze = () => {
    const dest = encodeURIComponent(rideStage === 'on_the_way' ? ride.origin : ride.destination);
    window.open(`https://waze.com/ul?q=${dest}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Aqui é ${driver.full_name}, seu motorista particular no DriverSaaS.\n` +
      `Veículo: ${driver.car_model} (${driver.car_plate})\n` +
      `Contrato Jurídico nº ${ride.contract_number}\n` +
      `Acompanhe nossa rota com total segurança!`
    );
    window.open(`https://api.whatsapp.com/send?phone=55${ride.passenger_phone.replace(/\D/g, '')}&text=${text}`, '_blank');
  };

  const handleCompleteRide = () => {
    const contractNum = `DS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const completedRide = {
      ...ride,
      contract_number: contractNum,
      payment_method: paymentMethod,
      date: new Date().toISOString(),
      status: 'completed',
      company_name: driver.razao_social,
      cnpj: driver.cnpj
    };

    // Credit full amount (100% driver revenue, 0% commission)
    setDriver(prev => ({
      ...prev,
      today_rides: prev.today_rides + 1,
      today_earnings: prev.today_earnings + completedRide.total_price,
      total_rides: prev.total_rides + 1,
      total_earnings: prev.total_earnings + completedRide.total_price,
      wallet: {
        ...prev.wallet,
        available_balance: prev.wallet.available_balance + completedRide.total_price,
        transactions: [
          {
            id: `tx_${Date.now().toString().slice(-4)}`,
            type: 'credit_ride',
            title: `Recebimento Corrida #${contractNum} (${completedRide.passenger_name})`,
            amount: completedRide.total_price,
            date: new Date().toISOString(),
            status: 'completed',
            method: paymentMethod
          },
          ...prev.wallet.transactions
        ]
      }
    }));

    setRidesHistory(prev => [completedRide, ...prev]);
    setIsFinished(true);

    setTimeout(() => {
      setActivePage('driver_dashboard');
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-24 max-w-2xl mx-auto space-y-6">
      
      {/* Header with Contract Number Badge */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Corrida Particular em Andamento
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            {rideStage === 'on_the_way' ? 'A Caminho do Passageiro' : 'Viagem em Andamento'}
          </h1>
        </div>

        <button
          onClick={() => setIsContractOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-green-500/40 text-xs text-green-400 font-semibold hover:bg-zinc-800 transition-colors shadow-md shadow-green-500/10"
        >
          <Scale className="w-3.5 h-3.5" />
          Ver Contrato PJ
        </button>
      </div>

      {/* Rota no Mapa Real */}
      <RealMap 
        height="220px"
        isOnline={true}
        originCoords={{ lat: -23.561684, lng: -46.655981 }}
        destCoords={{ lat: -23.610214, lng: -46.666872 }}
      />

      {/* Trip Stage Progress */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
        <button
          onClick={() => setRideStage('on_the_way')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            rideStage === 'on_the_way' 
              ? 'bg-zinc-800 text-white shadow-md' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          1. Indo ao Embarque
        </button>
        <button
          onClick={() => setRideStage('in_trip')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            rideStage === 'in_trip' 
              ? 'bg-green-500 text-black shadow-md' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          2. Passageiro a Bordo
        </button>
      </div>

      {/* Passenger Card */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-lg">
              {ride.passenger_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{ride.passenger_name}</h3>
              <p className="text-xs text-zinc-400">{ride.passenger_phone} • Cliente Particular</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-black text-green-400">R$ {parseFloat(ride.total_price).toFixed(2)}</span>
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">100% Taxa Zero</p>
          </div>
        </div>

        {/* Quick Contact & WhatsApp Share */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => window.open(`tel:${ride.passenger_phone.replace(/\D/g, '')}`)}
            className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-4 h-4 text-green-400" />
            Ligar para Passageiro
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-xs font-bold text-green-400 flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp & Rota
          </button>
        </div>

      </div>

      {/* Route & GPS Card */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Ponto de Embarque</span>
              <p className="text-xs font-medium text-white">{ride.origin}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Destino Final</span>
              <p className="text-xs font-medium text-white">{ride.destination}</p>
            </div>
          </div>
        </div>

        {/* GPS Navigation Links */}
        <div className="pt-2 border-t border-zinc-800/80 flex gap-3">
          <button
            onClick={handleOpenGoogleMaps}
            className="flex-1 py-3 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Navigation className="w-4 h-4 text-blue-400" />
            Navegar via Google Maps
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </button>

          <button
            onClick={handleOpenWaze}
            className="flex-1 py-3 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Navigation className="w-4 h-4 text-cyan-400" />
            Navegar via Waze
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </button>
        </div>

      </div>

      {/* Completion & Payment Confirmation Box */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        <h3 className="font-bold text-white text-sm">Recebimento Direto (Taxa Zero)</h3>

        <div className="flex gap-2">
          {['Pix Direto', 'Dinheiro', 'Cartão Máquina'].map((m) => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                paymentMethod === m
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {isFinished ? (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-center space-y-1 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Corrida Concluída com Sucesso!</h4>
            <p className="text-xs text-zinc-400">Contrato digital registrado e saldo creditado na sua carteira.</p>
          </div>
        ) : (
          <button
            onClick={handleCompleteRide}
            className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-black text-sm font-black shadow-xl shadow-green-500/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5px]" />
            FINALIZAR CORRIDA & EMITIR CONTRATO
          </button>
        )}

      </div>

      {/* Official Legal Contract Modal */}
      <RideContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        ride={ride}
        driver={driver}
      />

    </div>
  );
}
