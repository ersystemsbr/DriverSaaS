import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  User,
  ArrowRight
} from 'lucide-react';
import RideContractModal from '../components/RideContractModal';
import RealMap from '../components/RealMap';
import { updateRideStatus, apiCreateContract, apiDepositPix, subscribeToRide } from '../services/supabase';

export default function RideInProgress({ 
  currentRide, 
  driver, 
  setDriver, 
  setRidesHistory, 
  setActivePage, 
  currentRole = 'driver', 
  currentUser 
}) {
  const isDriver = currentRole === 'driver';
  const isPassenger = currentRole === 'passenger';

  const [rideStage, setRideStage] = useState(
    currentRide?.status === 'in_progress' ? 'in_trip' : 'on_the_way'
  );
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(currentRide?.payment_method || 'Pix Direto');
  const [isFinished, setIsFinished] = useState(currentRide?.status === 'completed');

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

  // Resolução segura dos dados do Motorista
  const activeDriver = isDriver ? (driver || {
    full_name: 'Motorista Credenciado',
    car_model: 'Veículo Executivo',
    car_plate: 'Placa Particular',
    phone: '',
    company_type: 'PJ',
    razao_social: 'Motorista PJ',
    cnpj: '00.000.000/0001-00'
  }) : {
    full_name: currentRide?.driver_name || 'Motorista Particular',
    car_model: currentRide?.driver_car || 'Veículo Particular',
    car_plate: currentRide?.driver_plate || 'Placa Particular',
    phone: currentRide?.driver_phone || '',
    company_type: 'PJ',
    razao_social: currentRide?.company_name || 'Transporte Individual Privado',
    cnpj: currentRide?.cnpj || '00.000.000/0001-00'
  };

  const passengerName = currentRide?.passenger_name || currentUser?.name || 'Mariana Albuquerque';
  const passengerPhone = currentRide?.passenger_phone || currentUser?.phone || '(11) 98877-6655';

  // Coordenadas para o mapa
  const originCoords = currentRide?.origin_coords || { lat: -23.561684, lng: -46.655981 };
  const destCoords = currentRide?.dest_coords || { lat: -23.610214, lng: -46.666872 };

  // Sincronização em tempo real entre Celular do Passageiro e Celular do Motorista
  useEffect(() => {
    if (!ride.id) return;

    const unsubscribe = subscribeToRide(ride.id, (updatedRide) => {
      if (updatedRide.status === 'in_progress') {
        setRideStage('in_trip');
      } else if (updatedRide.status === 'completed') {
        setRideStage('completed');
        setIsFinished(true);
      } else if (updatedRide.status === 'cancelled') {
        alert('A viagem foi cancelada.');
        setActivePage(isPassenger ? 'passenger_home' : 'driver_dashboard');
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [ride.id, isPassenger, setActivePage]);

  const handleOpenGoogleMaps = () => {
    const dest = encodeURIComponent(rideStage === 'on_the_way' ? (ride.origin_address || ride.origin) : (ride.destination_address || ride.destination));
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
  };

  const handleOpenWaze = () => {
    const dest = encodeURIComponent(rideStage === 'on_the_way' ? (ride.origin_address || ride.origin) : (ride.destination_address || ride.destination));
    window.open(`https://waze.com/ul?q=${dest}`, '_blank');
  };

  // Motorista inicia viagem com o passageiro a bordo
  const handleDriverSetInTrip = async () => {
    setRideStage('in_trip');
    if (ride.id) {
      await updateRideStatus(ride.id, 'in_progress');
    }
  };

  // Contato Motorista -> Passageiro via WhatsApp
  const handleShareWhatsAppDriver = () => {
    const text = encodeURIComponent(
      `Olá! Aqui é ${activeDriver.full_name}, seu motorista particular no DriverSaaS.\n` +
      `Veículo: ${activeDriver.car_model} (${activeDriver.car_plate})\n` +
      `Contrato Jurídico nº ${ride.contract_number}\n` +
      `Acompanhe nossa rota com total segurança!`
    );
    window.open(`https://api.whatsapp.com/send?phone=55${passengerPhone.replace(/\D/g, '')}&text=${text}`, '_blank');
  };

  // Contato Passageiro -> Motorista via WhatsApp
  const handleShareWhatsAppPassenger = () => {
    const text = encodeURIComponent(
      `Olá ${activeDriver.full_name}! Sou ${passengerName}, seu passageiro no DriverSaaS.\n` +
      `Estou no local de embarque: ${ride.origin_address || ride.origin}.`
    );
    const phoneClean = (activeDriver.phone || '').replace(/\D/g, '');
    if (phoneClean) {
      window.open(`https://api.whatsapp.com/send?phone=55${phoneClean}&text=${text}`, '_blank');
    } else {
      alert(`Telefone do motorista: ${activeDriver.phone || 'Cadastrado no app'}`);
    }
  };

  // Motorista finaliza a corrida e emite o contrato PJ
  const handleCompleteRide = async () => {
    const contractNum = ride.contract_number || `DS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const completedRide = {
      ...ride,
      contract_number: contractNum,
      payment_method: paymentMethod,
      date: new Date().toISOString(),
      status: 'completed',
      company_name: activeDriver?.razao_social || 'Motorista PJ',
      cnpj: activeDriver?.cnpj || '00.000.000/0001-00'
    };

    try {
      if (ride.id) {
        await updateRideStatus(ride.id, 'completed', {
          driver_id: activeDriver?.id,
          total_price: completedRide.total_price
        });
        await apiCreateContract(completedRide, activeDriver || {});
        if (driver?.wallet?.id) {
          await apiDepositPix(driver.wallet.id, completedRide.total_price);
        }
      }
    } catch (err) {
      console.warn('Erro ao sincronizar finalização no Supabase:', err);
    }

    // 100% repasse direto para a carteira do motorista
    if (setDriver) {
      setDriver(prev => {
        const prevWallet = prev?.wallet || { available_balance: 0, pending_balance: 0, pix_keys: [], transactions: [] };
        return {
          ...prev,
          today_rides: (prev?.today_rides || 0) + 1,
          today_earnings: (prev?.today_earnings || 0) + completedRide.total_price,
          total_rides: (prev?.total_rides || 0) + 1,
          total_earnings: (prev?.total_earnings || 0) + completedRide.total_price,
          wallet: {
            ...prevWallet,
            available_balance: (prevWallet.available_balance || 0) + completedRide.total_price,
            transactions: [
              {
                id: `tx_${Date.now().toString().slice(-4)}`,
                type: 'credit_ride',
                title: `Recebimento Corrida #${contractNum} (${passengerName})`,
                amount: completedRide.total_price,
                date: new Date().toISOString(),
                status: 'completed',
                method: paymentMethod
              },
              ...(prevWallet.transactions || [])
            ]
          }
        };
      });
    }

    if (setRidesHistory) {
      setRidesHistory(prev => [completedRide, ...(prev || [])]);
    }

    setIsFinished(true);

    setTimeout(() => {
      setActivePage('driver_dashboard');
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-24 max-w-2xl mx-auto space-y-6">
      
      {/* Header com Status e Contrato Jurídico */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {isFinished ? 'Viagem Finalizada' : 'Corrida Particular em Andamento'}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            {isFinished 
              ? 'Destino Alcançado'
              : rideStage === 'on_the_way' 
                ? (isDriver ? 'A Caminho do Passageiro' : 'Motorista a Caminho')
                : 'Viagem em Andamento'}
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

      {/* Rota no Mapa Real Leaflet */}
      <RealMap 
        height="230px"
        isOnline={true}
        originCoords={originCoords}
        destCoords={destCoords}
      />

      {/* Etapas do Trajeto */}
      {isDriver ? (
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
            onClick={handleDriverSetInTrip}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              rideStage === 'in_trip' 
                ? 'bg-green-500 text-black shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            2. Passageiro a Bordo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-center text-xs font-bold">
          <div className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            rideStage === 'on_the_way' 
              ? 'bg-zinc-800 text-green-400 border border-green-500/30' 
              : 'text-zinc-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${rideStage === 'on_the_way' ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`} />
            1. Motorista a Caminho
          </div>
          <div className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            rideStage === 'in_trip' 
              ? 'bg-green-500 text-black shadow-md' 
              : 'text-zinc-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${rideStage === 'in_trip' ? 'bg-black animate-pulse' : 'bg-zinc-600'}`} />
            2. Viagem em Andamento
          </div>
        </div>
      )}

      {/* Cartão de Identificação da Outra Parte */}
      {isDriver ? (
        // Perspectiva do Motorista (Vê dados do Passageiro)
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-lg">
                {passengerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{passengerName}</h3>
                <p className="text-xs text-zinc-400">{passengerPhone} • Cliente Particular</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-green-400">R$ {parseFloat(ride.total_price).toFixed(2)}</span>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">100% Taxa Zero</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => window.open(`tel:${passengerPhone.replace(/\D/g, '')}`)}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-green-400" />
              Ligar para Passageiro
            </button>

            <button
              onClick={handleShareWhatsAppDriver}
              className="py-2.5 px-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-xs font-bold text-green-400 flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp & Rota
            </button>
          </div>
        </div>
      ) : (
        // Perspectiva do Passageiro (Vê dados do Motorista e Veículo)
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-lg">
                {activeDriver.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{activeDriver.full_name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 font-bold">
                    PJ Credenciado
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {activeDriver.car_model} • Placa <strong className="text-white font-mono">{activeDriver.car_plate}</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-green-400">R$ {parseFloat(ride.total_price).toFixed(2)}</span>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Valor Fechado</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                const phone = (activeDriver.phone || '').replace(/\D/g, '');
                if (phone) window.open(`tel:${phone}`);
                else alert('Telefone disponível via chat/WhatsApp');
              }}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-green-400" />
              Ligar para Motorista
            </button>

            <button
              onClick={handleShareWhatsAppPassenger}
              className="py-2.5 px-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-xs font-bold text-green-400 flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp do Motorista
            </button>
          </div>
        </div>
      )}

      {/* Rota e Detalhes de Endereço */}
      <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Ponto de Embarque</span>
              <p className="text-xs font-medium text-white">{ride.origin_address || ride.origin}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500">Destino Final</span>
              <p className="text-xs font-medium text-white">{ride.destination_address || ride.destination}</p>
            </div>
          </div>
        </div>

        {/* GPS Navigation Links (Acesso fácil para ambos) */}
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

      {/* Caixa de Finalização / Pagamento (Diferenciada por Perfil) */}
      {isDriver ? (
        // Painel do Motorista
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
      ) : (
        // Painel do Passageiro
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4 text-center">
          {isFinished ? (
            <div className="space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Viagem Concluída!</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Pagamento de <strong className="text-green-400 font-bold">R$ {parseFloat(ride.total_price).toFixed(2)}</strong> via {ride.payment_method || 'Pix Direto'}.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsContractOpen(true)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-xs font-bold text-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Scale className="w-4 h-4 text-green-400" />
                  Ver Contrato Digital
                </button>

                <button
                  onClick={() => setActivePage('passenger_home')}
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                >
                  SOLICITAR NOVA VIAGEM
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Viagem com Escudo Jurídico Ativo</span>
              </div>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Contrato registrado eletronicamente no padrão Código Civil Brasileiro. Pagamento direto ao motorista PJ.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Oficial de Contrato Jurídico */}
      <RideContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        ride={ride}
        driver={activeDriver}
      />

    </div>
  );
}
