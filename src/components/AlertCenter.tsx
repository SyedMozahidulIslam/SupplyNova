import React from 'react';
import { AlertTriangle, ShieldCheck, HelpCircle, X, Bell, Zap, Play } from 'lucide-react';
import { Alert } from '../types';

interface AlertCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onTakeActionOnAlert: (alertId: string) => void;
}

export default function AlertCenter({
  isOpen,
  onClose,
  alerts,
  onTakeActionOnAlert,
}: AlertCenterProps) {
  if (!isOpen) return null;

  const activeAlerts = alerts.filter(a => !a.actionTaken);
  const resolvedAlerts = alerts.filter(a => a.actionTaken);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-accent-rose/20 border-accent-rose/40 text-accent-rose';
      case 'warning': return 'bg-accent-amber/20 border-accent-amber/40 text-accent-amber';
      default: return 'bg-white/10 border-white/20 text-white/50';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-brand-dark-grey/95 border-l border-white/10 shadow-2xl z-50 flex flex-col backdrop-blur-md">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-accent-cyan" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">SCM Alert Control Tower</h3>
            <p className="text-[10px] text-white/40">{activeAlerts.length} unresolved incidents</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Unresolved */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2 px-1">Active Incidents</div>
          <div className="space-y-2">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border space-y-3 transition-all ${getSeverityStyle(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase bg-white/10 px-1.5 py-0.2 rounded font-semibold text-white/80">
                    {alert.module}
                  </span>
                  <span className="text-[9px] font-mono opacity-60">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-white font-medium text-[11px] leading-relaxed">
                  {alert.description}
                </div>
                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => onTakeActionOnAlert(alert.id)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    Acknowledge & Mitigate
                  </button>
                </div>
              </div>
            ))}
            {activeAlerts.length === 0 && (
              <div className="text-center py-10 text-white/40 border border-dashed border-white/5 rounded-xl">
                All systems quiet. Zero incident events triggered.
              </div>
            )}
          </div>
        </div>

        {/* Resolved events */}
        {resolvedAlerts.length > 0 && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2 px-1">Mitigated Incidents log</div>
            <div className="space-y-2 opacity-50">
              {resolvedAlerts.map(alert => (
                <div key={alert.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-white/80 line-through truncate max-w-[180px]">{alert.title}</h5>
                    <span className="text-[9px] font-mono text-accent-emerald">Resolved</span>
                  </div>
                  <ShieldCheck size={16} className="text-accent-emerald" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer system diagnostics */}
      <div className="p-5 border-t border-white/10 bg-white/[0.01] text-[10px] font-mono text-white/30 text-center flex items-center justify-center gap-1">
        <Zap size={10} className="text-accent-emerald animate-pulse" /> Systems logging on UTC loop
      </div>
    </div>
  );
}
