import React, { useState } from 'react';
import { User, Phone, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RegisterPassenger({ onRegisterSuccess, setActivePage }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    password: '',
    confirmPassword: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    onRegisterSuccess({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      cpf: formData.cpf,
      role: 'passenger'
    });

    setActivePage('passenger_home');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      
      {/* Top Brand & Back */}
      <div className="mb-6">
        <button
          onClick={() => setActivePage('login')}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Login
        </button>

        <h1 className="text-2xl font-bold text-white">Criar Conta de Passageiro</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Viaje com motoristas credenciados com CNPJ e contrato seguro.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Nome Completo</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ex: Mariana Albuquerque"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white pl-10 focus:outline-none focus:border-blue-500"
              />
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Celular / WhatsApp</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="(11) 98877-6655"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white pl-10 focus:outline-none focus:border-blue-500"
              />
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">E-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="mariana@exemplo.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white pl-10 focus:outline-none focus:border-blue-500"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">CPF (Para o Contrato de Transporte)</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Senha</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Confirmar Senha</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-zinc-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Seus dados são protegidos e usados apenas para emissão dos contratos de transporte.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Cadastrar e Começar a Usar</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="pt-3 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-400">
            Já possui uma conta?{' '}
            <button
              onClick={() => setActivePage('login')}
              className="text-white font-bold underline hover:text-blue-400"
            >
              Fazer Login
            </button>
          </p>
        </div>

      </div>

    </div>
  );
}
