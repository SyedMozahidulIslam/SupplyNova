import React, { useState } from 'react';
import { Compass, Users, CheckCircle, MapPin, Search, AlertCircle, PlusCircle } from 'lucide-react';
import { BeatPlan, Outlet, Employee } from '../types';
import { OUTLETS } from '../data/mockData';

interface SalesForceModuleProps {
  currentEmployee: Employee;
  beatPlans: BeatPlan[];
  onTriggerCheckIn: (beatId: string) => void;
  onCollectOrder: (beatId: string, amount: number) => void;
}

export default function SalesForceModule({
  currentEmployee,
  beatPlans,
  onTriggerCheckIn,
  onCollectOrder,
}: SalesForceModuleProps) {
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedBeatId, setSelectedBeatId] = useState(beatPlans[0]?.id || '');
  const [orderAmount, setOrderAmount] = useState(25000);

  const activeBeat = beatPlans.find(b => b.id === selectedBeatId) || beatPlans[0];

  const triggerCheckIn = (beatId: string) => {
    onTriggerCheckIn(beatId);
    setSuccessMsg(`Geo-Check In recorded at ${new Date().toLocaleTimeString()} for ${activeBeat.salesRepName}. Safe Beat coordinates matched!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const collectOrder = (e: React.FormEvent) => {
    e.preventDefault();
    onCollectOrder(activeBeat.id, orderAmount);
    setSuccessMsg(`SCM wholesale order BDT ${orderAmount.toLocaleString()} collected and synced with ERP database!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded border border-white/10 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
            <Compass size={20} className="text-accent-cyan" /> Sales Force Beat Planning
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
            Territory assignments, geographic check-ins, store merchandising audit scorecards, and order book captures
          </p>
        </div>

        {/* Dropdown for active Beat */}
        <select
          value={selectedBeatId}
          onChange={(e) => setSelectedBeatId(e.target.value)}
          className="bg-white/5 border border-white/10 rounded p-2 px-3 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-accent-cyan cursor-pointer"
        >
          {beatPlans.map(b => (
            <option key={b.id} value={b.id} className="bg-brand-black">Beat: {b.salesRepName}</option>
          ))}
        </select>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald font-semibold flex items-center gap-2">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Beat Details */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-mono text-accent-cyan uppercase">Beat Representative</span>
              <h3 className="text-sm font-bold text-white mt-1">{activeBeat.salesRepName}</h3>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-white/40 block">TARGET PROGRESS</span>
              <span className="text-xs font-mono font-bold text-accent-emerald">
                {activeBeat.outletsVisited} / {activeBeat.totalOutlets} Visited
              </span>
            </div>
          </div>

          {/* Geo Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-white/40 text-[9px] uppercase font-mono block">GPS Geo-Check In</span>
                <span className="text-white font-semibold block mt-1">
                  {activeBeat.geoCheckIn ? `Checked In: ${activeBeat.geoCheckIn}` : 'Standby'}
                </span>
              </div>
              {!activeBeat.geoCheckIn && (
                <button
                  onClick={() => triggerCheckIn(activeBeat.id)}
                  className="mt-4 w-full py-2 rounded-lg bg-accent-cyan hover:bg-accent-cyan/80 text-xs font-bold text-black cursor-pointer transition-all"
                >
                  Geo Check-In (Dhaka Central Beat)
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-white/40 text-[9px] uppercase font-mono block">Wholesale Capital Collected</span>
                <strong className="text-accent-emerald block mt-1 text-sm">৳{activeBeat.orderCollectedBDT.toLocaleString()} BDT</strong>
              </div>
              <form onSubmit={collectOrder} className="mt-4 flex gap-2">
                <input
                  type="number"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded p-1 text-xs text-white w-24 outline-none"
                />
                <button
                  type="submit"
                  className="flex-1 py-1 px-3 rounded bg-accent-blue hover:bg-accent-blue/80 text-[10px] font-bold text-white cursor-pointer"
                >
                  Add Order
                </button>
              </form>
            </div>
          </div>

          {/* List of Outlets inside Beat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white font-display">Target Wholesale Retail Outlets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OUTLETS.map(out => {
                const visited = activeBeat.visitedOutlets.includes(out.id);
                return (
                  <div key={out.id} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 relative group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-xs font-bold text-white group-hover:text-accent-cyan">{out.name}</h5>
                        <p className="text-[10px] text-white/40 mt-1 flex items-center gap-1">
                          <MapPin size={10} /> {out.location}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        visited ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-white/10 text-white/40'
                      }`}>
                        {visited ? 'VISITED' : 'PENDING'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-[10px] font-mono">
                      <div>
                        <span className="text-white/40 block">Monthly sales:</span>
                        <span className="text-white font-semibold">৳{(out.monthlySalesBDT / 100000).toFixed(1)}L BDT</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">Merchandising share:</span>
                        <span className="text-accent-cyan font-semibold">{out.shelfSharePercent}% Shelf</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Competitor activities & shelf audits */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Store Merchandising Audit</h3>
              <p className="text-[10px] text-white/40 mt-1">Capture compliance indicators</p>
            </div>

            <div className="space-y-4 text-xs">
              {OUTLETS.map(out => (
                <div key={out.id} className="bg-white/[0.01] p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] font-bold text-white block">{out.name}</span>
                  <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed">
                    <strong className="text-accent-amber">Competitor notes: </strong> {out.competitorActivity}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mt-2">
                    <span>HACCP Compliance score:</span>
                    <strong className="text-accent-emerald">{out.auditScore}/100</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[10px] text-white/30 font-mono text-center flex items-center justify-center gap-1.5">
            <AlertCircle size={12} className="text-accent-amber animate-pulse" /> Photos synced with Sales Director
          </div>
        </div>
      </div>
    </div>
  );
}
