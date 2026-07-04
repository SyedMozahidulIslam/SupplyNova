import React, { useState, useEffect } from 'react';
import { Search, X, Package, Truck, Compass, ShoppingCart, UserCheck, Play, Leaf } from 'lucide-react';
import { PRODUCTS, EMPLOYEES, WAREHOUSES, VEHICLES } from '../data/mockData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigateTab }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle (controlled by parent, but let's support escape)
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Filter items based on query
  const filteredProducts = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredStaff = EMPLOYEES.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase()) || e.role.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredVehicles = VEHICLES.filter(v =>
    v.plateNumber.toLowerCase().includes(query.toLowerCase()) || v.type.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);

  const modules = [
    { id: 'overview', name: 'Executive Control Room', icon: Compass },
    { id: 'procurement', name: 'Procurement RFQ Portal', icon: ShoppingCart },
    { id: 'warehouse', name: 'Digital Twin / Warehouse Layout', icon: Package },
    { id: 'fleet', name: 'GPS Fleet Live Tracking Map', icon: Truck },
    { id: 'sustainability', name: 'Sustainability & ESG Command Center', icon: Leaf },
  ].filter(m => m.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center pt-[10vh] z-50">
      <div className="w-full max-w-2xl bg-brand-dark-grey border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-white/[0.02]">
          <Search className="text-white/40" size={18} />
          <input
            type="text"
            placeholder="Type search queries (e.g. lotion, insulin, Kawsar, Bogra)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder-white/30"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/50 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Quick Modules */}
          {modules.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2 px-2">Console Operations</div>
              <div className="grid grid-cols-2 gap-2">
                {modules.map(mod => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        onNavigateTab(mod.id);
                        onClose();
                      }}
                      className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-accent-blue/10 hover:border-accent-blue/30 text-left cursor-pointer group transition-all"
                    >
                      <Icon size={16} className="text-white/40 group-hover:text-accent-cyan" />
                      <span className="text-xs font-semibold text-white group-hover:text-white">{mod.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCM Products */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2 px-2">Inventory Stock Records</div>
              <div className="space-y-1">
                {filteredProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.01] hover:bg-white/5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Package size={14} className="text-accent-amber shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[10px] font-mono text-white/40">{p.sku} | {p.category}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-white">৳{p.priceBDT.toLocaleString()}</div>
                      <div className={`text-[10px] ${p.status === 'in_stock' ? 'text-accent-emerald' : p.status === 'low_stock' ? 'text-accent-amber' : 'text-accent-rose'}`}>
                        {p.stockLevel.toLocaleString()} units
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCM Personnel */}
          {filteredStaff.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2 px-2">Enterprise Corporate Directory</div>
              <div className="space-y-1">
                {filteredStaff.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.01] hover:bg-white/5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={s.avatar} alt={s.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-white">{s.name}</div>
                        <div className="text-[10px] text-accent-cyan">{s.role} | {s.department}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-mono text-white/40">{s.level}</div>
                      <div className="text-[10px] text-white/60">Target: {s.targetAchievement}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCM Active Trucks */}
          {filteredVehicles.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2 px-2">Fleet Active Telemetry</div>
              <div className="space-y-1">
                {filteredVehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.01] hover:bg-white/5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Truck size={14} className="text-accent-cyan shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-white">{v.plateNumber}</div>
                        <div className="text-[10px] text-white/40">{v.type}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-white">Driver: {v.driverName}</div>
                      <div className="text-[10px] text-accent-emerald">{v.status.replace('_', ' ').toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {modules.length === 0 && filteredProducts.length === 0 && filteredStaff.length === 0 && filteredVehicles.length === 0 && (
            <div className="text-center py-10 text-xs text-white/40">No enterprise match found for "{query}"</div>
          )}
        </div>

        {/* Keyboard Footer help */}
        <div className="px-4 py-2.5 bg-white/[0.01] border-t border-white/5 text-[10px] text-white/30 flex items-center justify-between">
          <span>Search index spans 38 roles, 25 inventory lines, 5 reefers & warehouses</span>
          <div className="flex items-center gap-3">
            <span>Esc to close</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
