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
  ArrowRight,
  Target,
  Edit3,
  Trophy,
  Award
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
import { motion, AnimatePresence } from 'motion/react';
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

  // Date range filter states for order collected trend chart
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-06-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-07-04');

  // Filter beat plans dynamically by the selected date range
  const filteredBeatPlans = beatPlans.filter(bp => {
    if (dateFilter === 'all') return true;
    
    const bpDate = new Date(bp.date);
    const currentDate = new Date('2026-07-04');
    
    if (dateFilter === 'today') {
      return bp.date === '2026-07-03' || bp.date === '2026-07-04';
    }
    
    if (dateFilter === 'last-7-days') {
      const diffTime = Math.abs(currentDate.getTime() - bpDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    
    if (dateFilter === 'july-2026') {
      return bp.date.startsWith('2026-07');
    }
    
    if (dateFilter === 'june-2026') {
      return bp.date.startsWith('2026-06');
    }
    
    if (dateFilter === 'may-2026') {
      return bp.date.startsWith('2026-05');
    }
    
    if (dateFilter === 'q2-2026') {
      return bp.date.startsWith('2026-04') || bp.date.startsWith('2026-05') || bp.date.startsWith('2026-06');
    }
    
    if (dateFilter === 'custom') {
      if (!customStartDate || !customEndDate) return true;
      return bp.date >= customStartDate && bp.date <= customEndDate;
    }
    
    return true;
  });

  // Aggregate orders and visits by sales representative name for correct charting
  const beatChartData = filteredBeatPlans.reduce((acc, bp) => {
    const existing = acc.find(item => item.name === bp.salesRepName);
    if (existing) {
      existing.amount += bp.orderCollectedBDT;
      existing.visited += bp.outletsVisited;
      existing.total += bp.totalOutlets;
    } else {
      acc.push({
        name: bp.salesRepName,
        amount: bp.orderCollectedBDT,
        visited: bp.outletsVisited,
        total: bp.totalOutlets
      });
    }
    return acc;
  }, [] as { name: string; amount: number; visited: number; total: number }[]);

  // Total collected and overall average
  const totalCollected = beatPlans.reduce((sum, b) => sum + b.orderCollectedBDT, 0);
  const totalFilteredCollected = filteredBeatPlans.reduce((sum, b) => sum + b.orderCollectedBDT, 0);

  // Dynamically extract unique representative IDs
  const uniqueRepIds = React.useMemo(() => {
    const ids = new Set<string>();
    beatPlans.forEach(bp => {
      if (bp.salesRepId) ids.add(bp.salesRepId);
    });
    return Array.from(ids);
  }, [beatPlans]);

  // Track selected reps for side-by-side comparison
  const [comparedRepIds, setComparedRepIds] = useState<string[]>([]);

  // Individual sales agent targets: keyed by salesRepId or salesRepName
  const [agentTargets, setAgentTargets] = useState<Record<string, {
    orderTargetBDT: number;
    checkinTarget: number;
    velocityTarget: number;
  }>>({
    'emp-10': { orderTargetBDT: 600000, checkinTarget: 5, velocityTarget: 120000 },
    'emp-20': { orderTargetBDT: 400000, checkinTarget: 4, velocityTarget: 80000 },
    'emp-30': { orderTargetBDT: 500000, checkinTarget: 3, velocityTarget: 150000 },
  });

  const [isEditingTargets, setIsEditingTargets] = useState(false);

  // Automatically initialize selected reps
  useEffect(() => {
    if (comparedRepIds.length === 0 && uniqueRepIds.length > 0) {
      setComparedRepIds(uniqueRepIds);
    }
  }, [uniqueRepIds]);

  // Aggregate stats across all historical beats for comparison
  const agentPerformanceStats = React.useMemo(() => {
    const statsMap: Record<string, {
      salesRepId: string;
      salesRepName: string;
      totalOrdersBDT: number;
      completedCheckins: number;
      totalOutletsVisited: number;
      totalOutletsAssigned: number;
      beatCount: number;
    }> = {};

    beatPlans.forEach((bp) => {
      const key = bp.salesRepId || bp.salesRepName;
      if (!statsMap[key]) {
        statsMap[key] = {
          salesRepId: bp.salesRepId,
          salesRepName: bp.salesRepName,
          totalOrdersBDT: 0,
          completedCheckins: 0,
          totalOutletsVisited: 0,
          totalOutletsAssigned: 0,
          beatCount: 0
        };
      }
      
      statsMap[key].totalOrdersBDT += bp.orderCollectedBDT;
      if (bp.geoCheckIn) {
        statsMap[key].completedCheckins += 1;
      }
      statsMap[key].totalOutletsVisited += bp.outletsVisited;
      statsMap[key].totalOutletsAssigned += bp.totalOutlets;
      statsMap[key].beatCount += 1;
    });

    const repsList = Object.values(statsMap).map(rep => {
      const id = rep.salesRepId || rep.salesRepName;
      const target = agentTargets[id] || { orderTargetBDT: 450000, checkinTarget: 4, velocityTarget: 100000 };

      // average collection velocity (orders collected / completed check-ins)
      const velocityPerCheckin = rep.completedCheckins > 0 
        ? Math.round(rep.totalOrdersBDT / rep.completedCheckins) 
        : 0;
      
      const velocityPerVisit = rep.totalOutletsVisited > 0
        ? Math.round(rep.totalOrdersBDT / rep.totalOutletsVisited)
        : 0;

      const coverageRate = rep.totalOutletsAssigned > 0
        ? Math.round((rep.totalOutletsVisited / rep.totalOutletsAssigned) * 100)
        : 0;

      // Calculate progress percentages against targets
      const orderProgress = target.orderTargetBDT > 0
        ? Math.round((rep.totalOrdersBDT / target.orderTargetBDT) * 100)
        : 0;

      const checkinProgress = target.checkinTarget > 0
        ? Math.round((rep.completedCheckins / target.checkinTarget) * 100)
        : 0;

      const velocityProgress = target.velocityTarget > 0
        ? Math.round((velocityPerCheckin / target.velocityTarget) * 100)
        : 0;

      return {
        ...rep,
        velocityPerCheckin,
        velocityPerVisit,
        coverageRate,
        target,
        orderProgress,
        checkinProgress,
        velocityProgress
      };
    });

    // Sort by totalOrdersBDT descending and assign rank
    return repsList
      .sort((a, b) => b.totalOrdersBDT - a.totalOrdersBDT)
      .map((rep, index) => ({
        ...rep,
        rank: index + 1
      }));
  }, [beatPlans, agentTargets]);

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
        <div className="space-y-6">
          {/* Beat Plan Summary Analytics Chart */}
          <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <TrendingUp size={16} className="text-accent-cyan" /> Beat Plans Order Collection Trends
                </h3>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">
                  Real-time visualization of wholesale orders collected (BDT) per active agent beat plan
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Date Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Period:</span>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-brand-black border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-accent-cyan cursor-pointer"
                  >
                    <option value="all">All Time (Historical)</option>
                    <option value="today">Today / Latest (Jul 3-4)</option>
                    <option value="last-7-days">Last 7 Days</option>
                    <option value="july-2026">July 2026</option>
                    <option value="june-2026">June 2026</option>
                    <option value="may-2026">May 2026</option>
                    <option value="q2-2026">Q2 2026 (Apr - Jun)</option>
                    <option value="custom">📅 Custom Date Range...</option>
                  </select>
                </div>

                {/* Custom Date Inputs */}
                {dateFilter === 'custom' && (
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded px-2 py-1">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer"
                    />
                    <span className="text-gray-500 font-mono text-[10px]">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer"
                    />
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-[10px] font-bold text-accent-cyan">
                  Avg. Filtered Collection: ৳{(filteredBeatPlans.length > 0 ? Math.round(totalFilteredCollected / filteredBeatPlans.length) : 0).toLocaleString()} BDT
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-4 relative">
              {beatChartData.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-6">
                  <Calendar className="text-gray-600 mb-2 animate-pulse" size={32} />
                  <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">No Beat Records Found</p>
                  <p className="text-[10px] text-gray-500 mt-1">Try expanding your selected time period or change the date range filter.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={beatChartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={10} 
                      fontClassName="font-mono" 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={10} 
                      fontClassName="font-mono" 
                      tickLine={false} 
                      tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip
                      formatter={(value: any) => [`৳${Number(value).toLocaleString()} BDT`, "Collected Order"]}
                      labelFormatter={(label) => `Representative: ${label}`}
                      contentStyle={{
                        backgroundColor: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontFamily: 'monospace',
                        fontSize: '11px'
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#06b6d4" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Quick SFA Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-1">
                <span className="text-gray-500 text-[9px] uppercase font-mono block">Top Performing Beat</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {filteredBeatPlans.length > 0 
                      ? [...filteredBeatPlans].sort((a,b) => b.orderCollectedBDT - a.orderCollectedBDT)[0]?.salesRepName 
                      : 'N/A'}
                  </span>
                  <span className="text-xs font-mono font-bold text-accent-emerald">
                    ৳{filteredBeatPlans.length > 0 
                      ? [...filteredBeatPlans].sort((a,b) => b.orderCollectedBDT - a.orderCollectedBDT)[0]?.orderCollectedBDT.toLocaleString() 
                      : '0'} BDT
                  </span>
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-1">
                <span className="text-gray-500 text-[9px] uppercase font-mono block">Least Active Beat</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {filteredBeatPlans.length > 0 
                      ? [...filteredBeatPlans].sort((a,b) => a.orderCollectedBDT - b.orderCollectedBDT)[0]?.salesRepName 
                      : 'N/A'}
                  </span>
                  <span className="text-xs font-mono font-bold text-accent-rose">
                    ৳{filteredBeatPlans.length > 0 
                      ? [...filteredBeatPlans].sort((a,b) => a.orderCollectedBDT - b.orderCollectedBDT)[0]?.orderCollectedBDT.toLocaleString() 
                      : '0'} BDT
                  </span>
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-1">
                <span className="text-gray-500 text-[9px] uppercase font-mono block">SFA Field Target Efficiency</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Average Visited Outlets
                  </span>
                  <span className="text-xs font-mono font-bold text-accent-cyan">
                    {filteredBeatPlans.length > 0 
                      ? (filteredBeatPlans.reduce((sum, b) => sum + (b.outletsVisited / b.totalOutlets), 0) / filteredBeatPlans.length * 100).toFixed(1) 
                      : '0.0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SFA Top Performers Leaderboard */}
          <div className="bg-gradient-to-r from-yellow-500/[0.03] via-white/[0.01] to-transparent p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-400 animate-pulse" /> SFA Top Performers Leaderboard
                </h3>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">
                  Honoring high-achieving field personnel based on total order collection volume
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                <span className="text-yellow-400 font-bold uppercase tracking-wider text-[10px]">Recognizing Top 3 Personnel</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {agentPerformanceStats.slice(0, 3).map((rep, idx) => {
                const id = rep.salesRepId || rep.salesRepName;
                const isSelected = comparedRepIds.includes(id);

                // Rank styling configs
                const rankConfigs = [
                  {
                    color: 'from-yellow-400 to-amber-500 text-yellow-400',
                    bg: 'bg-yellow-400/5 border-yellow-400/20',
                    badge: '🏆 Rank #1 Gold',
                    avatar: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400'
                  },
                  {
                    color: 'from-slate-300 to-slate-500 text-slate-300',
                    bg: 'bg-slate-300/5 border-slate-300/20',
                    badge: '🥈 Rank #2 Silver',
                    avatar: 'border-slate-300/50 bg-slate-300/10 text-slate-300'
                  },
                  {
                    color: 'from-amber-600 to-amber-800 text-amber-500',
                    bg: 'bg-amber-600/5 border-amber-600/20',
                    badge: '🥉 Rank #3 Bronze',
                    avatar: 'border-amber-600/50 bg-amber-600/10 text-amber-500'
                  }
                ];

                const cfg = rankConfigs[idx] || rankConfigs[2];

                return (
                  <div 
                    key={id}
                    className={`relative bg-white/[0.01] border ${
                      isSelected ? 'border-accent-cyan bg-accent-cyan/[0.01]' : 'border-white/5'
                    } hover:border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all hover:-translate-y-0.5`}
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border bg-black/40 ${cfg.bg} ${cfg.color}`}>
                        {cfg.badge}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Avatar & Info */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs uppercase ${cfg.avatar}`}>
                          {rep.salesRepName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-snug">{rep.salesRepName}</h4>
                          <span className="text-[9px] font-mono text-gray-500 uppercase">ID: {rep.salesRepId}</span>
                        </div>
                      </div>

                      {/* Performance Metric block */}
                      <div className="bg-white/[0.01] p-3 rounded-xl border border-white/[0.03] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[9px] font-mono text-gray-400 uppercase">Collected</span>
                          <span className="font-mono text-accent-emerald font-black">৳{rep.totalOrdersBDT.toLocaleString()}</span>
                        </div>
                        
                        {/* Target Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-mono">
                            <span className="text-gray-500">Goal Progress</span>
                            <span className={rep.orderProgress >= 100 ? 'text-accent-emerald font-bold' : 'text-gray-400'}>
                              {rep.orderProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                rep.orderProgress >= 100 ? 'bg-gradient-to-r from-accent-emerald to-emerald-400' : 'bg-accent-cyan'
                              }`} 
                              style={{ width: `${Math.min(100, rep.orderProgress)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Scorecard lists */}
                      <div className="space-y-1.5 text-[10px] text-gray-400">
                        <div className="flex items-center justify-between border-b border-white/[0.02] pb-1">
                          <span>Beats Visited:</span>
                          <span className="font-mono text-white font-bold">{rep.totalOutletsVisited} stores</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/[0.02] pb-1">
                          <span>Coverage Efficiency:</span>
                          <span className="font-mono text-accent-cyan font-bold">{rep.coverageRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Avg Velocity:</span>
                          <span className="font-mono text-white">৳{rep.velocityPerCheckin.toLocaleString()} / check-in</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-gray-500">
                        Ranked #{idx + 1} Overall
                      </span>
                      <button
                        onClick={() => {
                          setComparedRepIds(prev => 
                            prev.includes(id)
                              ? prev.filter(item => item !== id)
                              : [...prev, id]
                          );
                        }}
                        className={`text-[9px] font-mono font-bold cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                          isSelected 
                            ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30' 
                            : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Deselect' : 'Compare'} <ArrowRight size={8} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-Side Sales Agent Comparison */}
          <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <Users size={18} className="text-accent-cyan" /> Sales Agents Performance Comparator & Targets
                </h3>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">
                  Side-by-side performance audit, aggregate wholesale collection, check-ins, and target achievement velocity
                </p>
              </div>

              {/* Controls and Select Reps Multi-Toggle */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Config Targets Trigger */}
                <button
                  onClick={() => setIsEditingTargets(!isEditingTargets)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isEditingTargets
                      ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan font-bold'
                      : 'bg-white/5 border-white/10 text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Target size={14} className={isEditingTargets ? 'animate-spin' : ''} />
                  {isEditingTargets ? 'Close Targets Editor' : '🎯 Configure Targets'}
                </button>

                <div className="h-4 w-px bg-white/10 hidden sm:block" />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Compare:</span>
                  {agentPerformanceStats.map(rep => {
                    const id = rep.salesRepId || rep.salesRepName;
                    const isSelected = comparedRepIds.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setComparedRepIds(prev => 
                            prev.includes(id)
                              ? prev.filter(item => item !== id)
                              : [...prev, id]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan font-bold'
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-accent-cyan' : 'bg-white/20'}`} />
                        {rep.salesRepName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Target Settings Configuration panel */}
            {isEditingTargets && (
              <div className="bg-white/[0.03] border border-white/10 p-5 rounded-xl space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-accent-cyan font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} /> Adjust Agent SFA Target Thresholds
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Changes apply globally and instantly update progress meters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentPerformanceStats.map(rep => {
                    const id = rep.salesRepId || rep.salesRepName;
                    const target = agentTargets[id] || { orderTargetBDT: 450000, checkinTarget: 4, velocityTarget: 100000 };
                    return (
                      <div key={id} className="bg-brand-black/50 border border-white/5 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center font-bold text-[10px] text-accent-cyan uppercase">
                            {rep.salesRepName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs font-bold text-white">{rep.salesRepName}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">Order Collection Goal (BDT)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 text-[10px] text-gray-500">৳</span>
                              <input
                                type="number"
                                value={target.orderTargetBDT}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  setAgentTargets(prev => ({
                                    ...prev,
                                    [id]: { ...target, orderTargetBDT: val }
                                  }));
                                }}
                                className="w-full bg-brand-black border border-white/10 rounded pl-6 pr-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-accent-cyan"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">Check-ins Goal</label>
                            <input
                              type="number"
                              value={target.checkinTarget}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setAgentTargets(prev => ({
                                  ...prev,
                                  [id]: { ...target, checkinTarget: val }
                                }));
                              }}
                              className="w-full bg-brand-black border border-white/10 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-accent-cyan"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-gray-400 block uppercase">Velocity Goal (BDT / Check-in)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 text-[10px] text-gray-500">৳</span>
                              <input
                                type="number"
                                value={target.velocityTarget}
                                onChange={(e) => {
                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                  setAgentTargets(prev => ({
                                    ...prev,
                                    [id]: { ...target, velocityTarget: val }
                                  }));
                                }}
                                className="w-full bg-brand-black border border-white/10 rounded pl-6 pr-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-accent-cyan"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Table and Cards Display */}
            {comparedRepIds.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.01] border border-dashed border-white/10 rounded-xl space-y-2">
                <Users className="text-gray-600 mx-auto animate-pulse" size={32} />
                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">No Agents Selected for Comparison</p>
                <p className="text-[10px] text-gray-500">Toggle agent buttons above to load side-by-side performance cards.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Responsive Side-by-Side Grid Cards with Targets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentPerformanceStats
                    .filter(rep => comparedRepIds.includes(rep.salesRepId || rep.salesRepName))
                    .map(rep => {
                      const id = rep.salesRepId || rep.salesRepName;
                      // Determine performance badge based on collection velocity per check-in
                      const isElite = rep.velocityPerCheckin >= rep.target.velocityTarget;
                      const isStrong = rep.velocityPerCheckin >= rep.target.velocityTarget * 0.75 && rep.velocityPerCheckin < rep.target.velocityTarget;
                      const badgeColor = isElite 
                        ? 'bg-accent-emerald/10 border-accent-emerald text-accent-emerald' 
                        : isStrong 
                        ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan' 
                        : 'bg-accent-rose/10 border-accent-rose text-accent-rose';
                      
                      const badgeText = isElite 
                        ? '🏆 Target Met' 
                        : isStrong 
                        ? '⚡ Exceeding 75%' 
                        : '⏱️ Behind Target';

                      const activeBeatRecord = beatPlans.find(b => b.salesRepId === rep.salesRepId && b.geoCheckIn && !b.geoCheckOut);

                      // Dynamic color for order progress
                      const orderColor = rep.orderProgress >= 100 
                        ? 'bg-accent-emerald' 
                        : rep.orderProgress >= 50 
                        ? 'bg-accent-amber' 
                        : 'bg-accent-rose';

                      // Dynamic color for check-in progress
                      const checkinColor = rep.checkinProgress >= 100 
                        ? 'bg-accent-emerald' 
                        : rep.checkinProgress >= 50 
                        ? 'bg-accent-amber' 
                        : 'bg-accent-rose';

                      return (
                        <div 
                          key={id} 
                          className="bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl p-5 space-y-4 transition-all relative flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 border border-white/10 flex items-center justify-center font-bold text-accent-cyan uppercase">
                                  {rep.salesRepName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white leading-snug flex items-center gap-1">
                                    {rep.rank === 1 && <span title="1st Place Performer" className="text-xs">🏆</span>}
                                    {rep.rank === 2 && <span title="2nd Place Performer" className="text-xs">🥈</span>}
                                    {rep.rank === 3 && <span title="3rd Place Performer" className="text-xs">🥉</span>}
                                    {rep.salesRepName}
                                  </h4>
                                  <span className="text-[9px] font-mono text-gray-500 block uppercase">ID: {rep.salesRepId}</span>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${badgeColor} shrink-0`}>
                                {badgeText}
                              </span>
                            </div>

                            {/* Orders Collected vs Target */}
                            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/[0.03] space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[10px] font-mono text-gray-400 uppercase">Order Progress</span>
                                <span className="font-mono text-white font-bold">{rep.orderProgress}%</span>
                              </div>
                              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`${orderColor} h-full rounded-full transition-all duration-500`} 
                                  style={{ width: `${Math.min(100, rep.orderProgress)}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[9px] font-mono text-gray-500">
                                <span>Collected: <strong className="text-accent-emerald">৳{rep.totalOrdersBDT.toLocaleString()}</strong></span>
                                <span>Goal: ৳{rep.target.orderTargetBDT.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Check-ins vs Target */}
                            <div className="bg-white/[0.01] p-3 rounded-xl border border-white/[0.03] space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[10px] font-mono text-gray-400 uppercase">Check-ins Progress</span>
                                <span className="font-mono text-white font-bold">{rep.checkinProgress}%</span>
                              </div>
                              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`${checkinColor} h-full rounded-full transition-all duration-500`} 
                                  style={{ width: `${Math.min(100, rep.checkinProgress)}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[9px] font-mono text-gray-500">
                                <span>Actual: <strong className="text-white">{rep.completedCheckins} / {rep.beatCount}</strong></span>
                                <span>Goal: {rep.target.checkinTarget} Check-ins</span>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs">
                              {/* Metric lines */}
                              <div className="flex items-center justify-between border-b border-white/[0.03] pb-1.5">
                                <span className="text-gray-400">Total Outlets Visited:</span>
                                <span className="font-mono text-white font-bold">{rep.totalOutletsVisited} stores</span>
                              </div>
                              
                              <div className="flex items-center justify-between border-b border-white/[0.03] pb-1.5">
                                <span className="text-gray-400">Beat Coverage Rate:</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="bg-accent-cyan h-full rounded-full" 
                                      style={{ width: `${rep.coverageRate}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-accent-cyan font-bold">{rep.coverageRate}%</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-b border-white/[0.03] pb-1.5">
                                <span className="text-gray-400">Collection Velocity:</span>
                                <div className="text-right">
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <span className="font-mono text-accent-cyan font-black">৳{rep.velocityPerCheckin.toLocaleString()} / Check-in</span>
                                    <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                                      rep.velocityProgress >= 100 ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-amber/10 text-accent-amber'
                                    }`}>
                                      {rep.velocityProgress}% Goal
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono text-gray-500 block mt-0.5">Target Velocity: ৳{rep.target.velocityTarget.toLocaleString()} / Check-in</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-t-white/5 mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-mono">
                              {activeBeatRecord ? '🟢 Live Beat Active' : '⚪ Beat Complete / Standby'}
                            </span>
                            <button
                              onClick={() => {
                                const associatedBeat = beatPlans.find(b => b.salesRepId === rep.salesRepId);
                                if (associatedBeat) {
                                  setSelectedBeatId(associatedBeat.id);
                                }
                              }}
                              className="text-[10px] font-mono font-bold text-accent-cyan hover:underline cursor-pointer flex items-center gap-1"
                            >
                              Select Beat <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Dense Comparison Matrix / Table with custom Goal / Target Highlighting */}
                <div className="overflow-x-auto bg-white/[0.01] border border-white/5 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        <th className="p-4 font-bold">Representative Name</th>
                        <th className="p-4 font-bold text-right">Total Collected vs Goal</th>
                        <th className="p-4 font-bold text-right">Completed Check-Ins vs Goal</th>
                        <th className="p-4 font-bold text-right">Stores Visited</th>
                        <th className="p-4 font-bold text-right text-accent-cyan">Velocity (৳ / Check-in)</th>
                        <th className="p-4 font-bold text-right">Coverage Efficiency</th>
                        <th className="p-4 font-bold text-center">Goal Status summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03] text-xs font-mono">
                      {agentPerformanceStats.map(rep => {
                        const id = rep.salesRepId || rep.salesRepName;
                        const isSelected = comparedRepIds.includes(id);

                        // Highlight cells based on target completion
                        const orderTargetMet = rep.orderProgress >= 100;
                        const checkinTargetMet = rep.checkinProgress >= 100;
                        const velocityTargetMet = rep.velocityProgress >= 100;

                        let metCount = 0;
                        if (orderTargetMet) metCount++;
                        if (checkinTargetMet) metCount++;
                        if (velocityTargetMet) metCount++;

                        return (
                          <tr 
                            key={id}
                            className={`hover:bg-white/[0.02] transition-colors ${
                              isSelected ? 'bg-accent-cyan/[0.02]' : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <td className="p-4 flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setComparedRepIds(prev => 
                                    prev.includes(id)
                                      ? prev.filter(item => item !== id)
                                      : [...prev, id]
                                  );
                                }}
                                className="rounded border-white/10 bg-brand-black text-accent-cyan focus:ring-accent-cyan cursor-pointer"
                              />
                              <div>
                                <span className="font-bold text-white flex items-center gap-1">
                                  {rep.rank === 1 && <span title="1st Place Performer" className="text-xs">🏆</span>}
                                  {rep.rank === 2 && <span title="2nd Place Performer" className="text-xs">🥈</span>}
                                  {rep.rank === 3 && <span title="3rd Place Performer" className="text-xs">🥉</span>}
                                  {rep.salesRepName}
                                </span>
                                <span className="text-[10px] text-gray-500">ID: {rep.salesRepId}</span>
                              </div>
                            </td>

                            {/* Total Collected Column with Target Highlighting */}
                            <td className={`p-4 text-right transition-colors ${
                              orderTargetMet ? 'bg-accent-emerald/[0.03]' : 'bg-transparent'
                            }`}>
                              <span className="font-bold text-accent-emerald block">
                                ৳{rep.totalOrdersBDT.toLocaleString()}
                              </span>
                              <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500 mt-0.5">
                                <span>Goal: ৳{rep.target.orderTargetBDT.toLocaleString()}</span>
                                <span className={`px-1 rounded text-[8px] font-bold ${
                                  orderTargetMet 
                                    ? 'bg-accent-emerald/20 text-accent-emerald' 
                                    : rep.orderProgress >= 50 
                                    ? 'bg-accent-amber/20 text-accent-amber' 
                                    : 'bg-accent-rose/20 text-accent-rose'
                                }`}>
                                  {rep.orderProgress}%
                                </span>
                              </div>
                            </td>

                            {/* Completed Check-Ins Column with Target Highlighting */}
                            <td className={`p-4 text-right transition-colors ${
                              checkinTargetMet ? 'bg-accent-emerald/[0.03]' : 'bg-transparent'
                            }`}>
                              <span className="font-bold text-white block">
                                {rep.completedCheckins} <span className="text-[10px] text-gray-500">/ {rep.beatCount} Beats</span>
                              </span>
                              <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500 mt-0.5">
                                <span>Goal: {rep.target.checkinTarget}</span>
                                <span className={`px-1 rounded text-[8px] font-bold ${
                                  checkinTargetMet 
                                    ? 'bg-accent-emerald/20 text-accent-emerald' 
                                    : 'bg-accent-rose/20 text-accent-rose'
                                }`}>
                                  {rep.checkinProgress}%
                                </span>
                              </div>
                            </td>

                            <td className="p-4 text-right text-white">
                              {rep.totalOutletsVisited} <span className="text-[10px] text-gray-500">visited</span>
                            </td>

                            {/* Velocity Column with Target Highlighting */}
                            <td className={`p-4 text-right transition-colors ${
                              velocityTargetMet ? 'bg-accent-cyan/[0.04]' : 'bg-transparent'
                            }`}>
                              <span className="font-black text-accent-cyan block">
                                ৳{rep.velocityPerCheckin.toLocaleString()}
                              </span>
                              <div className="flex items-center justify-end gap-1 text-[9px] text-gray-500 mt-0.5">
                                <span>Goal: ৳{rep.target.velocityTarget.toLocaleString()}</span>
                                <span className={`px-1 rounded text-[8px] font-bold ${
                                  velocityTargetMet ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-accent-rose/20 text-accent-rose'
                                }`}>
                                  {rep.velocityProgress}%
                                </span>
                              </div>
                            </td>

                            <td className="p-4 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                rep.coverageRate >= 80 ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-amber/10 text-accent-amber'
                              }`}>
                                {rep.coverageRate}%
                              </span>
                            </td>

                            {/* Brand-new targets summary dashboard column */}
                            <td className="p-4 text-center">
                              <div className="flex flex-col items-center justify-center gap-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  metCount === 3 
                                    ? 'bg-accent-emerald/25 text-accent-emerald' 
                                    : metCount > 0 
                                    ? 'bg-accent-cyan/25 text-accent-cyan' 
                                    : 'bg-accent-rose/25 text-accent-rose'
                                }`}>
                                  {metCount} / 3 Goals Met
                                </span>
                                <div className="flex items-center gap-1 text-[10px]">
                                  <span className={`w-1.5 h-1.5 rounded-full ${orderTargetMet ? 'bg-accent-emerald' : 'bg-white/10'}`} title="Sales Goal" />
                                  <span className={`w-1.5 h-1.5 rounded-full ${checkinTargetMet ? 'bg-accent-emerald' : 'bg-white/10'}`} title="Check-in Goal" />
                                  <span className={`w-1.5 h-1.5 rounded-full ${velocityTargetMet ? 'bg-accent-emerald' : 'bg-white/10'}`} title="Velocity Goal" />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Beat Details */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
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

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedBeatId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="space-y-6"
                >
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
                </motion.div>
              </AnimatePresence>
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
