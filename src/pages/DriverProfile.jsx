import React, { useState, useEffect } from 'react';
import { User, Shield, Car, DollarSign, Save, CheckCircle2, Building2 } from 'lucide-react';

export default function DriverProfile({ driver, setDriver, setActivePage }) {
  const [profileData, setProfileData] = useState({ ...driver });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setProfileData({ ...driver });
  }, [driver]);

  const handleChange = (field, val) => {
    setProfileData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setDriver(profileData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-24 max-w-2xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-green-400" />
            Perfil & Configurações
          </h1>
          <p className="text-xs text-zinc-400">
            Gerencie seus dados societários, veículo e valores de corrida.
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 border border-green-500/40 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Salvo com Sucesso!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Personal Details */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-green-400" />
            Dados Pessoais
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nome Completo</label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">E-mail</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Escudo Jurídico PJ */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            Escudo Jurídico PJ (Qualquer CNPJ)
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Tipo de Empresa</label>
                <select
                  value={profileData.company_type}
                  onChange={(e) => handleChange('company_type', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
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
                  value={profileData.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Razão Social</label>
              <input
                type="text"
                value={profileData.razao_social}
                onChange={(e) => handleChange('razao_social', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={profileData.nome_fantasia}
                onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Veículo */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Car className="w-4 h-4 text-purple-400" />
            Dados do Veículo
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Modelo do Carro</label>
              <input
                type="text"
                value={profileData.car_model}
                onChange={(e) => handleChange('car_model', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Placa</label>
                <input
                  type="text"
                  value={profileData.car_plate}
                  onChange={(e) => handleChange('car_plate', e.target.value.toUpperCase())}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Cor</label>
                <input
                  type="text"
                  value={profileData.car_color}
                  onChange={(e) => handleChange('car_color', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tarifação Personalizada */}
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Tarifação Própria (R$/km)
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Preço Base (R$)</label>
              <input
                type="number"
                step="0.50"
                value={profileData.base_price}
                onChange={(e) => handleChange('base_price', parseFloat(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Valor por KM (R$)</label>
              <input
                type="number"
                step="0.10"
                value={profileData.price_per_km}
                onChange={(e) => handleChange('price_per_km', parseFloat(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-sm shadow-xl shadow-green-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Alterações
        </button>

      </form>

    </div>
  );
}
