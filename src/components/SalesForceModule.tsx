import React, { useState, useEffect } from 'react';
import {
  Compass,
  Users,
  CheckCircle,
  MapPin,
  Search,
  AlertCircle,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Calendar,
  DollarSign,
  Play,
  Check,
  Settings,
  Layers,
  Activity,
  Clock,
  ArrowUpRight,
  Sliders,
  Warehouse,
  ShoppingBag,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BeatPlan, Outlet, Employee } from '../types';
import { OUTLETS } from '../data/mockData';

interface SalesForceModuleProps {
  currentEmployee: Employee;
  beatPlans: BeatPlan[];
  onTriggerCheckIn: (beatId: string) => void;
  onCollectOrder: (beatId: string, amount: number) => void;
  onAddAuditLog?: (
    actionType: 'create' | 'update' | 'delete' | 'approve' | 'configure' | 'override' | 'mitigate',
    module: 'procurement' | 'warehouse' | 'fleet' | 'coldchain' | 'sales' | 'finance' | 'sustainability' | 'general',
    description: string,
    severity?: 'low' | 'medium' | 'high' | 'critical',
    stateBefore?: string,
    stateAfter?: string
  ) => void;
}

interface Holiday {
  id: string;
  name: string;
  banglaName: string;
  date2026: string;
  description: string;
  baseSpikePercent: number;
  baseProjectedRevenueBDT: number;
  featuredCategory: string;
  typicalBuyerSegments: string[];
}

const HOLIDAYS: Holiday[] = [
  {
    id: 'eid-ul-fitr',
    name: 'Eid-ul-Fitr',
    banglaName: 'ঈদুল ফিতর',
    date2026: 'March 20, 2026',
    description: 'The largest retail festival in Bangladesh. Characterized by a massive consumer retail rush, high demand for dairy/sweets, premium grains, beverages, and family gifting packs.',
    baseSpikePercent: 75,
    baseProjectedRevenueBDT: 4500000,
    featuredCategory: 'Sweets & Dairy',
    typicalBuyerSegments: ['Wholesale Markets', 'Dhaka Superstores', 'District Grocers', 'Confectioneries']
  },
  {
    id: 'pohela-boishakh',
    name: 'Pohela Boishakh',
    banglaName: 'পহেলা বৈশাখ',
    date2026: 'April 14, 2026',
    description: 'Bengali New Year. High seasonal surge for traditional dairy, puffed rice, molasses, local sweets, beverages, and snacks supporting cultural fairs and family gatherings.',
    baseSpikePercent: 45,
    baseProjectedRevenueBDT: 2400000,
    featuredCategory: 'Packaged Foods',
    typicalBuyerSegments: ['Sweets Retailers', 'Traditional Grocers', 'Folk Mela Organizers']
  },
  {
    id: 'eid-ul-adha',
    name: 'Eid-ul-Adha',
    banglaName: 'ঈদুল আজহা',
    date2026: 'May 27, 2026',
    description: 'Festival of Sacrifice. Massive regional demand spikes for whole spices (ginger, garlic, cumin), meat preservation packaging, salt, and reefer transit logistics.',
    baseSpikePercent: 65,
    baseProjectedRevenueBDT: 4100000,
    featuredCategory: 'Spices & Condiments',
    typicalBuyerSegments: ['Cattle Market Hubs', 'Bulk Meat Processors', 'Wholesale Spice Dealers']
  },
  {
    id: 'durga-puja',
    name: 'Durga Puja',
    banglaName: 'দুর্গাপূজা',
    date2026: 'October 19, 2026',
    description: 'Major autumn festival. High wholesale demand for puja gift hampers, high-end ghee, coconut oils, traditional dry sweets, and family-sized carbonated beverages.',
    baseSpikePercent: 35,
    baseProjectedRevenueBDT: 2100000,
    featuredCategory: 'Beverages',
    typicalBuyerSegments: ['Puja Committee Hubs', 'Sweet Shops', 'Retail Grocery Chains']
  }
];

