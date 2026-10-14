import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Copy, 
  Check, 
  Key, 
  Plus, 
  ShieldCheck, 
  Building2, 
  Search,
  Filter,
  CreditCard
} from 'lucide-react';
import PixModal from '../components/PixModal';

export default function Wallet({ driver, setDriver }) {
  const [filterType, setFilterType] = useState('all');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(50);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawKey, setWithdrawKey] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);

  const transactions = driver.wallet.transactions || [];

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'in') return tx.amount > 0;
    if (filterType === 'out') return tx.amount < 0;
    return true;
  });

  const handleConfirmDeposit = () => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return;

    setDriver(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        available_balance: prev.wallet.available_balance + val,
        transactions: [
          {
            id: `tx_${Date.now().toString().slice(-4)}`,
            type: 'deposit_pix',
            title: 'Depósito via Pix Recebido',
            amount: val,
            date: new Date().toISOString(),
            status: 'completed',
            method: 'Pix In'
          },
          ...prev.wallet.transactions
        ]
      }
    }));

    setIsDepositModalOpen(false);
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0 || val > driver.wallet.available_balance) {
      alert('Valor de saque inválido ou saldo insuficiente.');
      return;
    }

    setDriver(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        available_balance: prev.wallet.available_balance - val,
        transactions: [
          {
            id: `tx_${Date.now().toString().slice(-4)}`,
            type: 'transfer_out',
            title: `Saque Pix para chave ${withdrawKey || 'padrão'}`,
            amount: -val,
            date: new Date().toISOString(),
            status: 'completed',
            method: 'Pix Out (Instantâneo)'
          },
          ...prev.wallet.transactions
        ]
      }
    }));

    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawKey('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 sm:p-6 pb-24 max-w-4xl mx-auto space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <WalletIcon className="w-6 h-6 text-green-400" />
            Conta Digital DriverSaaS
          </h1>
          <p className="text-xs text-zinc-400">
            Conta de Pagamentos PJ • BaaS Integrado Bacen
          </p>
        </div>

        <button
          onClick={() => setIsKeysModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors self-start sm:self-auto"
        >
          <Key className="w-3.5 h-3.5 text-green-400" />
          Minhas Chaves Pix ({driver.wallet.pix_keys?.length || 0})
        </button>
      </div>

      {/* Digital Account Card (Fintech Style) */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 shadow-2xl overflow-hidden">
        
        {/* Background circuit glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div>
            <span className="text-xs font-semibold text-zinc-400 block mb-1">Saldo Total Disponível</span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-1">
              <span className="text-lg font-bold text-green-400">R$</span>
              <span>{driver.wallet.available_balance.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
              <span>A liberar: <strong className="text-zinc-200">R$ {driver.wallet.pending_balance?.toFixed(2) || '0.00'}</strong></span>
              <span>•</span>
              <span>Rendimento: <strong className="text-green-400">100% CDI</strong></span>
            </div>
          </div>

          {/* Account Coordinates */}
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold mb-1">
              <Building2 className="w-4 h-4 text-green-400" />
              <span>{driver.razao_social || 'Conta PJ DriverSaaS'}</span>
            </div>
            <p className="text-zinc-400"><span className="text-zinc-500">Banco:</span> 994 - DriverSaaS IP S.A.</p>
            <p className="text-zinc-400"><span className="text-zinc-500">Agência:</span> 0001 • <span className="text-zinc-500">Conta:</span> 847291-3</p>
            <p className="text-zinc-400"><span className="text-zinc-500">CNPJ:</span> <span className="font-mono text-zinc-300">{driver.cnpj}</span></p>
          </div>
        </div>

        {/* Quick Financial Operations */}
        <div className="relative z-10 pt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="flex-1 min-w-[140px] py-3 px-4 rounded-2xl bg-green-500 hover:bg-green-600 text-black text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02]"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[3px]" />
            Depositar via Pix
          </button>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex-1 min-w-[140px] py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <ArrowUpRight className="w-4 h-4 text-zinc-400" />
            Sacar / Transferir Pix
          </button>
        </div>

      </div>

      {/* Transactions & Statement Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Extrato da Conta</h3>
          
          {/* Filters */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('in')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'in' ? 'bg-green-500/20 text-green-400 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilterType('out')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'out' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Saídas
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-2.5">
          {filteredTransactions.map((tx) => {
            const isCredit = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCredit 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">{tx.title}</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {new Date(tx.date).toLocaleString('pt-BR')} • {tx.method}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm sm:text-base font-extrabold ${
                    isCredit ? 'text-green-400' : 'text-zinc-300'
                  }`}>
                    {isCredit ? '+' : ''} R$ {Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className="block text-[10px] text-zinc-500 uppercase font-semibold">
                    {tx.status === 'completed' ? 'Concluído' : tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deposit Pix Modal */}
      {isDepositModalOpen && (
        <PixModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          title="Recarga de Conta via Pix"
          amount={depositAmount}
          description="Transfira qualquer valor para a sua Conta Digital DriverSaaS via Pix Copia e Cola ou QR Code."
          onConfirmPayment={handleConfirmDeposit}
        />
      )}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-white text-lg mb-1">Transferência Pix (Saque)</h3>
            <p className="text-xs text-zinc-400 mb-4">Envie saldo da sua conta DriverSaaS para qualquer outro banco.</p>

            {withdrawSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
                <h4 className="font-bold text-white">Saque Concluído!</h4>
                <p className="text-xs text-zinc-400">O valor foi enviado via Pix com sucesso.</p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Chave Pix de Destino</label>
                  <input
                    type="text"
                    required
                    placeholder="CPF, CNPJ, Celular, E-mail ou Chave Aleatória"
                    value={withdrawKey}
                    onChange={(e) => setWithdrawKey(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Valor do Saque (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    max={driver.wallet.available_balance}
                    placeholder={`Disponível: R$ ${driver.wallet.available_balance.toFixed(2)}`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-green-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-extrabold shadow-lg shadow-green-500/20"
                  >
                    Confirmar Envio
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Pix Keys Management Modal */}
      {isKeysModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Minhas Chaves Pix</h3>
              <button 
                onClick={() => setIsKeysModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-2">
              {driver.wallet.pix_keys?.map((k, i) => (
                <div key={i} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-green-400 uppercase">{k.type} {k.default ? '(Padrão)' : ''}</span>
                    <p className="text-xs text-zinc-200 font-mono">{k.key}</p>
                  </div>
                  <span className="text-[11px] text-zinc-500">Ativa</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('Para cadastrar nova chave, confirme a validação de segurança via SMS.')}
              className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Nova Chave Pix
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
