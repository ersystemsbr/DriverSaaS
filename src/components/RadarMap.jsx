import React from 'react';
import { Navigation, MapPin, Radio, Compass } from 'lucide-react';

export default function RadarMap({ isOnline, driverName, carModel }) {
  return (
    <div className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900 border border-zinc-800 shadow-xl flex items-center justify-center">
      
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 70%),
            linear-gradient(to right, #27272a 1px, transparent 1px),
            linear-gradient(to bottom, #27272a 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* Concentric Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-24 h-24 rounded-full border border-zinc-800/80" />
        <div className="w-48 h-48 rounded-full border border-zinc-800/60" />
        <div className="w-72 h-72 rounded-full border border-zinc-800/40" />

        {isOnline && (
          <>
            <div className="absolute w-36 h-36 rounded-full border-2 border-green-500/40 animate-radar" />
            <div className="absolute w-56 h-56 rounded-full border border-green-500/20 animate-radar" style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>

      {/* Simulated Nearby Roads */}
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none stroke-zinc-700">
        <path d="M 0 50 Q 150 120 300 80 T 600 180" fill="none" strokeWidth="3" />
        <path d="M 80 0 Q 120 180 200 280" fill="none" strokeWidth="2" strokeDasharray="6,6" />
        <path d="M 280 280 Q 240 140 400 30" fill="none" strokeWidth="2.5" />
      </svg>

      {/* Center Driver Marker */}
      <div className="relative z-10 flex flex-col items-center">
        <div className={`relative p-3.5 rounded-2xl shadow-2xl transition-all duration-500 ${
          isOnline 
            ? 'bg-green-500 text-black shadow-green-500/30 ring-4 ring-green-500/20' 
            : 'bg-zinc-800 text-zinc-400 ring-4 ring-zinc-700/20'
        }`}>
          <Navigation className={`w-7 h-7 transform -rotate-45 transition-transform ${isOnline ? 'animate-pulse' : ''}`} />
          {isOnline && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300" />
            </span>
          )}
        </div>

        <div className="mt-3 px-3 py-1 rounded-full bg-zinc-950/90 border border-zinc-800 text-xs font-semibold backdrop-blur-md shadow-md text-center">
          {isOnline ? (
            <span className="text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Rastreador Ativo • Pronto para Corridas
            </span>
          ) : (
            <span className="text-zinc-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              Você está Offline
            </span>
          )}
        </div>
      </div>

      {/* Overlay Quick Info */}
      <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center gap-2">
        <Compass className="w-3.5 h-3.5 text-green-500" />
        <span>São Paulo, SP • GPS Alta Precisão</span>
      </div>

      <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center gap-1.5">
        <Radio className="w-3.5 h-3.5 text-zinc-500" />
        <span>Raio de Busca: 10 km</span>
      </div>
    </div>
  );
}
