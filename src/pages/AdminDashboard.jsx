import React, { useState } from 'react';
import { 
  Settings, 
  DollarSign, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Edit3, 
  Save, 
  Car, 
  Building2,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { INITIAL_ALL_DRIVERS_ADMIN } from '../data/mockData';

export default function AdminDashboard({ plans, setPlans, setActivePage }) {
  const [editablePlans, setEditablePlans] = useState(JSON.parse(JSON.stringify(plans)));
  const [driversList, setDriversList] = useState(INITIAL_ALL_DRIVERS_ADMIN);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePriceChange = (planId, newPrice) => {
    setEditablePlans(prev => prev.map(p => {
      if (p.id === planId) {
        return { ...p, price: parseFloat(newPrice) || 0 };
      }
      return p;
    }));
  };

  const handleSavePlans = (e) => {
    e.preventDefault();
    setPlans(editablePlans);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleDriverStatus = (driverId) => {
    setDriversList(prev => prev.map(d => {
      if (d.id === driverId) {
        const nextStatus = d.status === 'active' ? 'suspended' : 'active';
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  const handleApproveDriver = (driverId) => {
    setDriversList(prev => prev.map(d => {
      if (d.id === driverId) {
        return { ...d, status: 'active' };
      }
      return d;
    }));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-24 max-w-5xl mx-auto space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-4 h-4" />
            Administração da Plataforma
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
            Painel Gerencial DriverSaaS
          </h1>
          <p className="text-xs text-zinc-400">
            Controle de tarifas, aprovação de CNPJs e gestão de assinaturas em tempo real.
          </p>
        </div>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/40 text-xs font-bold animate-fade-in self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4" />
            Tarifas Atualizadas em Todo o Sistema!
          </span>
        )}
      </div>

      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Receita com Assinaturas</span>
          <span className="text-2xl font-black text-amber-400">R$ 48.950,00</span>
          <span className="text-[10px] text-green-400 block mt-1">+14% este mês</span>
        </div>

        <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Motoristas Credenciados</span>
          <span className="text-2xl font-black text-white">458</span>
          <span className="text-[10px] text-zinc-400 block mt-1">100% com CNPJ auditado</span>
        </div>

        <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Corridas Intermediadas</span>
          <span className="text-2xl font-black text-white">18.420</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Contratos emitidos</span>
        </div>

        <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Economia Gerada (Taxa 0%)</span>
          <span className="text-2xl font-black text-green-400">R$ 142.600</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Direto no bolso do motorista</span>
        </div>
      </div>

      {/* PLAN PRICE MANAGER (Alterar Valores dos Planos) */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              Gestão de Valores dos Planos de Assinatura
            </h3>
            <p className="text-xs text-zinc-400">
              Altere os valores cobrados aos motoristas. As alterações refletem imediatamente na tela de contratação.
            </p>
          </div>

          <button
            onClick={handleSavePlans}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            Salvar Novos Valores
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {editablePlans.map((plan) => (
            <div 
              key={plan.id}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase">{plan.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{plan.period}</span>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Valor da Assinatura (R$)
                </label>
                <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800">
                  <span className="text-xs font-bold text-amber-400">R$</span>
                  <input
                    type="number"
                    step="0.10"
                    value={plan.price}
                    onChange={(e) => handlePriceChange(plan.id, e.target.value)}
                    className="w-full bg-transparent text-lg font-black text-white focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 line-clamp-2">
                {plan.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* DRIVERS & CNPJ ESCUDO JURÍDICO MANAGEMENT */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-400" />
              Gestão de Motoristas e PJs (Escudo Jurídico)
            </h3>
            <p className="text-xs text-zinc-400">
              Verifique e autorize motoristas com CNPJ (MEI, ME, LTDA, EIRELI).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Motorista</th>
                <th className="pb-3 font-semibold">Empresa / CNPJ</th>
                <th className="pb-3 font-semibold">Veículo</th>
                <th className="pb-3 font-semibold">Plano</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {driversList.map((drv) => (
                <tr key={drv.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 pr-2">
                    <p className="font-bold text-white">{drv.name}</p>
                    <span className="text-[10px] text-zinc-500">Desde {drv.joined_date}</span>
                  </td>

                  <td className="py-3.5 pr-2">
                    <p className="text-zinc-300 font-medium">{drv.company}</p>
                    <span className="font-mono text-zinc-500 text-[11px]">{drv.cnpj} ({drv.company_type})</span>
                  </td>

                  <td className="py-3.5 pr-2">
                    <span className="text-zinc-300">{drv.car}</span>
                  </td>

                  <td className="py-3.5 pr-2">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 font-semibold text-zinc-300">
                      {drv.plan}
                    </span>
                  </td>

                  <td className="py-3.5 pr-2">
                    {drv.status === 'active' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/40">
                        Ativo
                      </span>
                    ) : drv.status === 'pending_review' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        Em Análise
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                        Suspenso
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 text-right space-x-2">
                    {drv.status === 'pending_review' ? (
                      <button
                        onClick={() => handleApproveDriver(drv.id)}
                        className="px-2.5 py-1 rounded-lg bg-green-500 text-black font-bold text-[11px] hover:bg-green-600"
                      >
                        Aprovar CNPJ
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleDriverStatus(drv.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-colors ${
                          drv.status === 'active'
                            ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                            : 'border-green-500/40 text-green-400 hover:bg-green-500/10'
                        }`}
                      >
                        {drv.status === 'active' ? 'Suspender' : 'Reativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