const HISTORICAL_TRENDS: Record<string, { year: string; sales: number }[]> = {
  'eid-ul-fitr': [
    { year: '2023 Actual', sales: 2100000 },
    { year: '2024 Actual', sales: 2850000 },
    { year: '2025 Actual', sales: 3600000 },
    { year: '2026 Projected', sales: 4500000 }
  ],
  'pohela-boishakh': [
    { year: '2023 Actual', sales: 1100000 },
    { year: '2024 Actual', sales: 1480000 },
    { year: '2025 Actual', sales: 1850000 },
    { year: '2026 Projected', sales: 2400000 }
  ],
  'eid-ul-adha': [
    { year: '2023 Actual', sales: 1850000 },
    { year: '2024 Actual', sales: 2450000 },
    { year: '2025 Actual', sales: 3100000 },
    { year: '2026 Projected', sales: 4100000 }
  ],
  'durga-puja': [
    { year: '2023 Actual', sales: 950000 },
    { year: '2024 Actual', sales: 1250000 },
    { year: '2025 Actual', sales: 1550000 },
    { year: '2026 Projected', sales: 2100000 }
  ]
};

const INITIAL_MULTIPLIERS: Record<string, Record<string, number>> = {
  'eid-ul-fitr': {
    'Beverages': 1.65,
    'Spices & Condiments': 1.45,
    'Packaged Foods': 1.80,
    'Sweets & Dairy': 1.95,
    'Meat & Poultry': 1.30
  },
  'pohela-boishakh': {
    'Beverages': 1.40,
    'Spices & Condiments': 1.15,
    'Packaged Foods': 1.30,
    'Sweets & Dairy': 1.85,
    'Meat & Poultry': 1.10
  },
  'eid-ul-adha': {
    'Beverages': 1.25,
    'Spices & Condiments': 2.10,
    'Packaged Foods': 1.35,
    'Sweets & Dairy': 1.40,
    'Meat & Poultry': 1.75
  },
  'durga-puja': {
    'Beverages': 1.35,
    'Spices & Condiments': 1.25,
    'Packaged Foods': 1.50,
    'Sweets & Dairy': 1.70,
    'Meat & Poultry': 1.05
  }
};

const CATEGORY_WEIGHTS: Record<string, number> = {
  'Beverages': 0.20,
  'Spices & Condiments': 0.15,
  'Packaged Foods': 0.25,
  'Sweets & Dairy': 0.25,
  'Meat & Poultry': 0.15
};

