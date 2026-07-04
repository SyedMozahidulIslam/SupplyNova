import React, { useState } from 'react';
import { Thermometer, ShieldAlert, Wind, Activity, CheckCircle, Flame, Plus } from 'lucide-react';
import { Vehicle } from '../types';

interface ColdChainModuleProps {
  vehicles: Vehicle[];
  onTriggerEmergencyCooling: (vehicleId: string) => void;
}

export default function ColdChainModule({ vehicles, onTriggerEmergencyCooling }: ColdChainModuleProps) {
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filter only refrigerated reefer trucks
  const reeferTrucks = vehicles.filter(v => v.tempCelsius !== undefined);

  const triggerEmergencyCooling = (vehId: string) => {
    onTriggerEmergencyCooling(vehId);
    setSuccessMsg(`Emergency compressor cooling sequence initiated for ${vehicles.find(v => v.id === vehId)?.plateNumber}. Adjusting temp towards 4.0°C.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded border border-white/10 bg-white/5">
        <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
          <Thermometer size={20} className="text-accent-cyan" /> Cold Chain Telemetry
        </h2>
        <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
          Real-time cold storage temperature sensors, atmospheric humidity logs, and critical HACCP compliance
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded border border-accent-emerald/30 bg-accent-emerald/5 text-xs text-accent-emerald font-bold uppercase tracking-wider flex items-center gap-2">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Reefer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reeferTrucks.map(truck => {
          const isHazard = (truck.tempCelsius ?? 0) > 8;
          return (
            <div
              key={truck.id}
              className={`p-6 rounded-2xl bg-white/[0.02] border transition-all ${
                isHazard ? 'border-accent-rose bg-accent-rose/[0.02]' : 'border-white/5'
              }`}
            >
              <div className="flex items-start justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-display">{truck.plateNumber}</h3>
                  <p className="text-[10px] font-mono text-white/40 mt-1">Vehicle Duty: {truck.destination}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-white/40 block">CURRENT SENSOR FEED</span>
                  <span className={`text-xl font-extrabold font-mono block ${isHazard ? 'text-accent-rose animate-bounce' : 'text-accent-emerald'}`}>
                    {truck.tempCelsius}°C
                  </span>
                </div>
              </div>

              {/* Sensor Diagnostics */}
              <div className="grid grid-cols-2 gap-4 py-4 text-xs font-mono">
                <div>
                  <span className="text-white/40 text-[9px] block">Atmospheric Class</span>
                  <strong className="text-white mt-1 block">Requires strict refrigeration (2°C to 8°C)</strong>
                </div>
                <div>
                  <span className="text-white/40 text-[9px] block">Compressor Duty Cycle</span>
                  <span className="text-white/80 block mt-1">84% Capacity</span>
                </div>
                <div>
                  <span className="text-white/40 text-[9px] block">Sensor sync status</span>
                  <span className="text-accent-emerald font-semibold block mt-1">ACTIVE (100% Signal)</span>
                </div>
                <div>
                  <span className="text-white/40 text-[9px] block">Cargo Risk Rating</span>
                  <span className={`font-semibold block mt-1 ${isHazard ? 'text-accent-rose' : 'text-accent-emerald'}`}>
                    {isHazard ? 'CRITICAL TEMPERATURE HAZARD' : 'STABILIZED'}
                  </span>
                </div>
              </div>

              {/* Live line chart mock visualizer */}
              <div className="h-16 bg-brand-black/40 border border-white/5 rounded-xl p-2 flex items-end gap-1 overflow-hidden relative">
                <span className="absolute top-1 left-2 text-[8px] font-mono text-white/30 uppercase">Atmospheric log chart</span>
                <div className="w-full h-8 flex items-end gap-1.5">
                  <div className="flex-1 bg-accent-blue/30 h-4 rounded"></div>
                  <div className="flex-1 bg-accent-blue/40 h-5 rounded"></div>
                  <div className="flex-1 bg-accent-blue/50 h-3 rounded"></div>
                  <div className="flex-1 bg-accent-blue/60 h-6 rounded"></div>
                  <div className="flex-1 bg-accent-blue/80 h-4 rounded"></div>
                  <div className="flex-1 bg-accent-emerald/80 h-3 rounded"></div>
                  <div className="flex-1 bg-accent-emerald h-3.5 rounded"></div>
                  <div className={`flex-1 h-7 rounded ${isHazard ? 'bg-accent-rose animate-pulse' : 'bg-accent-emerald'}`}></div>
                </div>
              </div>

              {/* Action triggers */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/40">SLA Rule: Trigger notifications &gt;8°C</span>
                <button
                  onClick={() => triggerEmergencyCooling(truck.id)}
                  className="px-4 py-2 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-xs font-bold text-black flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Wind size={12} /> Force Emergency Cooling
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
