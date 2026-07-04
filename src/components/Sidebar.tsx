import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Truck,
  Package,
  ShoppingCart,
  DollarSign,
  Compass,
  Thermometer,
  AlertTriangle,
  Brain,
  Users,
  Search,
  CheckCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import { Employee, Role } from '../types';
import { EMPLOYEES } from '../data/mockData';

interface SidebarProps {
  currentEmployee: Employee;
  onSelectEmployee: (employee: Employee) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({
  currentEmployee,
  onSelectEmployee,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  const [showImpersonator, setShowImpersonator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Group roles by department for easier impersonation selection
  const filteredEmployees = EMPLOYEES.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigationItems = [
    { id: 'overview', name: 'Executive Center', icon: Layers, roles: ['Super Admin', 'COO', 'Supply Chain Director', 'Managing Director', 'Procurement Director', 'Warehouse Director', 'Logistics Director', 'National Sales Manager', 'Finance Manager'] },
    { id: 'procurement', name: 'Procurement & RFQ', icon: ShoppingCart, roles: ['Super Admin', 'COO', 'Supply Chain Director', 'Procurement Director', 'Procurement Manager', 'Finance Manager', 'Supplier'] },
    { id: 'warehouse', name: 'Warehouse Digital Twin', icon: Package, roles: ['Super Admin', 'COO', 'Supply Chain Director', 'Warehouse Director', 'Warehouse Manager', 'Inventory Controller', 'Store Manager'] },
    { id: 'fleet', name: 'Fleet GPS GIS Map', icon: Truck, roles: ['Super Admin', 'COO', 'Supply Chain Director', 'Logistics Director', 'Fleet Manager', 'Driver'] },
    { id: 'coldchain', name: 'Cold Chain Telemetry', icon: Thermometer, roles: ['Super Admin', 'COO', 'Supply Chain Director', 'Logistics Director', 'Warehouse Director', 'Fleet Manager', 'Warehouse Manager'] },
    { id: 'sales', name: 'Sales Beat Automation', icon: Compass, roles: ['Super Admin', 'COO', 'National Sales Manager', 'Regional Sales Manager', 'Area Sales Manager', 'Territory Officer', 'Sales Representative'] },
    { id: 'finance', name: 'Finance Ledger BDT', icon: DollarSign, roles: ['Super Admin', 'COO', 'Managing Director', 'Finance Manager'] },
    { id: 'ai-center', name: 'AI SCM Optimizer', icon: Brain, roles: ['Super Admin', 'COO', 'Supply Chain Director', 'Managing Director', 'Procurement Director', 'Warehouse Director', 'Logistics Director', 'Finance Manager'] },
  ];

  const allowedNavs = navigationItems.filter(item => 
    item.roles.includes(currentEmployee.role) || currentEmployee.role === 'Super Admin'
  );

  return (
    <div className="w-80 h-screen glass-panel flex flex-col border-r border-white/10 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-blue rounded flex items-center justify-center shrink-0">
            <span className="font-black text-white text-sm">SN</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tighter uppercase italic text-white leading-none">
              SupplyNova
            </h1>
            <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mt-1">Enterprise SCM</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/20 text-[9px] font-black uppercase tracking-wider text-accent-blue animate-pulse">
          Live
        </div>
      </div>

      {/* Corporate Persona Switching Engine */}
      <div className="p-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Corporate Persona</span>
          <button
            onClick={() => setShowImpersonator(!showImpersonator)}
            className="text-[10px] font-black text-accent-cyan uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
          >
            Impersonate <ChevronDown size={10} />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 border-l-2 border-accent-blue">
          <img
            src={currentEmployee.avatar}
            alt={currentEmployee.name}
            className="w-11 h-11 rounded object-cover ring-1 ring-white/10"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black uppercase tracking-tight text-white truncate">{currentEmployee.name}</h4>
            <p className="text-[10px] text-accent-cyan font-bold uppercase tracking-wider truncate mt-0.5">{currentEmployee.role}</p>
            <p className="text-[9px] font-mono text-gray-400 truncate mt-0.5">{currentEmployee.level}</p>
          </div>
        </div>
      </div>

      {/* Impersonator Drawer / Popup */}
      {showImpersonator && (
        <div className="fixed inset-y-0 left-80 w-80 bg-brand-black/95 backdrop-blur-md border-r border-white/10 p-4 shadow-2xl flex flex-col z-50">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Shield size={14} className="text-accent-cyan" /> Corporate Directory
              </h3>
              <p className="text-[10px] text-white/50">Switch perspective to test role permissions</p>
            </div>
            <button
              onClick={() => setShowImpersonator(false)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/70 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Search box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 text-white/40" size={14} />
            <input
              type="text"
              placeholder="Search employee or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-accent-cyan"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => {
                  onSelectEmployee(emp);
                  setShowImpersonator(false);
                  // Default to first allowable tab
                  const items = navigationItems.filter(item => 
                    item.roles.includes(emp.role) || emp.role === 'Super Admin'
                  );
                  if (items.length > 0) {
                    setActiveTab(items[0].id);
                  }
                }}
                className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all cursor-pointer ${
                  currentEmployee.id === emp.id
                    ? 'bg-accent-blue/20 border border-accent-blue/30'
                    : 'bg-white/[0.02] border border-white/5 hover:bg-white/5'
                }`}
              >
                <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-white truncate">{emp.name}</h5>
                    {currentEmployee.id === emp.id && (
                      <CheckCircle size={10} className="text-accent-emerald shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-accent-cyan truncate">{emp.role}</p>
                  <p className="text-[8px] font-mono text-white/40 truncate">{emp.department}</p>
                </div>
              </button>
            ))}
            {filteredEmployees.length === 0 && (
              <div className="text-center py-6 text-xs text-white/40">No corporate persona found</div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <span className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-3">
          Operations Console
        </span>

        {allowedNavs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-black uppercase tracking-wider transition-all group cursor-pointer border-l-2 ${
                isActive
                  ? 'bg-white/5 text-accent-blue border-accent-blue'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Icon
                size={16}
                className={`transition-all ${
                  isActive ? 'text-accent-blue scale-105' : 'text-gray-500 group-hover:text-white'
                }`}
              />
              <span className="flex-1 text-left truncate">{item.name}</span>
            </button>
          );
        })}

        {allowedNavs.length === 0 && (
          <div className="p-4 text-center rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-xs text-accent-rose">
            Access Restricted. No active operations permissions configured.
          </div>
        )}
      </div>

      {/* Bottom Legal / Enterprise Stamp */}
      <div className="p-6 border-t border-white/10 bg-white/[0.01] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
          <span>SECURE SYSTEM</span>
          <span className="text-accent-emerald flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald inline-block animate-pulse"></span>
            AES-256
          </span>
        </div>
        <p className="text-[9px] text-white/30 text-center">
          Licensed to Multinational FMCG / Retail Partners
        </p>
      </div>
    </div>
  );
}
