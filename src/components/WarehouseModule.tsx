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
  Calendar,
  TrendingUp,
  Sparkles,
  DollarSign,
  Zap,
  Boxes,
  Play,
  Check,
  AlertCircle,
  ArrowRight,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Warehouse, Product } from '../types';
import { WAREHOUSES, PRODUCTS } from '../data/mockData';

interface WarehouseModuleProps {
  warehouses: Warehouse[];
  onUpdateStock: (sku: string, newQty: number) => void;
  onReportDamage: (sku: string, qty: number, comment: string) => void;
  onAddAuditLog?: (
    actionType: 'create' | 'update' | 'delete' | 'approve' | 'configure' | 'override' | 'mitigate',
    module: 'procurement' | 'warehouse' | 'fleet' | 'coldchain' | 'sales' | 'finance' | 'sustainability' | 'general',
    description: string,
    severity?: 'low' | 'medium' | 'high' | 'critical',
    stateBefore?: string,
    stateAfter?: string
  ) => void;
}

export default function WarehouseModule({
  warehouses,
  onUpdateStock,
  onReportDamage,
  onAddAuditLog,
}: WarehouseModuleProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('wh-1');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [activeSubTab, setActiveSubTab] = useState<'layout' | 'audit' | 'damage' | 'aging'>('layout');
  const [selectedRack, setSelectedRack] = useState<any>(null);

  // Liquidation engine states
  const [activeLiquidationSku, setActiveLiquidationSku] = useState<string | null>(null);
  const [clearedLiquidationSkus, setClearedLiquidationSkus] = useState<string[]>([]);
  const [liquidationProgress, setLiquidationProgress] = useState(0);

  const getProductAgingDistributionForCompleteness = (item: Product) => {
    const total = item.stockLevel;
    const seed = item.sku.charCodeAt(item.sku.length - 1) % 10;
    
    let p0_30 = 0.7;
    let p31_60 = 0.2;
    let p61_90 = 0.08;
    let p90_plus = 0.02;

    if (!item.fastMoving) {
      p0_30 = 0.12 + (seed * 0.01);
      p31_60 = 0.20 + (seed * 0.015);
      p61_90 = 0.38 - (seed * 0.01);
      p90_plus = 0.30 - (seed * 0.015);
    } else {
      p0_30 = 0.80 + (seed * 0.01);
      p31_60 = 0.12 - (seed * 0.005);
      p61_90 = 0.06 - (seed * 0.003);
      p90_plus = 0.02;
    }

    const sum = p0_30 + p31_60 + p61_90 + p90_plus;
    const b0_30 = Math.round(total * (p0_30 / sum));
    const b31_60 = Math.round(total * (p31_60 / sum));
    const b61_90 = Math.round(total * (p61_90 / sum));
    const b90_plus = Math.max(0, total - b0_30 - b31_60 - b61_90);

    return { b0_30, b31_60, b61_90, b90_plus };
  };

  const getLiquidationStrategyForProduct = (p: Product, idx: number) => {
    if (idx === 0) {
      return {
        method: "B2B WHOLESALE",
        title: `Regional Distributor Clearance for SKU ${p.sku}`,
        description: `Execute high-volume dispatch of stagnant ${p.category} units to certified wholesalers in Chittagong, liquidating stagnant capacity at a bulk salvage wholesale margin.`,
        discountRate: 65,
        salvagePriceBDT: Math.round(p.priceBDT * 0.65),
        estRecoveryValue: Math.round(getProductAgingDistributionForCompleteness(p).b90_plus * p.priceBDT * 0.65)
      };
    } else if (idx === 1) {
      return {
        method: "SFA BUNDLED PROMO",
        title: `Salesforce Smart Multi-Buy Campaign`,
        description: `Push real-time multi-buy discount triggers directly to the Sales Agent Beat app, pairing slow-moving ${p.sku} with active fast-moving SKUs of same class.`,
        discountRate: 50,
        salvagePriceBDT: Math.round(p.priceBDT * 0.50),
        estRecoveryValue: Math.round(getProductAgingDistributionForCompleteness(p).b90_plus * p.priceBDT * 0.50)
      };
    } else {
      return {
        method: "DIRECT RETAIL FLASH",
        title: `Dynamic Retail Markdown & Flash clearance`,
        description: `Trigger automatic price markdowns to registered retail stores via the corporate logistics portal to fast-track clearing stock ahead of the next fiscal audit.`,
        discountRate: 40,
        salvagePriceBDT: Math.round(p.priceBDT * 0.40),
        estRecoveryValue: Math.round(getProductAgingDistributionForCompleteness(p).b90_plus * p.priceBDT * 0.40)
      };
    }
  };

  const handleExecuteLiquidation = (p: Product, strategy: any) => {
    setActiveLiquidationSku(p.sku);
    setLiquidationProgress(5);
    
    const interval = setInterval(() => {
      setLiquidationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      const aging = getProductAgingDistributionForCompleteness(p);
      const clearedVolume = aging.b90_plus;
      
      // Update ERP stock Level dynamically
      onUpdateStock(p.sku, Math.max(0, p.stockLevel - clearedVolume));

      setProducts(prev => prev.map(item => {
        if (item.sku === p.sku) {
          const newStockLevel = Math.max(0, item.stockLevel - clearedVolume);
          return {
            ...item,
            stockLevel: newStockLevel,
            status: newStockLevel > item.minSafetyStock ? 'in_stock' : newStockLevel > 0 ? 'low_stock' : 'out_of_stock'
          };
        }
        return item;
      }));

      setClearedLiquidationSkus(prev => [...prev, p.sku]);
      setActiveLiquidationSku(null);
      setLiquidationProgress(0);

      if (onAddAuditLog) {
        onAddAuditLog(
          'override',
          'warehouse',
          `Authorized AI Liquidation strategy [${strategy.method}] for SKU ${p.sku} ("${p.name}"). Cleared ${clearedVolume.toLocaleString()} units of stagnant stock, recovering ৳${strategy.estRecoveryValue.toLocaleString()} BDT.`,
          'high',
          `stock_level: ${p.stockLevel.toLocaleString()}, b90_plus: ${clearedVolume.toLocaleString()}`,
          `stock_level: ${(p.stockLevel - clearedVolume).toLocaleString()}, b90_plus: 0 (Cleared)`
        );
      }

      setSuccessMsg(`AI Clearance Dispatched: Successfully liquidated ${p.sku} dead stock. Recovered BDT ৳${strategy.estRecoveryValue.toLocaleString()} in secondary capital channels.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }, 2500);
  };

  // Cycle Counting form state
  const [auditSku, setAuditSku] = useState(products[0]?.sku || '');
  const [auditQty, setAuditQty] = useState(1000);

  // Damage report form state
  const [damageSku, setDamageSku] = useState(products[0]?.sku || '');
  const [damageQty, setDamageQty] = useState(50);
  const [damageComment, setDamageComment] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const activeWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];
  const warehouseProducts = products.filter(p => p.warehouseId === selectedWarehouseId);

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
    
    // Sync local products state
    setProducts(prev => prev.map(p => p.sku === auditSku ? {
      ...p,
      stockLevel: auditQty,
      status: auditQty > p.minSafetyStock ? 'in_stock' : auditQty > 0 ? 'low_stock' : 'out_of_stock'
    } : p));

    setSuccessMsg(`Cycle Count recorded. SKU ${auditSku} adjusted to ${auditQty.toLocaleString()} units.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleReportDamageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportDamage(damageSku, damageQty, damageComment);
    
    // Sync local products state by subtracting damaged quantity
    setProducts(prev => prev.map(p => p.sku === damageSku ? {
      ...p,
      stockLevel: Math.max(0, p.stockLevel - damageQty),
      status: Math.max(0, p.stockLevel - damageQty) > p.minSafetyStock ? 'in_stock' : Math.max(0, p.stockLevel - damageQty) > 0 ? 'low_stock' : 'out_of_stock'
    } : p));

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
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Inventory Auditing & Analytics Panel</h3>
          <p className="text-xs text-gray-300 leading-relaxed mt-1">
            Track spatial allocations, verify ERP stock counts, file damage claims, or audit inventory aging profiles with AI remediation.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
            <button
              onClick={() => setActiveSubTab('layout')}
              className={`py-2 text-[10px] font-black uppercase tracking-widest rounded border text-center transition-all cursor-pointer ${
                activeSubTab === 'layout' ? 'bg-accent-cyan border-accent-cyan text-black font-extrabold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Digital Twin
            </button>
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`py-2 text-[10px] font-black uppercase tracking-widest rounded border text-center transition-all cursor-pointer ${
                activeSubTab === 'audit' ? 'bg-accent-cyan border-accent-cyan text-black font-extrabold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Cycle Count
            </button>
            <button
              onClick={() => setActiveSubTab('damage')}
              className={`py-2 text-[10px] font-black uppercase tracking-widest rounded border text-center transition-all cursor-pointer ${
                activeSubTab === 'damage' ? 'bg-accent-cyan border-accent-cyan text-black font-extrabold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Damage Log
            </button>
            <button
              onClick={() => setActiveSubTab('aging')}
              className={`py-2 text-[10px] font-black uppercase tracking-widest rounded border text-center transition-all cursor-pointer ${
                activeSubTab === 'aging' ? 'bg-accent-cyan border-accent-cyan text-black font-extrabold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Aging & AI Suggestions
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

      {/* SUB-TAB 4: INVENTORY AGING & AI LIQUIDATION */}
      {activeSubTab === 'aging' && (() => {
        const getProductAgingDistribution = (p: Product) => {
          const total = p.stockLevel;
          const seed = p.sku.charCodeAt(p.sku.length - 1) % 10;
          
          let p0_30 = 0.7;
          let p31_60 = 0.2;
          let p61_90 = 0.08;
          let p90_plus = 0.02;

          if (!p.fastMoving) {
            p0_30 = 0.12 + (seed * 0.01);
            p31_60 = 0.20 + (seed * 0.015);
            p61_90 = 0.38 - (seed * 0.01);
            p90_plus = 0.30 - (seed * 0.015);
          } else {
            p0_30 = 0.80 + (seed * 0.01);
            p31_60 = 0.12 - (seed * 0.005);
            p61_90 = 0.06 - (seed * 0.003);
            p90_plus = 0.02;
          }

          const sum = p0_30 + p31_60 + p61_90 + p90_plus;
          const b0_30 = Math.round(total * (p0_30 / sum));
          const b31_60 = Math.round(total * (p31_60 / sum));
          const b61_90 = Math.round(total * (p61_90 / sum));
          const b90_plus = Math.max(0, total - b0_30 - b31_60 - b61_90);

          return { b0_30, b31_60, b61_90, b90_plus };
        };

        const agedProducts = warehouseProducts.map(p => {
          const aging = getProductAgingDistribution(p);
          const deadStockValue = aging.b90_plus * p.priceBDT;
          const totalValue = p.stockLevel * p.priceBDT;
          return {
            ...p,
            ...aging,
            deadStockValue,
            totalValue
          };
        });

        const totalStockVolume = agedProducts.reduce((sum, p) => sum + p.stockLevel, 0);
        const totalDeadStockVolume = agedProducts.reduce((sum, p) => sum + p.b90_plus, 0);
        const totalWarehouseValue = agedProducts.reduce((sum, p) => sum + p.totalValue, 0);
        const totalDeadStockValue = agedProducts.reduce((sum, p) => sum + p.deadStockValue, 0);
        const deadStockRatio = totalStockVolume > 0 ? (totalDeadStockVolume / totalStockVolume) * 100 : 0;
        
        const estHoldingCost = totalDeadStockValue * 0.018;

        const uniqueCategories = Array.from(new Set(agedProducts.map(p => p.category)));
        const chartData = uniqueCategories.map(cat => {
          const catProducts = agedProducts.filter(p => p.category === cat);
          const b0_30 = catProducts.reduce((sum, p) => sum + p.b0_30, 0);
          const b31_60 = catProducts.reduce((sum, p) => sum + p.b31_60, 0);
          const b61_90 = catProducts.reduce((sum, p) => sum + p.b61_90, 0);
          const b90_plus = catProducts.reduce((sum, p) => sum + p.b90_plus, 0);
          return {
            name: cat,
            "0-30 Days (Active)": b0_30,
            "31-60 Days (Stable)": b31_60,
            "61-90 Days (Slow)": b61_90,
            "90+ Days (Dead Stock)": b90_plus,
          };
        });

        const topDeadStockItems = [...agedProducts]
          .filter(p => p.b90_plus > 20)
          .sort((a, b) => b.deadStockValue - a.deadStockValue)
          .slice(0, 3);

        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-500 block text-[9px] font-mono font-black uppercase tracking-wider">Total Stored Value</span>
                <span className="text-xl font-display font-black text-white block">৳{totalWarehouseValue.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 block font-mono">{totalStockVolume.toLocaleString()} units stored</span>
              </div>
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-accent-rose block text-[9px] font-mono font-black uppercase tracking-wider">Dead Stock tied-up</span>
                <span className="text-xl font-display font-black text-accent-rose block">৳{totalDeadStockValue.toLocaleString()}</span>
                <span className="text-[10px] text-accent-rose/70 block font-mono">{totalDeadStockVolume.toLocaleString()} units (&gt;90 days)</span>
              </div>
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-accent-amber block text-[9px] font-mono font-black uppercase tracking-wider">Dead Stock Ratio</span>
                <span className="text-xl font-display font-black text-accent-amber block">{deadStockRatio.toFixed(1)}%</span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  {deadStockRatio > 15 ? '⚠️ High risk overhead' : '✅ Below SLA risk threshold'}
                </span>
              </div>
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-accent-cyan block text-[9px] font-mono font-black uppercase tracking-wider">Est. Carrying Costs /Mo</span>
                <span className="text-xl font-display font-black text-accent-cyan block">৳{Math.round(estHoldingCost).toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 block font-mono">At 1.8% average monthly capital loss</span>
              </div>
            </div>

            {/* Middle Section: Chart and High-Risk List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stacked Bar Chart */}
              <div className="lg:col-span-2 bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Inventory Aging Distribution by Category</h4>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-wider">Stacked volumetric comparison across product classes</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} fontClassName="font-mono" tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} fontClassName="font-mono" tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a0a',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontFamily: 'monospace',
                          fontSize: '11px'
                        }}
                      />
                      <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#aaa', marginTop: '10px' }} />
                      <Bar dataKey="0-30 Days (Active)" stackId="a" fill="#10b981" />
                      <Bar dataKey="31-60 Days (Stable)" stackId="a" fill="#06b6d4" />
                      <Bar dataKey="61-90 Days (Slow)" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="90+ Days (Dead Stock)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dead Stock Heavy SKUs */}
              <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Aged Dead Stock Hotspots (&gt;90 Days)</h4>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-wider">Urgent clearing candidates ordered by capital tie-up</p>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[240px] pr-1 scrollbar-thin">
                  {agedProducts.filter(p => p.b90_plus > 0).sort((a,b) => b.deadStockValue - a.deadStockValue).map(p => {
                    const ratio = p.stockLevel > 0 ? (p.b90_plus / p.stockLevel) * 100 : 0;
                    return (
                      <div key={p.id} className="p-3 rounded bg-white/[0.01] border border-white/5 space-y-2 text-xs">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-[10px] text-accent-cyan font-bold block">{p.sku}</span>
                            <span className="text-white font-medium line-clamp-1">{p.name}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase rounded bg-accent-rose/20 text-accent-rose shrink-0">
                            {ratio.toFixed(0)}% Dead
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-gray-400">
                          <div>Dead Volume: <span className="text-white font-bold">{p.b90_plus.toLocaleString()} u</span></div>
                          <div>Tied Capital: <span className="text-white font-bold">৳{p.deadStockValue.toLocaleString()}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 font-mono">
                  <span>Automatic WMS Alerts Active</span>
                  <Clock size={10} />
                </div>
              </div>
            </div>

            {/* Bottom Section: AI Liquidation Engine (Interactive) */}
            <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
                    <Sparkles size={16} className="text-accent-cyan animate-pulse" /> AI Inventory Liquidation Engine
                  </h4>
                  <p className="text-xs text-white/50 mt-1">
                    Smart algorithms generating immediate recovery workflows for stagnant assets in this warehouse zone.
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan font-mono font-bold uppercase shrink-0">
                  ⚡ Models preloaded
                </span>
              </div>

              {topDeadStockItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-white/40 flex flex-col items-center gap-2">
                  <CheckCircle size={24} className="text-accent-emerald" />
                  No excessive dead stock identified in this digital twin node. Maximum inventory turnaround rate achieved!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {topDeadStockItems.map((p, idx) => {
                    const strategy = getLiquidationStrategyForProduct(p, idx);
                    const isProcessing = activeLiquidationSku === p.sku;
                    const isSuccess = clearedLiquidationSkus.includes(p.sku);

                    return (
                      <div 
                        key={p.sku} 
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                          isSuccess 
                            ? 'bg-accent-emerald/[0.02] border-accent-emerald/30 opacity-75' 
                            : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-white/10 text-white uppercase">
                              {strategy.method}
                            </span>
                            <span className="text-[10px] text-accent-cyan font-bold font-mono">
                              Recovery: ৳{strategy.estRecoveryValue.toLocaleString()}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-white mt-1 uppercase tracking-tight">{strategy.title}</h5>
                          <p className="text-[11px] text-white/60 leading-relaxed">{strategy.description}</p>
                          
                          <div className="bg-black/25 p-2 rounded border border-white/[0.03] space-y-1 text-[10px] font-mono text-gray-400">
                            <div className="flex justify-between">
                              <span>Target Item:</span>
                              <span className="text-white font-medium truncate max-w-[120px]">{p.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Units to Clear:</span>
                              <span className="text-accent-rose font-bold">{p.b90_plus.toLocaleString()} units</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Original Capital:</span>
                              <span className="text-white">৳{p.deadStockValue.toLocaleString()} BDT</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-accent-amber pt-1 border-t border-white/[0.05] font-black">
                              <span>Recovery Yield:</span>
                              <span>{strategy.discountRate}% (৳{strategy.salvagePriceBDT.toLocaleString()}/unit)</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {isSuccess ? (
                            <div className="w-full py-2 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-center text-[10px] font-mono font-bold uppercase rounded flex items-center justify-center gap-1">
                              <Check size={12} /> Strategy Executed
                            </div>
                          ) : isProcessing ? (
                            <div className="space-y-1.5">
                              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="bg-accent-cyan h-full rounded-full animate-pulse" style={{ width: `${liquidationProgress}%`, transition: 'width 200ms ease' }}></div>
                              </div>
                              <span className="text-[9px] text-accent-cyan font-mono block text-center uppercase tracking-widest font-black">
                                {liquidationProgress < 25 ? 'Re-routing WMS ledger...' : liquidationProgress < 60 ? 'Creating discount contracts...' : liquidationProgress < 90 ? 'Updating SFA databases...' : 'Finalizing compliance signatures...'}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleExecuteLiquidation(p, strategy)}
                              className="w-full py-2 bg-accent-cyan hover:bg-accent-cyan/90 text-black text-[10px] font-mono font-black uppercase tracking-wider rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <Play size={10} fill="#000" /> Dispatch Clearance
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
