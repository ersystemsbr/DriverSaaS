import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, XCircle, Loader2, Copy, Check, ExternalLink, X, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabase';

export default function SupabaseConfigModal({ isOpen, onClose }) {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [testStatus, setTestStatus] = useState(null); // { success: boolean, latency?: number, error?: string }
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseConfig();
      setConfig(current);
      setUrl(current.url);
      setAnonKey(current.anonKey);
      runTest();
    }
  }, [isOpen]);

  const runTest = async () => {
    setIsTesting(true);
    setTestStatus(null);
    const result = await testSupabaseConnection();
    setTestStatus(result);
    setIsTesting(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    setConfig(getSupabaseConfig());
    runTest();
  };

  const copySqlNotice = () => {
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Status da Conexão Supabase</h2>
              <p className="text-[11px] text-zinc-400">Tabelas padronizadas xds_ com PostgreSQL</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Badge */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          testStatus?.success
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : isTesting
            ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <div className="flex items-center gap-3">
            {isTesting ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            ) : testStatus?.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <div>
              <span className="text-xs font-bold block">
                {isTesting
                  ? 'Testando conexão com o banco...'
                  : testStatus?.success
                  ? `Supabase Conectado (${testStatus.latency}ms)`
                  : 'Aguardando Validação de Chaves'}
              </span>
              <p className="text-[10px] opacity-80 mt-0.5">
                {testStatus?.success
                  ? 'Todas as 10 tabelas xds_ estão prontas para gravação e leitura em tempo real.'
                  : testStatus?.error || 'Certifique-se de que as variáveis foram salvas no Vercel ou abaixo.'}
              </p>
            </div>
          </div>

          <button
            onClick={runTest}
            disabled={isTesting}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Testar</span>
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              required
              placeholder="https://seu-projeto.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Anon / Public API Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-xs shadow-lg shadow-green-500/20 transition-all"
          >
            Salvar e Conectar
          </button>
        </form>

        {/* SQL Schema Notice */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Script SQL das 10 Tabelas (schema.sql)
            </span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-green-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Abrir Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Caso ainda não tenha executado o script no SQL Editor do Supabase, o arquivo completo está localizado em <span className="font-mono text-zinc-300">database/schema.sql</span> no repositório.
          </p>
        </div>

      </div>
    </div>
  );
}
