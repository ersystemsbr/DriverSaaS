import React, { useState } from 'react';
import { Crown, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Calendar, ArrowRight, Zap } from 'lucide-react';
import PixModal from '../components/PixModal';
import { apiCreateSubscription } from '../services/supabase';

export default function Subscription({ driver, setDriver, plans, setActivePage }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

  const isSubActive = driver?.subscription_status === 'active';
  const expiresDate = new Date(driver?.subscription_expires_at || Date.now());
  const daysRemaining = Math.max(0, Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24)));

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsPixModalOpen(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;

    let durationDays = 1;
    if (selectedPlan.id === 'weekly' || selectedPlan.slug === 'weekly') durationDays = 7;
    if (selectedPlan.id === 'monthly' || selectedPlan.slug === 'monthly') durationDays = 30;
    if (selectedPlan.id === 'yearly' || selectedPlan.slug === 'yearly') durationDays = 365;

    const newExpiration = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    if (driver?.id) {
      try {
        await apiCreateSubscription(
          driver.id,
          selectedPlan.plan_db_id || selectedPlan.id,
          selectedPlan.price,
          durationDays,
          'Pix Direto'
        );
      } catch (err) {
        console.warn('Erro ao salvar assinatura no Supabase:', err);
      }
    }

    setDriver(prev => {
      const prevWallet = prev?.wallet || { available_balance: 0, pending_balance: 0, pix_keys: [], transactions: [] };
      return {
        ...prev,
        subscription_status: 'active',
        current_plan: selectedPlan.slug || selectedPlan.id,
        subscription_expires_at: newExpiration,
        wallet: {
          ...prevWallet,
          transactions: [
            {
              id: `tx_${Date.now().toString().slice(-4)}`,
              type: 'debit_plan',
              title: `Assinatura DriverSaaS - Plano ${selectedPlan.name}`,
              amount: -selectedPlan.price,
              date: new Date().toISOString(),
              status: 'completed',
              method: 'Pix Direto'
            },
            ...(prevWallet.transactions || [])
          ]
        }
      };
    });

    setIsPixModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-24 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="text-center mb-8 pt-4">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20 text-black">
          <Crown className="w-8 h-8 text-black stroke-[2.2px]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Assinatura Driver<span className="text-green-500">SaaS</span>
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Taxa zero em 100% das corridas particulares. Você não paga comissão por viagem: pague apenas a assinatura.
        </p>
      </div>

      {/* Current Active Plan Status Banner */}
      {isSubActive ? (
        <div className="mb-10 p-5 rounded-3xl bg-gradient-to-r from-green-950/40 via-zinc-900 to-zinc-950 border border-green-500/40 shadow-xl shadow-green-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[11px] font-bold border border-green-500/40">
                    Plano Ativo
                  </span>
                  <span className="text-xs text-zinc-400">• Escudo Jurídico Regular</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Plano {driver?.current_plan === 'daily' ? 'Diário' : driver?.current_plan === 'weekly' ? 'Semanal' : driver?.current_plan === 'yearly' ? 'Anual' : 'Mensal'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-400 sm:border-l sm:border-zinc-800 sm:pl-6">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Validade</span>
                <span className="font-medium text-white">{expiresDate.toLocaleDateString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Tempo Restante</span>
                <span className="font-bold text-green-400">{daysRemaining} dias restantes</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-10 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-white text-sm">Nenhum plano ativo no momento</h4>
            <p className="text-zinc-400 mt-0.5">Escolha um dos planos abaixo para liberar seu painel e receber corridas particulares hoje.</p>
          </div>
        </div>
      )}

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {plans.map((plan) => {
          const isSelected = isSubActive && (driver?.current_plan === plan.id || driver?.current_plan === plan.slug);
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between p-5 rounded-3xl transition-all ${
                plan.popular 
                  ? 'bg-zinc-950 border-2 border-green-500 shadow-xl shadow-green-500/15'
                  : 'bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  plan.popular ? 'bg-green-500 text-black shadow-md' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div>
                <h3 className="text-base font-bold text-white mt-1">{plan.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">{plan.description}</p>

                {/* Price Display */}
                <div className="my-5 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-zinc-400">R$</span>
                    <span className="text-3xl font-extrabold text-white">{plan.price.toFixed(2)}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium">por {plan.period}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                  plan.popular 
                    ? 'bg-green-500 hover:bg-green-600 text-black shadow-green-500/25'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSelected ? 'Renovar Plano' : 'Assinar com Pix'}</span>
              </button>

            </div>
          );
        })}
      </div>

      {/* Pix Checkout Modal */}
      {selectedPlan && (
        <PixModal
          isOpen={isPixModalOpen}
          onClose={() => setIsPixModalOpen(false)}
          title={`Assinar Plano ${selectedPlan.name}`}
          amount={selectedPlan.price}
          description={`Assinatura DriverSaaS com acesso por ${selectedPlan.period}. 100% livre de taxa em todas as viagens.`}
          onConfirmPayment={handleConfirmSubscription}
        />
      )}

      {/* Legal Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
        <div>
          <strong className="text-white">Garantia Legal:</strong> Todas as assinaturas incluem emissão ilimitada de contratos digitais personalizados com a sua Razão Social e CNPJ.
        </div>
      </div>

    </div>
  );
}
