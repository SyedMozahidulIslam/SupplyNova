import React, { useState } from 'react';
import {
  Package,
  Layers,
  Thermometer,
  ShieldAlert,
  Edit,
  RefreshCw,
  MapPin,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';
import { Warehouse, Product } from '../types';
import { WAREHOUSES, PRODUCTS } from '../data/mockData';

interface WarehouseModuleProps {
  warehouses: Warehouse[];
  onUpdateStock: (sku: string, newQty: number) => void;
  onReportDamage: (sku: string, qty: number, comment: string) => void;
}

export default function WarehouseModule({
  warehouses,
  onUpdateStock,
  onReportDamage,
}: WarehouseModuleProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('wh-1');
  const [activeSubTab, setActiveSubTab] = useState<'layout' | 'audit' | 'damage'>('layout');
  const [selectedRack, setSelectedRack] = useState<any>(null);

  // Cycle Counting form state
  const [auditSku, setAuditSku] = useState(PRODUCTS[0]?.sku || '');
  const [auditQty, setAuditQty] = useState(1000);

  // Damage report form state
  const [damageSku, setDamageSku] = useState(PRODUCTS[0]?.sku || '');
  const [damageQty, setDamageQty] = useState(50);
  const [damageComment, setDamageComment] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const activeWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];
  const warehouseProducts = PRODUCTS.filter(p => p.warehouseId === selectedWarehouseId);

  const getFillColor = (percent: number) => {
    if (percent > 90) return 'bg-accent-rose text-black border-accent-rose/50';
    if (percent > 75) return 'bg-accent-amber text-black border-accent-amber/50';
    if (percent > 50) return 'bg-accent-blue/30 text-white border-accent-blue/40';
    return 'bg-white/10 text-white/70 border-white/20';
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'cold': return 'border-accent-cyan text-accent-cyan bg-accent-cyan/10';
      case 'fast': return 'border-accent-emerald text-accent-emerald bg-accent-emerald/10';
      case 'slow': return 'border-white/20 text-white/50 bg-white/5';
      default: return 'border-white/10 text-white/70 bg-white/[0.02]';
    }
  };

  const handleUpdateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStock(auditSku, auditQty);
    setSuccessMsg(`Cycle Count recorded. SKU ${auditSku} adjusted to ${auditQty.toLocaleString()} units.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleReportDamageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportDamage(damageSku, damageQty, damageComment);
    setSuccessMsg(`Damage Report compiled. ${damageQty} units of SKU ${damageSku} isolated for disposal.`);
    setDamageComment('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Warehouse Selector & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded border border-white/10 bg-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
                <Package size={20} className="text-accent-cyan" /> WMS Digital Twin
              </h2>
              <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
                Real-time zone monitoring, rack spatial coordinates, and smart bin allocations
              </p>
            </div>
            {/* Dropdown Selector */}
            <select
              value={selectedWarehouseId}
              onChange={(e) => {
                setSelectedWarehouseId(e.target.value);
                setSelectedRack(null);
              }}
              className="bg-white/5 border border-white/10 rounded p-2 px-3 text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-accent-cyan cursor-pointer"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id} className="bg-brand-black">{w.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs font-mono">
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">Storage Location</span>
              <span className="text-white font-bold truncate block mt-1 uppercase">{activeWarehouse.location}</span>
            </div>
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">Filled Capacity</span>
              <span className="text-white font-bold flex items-center gap-1.5 mt-1 uppercase">
                <span className="w-2 h-2 rounded bg-accent-amber block"></span>
                {activeWarehouse.filledPercent}% ({activeWarehouse.capacitySqft.toLocaleString()} Sqft)
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">Atmospheric Sensors</span>
              <span className="text-accent-cyan font-bold block mt-1 uppercase">
                🌡️ {activeWarehouse.tempCelsius}°C | 💧 {activeWarehouse.humidityPercent}% RH
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <span className="text-gray-500 block text-[9px] font-black uppercase tracking-widest">Security Risks</span>
              <span className={`font-bold block mt-1 uppercase ${
                activeWarehouse.activeIncidents > 0 ? 'text-accent-rose' : 'text-accent-emerald'
              }`}>
                {activeWarehouse.activeIncidents > 0 ? `🚨 ${activeWarehouse.activeIncidents} Alert` : '🛡️ All Clear'}
              </span>
            </div>
          </div>
        </div>

        {/* Action navigation card */}
        <div className="p-6 rounded border border-white/10 bg-white/5 flex flex-col justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Inventory Auditing Panel</h3>
          <p className="text-xs text-gray-300 leading-relaxed mt-1">
            Perform cycle counting audits and record material damages directly inside the digital twin layout.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              onClick={() => setActiveSubTab('layout')}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded border text-center transition-all cursor-pointer ${
                activeSubTab === 'layout' ? 'bg-accent-cyan border-accent-cyan text-black' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Digital Twin
            </button>
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded border text-center transition-all cursor-pointer ${
                activeSubTab === 'audit' ? 'bg-accent-cyan border-accent-cyan text-black' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Cycle Count
            </button>
            <button
              onClick={() => setActiveSubTab('damage')}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded border text-center transition-all cursor-pointer ${
                activeSubTab === 'damage' ? 'bg-accent-cyan border-accent-cyan text-black' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Damage Log
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald font-semibold flex items-center gap-2">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* SUB-TAB 1: DIGITAL TWIN LAYOUT */}
      {activeSubTab === 'layout' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Layout Grid */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-display">Warehouse 2D Zone Grid</h3>
              <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent-rose inline-block"></span> High (&gt;90%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent-amber inline-block"></span> Medium (75-90%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent-blue/40 inline-block"></span> Normal (50-75%)</span>
              </div>
            </div>

            <div className="space-y-6">
              {activeWarehouse.zones.map((zone, zIdx) => (
                <div key={zIdx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Layers size={12} className="text-accent-cyan" /> {zone.name}
                    </span>
                    <span className="font-mono text-white/40">Zone Ambient: {zone.temperature}°C</span>
                  </div>

                  {/* Interactive Rack Boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {zone.racks.map((rack, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => setSelectedRack({ ...rack, zone: zone.name })}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${getFillColor(rack.fillStatus)} ${
                          selectedRack?.name === rack.name ? 'ring-2 ring-accent-cyan border-accent-cyan' : ''
                        }`}
                      >
                        <div className="text-xs font-bold leading-none">{rack.name}</div>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-[10px] opacity-75">{rack.fillStatus}% Density</span>
                          <span className={`text-[8px] px-1 py-0.2 rounded font-mono uppercase ${getTypeStyle(rack.type)}`}>
                            {rack.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Selected Rack Details */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            {selectedRack ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    Rack telemetry: <span className="text-accent-cyan font-mono">{selectedRack.name}</span>
                  </h3>
                  <p className="text-[10px] text-white/40 mt-1">Location context: {selectedRack.zone}</p>
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <span className="text-white/40 text-[9px] block">Spatial Volume Filled</span>
                    <div className="w-full bg-white/10 h-2 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-accent-amber h-full rounded-full" style={{ width: `${selectedRack.fillStatus}%` }}></div>
                    </div>
                    <span className="text-white text-xs block text-right mt-1">{selectedRack.fillStatus}% Capacity</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                      <span className="text-white/40 text-[9px] block">Atmospheric Risk</span>
                      <span className="text-white font-semibold block mt-0.5">SAFE</span>
                    </div>
                    <div className="bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                      <span className="text-white/40 text-[9px] block">Zone class</span>
                      <span className="text-accent-cyan font-semibold block mt-0.5 uppercase">{selectedRack.type}</span>
                    </div>
                  </div>
                </div>

                {/* Products stored inside selected rack */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Item Allocation:</h4>
                  <div className="space-y-1">
                    {warehouseProducts.slice(0, 3).map(p => (
                      <div key={p.id} className="p-2 bg-white/[0.01] border border-white/5 rounded text-[11px] flex items-center justify-between">
                        <span className="text-white font-medium truncate max-w-[130px]">{p.name}</span>
                        <span className="text-white/60 font-mono shrink-0">{p.stockLevel.toLocaleString()} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-white/40 flex flex-col items-center justify-center gap-3">
                <Layers size={24} className="text-white/20 animate-pulse" />
                Select any digital rack from the grid layout to inspect atmospheric telemetry, storage allocation, and volumetric data.
              </div>
            )}

            <div className="pt-4 border-t border-white/5 text-[10px] text-white/30 font-mono text-center">
              RFID / Barcode tracking active
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CYCLE COUNT AUDITING */}
      {activeSubTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Operational Cycle Counting Adjuster</h3>
            <p className="text-xs text-white/50 mt-1">Audit stock quantities to maintain perfect records</p>
          </div>

          <form onSubmit={handleUpdateAudit} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Select Product SKU</label>
              <select
                value={auditSku}
                onChange={(e) => setAuditSku(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-accent-cyan"
              >
                {warehouseProducts.map(p => (
                  <option key={p.id} value={p.sku} className="bg-brand-black">{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Physical Count Audited</label>
              <input
                type="number"
                value={auditQty}
                onChange={(e) => setAuditQty(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-accent-cyan hover:bg-accent-cyan/80 text-xs font-bold text-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw size={14} /> Re-align ERP Stock Quantities
              </button>
            </div>
          </form>

          {/* Inventory Table */}
          <div className="border border-white/5 rounded-xl overflow-hidden mt-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5 font-mono text-[10px] text-white/50 uppercase tracking-wider">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Stock Level</th>
                  <th className="p-3 text-right">Min Safety Stock</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px] text-white/80">
                {warehouseProducts.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.01]">
                    <td className="p-3 font-semibold text-accent-cyan">{p.sku}</td>
                    <td className="p-3 font-sans text-white font-medium">{p.name}</td>
                    <td className="p-3 text-white/60">{p.category}</td>
                    <td className="p-3 text-right text-white font-semibold">{p.stockLevel.toLocaleString()}</td>
                    <td className="p-3 text-right text-white/50">{p.minSafetyStock.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        p.status === 'in_stock' ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-accent-rose/20 text-accent-rose'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DAMAGE REPORTING */}
      {activeSubTab === 'damage' && (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white font-display">SCM Damage Logging & Quarantine Request</h3>
            <p className="text-xs text-white/50 mt-1">Quarantine damaged or expired items to prevent supply defects</p>
          </div>

          <form onSubmit={handleReportDamageSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Select Damaged Item SKU</label>
              <select
                value={damageSku}
                onChange={(e) => setDamageSku(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-accent-cyan"
              >
                {warehouseProducts.map(p => (
                  <option key={p.id} value={p.sku} className="bg-brand-black">{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Damaged Quantity (units)</label>
              <input
                type="number"
                value={damageQty}
                onChange={(e) => setDamageQty(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Damage Comment / Defect Reason</label>
              <input
                type="text"
                value={damageComment}
                onChange={(e) => setDamageComment(e.target.value)}
                placeholder="e.g. Liquid leak during haul or seal fracture"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-accent-rose hover:bg-accent-rose/80 text-xs font-bold text-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ShieldAlert size={14} /> Quarantine Damaged Stocks
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
