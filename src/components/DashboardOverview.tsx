import React from 'react';
import {
  TrendingUp,
  Truck,
  Package,
  Activity,
  AlertOctagon,
  ShieldCheck,
  ThermometerSnowflake,
  Users,
  Calendar,
  Zap,
  DollarSign,
  PieChart,
  CornerUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Employee, Alert, Warehouse, Vehicle, FinancialRecord } from '../types';
import { PRODUCTS } from '../data/mockData';
import ScmEChartsPanel from './ScmEChartsPanel';

interface DashboardOverviewProps {
  currentEmployee: Employee;
  alerts: Alert[];
  warehouses: Warehouse[];
  vehicles: Vehicle[];
  financials: FinancialRecord[];
  onNavigateTab: (tabId: string) => void;
  onTakeActionOnAlert: (alertId: string) => void;
}

export default function DashboardOverview({
  currentEmployee,
  alerts,
  warehouses,
  vehicles,
  financials,
  onNavigateTab,
  onTakeActionOnAlert,
}: DashboardOverviewProps) {
  // Compute metrics from real state
  const totalFleetInTransit = vehicles.filter(v => v.status === 'in_transit').length;
  const activeAlerts = alerts.filter(a => !a.actionTaken);
  const totalStockCount = PRODUCTS.reduce((sum, p) => sum + p.stockLevel, 0);
  const lowStockItemsCount = PRODUCTS.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;

  const totalIncome = financials.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amountBDT, 0);
  const totalExpense = financials.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amountBDT, 0);
  const netProfit = totalIncome - totalExpense;

  // Chart data summarizing weekly financials
  const financialTrendData = [
    { name: 'Mon', revenue: 2400000, cost: 1200000, profit: 1200000 },
    { name: 'Tue', revenue: 3800000, cost: 1800000, profit: 2000000 },
    { name: 'Wed', revenue: 2900000, cost: 1450000, profit: 1450000 },
    { name: 'Thu', revenue: 4500000, cost: 2100000, profit: 2400000 },
    { name: 'Fri', revenue: 5800000, cost: 2800000, profit: 3000000 },
    { name: 'Sat', revenue: 3100000, cost: 1500000, profit: 1600000 },
    { name: 'Sun', revenue: 4200000, cost: 1900000, profit: 2300000 },
  ];

  // Distribution chart of products
  const categoryData = [
    { name: 'Personal Care', stock: 61950 },
    { name: 'Beverage', stock: 91580 },
    { name: 'Food', stock: 26000 },
    { name: 'Electronics', stock: 2210 },
    { name: 'Pharma', stock: 200100 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Panel with Glass Banner */}
      <div className="p-6 rounded border border-white/10 bg-white/5 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/5 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-accent-cyan/5 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">
              SYSTEM COMMAND OVERVIEW
            </span>
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping"></span>
          </div>
          <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white">
            Welcome back, <span className="text-accent-cyan">{currentEmployee.name}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            SupplyNova is active with real-time telematics. You have authorized clearance as{' '}
            <span className="text-accent-blue font-bold uppercase tracking-wider">{currentEmployee.role}</span>.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded shrink-0">
          <Calendar className="text-accent-cyan" size={18} />
          <div className="text-left font-mono">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">SCM UTC TIMESTAMP</div>
            <div className="text-xs font-bold text-white mt-0.5">2026-07-03 21:11</div>
            <div className="text-[10px] text-accent-emerald font-black uppercase tracking-wider mt-0.5">Live Operational Sync</div>
          </div>
        </div>
      </div>

      {/* CEO / Executive Daily Brief (AI Driven Insight Card) */}
      <div className="p-5 rounded border border-accent-blue/30 bg-accent-blue/5 relative border-l-4">
        <div className="absolute top-3 right-3 flex items-center gap-1.5 text-accent-cyan text-[10px] font-black uppercase tracking-wider bg-accent-cyan/10 px-2 py-0.5 rounded">
          <Zap size={10} className="animate-bounce" /> AI Executive Advisor
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
          CEO Daily Operations Brief
        </h3>
        <p className="text-xs text-white/90 leading-relaxed">
          <strong className="text-accent-amber font-bold">Upcoming Eid-ul-Fitr Surge Alert:</strong> SCM models predict a{' '}
          <span className="text-accent-emerald font-bold">2.3x increase</span> in wholesale FMCG demand across
          northern districts (Bogra Hub). Recommend increasing raw procurement orders for Unilever and PRAN-RFL products.
          Additionally, a refrigerated truck delay has been identified on route to Sylhet; temperature is stabilized.
        </p>
      </div>

      {/* Animated KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI Card 1: Revenue */}
        <div className="p-5 rounded bg-white/5 border border-white/10 border-l-4 border-l-accent-blue flex flex-col justify-between relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/[0.01] rounded-full filter blur-2xl group-hover:bg-accent-blue/[0.03] transition-all"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-kpi">Total Sales Revenue</p>
              <h4 className="text-xl sm:text-2xl font-kpi font-extrabold tracking-wider text-white mt-2 leading-none uppercase">
                ৳{(totalIncome / 100000).toFixed(1)} Lakh
              </h4>
            </div>
            <div className="w-8 h-8 rounded bg-accent-blue/10 flex items-center justify-center text-accent-blue shrink-0">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-accent-emerald font-black uppercase tracking-widest">
            <TrendingUp size={12} />
            <span>+14.2% MoM Growth</span>
          </div>
        </div>

        {/* KPI Card 2: Fleet Dispatch */}
        <button
          onClick={() => onNavigateTab('fleet')}
          className="p-5 rounded bg-white/5 border border-white/10 border-l-4 border-l-accent-cyan flex flex-col justify-between relative group text-left cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/[0.01] rounded-full filter blur-2xl group-hover:bg-accent-cyan/[0.03] transition-all"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-kpi">Fleet Transit Ratio</p>
              <h4 className="text-xl sm:text-2xl font-kpi font-extrabold tracking-wider text-white mt-2 leading-none uppercase">
                {totalFleetInTransit} / {vehicles.length} Active
              </h4>
            </div>
            <div className="w-8 h-8 rounded bg-accent-cyan/10 flex items-center justify-center text-accent-cyan shrink-0">
              <Truck size={16} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-gray-400 font-black uppercase tracking-widest">
            <span>92.4% Delivery SLA Rate</span>
          </div>
        </button>

        {/* KPI Card 3: Inventory Health */}
        <button
          onClick={() => onNavigateTab('warehouse')}
          className="p-5 rounded bg-white/5 border border-white/10 border-l-4 border-l-accent-amber flex flex-col justify-between relative group text-left cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber/[0.01] rounded-full filter blur-2xl group-hover:bg-accent-amber/[0.03] transition-all"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-kpi">Inventory Levels</p>
              <h4 className="text-xl sm:text-2xl font-kpi font-extrabold tracking-wider text-white mt-2 leading-none uppercase">
                {totalStockCount.toLocaleString()} Units
              </h4>
            </div>
            <div className="w-8 h-8 rounded bg-accent-amber/10 flex items-center justify-center text-accent-amber shrink-0">
              <Package size={16} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-accent-rose font-black uppercase tracking-widest">
            <span>{lowStockItemsCount} below safety limits</span>
          </div>
        </button>

        {/* KPI Card 4: Cold Chain Status */}
        <button
          onClick={() => onNavigateTab('coldchain')}
          className="p-5 rounded bg-white/5 border border-white/10 border-l-4 border-l-accent-emerald flex flex-col justify-between relative group text-left cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-emerald/[0.01] rounded-full filter blur-2xl group-hover:bg-accent-emerald/[0.03] transition-all"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-kpi">Cold Chain Integrity</p>
              <h4 className="text-xl sm:text-2xl font-kpi font-extrabold tracking-wider text-white mt-2 leading-none uppercase">
                99.8% Perfect
              </h4>
            </div>
            <div className="w-8 h-8 rounded bg-accent-emerald/10 flex items-center justify-center text-accent-emerald shrink-0">
              <ThermometerSnowflake size={16} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-[10px] text-accent-amber font-black uppercase tracking-widest">
            <span>1 Active Sensor warning</span>
          </div>
        </button>
      </div>

      {/* Main Charts & Real-time ECharts Analytics Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Telemetry & Map Heatmap Control Center */}
        <div className="lg:col-span-2">
          <ScmEChartsPanel vehicles={vehicles} warehouses={warehouses} />
        </div>

        {/* Warehouse Stock distribution */}
        <div className="p-6 rounded bg-white/5 border border-white/10 flex flex-col justify-between h-[400px]">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Stock Distribution</h3>
            <p className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase tracking-wider">Active stock counts by category</p>
          </div>
          <div className="flex-1 w-full min-h-0 text-[10px] font-mono text-white/40 py-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <Bar dataKey="stock" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Radar / Real-Time Alert Triage Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active SCM Incident Feed */}
        <div className="lg:col-span-2 p-6 rounded bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <AlertOctagon size={16} className="text-accent-rose animate-pulse" /> Risk Control Command
              </h3>
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-0.5">Active incidents needing executive action</p>
            </div>
            <button
              onClick={() => onNavigateTab('overview')}
              className="text-[10px] font-black uppercase tracking-widest text-accent-cyan hover:underline cursor-pointer"
            >
              Configure SLA Rules
            </button>
          </div>

          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3.5 rounded border border-white/10 flex items-start justify-between gap-4 transition-all border-l-4 ${
                  alert.module === 'sustainability'
                    ? 'border-l-accent-emerald bg-accent-emerald/5'
                    : alert.severity === 'critical'
                    ? 'border-l-accent-rose bg-accent-rose/5'
                    : alert.severity === 'warning'
                    ? 'border-l-accent-amber bg-accent-amber/5'
                    : 'border-l-gray-400 bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded mt-0.5 ${
                    alert.module === 'sustainability'
                      ? 'bg-accent-emerald/20 text-accent-emerald'
                      : alert.severity === 'critical'
                      ? 'bg-accent-rose/20 text-accent-rose'
                      : alert.severity === 'warning'
                      ? 'bg-accent-amber/20 text-accent-amber'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    <AlertOctagon size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-tight text-white">{alert.title}</h4>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        alert.module === 'sustainability'
                          ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30'
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        {alert.module}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{alert.description}</p>

                    {alert.correctiveAction && (
                      <div className="mt-3 p-3 bg-brand-black/40 border border-accent-emerald/25 rounded text-left space-y-1">
                        <div className="flex items-center gap-1.5 text-accent-emerald font-black text-[10px] uppercase tracking-wider">
                          <Zap size={12} className="animate-pulse shrink-0" /> AI Recommended Corrective Action Recommendation:
                        </div>
                        <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                          {alert.correctiveAction}
                        </p>
                      </div>
                    )}

                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mt-1.5 block">
                      Triggered: {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onTakeActionOnAlert(alert.id)}
                  className={`px-3 py-1.5 rounded border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all shrink-0 ${
                    alert.module === 'sustainability'
                      ? 'bg-accent-emerald hover:bg-accent-emerald/85 text-brand-black border-accent-emerald/20 font-black hover:border-accent-emerald/40'
                      : 'bg-white/10 hover:bg-white/20 border-white/10 text-white hover:border-white/30'
                  }`}
                >
                  {alert.module === 'sustainability' ? 'Execute AI Correction' : 'Mitigate Alert'}
                </button>
              </div>
            ))}
            {activeAlerts.length === 0 && (
              <div className="p-8 text-center rounded bg-white/5 border border-white/10 text-xs text-white/40">
                All systems green. Zero active risks detected on radar.
              </div>
            )}
          </div>
        </div>

        {/* Live Active Dispatch Telemetry Monitor */}
        <div className="p-6 rounded bg-white/5 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Activity size={16} className="text-accent-cyan" /> SCM Telemetry Stream
            </h3>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-0.5">Active tracking coordinates on N1/N5 Highways</p>
          </div>

          <div className="my-4 space-y-3.5 flex-1 overflow-y-auto pr-1">
            {vehicles.slice(0, 3).map(veh => (
              <div key={veh.id} className="p-3 rounded border border-white/10 border-l-2 border-accent-cyan bg-white/5 text-xs">
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-bold text-white text-[10px]">{veh.plateNumber}</span>
                  <span className={`text-[9px] font-black tracking-widest ${
                    veh.status === 'in_transit' ? 'text-accent-emerald' : 'text-accent-amber'
                  }`}>
                    {veh.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-300 mt-1.5">
                  <span>Destination:</span>
                  <span className="text-white font-semibold truncate max-w-[150px]">{veh.destination}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-300">
                  <span>Speed:</span>
                  <span className="text-accent-cyan font-bold">{veh.currentSpeed} km/h</span>
                </div>
                {veh.tempCelsius !== undefined && (
                  <div className="flex items-center justify-between text-[11px] text-gray-300 mt-1">
                    <span>Reefer Temp:</span>
                    <span className={`font-bold ${veh.tempCelsius > 8 ? 'text-accent-rose animate-pulse' : 'text-accent-emerald'}`}>
                      {veh.tempCelsius}°C
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('fleet')}
            className="w-full py-2.5 rounded bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/20 text-[10px] font-black uppercase tracking-widest text-accent-blue transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Launch GIS Live Tracking Map <CornerUpRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
