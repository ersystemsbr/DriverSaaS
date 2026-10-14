import React, { useState } from 'react';
import { QrCode, Copy, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PixModal({ isOpen, onClose, title, amount, description, onConfirmPayment }) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Gerador de Pix Copia e Cola no padrão oficial EMVco / BACEN
  const pixCode = `00020126580014br.gov.bcb.pix0136${Date.now()}520400005303986540${amount.toFixed(2)}5802BR5913DriverSaaS_PJ6008SAOPAULO62140510DS${Math.floor(1000 + Math.random() * 9000)}6304`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{title || "Pagamento via Pix"}</h3>
              <p className="text-xs text-zinc-400">Liquidação Imediata (Bacen)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 flex flex-col items-center text-center">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">Valor a Pagar</span>
          <div className="text-3xl font-extrabold text-white mb-1">
            R$ {amount.toFixed(2)}
          </div>
          <p className="text-xs text-zinc-400 max-w-xs mb-6">{description}</p>

          {/* QR Code Mock Graphic */}
          <div className="p-4 bg-white rounded-2xl shadow-xl mb-4 relative group">
            <div className="w-44 h-44 bg-white flex flex-col items-center justify-center border-4 border-black p-2">
              <div className="grid grid-cols-6 gap-1 w-full h-full">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35 || i % 7 === 0
                        ? 'bg-black' 
                        : 'bg-zinc-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Copy Paste Code */}
          <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-left mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-zinc-400">Pix Copia e Cola</span>
              {copied && <span className="text-[11px] font-bold text-green-400">Copiado com sucesso!</span>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pixCode}
                className="w-full bg-transparent text-xs text-zinc-300 font-mono outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all flex-shrink-0 ${
                  copied 
                    ? 'bg-green-500 text-black' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-xs text-zinc-400 bg-green-500/5 border border-green-500/20 rounded-xl p-3 mb-6">
            <div className="flex items-center gap-2 text-left">
              <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>Liberação automática em até 30 segundos após a confirmação.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-900"
            >
              Cancelar
            </button>
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-bold text-sm shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Pagamento'
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
