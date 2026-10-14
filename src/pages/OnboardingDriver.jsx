import React, { useState } from 'react';
import { ShieldCheck, User, Car, DollarSign, ArrowRight, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';

export default function OnboardingDriver({ driver, setDriver, setActivePage }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: driver.full_name || '',
    phone: driver.phone || '',
    email: driver.email || '',
    
    // Escudo Jurídico PJ Amplo
    company_type: driver.company_type || 'ME', // MEI, ME, LTDA, SLU, EIRELI
    cnpj: driver.cnpj || '',
    razao_social: driver.razao_social || '',
    nome_fantasia: driver.nome_fantasia || '',
    inscricao_municipal: driver.inscricao_municipal || '',
    
    // Veículo
    car_model: driver.car_model || '',
    car_plate: driver.car_plate || '',
    car_color: driver.car_color || '',
    car_year: driver.car_year || '2023',
    
    // Tarifas
    base_price: driver.base_price || 6.00,
    price_per_km: driver.price_per_km || 2.80,
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.phone) {
        setErrorMsg('Por favor, informe seu nome completo e telefone/WhatsApp.');
        return;
      }
    } else if (step === 2) {
      if (!formData.cnpj || !formData.razao_social) {
        setErrorMsg('O CNPJ e a Razão Social da empresa são obrigatórios para a emissão do Escudo Jurídico.');
        return;
      }
    } else if (step === 3) {
      if (!formData.car_model || !formData.car_plate) {
        setErrorMsg('Informe o modelo e a placa do veículo.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleFinish = () => {
    setDriver(prev => ({
      ...prev,
      ...formData,
      base_price: parseFloat(formData.base_price),
      price_per_km: parseFloat(formData.price_per_km)
    }));
    setActivePage('driver_dashboard');
  };

  const progressPercent = Math.round((step / 4) * 100);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between p-4 sm:p-6 max-w-xl mx-auto">
      
      {/* Header & Stepper Progress */}
      <div className="pt-2 pb-6">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold mb-2">
          <span>Passo {step} de 4</span>
          <span className="text-green-400 font-bold">{progressPercent}% Concluído</span>
        </div>
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Form Box */}
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
        
        {/* Step 1: Dados Pessoais */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Dados Pessoais</h2>
                <p className="text-xs text-zinc-400">Identificação do motorista condutor</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Alberto Silva"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  placeholder="carlos.motorista@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Escudo Jurídico PJ Amplo (MEI, ME, LTDA, SLU) */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Escudo Jurídico PJ</h2>
                <p className="text-xs text-zinc-400">Qualquer CNPJ ativo (MEI, ME, LTDA, SLU)</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Tipo de Empresa / Sociedade</label>
                <select
                  value={formData.company_type}
                  onChange={(e) => handleChange('company_type', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="MEI">Microempreendedor Individual (MEI)</option>
                  <option value="ME">Microempresa (ME)</option>
                  <option value="LTDA">Sociedade Limitada (LTDA)</option>
                  <option value="SLU">Sociedade Limitada Unipessoal (SLU)</option>
                  <option value="EIRELI">EIRELI / Individual</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">CNPJ</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={formData.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Razão Social (Nome Oficial)</label>
                <input
                  type="text"
                  placeholder="Ex: C. A. Silva Serviços de Transporte Executivo ME"
                  value={formData.razao_social}
                  onChange={(e) => handleChange('razao_social', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Nome Fantasia (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Silva Transporte Privado"
                  value={formData.nome_fantasia}
                  onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Dados do Veículo */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Dados do Veículo</h2>
                <p className="text-xs text-zinc-400">Carro que constará nos contratos de transporte</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Modelo do Carro</label>
                <input
                  type="text"
                  placeholder="Ex: Honda Civic EXL / Toyota Corolla"
                  value={formData.car_model}
                  onChange={(e) => handleChange('car_model', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Placa</label>
                  <input
                    type="text"
                    placeholder="BRA2E19"
                    value={formData.car_plate}
                    onChange={(e) => handleChange('car_plate', e.target.value.toUpperCase())}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Cor</label>
                  <input
                    type="text"
                    placeholder="Prata / Preto"
                    value={formData.car_color}
                    onChange={(e) => handleChange('car_color', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Ano de Fabricação</label>
                <input
                  type="text"
                  placeholder="2023"
                  value={formData.car_year}
                  onChange={(e) => handleChange('car_year', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Tarifação Personalizada */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sua Tarifação</h2>
                <p className="text-xs text-zinc-400">Você define quanto quer cobrar dos seus clientes</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Preço Base (Bandeirada de Partida)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-400">R$</span>
                  <input
                    type="number"
                    step="0.50"
                    value={formData.base_price}
                    onChange={(e) => handleChange('base_price', e.target.value)}
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Valor fixo cobrado no início de qualquer corrida.</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Valor por Quilômetro Rodado (R$/km)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-400">R$</span>
                  <input
                    type="number"
                    step="0.10"
                    value={formData.price_per_km}
                    onChange={(e) => handleChange('price_per_km', e.target.value)}
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs text-zinc-400 font-semibold">/ km</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Calculado automaticamente com base na distância da rota.</p>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Simulação: Uma corrida de 10 km custará R$ {(parseFloat(formData.base_price || 0) + 10 * parseFloat(formData.price_per_km || 0)).toFixed(2)}.</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-800/80 gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : (
            <button
              onClick={() => setActivePage('home')}
              className="px-4 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all ml-auto"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-black text-xs font-extrabold flex items-center gap-2 shadow-xl shadow-green-500/30 transition-all ml-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir Cadastro</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
