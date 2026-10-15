import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Car, 
  DollarSign, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown, 
  Loader2 
} from 'lucide-react';
import { apiUpdateDriver } from '../services/supabase';

export default function DriverProfile({ driver, setDriver, setActivePage }) {
  const [profileData, setProfileData] = useState({ ...driver });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Controle de sanfona (accordion) para cada sessão
  const [openSections, setOpenSections] = useState({
    personal: true,
    cnpj: false,
    vehicle: false,
    pricing: false
  });

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  useEffect(() => {
    setProfileData({ ...driver });
  }, [driver]);

  const handleChange = (field, val) => {
    setProfileData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setDriver(profileData);

    // Persiste atualizações no Supabase se houver driver.id
    if (driver?.id) {
      try {
        await apiUpdateDriver(driver.id, {
          company_type: profileData.company_type,
          cnpj: profileData.cnpj,
          razao_social: profileData.razao_social,
          nome_fantasia: profileData.nome_fantasia,
          car_model: profileData.car_model,
          car_plate: profileData.car_plate,
          car_color: profileData.car_color,
          base_price: parseFloat(profileData.base_price || 6.0),
          price_per_km: parseFloat(profileData.price_per_km || 2.8)
        });
      } catch (err) {
        console.warn('Erro ao atualizar motorista no Supabase:', err);
      }
    }

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const isSubActive = driver?.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-28 max-w-2xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-green-400" />
            Perfil & Configurações
          </h1>
          <p className="text-xs text-zinc-400">
            Gerencie sua assinatura, dados societários, veículo e tarifas.
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 border border-green-500/40 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Salvo com Sucesso!
          </span>
        )}
      </div>

      {/* Card da Assinatura (Movido da Home para o Perfil) */}
      {!isSubActive ? (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Sua assinatura está inativa ou expirou</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Ative seu plano para receber chamadas particulares com taxa 0%.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('subscription')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition-all whitespace-nowrap self-start sm:self-auto shadow-md"
          >
            Ver Planos & Ativar
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-400 flex items-center justify-center flex-shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  Plano {driver?.current_plan === 'daily' ? 'Diário' : driver?.current_plan === 'weekly' ? 'Semanal' : driver?.current_plan === 'yearly' ? 'Anual' : 'Mensal'}
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/30">
                  Assinatura Ativa
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Válida até <strong className="text-zinc-200">{new Date(driver?.subscription_expires_at || Date.now()).toLocaleDateString('pt-BR')}</strong> • 100% Taxa Zero
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('subscription')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-green-400 font-bold transition-all flex items-center gap-1 self-start sm:self-auto shadow-sm"
          >
            Gerenciar Planos
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Formulário com Seções em Sanfona (Accordion) */}
      <form onSubmit={handleSave} className="space-y-4">
        
        {/* 1. Sanfona: Dados Pessoais */}
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-xl transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('personal')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-zinc-900/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm">Dados Pessoais</h3>
                <p className="text-[11px] text-zinc-400 truncate">
                  {profileData.full_name || 'Nome do condutor'} • {profileData.phone || 'Telefone'}
                </p>
              </div>
            </div>
            <div className={`p-1.5 rounded-lg bg-zinc-900 text-zinc-400 transition-transform duration-200 ${openSections.personal ? 'rotate-180 text-green-400' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {openSections.personal && (
            <div className="p-5 pt-0 border-t border-zinc-800/60 space-y-3.5 animate-fade-in mt-2">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={profileData.full_name || ''}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={profileData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="(11) 98877-6655"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={profileData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 transition-colors"
                    placeholder="seuemail@exemplo.com"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Sanfona: Dados CNPJ (Substitui Escudo Jurídico PJ) */}
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-xl transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('cnpj')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-zinc-900/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm">Dados CNPJ</h3>
                <p className="text-[11px] text-zinc-400 truncate">
                  {profileData.cnpj ? `CNPJ: ${profileData.cnpj}` : 'CNPJ não informado'} • {profileData.company_type || 'MEI'}
                </p>
              </div>
            </div>
            <div className={`p-1.5 rounded-lg bg-zinc-900 text-zinc-400 transition-transform duration-200 ${openSections.cnpj ? 'rotate-180 text-blue-400' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {openSections.cnpj && (
            <div className="p-5 pt-0 border-t border-zinc-800/60 space-y-3.5 animate-fade-in mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Tipo de Empresa</label>
                  <select
                    value={profileData.company_type || 'MEI'}
                    onChange={(e) => handleChange('company_type', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="MEI">Microempreendedor Individual (MEI)</option>
                    <option value="ME">Microempresa (ME)</option>
                    <option value="LTDA">Sociedade Limitada (LTDA)</option>
                    <option value="SLU">Sociedade Unipessoal (SLU)</option>
                    <option value="EIRELI">EIRELI / Individual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={profileData.cnpj || ''}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Razão Social</label>
                <input
                  type="text"
                  value={profileData.razao_social || ''}
                  onChange={(e) => handleChange('razao_social', e.target.value)}
                  placeholder="Nome empresarial registrado"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={profileData.nome_fantasia || ''}
                  onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                  placeholder="Nome comercial (opcional)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Sanfona: Dados do Veículo */}
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-xl transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('vehicle')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-zinc-900/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm">Dados do Veículo</h3>
                <p className="text-[11px] text-zinc-400 truncate">
                  {profileData.car_model || 'Veículo'} • Placa <span className="font-mono text-zinc-300">{profileData.car_plate || '---'}</span>
                </p>
              </div>
            </div>
            <div className={`p-1.5 rounded-lg bg-zinc-900 text-zinc-400 transition-transform duration-200 ${openSections.vehicle ? 'rotate-180 text-purple-400' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {openSections.vehicle && (
            <div className="p-5 pt-0 border-t border-zinc-800/60 space-y-3.5 animate-fade-in mt-2">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Modelo do Carro</label>
                <input
                  type="text"
                  value={profileData.car_model || ''}
                  onChange={(e) => handleChange('car_model', e.target.value)}
                  placeholder="Ex: Toyota Corolla Sedan"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Placa</label>
                  <input
                    type="text"
                    value={profileData.car_plate || ''}
                    onChange={(e) => handleChange('car_plate', e.target.value.toUpperCase())}
                    placeholder="BRA2E19"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Cor</label>
                  <input
                    type="text"
                    value={profileData.car_color || ''}
                    onChange={(e) => handleChange('car_color', e.target.value)}
                    placeholder="Preto, Prata, etc."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Sanfona: Tarifação Própria */}
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-xl transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('pricing')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-zinc-900/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-sm">Tarifação Própria (R$/km)</h3>
                <p className="text-[11px] text-zinc-400 truncate">
                  Base R$ {Number(profileData.base_price || 6).toFixed(2)} • R$ {Number(profileData.price_per_km || 2.8).toFixed(2)}/km
                </p>
              </div>
            </div>
            <div className={`p-1.5 rounded-lg bg-zinc-900 text-zinc-400 transition-transform duration-200 ${openSections.pricing ? 'rotate-180 text-amber-400' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {openSections.pricing && (
            <div className="p-5 pt-0 border-t border-zinc-800/60 space-y-3.5 animate-fade-in mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Preço Base (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={profileData.base_price ?? 6.0}
                    onChange={(e) => handleChange('base_price', parseFloat(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Valor por KM (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={profileData.price_per_km ?? 2.8}
                    onChange={(e) => handleChange('price_per_km', parseFloat(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Salvar Alterações */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-extrabold text-sm shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Salvando no Supabase...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
