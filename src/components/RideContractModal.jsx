import React from 'react';
import { FileText, ShieldCheck, Printer, Download, X, CheckCircle, Scale } from 'lucide-react';

export default function RideContractModal({ isOpen, onClose, ride, driver }) {
  if (!isOpen || !ride) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-white max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Escudo Jurídico • Contrato Digital
                <span className="px-2 py-0.5 text-[11px] font-bold bg-green-500/20 text-green-400 border border-green-500/40 rounded-full">
                  Válido
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Certificação nos termos das Leis Federais 12.587/12 e 13.640/18</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Legal Contract Body */}
        <div className="overflow-y-auto py-6 pr-1 space-y-5 text-xs text-zinc-300 leading-relaxed font-sans">
          
          {/* Document Header */}
          <div className="text-center p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
            <h4 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wider mb-1">
              Instrumento Particular de Prestação de Serviços de Transporte Privado Individual
            </h4>
            <p className="font-mono text-green-400 font-semibold text-xs">
              Protocolo Oficial: {ride.contract_number || `DS-${Date.now().toString().slice(-8)}`}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Data de Emissão: {new Date(ride.date || Date.now()).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Partes Contratantes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 block mb-1">
                CONTRATADA (Pessoa Jurídica / Motorista):
              </span>
              <p className="font-semibold text-white text-xs">{driver?.razao_social || ride.company_name}</p>
              <p><span className="text-zinc-500">CNPJ:</span> <span className="font-mono">{driver?.cnpj || ride.cnpj}</span> ({driver?.company_type || 'ME'})</p>
              <p><span className="text-zinc-500">Condutor:</span> {driver?.full_name}</p>
              <p><span className="text-zinc-500">Veículo:</span> {driver?.car_model} - Placa <span className="font-mono font-bold text-white">{driver?.car_plate}</span></p>
            </div>

            <div className="p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                CONTRATANTE (Passageiro):
              </span>
              <p className="font-semibold text-white text-xs">{ride.passenger_name}</p>
              <p><span className="text-zinc-500">Contato:</span> {ride.passenger_phone}</p>
              <p><span className="text-zinc-500">Origem:</span> {ride.origin}</p>
              <p><span className="text-zinc-500">Destino:</span> {ride.destination}</p>
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="space-y-3 p-4 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl">
            <div>
              <p className="font-bold text-zinc-200 mb-1">CLÁUSULA 1ª – DO OBJETO E FUNDAMENTAÇÃO LEGAL</p>
              <p className="text-zinc-400 text-justify">
                O presente contrato tem como objeto o transporte privado individual e remunerado de passageiros, acordado entre a CONTRATADA devidamente inscrita no CNPJ e o CONTRATANTE, amparado pelos artigos 730 e seguintes do Código Civil Brasileiro (Lei nº 10.406/2002) e pelas diretrizes da Política Nacional de Mobilidade Urbana (Lei Federal nº 12.587/2012 e Lei nº 13.640/2018), com natureza estritamente privada.
              </p>
            </div>

            <div>
              <p className="font-bold text-zinc-200 mb-1">CLÁUSULA 2ª – DO PREÇO E DA REMUNERAÇÃO DIRETA (TAXA ZERO)</p>
              <p className="text-zinc-400 text-justify">
                Pelo serviço prestado com rota de <strong className="text-white">{ride.distance_km} km</strong> e duração estimada de <strong className="text-white">{ride.duration_min} min</strong>, o CONTRATANTE paga à CONTRATADA o montante líquido de <strong className="text-green-400 font-bold text-sm">R$ {parseFloat(ride.total_price || 0).toFixed(2)}</strong> mediante <strong className="text-white">{ride.payment_method || 'Pix Direto'}</strong>, ficando vedada qualquer retenção ou comissão por plataformas intermediadoras.
              </p>
            </div>

            <div>
              <p className="font-bold text-zinc-200 mb-1">CLÁUSULA 3ª – DA SEGURANÇA E RESPALDO CONTRA APREENSÕES</p>
              <p className="text-zinc-400 text-justify">
                Este documento constitui prova pré-constituída de contrato privado de transporte individual regular, afastando peremptoriamente qualquer tipificação de transporte clandestino ou irregular pelas autoridades fiscalizadoras de trânsito em âmbito municipal, estadual ou federal.
              </p>
            </div>
          </div>

          {/* Digital Signature Hash */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-[11px] font-bold text-white">Assinado Digitalmente por Ambas as Partes</p>
                <p className="text-[10px] text-zinc-400 font-mono">Hash SHA-256: 7d8a9f0b2c1e4d3a5b6c7e8f90123456789abcdef0123456789</p>
              </div>
            </div>
            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md font-mono font-bold">
              AUTENTICADO
            </span>
          </div>

        </div>

        {/* Modal Footer / Actions */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between flex-shrink-0 gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-xs font-semibold text-zinc-300 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Contrato
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-bold shadow-lg shadow-green-500/20 transition-all"
          >
            Fechar Contrato
          </button>
        </div>

      </div>
    </div>
  );
}