export default function SalesForceModule({
  currentEmployee,
  beatPlans,
  onTriggerCheckIn,
  onCollectOrder,
  onAddAuditLog,
}: SalesForceModuleProps) {
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'beats' | 'planner'>('beats');
  const [selectedBeatId, setSelectedBeatId] = useState(beatPlans[0]?.id || '');
  const [orderAmount, setOrderAmount] = useState(25000);

  // Seasonal Demand Planner state
  const [selectedHolidayId, setSelectedHolidayId] = useState<string>('eid-ul-fitr');
  const [multipliers, setMultipliers] = useState<Record<string, Record<string, number>>>(INITIAL_MULTIPLIERS);
  const [preAllocatedHolidays, setPreAllocatedHolidays] = useState<string[]>([]);
  const [prioritizedOutlets, setPrioritizedOutlets] = useState<string[]>([]);
  
  // Simulation for Dispatching reserve
  const [isPreAllocating, setIsPreAllocating] = useState(false);
  const [preAllocationProgress, setPreAllocationProgress] = useState(0);
  const [currentPreAllocationStep, setCurrentPreAllocationStep] = useState('');

  const activeBeat = beatPlans.find(b => b.id === selectedBeatId) || beatPlans[0];
  const activeHoliday = HOLIDAYS.find(h => h.id === selectedHolidayId) || HOLIDAYS[0];

  // Reset order collected for local computation or read total collected
  const totalCollected = beatPlans.reduce((sum, b) => sum + b.orderCollectedBDT, 0);

  // Dynamic calculations for Seasonal Demand Planner
  const currentHolidayMultipliers = multipliers[selectedHolidayId] || {};
  const initialHolidayMultipliers = INITIAL_MULTIPLIERS[selectedHolidayId] || {};

  // Weighted multipliers calculator
  const getWeightedMultiplier = (mults: Record<string, number>) => {
    let sum = 0;
    Object.keys(CATEGORY_WEIGHTS).forEach(cat => {
      const weight = CATEGORY_WEIGHTS[cat];
      const val = mults[cat] || 1.0;
      sum += val * weight;
    });
    return sum;
  };

  const activeWeighted = getWeightedMultiplier(currentHolidayMultipliers);
  const initialWeighted = getWeightedMultiplier(initialHolidayMultipliers);
  const scaleRatio = activeWeighted / (initialWeighted || 1);

  const calculatedRevenue = Math.round(activeHoliday.baseProjectedRevenueBDT * scaleRatio);
  const calculatedSpike = Math.round(activeHoliday.baseSpikePercent * scaleRatio);

  // Sync back slider resets if user switches holidays
  const handleSliderChange = (category: string, value: number) => {
    setMultipliers(prev => ({
      ...prev,
      [selectedHolidayId]: {
        ...prev[selectedHolidayId],
        [category]: value
      }
    }));
  };

  const handleResetSliders = () => {
    setMultipliers(prev => ({
      ...prev,
      [selectedHolidayId]: {
        ...INITIAL_MULTIPLIERS[selectedHolidayId]
      }
    }));
    setSuccessMsg(`Restored predictive AI baseline configurations for ${activeHoliday.name}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Determine Outlet risk score based on holiday
  const getOutletRiskForHoliday = (out: Outlet, holidayId: string) => {
    const textSeed = out.name + holidayId;
    let scoreSum = 0;
    for (let i = 0; i < textSeed.length; i++) {
      scoreSum += textSeed.charCodeAt(i);
    }
    
    const baseRisk = 40 + (scoreSum % 35);
    const salesImpact = out.monthlySalesBDT > 300000 ? 15 : 2;
    const shelfImpact = out.shelfSharePercent < 30 ? 14 : -10;
    const prioritizedImpact = prioritizedOutlets.includes(out.id) ? -25 : 0;

    const riskScore = Math.min(98, Math.max(12, baseRisk + salesImpact + shelfImpact + prioritizedImpact));
    
    let reason = "High customer footfall density predicted during peak holiday period.";
    if (out.shelfSharePercent < 35) {
      reason = "Low shelf share leaves store vulnerable to competitor substitution during spikes.";
    } else if (out.monthlySalesBDT > 400000) {
      reason = "Critical high-volume retail hub with volatile daily stockout thresholds.";
    } else if (out.isColdChainRequired) {
      reason = "Requires strict cold-chain logistics; high risk of transit delays.";
    }

    return {
      riskScore,
      reason,
      severity: riskScore > 75 ? 'critical' : riskScore > 45 ? 'warning' : 'stable'
    };
  };

  // Count high risk outlets
  const riskOutletsCount = OUTLETS.filter(out => {
    const risk = getOutletRiskForHoliday(out, selectedHolidayId);
    return risk.severity === 'critical';
  }).length;

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

  // Prioritize outlet in field agent plan
  const handlePrioritizeOutlet = (out: Outlet) => {
    if (prioritizedOutlets.includes(out.id)) return;
    setPrioritizedOutlets(prev => [...prev, out.id]);
    
    if (onAddAuditLog) {
      onAddAuditLog(
        'mitigate',
        'sales',
        `Adjusted SFA routing strategy. Prioritized '${out.name}' (${out.location}) in active territory beats to mitigate seasonal stockout risk during ${activeHoliday.name}.`,
        'low',
        `Priority: standard, Risk: ${getOutletRiskForHoliday(out, selectedHolidayId).riskScore}%`,
        `Priority: CRITICAL_OVERRIDE, Risk: ${Math.max(12, getOutletRiskForHoliday(out, selectedHolidayId).riskScore - 25)}% (Mitigated)`
      );
    }

    setSuccessMsg(`SFA Beat Priority updated! Added ${out.name} to immediate pre-holiday replenishment cycles.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Execute Pre-Allocation Dispatch
  const handleAuthorizePreAllocation = () => {
    setIsPreAllocating(true);
    setPreAllocationProgress(5);
    setCurrentPreAllocationStep('Analyzing outlet historical sales and current warehouse inventories...');

    const steps = [
      { progress: 20, step: 'Formulating wholesale pre-orders for Gazipur SCM Hub...' },
      { progress: 45, step: 'Drafting bulk SCM Transit Warrants and cold-chain reservations...' },
      { progress: 70, step: 'Locking reserved supplier inventory layers in central ERP...' },
      { progress: 90, step: 'Generating smart SFA Beat dispatch route recommendations...' },
      { progress: 100, step: 'Authorized and synchronized with central logistics!' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setPreAllocationProgress(steps[currentStepIdx].progress);
        setCurrentPreAllocationStep(steps[currentStepIdx].step);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsPreAllocating(false);
          setPreAllocatedHolidays(prev => [...prev, selectedHolidayId]);
          
          if (onAddAuditLog) {
            onAddAuditLog(
              'configure',
              'sales',
              `Authorized Seasonal Pre-Allocation Reserve Dispatch for ${activeHoliday.name} (${activeHoliday.banglaName}). Locked ৳${calculatedRevenue.toLocaleString()} BDT in bulk orders with SCM suppliers. Target growth: +${calculatedSpike}% sales spike.`,
              'high',
              `Pre-allocated: false`,
              `Pre-allocated: true, Allocated Revenue Budget BDT: ৳${calculatedRevenue.toLocaleString()}, Peak Spike Forecast: +${calculatedSpike}%`
            );
          }

          setSuccessMsg(`AI Pre-Allocation Dispatch complete! ৳${calculatedRevenue.toLocaleString()} BDT in wholesale reserves secured for ${activeHoliday.name}.`);
          setTimeout(() => setSuccessMsg(''), 5000);
        }, 1000);
      }
    }, 600);
  };

  // Setup recharts historical chart data dynamically
  const chartData = HISTORICAL_TRENDS[selectedHolidayId] || [];
  // Inject the custom calculated revenue for 2026
  const finalChartData = chartData.map(item => {
    if (item.year === '2026 Projected') {
      return { ...item, sales: calculatedRevenue };
    }
    return item;
  });

  return (
    <div className="space-y-6">
      {/* Header and Sub-Tabs */}
      <div className="p-6 rounded border border-white/10 bg-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
            <Compass size={24} className="text-accent-cyan" /> Sales Force Beat Planning & Intelligence
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
            Territory assignments, store merchandising scorecard audits, and predictive seasonal demand planners
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('beats')}
            className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
              activeTab === 'beats'
                ? 'bg-accent-cyan text-black font-extrabold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Field Beats
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'planner'
                ? 'bg-accent-cyan text-black font-extrabold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={11} className={activeTab === 'planner' ? 'text-black' : 'text-accent-cyan animate-pulse'} />
            Demand Planner
          </button>
        </div>
      </div>

      {/* Unified Sales Force & Holiday Demand KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-gray-500 block text-[9px] font-mono font-black uppercase tracking-wider">Upcoming peak uplift</span>
          <span className="text-xl font-display font-black text-white block">
            +{calculatedSpike}% expected spike
          </span>
          <span className="text-[10px] text-accent-cyan block font-mono">
            {activeHoliday.name} ({activeHoliday.banglaName})
          </span>
        </div>

        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-accent-cyan block text-[9px] font-mono font-black uppercase tracking-wider">Projected SFA Demand</span>
          <span className="text-xl font-display font-black text-accent-cyan block">
            ৳{calculatedRevenue.toLocaleString()} BDT
          </span>
          <span className="text-[10px] text-gray-400 block font-mono">
            Dynamic bulk sales value target
          </span>
        </div>

        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-accent-rose block text-[9px] font-mono font-black uppercase tracking-wider">Outlet Stockout Risks</span>
          <span className="text-xl font-display font-black text-accent-rose block">
            {riskOutletsCount} Outlets
          </span>
          <span className="text-[10px] text-accent-rose/70 block font-mono">
            At critical risk of holiday stockout
          </span>
        </div>

        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-1">
          <span className="text-accent-emerald block text-[9px] font-mono font-black uppercase tracking-wider">Active Wholesale Collections</span>
          <span className="text-xl font-display font-black text-accent-emerald block">
            ৳{totalCollected.toLocaleString()} BDT
          </span>
          <span className="text-[10px] text-gray-400 block font-mono">
            Real-time field synchronization
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-xs text-accent-emerald font-semibold flex items-center gap-2">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* VIEW 1: FIELD BEATS AND OPERATIONS */}
      {activeTab === 'beats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Beat Details */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-mono text-accent-cyan uppercase">Active Beat Representative</span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-sm font-bold text-white">{activeBeat.salesRepName}</h3>
                  <span className="bg-white/5 border border-white/10 rounded p-1 text-[9px] text-gray-400 font-mono">
                    ID: {activeBeat.salesRepId}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-white/40 block">TARGET COVERAGE PROGRESS</span>
                <span className="text-xs font-mono font-bold text-accent-emerald">
                  {activeBeat.outletsVisited} / {activeBeat.totalOutlets} Visited
                </span>
              </div>
            </div>

            {/* Dropdown for active Beat */}
            <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-3 rounded-xl gap-2">
              <span className="text-xs font-bold text-white/70">Select Agent Beat:</span>
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

            {/* Geo Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-white/40 text-[9px] uppercase font-mono block">GPS Geo-Check In Status</span>
                  <span className="text-white font-semibold block mt-1">
                    {activeBeat.geoCheckIn ? `Checked In: ${activeBeat.geoCheckIn}` : 'Standby / Geo-Lock Active'}
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
                    className="bg-white/5 border border-white/10 rounded p-1 text-xs text-white w-24 outline-none font-mono"
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
              <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={12} className="text-accent-cyan" /> Target Wholesale Retail Outlets
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OUTLETS.map(out => {
                  const visited = activeBeat.visitedOutlets.includes(out.id);
                  const isPrioritized = prioritizedOutlets.includes(out.id);
                  const risk = getOutletRiskForHoliday(out, selectedHolidayId);

                  return (
                    <div key={out.id} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 relative group flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-bold text-white group-hover:text-accent-cyan">{out.name}</h5>
                              {isPrioritized && (
                                <span className="bg-accent-cyan/10 border border-accent-cyan/30 text-[8px] text-accent-cyan font-bold px-1.5 py-0.5 rounded uppercase">
                                  Priority
                                </span>
                              )}
                            </div>
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
                            <span className="text-white/40 block">Merchandising:</span>
                            <span className="text-accent-cyan font-semibold">{out.shelfSharePercent}% Shelf</span>
                          </div>
                        </div>
                      </div>

                      {/* Holiday Risk warning when prioritizing */}
                      <div className="mt-3 pt-2 border-t border-white/[0.03] flex items-center justify-between text-[9px] font-mono">
                        <span className="text-white/30">Holiday Risk Indicator:</span>
                        <span className={`font-black uppercase ${
                          risk.severity === 'critical' 
                            ? 'text-accent-rose' 
                            : risk.severity === 'warning' 
                            ? 'text-accent-amber' 
                            : 'text-accent-emerald'
                        }`}>
                          {risk.riskScore}% {risk.severity}
                        </span>
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
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-accent-amber" /> Store Merchandising Audit
                </h3>
                <p className="text-[10px] text-white/40 mt-1 uppercase font-mono">Capture retail compliance & competitor movements</p>
              </div>

              <div className="space-y-4 text-xs">
                {OUTLETS.map(out => (
                  <div key={out.id} className="bg-white/[0.01] p-3 rounded-lg border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold text-white block">{out.name}</span>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      <strong className="text-accent-amber font-medium">Competitor Notes: </strong> {out.competitorActivity}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1">
                      <span>HACCP Compliance Score:</span>
                      <strong className="text-accent-emerald">{out.auditScore}/100</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-[10px] text-white/30 font-mono text-center flex items-center justify-center gap-1.5">
              <AlertCircle size={12} className="text-accent-amber animate-pulse" /> Photos synced with Regional Sales Director
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SEASONAL DEMAND PLANNER (NEW) */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          {/* Main Planner Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Holiday Config & Interactive Sliders */}
            <div className="lg:col-span-1 bg-white/[0.02] p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">Holiday Profiles</h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider mt-0.5">Select a Bangladeshi national festival</p>
                </div>

                {/* Holiday Select buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {HOLIDAYS.map(h => {
                    const isSelected = selectedHolidayId === h.id;
                    const isDispatched = preAllocatedHolidays.includes(h.id);
                    return (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHolidayId(h.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-accent-cyan/[0.05] border-accent-cyan text-white'
                            : 'bg-white/[0.01] border-white/5 text-white/70 hover:bg-white/[0.03] hover:border-white/10'
                        }`}
                      >
                        <span className="text-[9px] block text-gray-500 font-mono font-bold uppercase tracking-wider">{h.date2026}</span>
                        <span className="text-xs font-black block mt-1">{h.name}</span>
                        <span className="text-[10px] text-accent-cyan font-mono block font-bold">{h.banglaName}</span>
                        
                        {isDispatched && (
                          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Holiday Detail card */}
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1 text-accent-cyan text-[10px] font-mono font-bold uppercase tracking-widest">
                    <Calendar size={10} /> Profile Summary
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {activeHoliday.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-white/5 text-gray-400">
                    <div>
                      <span>Baseline Spike:</span>
                      <span className="text-white font-bold block">+{activeHoliday.baseSpikePercent}% expected</span>
                    </div>
                    <div>
                      <span>Core Segment:</span>
                      <span className="text-accent-cyan font-bold block truncate">{activeHoliday.featuredCategory}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Sliders: Demand Modifiers */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Demand Modifiers</h4>
                      <p className="text-[9px] text-white/30 font-mono uppercase">Adjust category-specific allocation multipliers</p>
                    </div>
                    <button
                      onClick={handleResetSliders}
                      className="text-[9px] font-mono font-black uppercase text-accent-cyan hover:underline bg-white/5 px-2 py-0.5 rounded border border-white/10 cursor-pointer"
                    >
                      Reset to Base
                    </button>
                  </div>

                  <div className="space-y-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                    {Object.keys(CATEGORY_WEIGHTS).map(cat => {
                      const currentVal = currentHolidayMultipliers[cat] !== undefined ? currentHolidayMultipliers[cat] : 1.0;
                      const initialVal = initialHolidayMultipliers[cat] || 1.0;
                      const weight = CATEGORY_WEIGHTS[cat];

                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-white/80 font-medium truncate max-w-[130px]">{cat}</span>
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-gray-500 font-bold uppercase">({(weight * 100).toFixed(0)}% Wt)</span>
                              <strong className={`${currentVal > initialVal ? 'text-accent-cyan' : currentVal < initialVal ? 'text-accent-rose' : 'text-white'}`}>
                                {currentVal.toFixed(2)}x
                              </strong>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0.5"
                              max="3.0"
                              step="0.05"
                              value={currentVal}
                              onChange={(e) => handleSliderChange(cat, parseFloat(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button: Pre-allocation Warrant Dispatch */}
              <div className="pt-4 border-t border-white/5">
                {isPreAllocating ? (
                  <div className="space-y-2">
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-accent-cyan h-full rounded-full transition-all duration-300"
                        style={{ width: `${preAllocationProgress}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-accent-cyan font-mono block text-center uppercase tracking-wider animate-pulse">
                      {currentPreAllocationStep}
                    </span>
                  </div>
                ) : preAllocatedHolidays.includes(selectedHolidayId) ? (
                  <div className="p-3 bg-accent-emerald/10 border border-accent-emerald/30 rounded-xl text-center space-y-1">
                    <div className="text-accent-emerald text-xs font-mono font-bold uppercase flex items-center justify-center gap-1">
                      <Check size={14} /> Bulk Stock Reserve Dispatched
                    </div>
                    <p className="text-[10px] text-white/50">
                      SFA pre-allocation routes compiled and locked in main ERP ledger.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleAuthorizePreAllocation}
                    className="w-full py-3 rounded-xl bg-accent-cyan hover:bg-accent-cyan/90 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-accent-cyan/10"
                  >
                    <Play size={12} fill="#000" /> Authorize AI Stock Pre-Allocation
                  </button>
                )}
              </div>
            </div>

            {/* Historical Order Trends Chart */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Chart container */}
              <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">Historical Holiday Order Spikes</h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider mt-0.5">Dual-axis volumetric comparisons: 3-Year historical sales peak vs 2026 AI-Projected Peak</p>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={finalChartData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" fontSize={9} fontClassName="font-mono" tickLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} fontClassName="font-mono" tickLine={false} tickFormatter={(val) => `৳${(val / 100000).toFixed(0)}L`} />
                      <Tooltip
                        formatter={(value: any) => [`৳${value.toLocaleString()} BDT`, "Total Wholesales Sales Peak"]}
                        contentStyle={{
                          backgroundColor: '#0a0a0a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontFamily: 'monospace',
                          fontSize: '11px'
                        }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Interactive Simulation feedback */}
                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-white/40 text-[9px] uppercase font-mono block">Dynamic Forecast Model</span>
                    <p className="text-white font-medium">
                      Modifiers yield a <strong className="text-accent-cyan font-bold">৳{(calculatedRevenue - activeHoliday.baseProjectedRevenueBDT) >= 0 ? '+' : ''}{(calculatedRevenue - activeHoliday.baseProjectedRevenueBDT).toLocaleString()} BDT</strong> variance from base.
                    </p>
                  </div>
                  <span className="bg-accent-cyan/10 border border-accent-cyan/30 text-[9px] font-mono text-accent-cyan font-bold px-2 py-0.5 rounded uppercase self-start sm:self-auto">
                    Confidence: 94.8% (Backtested)
                  </span>
                </div>
              </div>

              {/* Outlet-specific stockout risks & SFA action */}
              <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">Target Retailer Risk Audit ({activeHoliday.name})</h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider mt-0.5">High-footfall FMCG outlets prone to stockouts during seasonal demand peaks</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {OUTLETS.map(out => {
                    const risk = getOutletRiskForHoliday(out, selectedHolidayId);
                    const isPrioritized = prioritizedOutlets.includes(out.id);

                    return (
                      <div 
                        key={out.id} 
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                          isPrioritized 
                            ? 'bg-accent-cyan/[0.01] border-accent-cyan/20' 
                            : 'bg-white/[0.01] border-white/5'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <span className="text-[10px] text-accent-cyan font-mono block">{out.location}</span>
                              <h4 className="text-xs font-bold text-white line-clamp-1">{out.name}</h4>
                            </div>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 uppercase ${
                              risk.severity === 'critical' 
                                ? 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20 animate-pulse' 
                                : risk.severity === 'warning' 
                                ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20' 
                                : 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'
                            }`}>
                              {risk.riskScore}% Risk
                            </span>
                          </div>
                          <p className="text-[10px] text-white/50 leading-relaxed font-mono">
                            {risk.reason}
                          </p>
                        </div>

                        <div>
                          {isPrioritized ? (
                            <div className="w-full py-1.5 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-center text-[9px] font-mono font-bold uppercase rounded flex items-center justify-center gap-1">
                              <Check size={10} /> Added to Priority SFA Beats
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePrioritizeOutlet(out)}
                              className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white text-[9px] font-mono font-bold uppercase rounded border border-white/10 flex items-center justify-center gap-1 cursor-pointer transition-all"
                            >
                              Prioritize Agent Rep
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
