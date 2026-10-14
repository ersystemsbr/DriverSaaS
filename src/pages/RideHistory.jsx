import React, { useState } from 'react';
import { History, Scale, MapPin, Calendar, Clock, DollarSign, Filter, CheckCircle2, XCircle } from 'lucide-react';
import RideContractModal from '../components/RideContractModal';

export default function RideHistory({ ridesHistory, driver }) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'cancelled'
  const [selectedRideForContract, setSelectedRideForContract] = useState(null);

  const filteredRides = ridesHistory.filter(ride => {
    if (filterStatus === 'completed') return ride.status === 'completed';
    if (filterStatus === 'cancelled') return ride.status === 'cancelled';
    return true;
  });

  const totalEarnings = ridesHistory
    .filter(r => r.status === 'completed')
    .reduce((acc, curr) => acc + (parseFloat(curr.total_price) || 0), 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-green-400" />
            Histórico de Viagens & Contratos
          </h1>
          <p className="text-xs text-zinc-400">
            Todas as corridas são formalizadas com contratos digitais de transporte individual.
          </p>
        </div>

        {/* Financial Summary */}
        <div className="px-4 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-right self-start sm:self-auto">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Total Líquido Recebido</span>
          <span className="text-lg font-black text-green-400">R$ {totalEarnings.toFixed(2)}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 w-fit">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === 'all' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Todas ({ridesHistory.length})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === 'completed' ? 'bg-green-500/20 text-green-400 font-bold shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Concluídas ({ridesHistory.filter(r => r.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterStatus === 'cancelled' ? 'bg-red-500/20 text-red-400 font-bold shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Canceladas ({ridesHistory.filter(r => r.status === 'cancelled').length})
        </button>
      </div>

      {/* Rides List */}
      <div className="space-y-3">
        {filteredRides.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-3xl">
            <History className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h4 className="font-bold text-zinc-400 text-sm">Nenhuma corrida encontrada</h4>
            <p className="text-xs text-zinc-500 mt-1">Suas viagens concluídas serão arquivadas aqui.</p>
          </div>
        ) : (
          filteredRides.map((ride) => {
            const isCompleted = ride.status === 'completed';
            return (
              <div
                key={ride.id}
                className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 shadow-xl space-y-3 transition-colors"
              >
                
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isCompleted 
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {isCompleted ? 'Concluída' : 'Cancelada'}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">{ride.contract_number}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-white">R$ {parseFloat(ride.total_price).toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-500 block">{ride.payment_method}</span>
                  </div>
                </div>

                {/* Details row */}
                <div className="space-y-1.5 text-xs text-zinc-300 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/60">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="truncate">{ride.origin}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="truncate">{ride.destination}</span>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-zinc-800/60 text-xs text-zinc-400">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span>Passageiro: <strong className="text-white">{ride.passenger_name}</strong></span>
                    <span>•</span>
                    <span>{new Date(ride.date).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <button
                    onClick={() => setSelectedRideForContract(ride)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-green-400 font-semibold transition-colors self-end sm:self-auto"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    Abrir Contrato Jurídico
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Contract Viewer Modal */}
      {selectedRideForContract && (
        <RideContractModal
          isOpen={!!selectedRideForContract}
          onClose={() => setSelectedRideForContract(null)}
          ride={selectedRideForContract}
          driver={driver}
        />
      )}

    </div>
  );
}
