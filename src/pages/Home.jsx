import React from 'react';
import { Car, Shield, User, DollarSign, CheckCircle2, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Home({ setActivePage, setCurrentRole, setSelectedLoginRole }) {
  
  const handleSelectRole = (role) => {
    setCurrentRole(role);
    if (setSelectedLoginRole) {
      setSelectedLoginRole(role);
    }
    setActivePage('login');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-20 max-w-4xl mx-auto flex flex-col items-center text-center">
        
        {/* Glow FX */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-300 mb-6 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span>Transporte Particular com Respaldo Jurídico PJ</span>
        </div>

        {/* Brand Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-green-600 via-emerald-500 to-green-400 flex items-center justify-center text-black mb-6 shadow-2xl shadow-green-500/30">
          <Car className="w-10 h-10 text-black stroke-[2.2px]" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Driver<span className="text-green-500">SaaS</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-300 font-medium max-w-2xl mb-8 leading-relaxed">
          A plataforma definitiva para motoristas profissionais particulares. <br className="hidden sm:inline" />
          <strong className="text-white">Taxa zero por corrida</strong>, contratos digitais com <strong className="text-green-400">CNPJ (MEI, ME, LTDA)</strong> e fidelização direta de clientes.
        </p>

        {/* Value Prop Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-10 text-left">
          
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Taxa 0% por Corrida</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Fique com 100% do valor da corrida. Pague apenas uma assinatura fixa flexível.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Escudo Jurídico PJ</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Contratos eletrônicos automáticos emitidos por viagem. Blindagem contra fiscalização.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <User className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Motorista Preferencial</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Passageiros escolhem você como 1ª opção com despacho inteligente em cascata.
            </p>
          </div>

        </div>

        {/* Main CTA Buttons - EXCLUSIVAMENTE DUAS OPÇÕES */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => handleSelectRole('driver')}
            className="flex-1 py-4 px-6 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-green-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Car className="w-5 h-5 text-black stroke-[2.5px]" />
            <span>Sou Motorista</span>
            <ChevronRight className="w-5 h-5 text-black ml-auto" />
          </button>

          <button
            onClick={() => handleSelectRole('passenger')}
            className="flex-1 py-4 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <User className="w-5 h-5 text-zinc-400" />
            <span>Sou Passageiro</span>
            <ChevronRight className="w-5 h-5 text-zinc-400 ml-auto" />
          </button>
        </div>

      </section>

      {/* Comparison Section */}
      <section className="px-4 py-12 max-w-4xl mx-auto border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold text-center text-white mb-8">
          Por que os motoristas estão migrando para o DriverSaaS?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tradicionais */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-red-500/20 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">Aplicativos Tradicionais</span>
            <h4 className="text-lg font-bold text-white">Retenção Abusiva</h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                Cobram de 25% a 40% de comissão em cada corrida.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                Você não é dono da sua clientela nem dos seus dados.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                Risco de bloqueios repentinos sem justificativa.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                Sem contrato de transporte particular individual.
              </li>
            </ul>
          </div>

          {/* DriverSaaS */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-green-950/40 via-zinc-900/60 to-zinc-950 border border-green-500/40 space-y-3 shadow-lg shadow-green-500/10">
            <span className="text-xs font-bold uppercase tracking-wider text-green-400">Modelo DriverSaaS</span>
            <h4 className="text-lg font-bold text-white">100% Seu Lucro</h4>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <strong className="text-white">Taxa zero:</strong> Todo o dinheiro da corrida vai direto para sua conta.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <strong className="text-white">Escudo Jurídico PJ:</strong> Contrato digital gerado para qualquer CNPJ.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <strong className="text-white">Conta Digital Integrada:</strong> Pix Copia e Cola, chaves Pix e gestão de saldos.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <strong className="text-white">Fidelização:</strong> O passageiro chama você primeiro pelo motorista preferencial.
              </li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
}
