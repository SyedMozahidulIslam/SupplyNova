import React, { useState } from 'react';
import {
  Bell,
  Search,
  Activity,
  ShieldCheck,
  Coins,
  Cpu,
  CornerDownLeft,
} from 'lucide-react';
import { Employee, Alert } from '../types';

interface HeaderProps {
  currentEmployee: Employee;
  alerts: Alert[];
  onOpenAlertCenter: () => void;
  onOpenCommandPalette: () => void;
}

export default function Header({
  currentEmployee,
  alerts,
  onOpenAlertCenter,
  onOpenCommandPalette,
}: HeaderProps) {
  const activeAlertsCount = alerts.filter(a => !a.actionTaken).length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' && !a.actionTaken).length;

  return (
    <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between bg-brand-black/40 backdrop-blur-md relative z-20">
      {/* Search Input / Command Palette Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white/50 text-xs w-80 text-left transition-all group cursor-pointer"
        >
          <Search size={14} className="text-white/40 group-hover:text-white/70" />
          <span className="font-bold uppercase tracking-wider text-[10px] flex-1">Search SupplyNova...</span>
          <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-white/60">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Center SCM Enterprise details */}
      <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-gray-400">
        <div className="flex items-center gap-1.5 border-r border-white/10 pr-6">
          <Coins size={14} className="text-accent-cyan" />
          <span className="font-black uppercase tracking-wider">SCM currency: </span>
          <span className="text-white font-bold">BDT (৳)</span>
        </div>
        <div className="flex items-center gap-1.5 border-r border-white/10 pr-6">
          <ShieldCheck size={14} className="text-accent-emerald" />
          <span className="font-black uppercase tracking-wider">VAT BIN: </span>
          <span className="text-white font-bold">000192837-0101</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu size={14} className="text-accent-amber" />
          <span className="font-black uppercase tracking-wider">Server: </span>
          <span className="text-accent-emerald font-bold flex items-center gap-1 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald inline-block animate-ping"></span>
            ACTIVE-SSL
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Dynamic Alert Center bell */}
        <button
          onClick={onOpenAlertCenter}
          className="relative p-2.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
        >
          <Bell size={18} className="text-white/70 group-hover:text-white" />
          {activeAlertsCount > 0 && (
            <span className={`absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded px-1 text-[9px] font-black text-black flex items-center justify-center animate-bounce ${
              criticalAlertsCount > 0 ? 'bg-accent-rose' : 'bg-accent-amber'
            }`}>
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* User security context status */}
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded">
          <div className="w-2.5 h-2.5 rounded bg-accent-emerald relative">
            <span className="absolute inset-0 w-full h-full rounded bg-accent-emerald/50 animate-ping"></span>
          </div>
          <div className="text-left">
            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 leading-none">RBAC Security</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-white leading-none mt-1">
              {currentEmployee.role === 'Super Admin' ? 'Root Access' : `${currentEmployee.role} View`}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
