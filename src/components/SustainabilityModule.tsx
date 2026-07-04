import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { 
  Leaf, 
  Trees, 
  Globe, 
  Activity, 
  Award, 
  Zap, 
  Droplet, 
  Trash2, 
  FileText, 
  Cpu, 
  Map, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Warehouse, 
  Coins, 
  Download, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  TrendingDown, 
  Play, 
  RefreshCw,
  Gauge,
  Percent,
  TrendingUp,
  Sliders,
  Flame,
  UserCheck
} from 'lucide-react';
import { Vehicle, Warehouse as WarehouseType } from '../types';

interface SustainabilityModuleProps {
  vehicles: Vehicle[];
  warehouses: WarehouseType[];
  carbonThreshold?: number;
  setCarbonThreshold?: (v: number) => void;
}

// Sub-tabs within the Sustainability Module
type SustainabilitySubTab = 
  | 'executive'
  | 'carbon'
  | 'fleet'
  | 'warehouse'
  | 'suppliers'
  | 'offsets'
  | 'reports'
  | 'advisor';

export default function SustainabilityModule({
  vehicles,
  warehouses,
  carbonThreshold = 18.0,
  setCarbonThreshold = () => {}
}: SustainabilityModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<SustainabilitySubTab>('executive');
  const [isLiveTelemetry, setIsLiveTelemetry] = useState(true);

  // Live telemetry fluctuating state for high-fidelity feel
  const [tickerOffset, setTickerOffset] = useState(0);
  useEffect(() => {
    if (!isLiveTelemetry) return;
    const interval = setInterval(() => {
      setTickerOffset(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLiveTelemetry]);

  // --- CORE SYSTEM METRICS & CALCULATIONS ---
  const activeTransitVehicles = vehicles.filter(v => v.status === 'in_transit');
  const totalFleetEmissionsThisMonth = 142.8 + tickerOffset; // Tons CO2
  const fuelConsumptionThisMonth = 42850 + Math.round(tickerOffset * 100); // Liters
  const electricityUsedThisMonth = 28450; // kWh
  const wasteGeneratedThisMonth = 4820; // kg
  const wasteRecycledThisMonth = 3280; // kg
  const waterConsumptionThisMonth = 1450; // m³
  const esgComplianceScore = 94.2; // %
  const aiHealthScore = 96.5; // %
  const treesSaved = 4520; // Trees equivalent
  const greenDeliveriesRatio = 82.4; // %
  const carbonOffsetCostEstimate = 428000; // ৳ BDT
  const currentAvoidedCarbon = 34.2; // Tons

  // Multi-facility metrics
  const totalSolarGeneration = 12400; // kWh
  const gridPeakUsageHrs = "14:00 - 17:00 BDT";

  // State for carbon offset calculator
  const [calcFuel, setCalcFuel] = useState('25000');
  const [calcElectricity, setCalcElectricity] = useState('15000');
  const [calcFreightWeight, setCalcFreightWeight] = useState('80');
  const [calcFreightDistance, setCalcFreightDistance] = useState('450');

  // Offset Interactive Portfolio allocation
  const [offsetAllocation, setOffsetAllocation] = useState({
    reforestation: 50,
    solarFarm: 30,
    creditPurchase: 20
  });

  // Supplier sustainable scores and details
  const [suppliers, setSuppliers] = useState([
    { id: 'sup-1', name: 'Apex Logistics Corp', esgScore: 92, carbonIntensity: '0.12 kg CO2/km', packagingRecyclable: 95, ethicalRating: 'Gold', category: 'Third-party Logistics' },
    { id: 'sup-2', name: 'Bengal Polychem Ltd', esgScore: 68, carbonIntensity: '0.45 kg CO2/kg', packagingRecyclable: 40, ethicalRating: 'Silver', category: 'Packaging Material' },
    { id: 'sup-3', name: 'Padma Container Depot', esgScore: 88, carbonIntensity: '0.22 kg CO2/unit', packagingRecyclable: 80, ethicalRating: 'Gold', category: 'Warehousing & Storage' },
    { id: 'sup-4', name: 'Desh Green Carton Hub', esgScore: 96, carbonIntensity: '0.08 kg CO2/kg', packagingRecyclable: 100, ethicalRating: 'Platinum', category: 'Packaging Material' },
    { id: 'sup-5', name: 'Meghna Carrier Services', esgScore: 54, carbonIntensity: '0.62 kg CO2/km', packagingRecyclable: 30, ethicalRating: 'Bronze', category: 'Primary Freight' },
  ]);

  // Alert Feed State
  const [sustainabilityAlerts, setSustainabilityAlerts] = useState([
    { id: 'sus-alt-1', title: 'Scope 1 Vehicle Emission Spikes', desc: 'Truck Dhaka-Metro-U-1204 recorded carbon emissions exceeding 45L/100km threshold on Dhaka-Chittagong Highway.', severity: 'critical', actionTaken: false, type: 'vehicle', targetId: ' Dhaka-Metro-U-1204' },
    { id: 'sus-alt-2', title: 'Solar Battery Substation Grid Drop', desc: 'Warehouse Chittagong Depot 2 solar generation decreased 35% during peak hours; grid storage discharge bypass initiated.', severity: 'moderate', actionTaken: false, type: 'facility', targetId: 'Chittagong Depot 2' },
    { id: 'sus-alt-3', title: 'Packaging Material ESG Decline', desc: 'Bengal Polychem Ltd reported a drop in PCR plastic ratio from 45% to 30%, lowering supplier rating to C.', severity: 'warning', actionTaken: false, type: 'supplier', targetId: 'Bengal Polychem Ltd' },
    { id: 'sus-alt-4', title: 'Rainwater Harvesting Leak Detected', desc: 'Secondary storage system in Dhaka Central Warehouse reported low pressure. Possible valve disruption.', severity: 'warning', actionTaken: false, type: 'facility', targetId: 'Dhaka Central Warehouse' },
  ]);

  const [activeAdvisorPrompt, setActiveAdvisorPrompt] = useState('');
  const [advisorChatLog, setAdvisorChatLog] = useState<Array<{ sender: 'user' | 'cso'; text: string; date: string }>>([
    {
      sender: 'cso',
      text: "System Online. I am your virtual Chief Sustainability Officer AI Advisor. I am continuously auditing SupplyNova's Scope 1-3 operations against ISO 14064 criteria. How can I assist you in optimizing our carbon-to-revenue ratio today?",
      date: '22:21'
    }
  ]);

  // Report Export State
  const [selectedReportType, setSelectedReportType] = useState('executive');
  const [selectedReportQuarter, setSelectedReportQuarter] = useState('Q2 2026');
  const [includeAISummary, setIncludeAISummary] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportCompleteMessage, setExportCompleteMessage] = useState<string | null>(null);

  // Selected Truck Detail for Fleet Log Drilldown
  const [selectedTruckId, setSelectedTruckId] = useState<string>(vehicles[0]?.id || '');
  const activeTruck = vehicles.find(v => v.id === selectedTruckId) || vehicles[0];

  // Selected Supplier Detail for Edit State
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [editEsgVal, setEditEsgVal] = useState<number>(80);
  const [editRecyclableVal, setEditRecyclableVal] = useState<number>(80);

  // ECharts References
  const forecastChartRef = useRef<HTMLDivElement>(null);
  const sourceChartRef = useRef<HTMLDivElement>(null);

  // --- RENDERING CHARTS ---
  useEffect(() => {
    if (activeSubTab === 'advisor' && forecastChartRef.current) {
      const chart = echarts.init(forecastChartRef.current, 'dark', { renderer: 'canvas' });
      const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        title: {
          text: 'SupplyNova Carbon Emissions Forecast (Tons CO2) - 2026 to 2030',
          left: 'center',
          textStyle: { color: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#121214',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#f3f4f6', fontSize: 11, fontFamily: 'monospace' }
        },
        legend: {
          data: ['Historical Base', 'BAU Projection', 'Green Optimization Path (SLA Bound)', 'Confidence Interval Max', 'Confidence Interval Min'],
          textStyle: { color: '#9ca3af', fontSize: 9 },
          top: 25
        },
        grid: {
          top: 60,
          left: '3%',
          right: '3%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['2023', '2024', '2025', '2026 (Act)', '2027 (Est)', '2028 (Est)', '2029 (Est)', '2030 (Est)'],
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
          axisLabel: { color: '#9ca3af', fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          name: 'CO2 Tons',
          axisLabel: { color: '#9ca3af', fontSize: 9 },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } }
        },
        series: [
          {
            name: 'Historical Base',
            type: 'line',
            symbol: 'circle',
            smooth: true,
            lineStyle: { width: 3, color: '#3b82f6' },
            data: [180, 165, 150, 142.8, null, null, null, null]
          },
          {
            name: 'BAU Projection',
            type: 'line',
            smooth: true,
            lineStyle: { width: 2, type: 'dashed', color: '#f43f5e' },
            data: [null, null, null, 142.8, 148.5, 154.2, 161.0, 168.4]
          },
          {
            name: 'Green Optimization Path (SLA Bound)',
            type: 'line',
            smooth: true,
            lineStyle: { width: 3, color: '#10b981' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0)' }
              ])
            },
            data: [null, null, null, 142.8, 128.4, 114.5, 98.2, 80.5]
          },
          {
            name: 'Confidence Interval Max',
            type: 'line',
            lineStyle: { width: 1, color: 'rgba(255,255,255,0.15)', type: 'dotted' },
            data: [null, null, null, 145.2, 134.1, 122.3, 107.4, 91.0]
          },
          {
            name: 'Confidence Interval Min',
            type: 'line',
            lineStyle: { width: 1, color: 'rgba(255,255,255,0.15)', type: 'dotted' },
            data: [null, null, null, 140.4, 122.7, 106.7, 89.0, 70.0]
          }
        ]
      };
      chart.setOption(option);
      const resizeHandler = () => chart.resize();
      window.addEventListener('resize', resizeHandler);
      return () => {
        window.removeEventListener('resize', resizeHandler);
        chart.dispose();
      };
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (activeSubTab === 'carbon' && sourceChartRef.current) {
      const chart = echarts.init(sourceChartRef.current, 'dark', { renderer: 'canvas' });
      const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        title: {
          text: 'Carbon Footprint Apportionment By Logistics Source',
          left: 'center',
          textStyle: { color: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: '#121214',
          borderColor: 'rgba(255,255,255,0.1)',
          formatter: '{b} : {c} Tons ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: { color: '#9ca3af', fontSize: 9 },
          top: 30
        },
        series: [
          {
            name: 'Emissions Apportionment',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#121214',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}\n({d}%)',
              color: '#fff',
              fontSize: 9
            },
            data: [
              { value: 48.5, name: 'Diesel Freight Fleet', itemStyle: { color: '#f43f5e' } },
              { value: 24.2, name: 'Warehouse Power Grid (Scope 2)', itemStyle: { color: '#f59e0b' } },
              { value: 12.8, name: '3PL Partners (Scope 3)', itemStyle: { color: '#06b6d4' } },
              { value: 9.5, name: 'HVAC & Facility Generators', itemStyle: { color: '#a855f7' } },
              { value: 5.0, name: 'Packaging Waste Overhead', itemStyle: { color: '#10b981' } },
            ]
          }
        ]
      };
      chart.setOption(option);
      const resizeHandler = () => chart.resize();
      window.addEventListener('resize', resizeHandler);
      return () => {
        window.removeEventListener('resize', resizeHandler);
        chart.dispose();
      };
    }
  }, [activeSubTab]);

  // Alert remediation handler
  const handleAcknowledgeAlert = (id: string) => {
    setSustainabilityAlerts(prev =>
      prev.map(alt => (alt.id === id ? { ...alt, actionTaken: true } : alt))
    );
  };

  // Chat agent submission logic
  const handleAskAdvisor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeAdvisorPrompt.trim()) return;

    const userMsg = activeAdvisorPrompt;
    setAdvisorChatLog(prev => [
      ...prev,
      { sender: 'user', text: userMsg, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setActiveAdvisorPrompt('');

    // Simulated responses mapping
    setTimeout(() => {
      let responseText = "Auditing criteria. Our current fleet reports a peak emission density of 0.28kg CO2/km BDT. If we transition the Dhaka-Comilla corridor routes to 100% EV carriers by Q4, we can drop fleet carbon output by an estimated 28.5 tons monthly, while realizing ৳1,45,000 in fuel cost offsets.";
      
      const promptLower = userMsg.toLowerCase();
      if (promptLower.includes('fleet') || promptLower.includes('truck') || promptLower.includes('vehicle')) {
        responseText = "Fleet Analysis complete. 3 diesel vehicles are registering idle times greater than 45 minutes at Dhaka Central Hub. We recommend: 1) Deploy smart shut-off protocols on Dhaka-Metro-U-1204; 2) Reroute heavy container rigs through outer ring pathways to minimize gridlocked deceleration cycles.";
      } else if (promptLower.includes('warehouse') || promptLower.includes('solar') || promptLower.includes('energy')) {
        responseText = "Energy Ledger Audited. Current solar contribution at Warehouse 1 is 48% with a battery storage reserve of 650 kWh. Shifting high-intensity material conveyor operations to peak solar generation hours (11:00 AM - 2:00 PM) will reduce utility peak surcharges by ৳32,000 monthly.";
      } else if (promptLower.includes('supplier') || promptLower.includes('esg')) {
        responseText = "Supplier ESG Optimization: Bengal Polychem Ltd has a C rating due to uncertified plastic sourcing. Switching 30% of bulk container packaging to Desh Green Carton Hub would improve overall ESG Procurement Scoring from 94.2% to 96.8%.";
      } else if (promptLower.includes('forecast') || promptLower.includes('future') || promptLower.includes('2030')) {
        responseText = "Predictive Carbon Model: Without active interventions, business-as-usual cargo emissions are modeled to reach 168.4 Tons by 2030. Implementing our dynamic smart logistics routing along N1 highways can force a carbon downward slope to 80.5 Tons, a 52% reduction.";
      }

      setAdvisorChatLog(prev => [
        ...prev,
        { sender: 'cso', text: responseText, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1200);
  };

  // Interactive carbon calculations
  const parsedFuel = Number(calcFuel) || 0;
  const parsedElec = Number(calcElectricity) || 0;
  const parsedWeight = Number(calcFreightWeight) || 0;
  const parsedDistance = Number(calcFreightDistance) || 0;

  // Emission factors (Approx values)
  // Diesel: ~2.68 kg CO2/L
  // Grid Elec Bangladesh: ~0.64 kg CO2/kWh
  // Freight: ~0.15 kg CO2/Ton-KM
  const scope1Emissions = Number(((parsedFuel * 2.68) / 1000).toFixed(2));
  const scope2Emissions = Number(((parsedElec * 0.64) / 1000).toFixed(2));
  const scope3Emissions = Number(((parsedWeight * parsedDistance * 0.15) / 1000).toFixed(2));
  const combinedCalculatorTotal = Number((scope1Emissions + scope2Emissions + scope3Emissions).toFixed(2));

  // Supplier update handler
  const handleUpdateSupplierDetails = (supId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supId) {
        let goldVal = 'Silver';
        if (editEsgVal >= 90) goldVal = 'Platinum';
        else if (editEsgVal >= 80) goldVal = 'Gold';
        return {
          ...s,
          esgScore: editEsgVal,
          packagingRecyclable: editRecyclableVal,
          ethicalRating: goldVal
        };
      }
      return s;
    }));
    setEditingSupplierId(null);
  };

  // Simulated Report Exporter
  const handleExportReport = () => {
    setIsExporting(true);
    setExportCompleteMessage(null);
    setTimeout(() => {
      setIsExporting(false);
      setExportCompleteMessage(`Successfully generated ${selectedReportType.toUpperCase()} REPORT for ${selectedReportQuarter}. Download completed: SupplyNova_ESG_${selectedReportQuarter.replace(' ', '_')}.${selectedReportType === 'executive' ? 'pdf' : 'xlsx'} (Corporate Digital Certified Signature Attached)`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-dark-grey p-5 rounded-xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center shrink-0">
            <Leaf className="text-accent-emerald animate-bounce" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded">ISO 14064 Compliance</span>
              <span className="text-[10px] font-mono text-gray-500">SYSTEM STABLE</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase mt-0.5">
              Sustainability &amp; Carbon Command Center
            </h1>
          </div>
        </div>

        {/* Global stream toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiveTelemetry(!isLiveTelemetry)}
            className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 cursor-pointer ${
              isLiveTelemetry
                ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20 hover:bg-accent-emerald/20'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLiveTelemetry ? 'bg-accent-emerald animate-pulse' : 'bg-gray-500'}`} />
            ESG Telemetry: {isLiveTelemetry ? 'LIVE' : 'PAUSED'}
          </button>
          <div className="text-[10px] font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded border border-white/10 uppercase tracking-wider">
            SLA Bound BDT Offset Ratio: <span className="text-accent-cyan font-bold">1:2.4</span>
          </div>
        </div>
      </div>

      {/* Primary Sub-Tabs Controller (Bloomberg / Microsoft ESG Terminal look) */}
      <div className="flex items-center gap-1.5 bg-brand-dark-grey p-1.5 rounded border border-white/10 overflow-x-auto select-none no-scrollbar">
        {[
          { id: 'executive', name: 'Executive Overview', icon: Globe },
          { id: 'carbon', name: 'Carbon footprint Calculator', icon: Sliders },
          { id: 'fleet', name: 'Fleet Green log', icon: Truck },
          { id: 'warehouse', name: 'Facility ESG Grid', icon: Warehouse },
          { id: 'suppliers', name: 'Vendor ESG Scoring', icon: Award },
          { id: 'offsets', name: 'Capital offsets Hub', icon: Coins },
          { id: 'reports', name: 'Professional Reports', icon: FileText },
          { id: 'advisor', name: 'CSO AI Assistant & Forecast', icon: Sparkles },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SustainabilitySubTab)}
              className={`px-3.5 py-2 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
                isActive
                  ? 'bg-white/5 text-accent-emerald border-accent-emerald'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/[0.01]'
              }`}
            >
              <Icon size={12} className={isActive ? 'text-accent-emerald scale-110' : 'text-gray-500'} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: EXECUTIVE COMMAND CENTER */}
      {activeSubTab === 'executive' && (
        <div className="space-y-6">
          {/* Real-time KPI Wall (18 Metrics total for Executive insight) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-rose/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Scope 1 CO₂ Emissions</span>
                <span className="text-[9px] font-mono text-accent-rose font-semibold flex items-center gap-0.5 mt-0.5">
                  <TrendingUp size={10} /> +1.2% MoM
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-white mt-1.5 tracking-wider leading-none uppercase">
                  {(84.5 + tickerOffset * 0.5).toFixed(1)} Tons
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-emerald/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Scope 2 (Electricity)</span>
                <span className="text-[9px] font-mono text-accent-emerald font-semibold flex items-center gap-0.5 mt-0.5">
                  <TrendingDown size={10} /> -4.8% MoM
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-white mt-1.5 tracking-wider leading-none uppercase">
                  {(58.3).toFixed(1)} Tons
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-cyan/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Scope 3 (Suppliers/3PL)</span>
                <span className="text-[9px] font-mono text-accent-cyan font-semibold flex items-center gap-0.5 mt-0.5 text-gray-400">
                  Stable
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-white mt-1.5 tracking-wider leading-none uppercase">
                  {(34.2).toFixed(1)} Tons
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-emerald/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Total Monthly CO₂</span>
                <span className="text-[9px] font-mono text-accent-emerald font-semibold flex items-center gap-0.5 mt-0.5">
                  <TrendingDown size={10} /> -1.8% overall
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-accent-emerald mt-1.5 tracking-wider leading-none uppercase">
                  {totalFleetEmissionsThisMonth.toFixed(1)} Tons
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-emerald/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Fuel Consumption</span>
                <span className="text-[9px] font-mono text-accent-emerald font-semibold flex items-center gap-0.5 mt-0.5">
                  Diesel Optimized
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-white mt-1.5 tracking-wider leading-none uppercase">
                  {fuelConsumptionThisMonth.toLocaleString()} L
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-cyan/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Green Logistics Score</span>
                <span className="text-[9px] font-mono text-accent-cyan font-semibold flex items-center gap-0.5 mt-0.5">
                  SLA Tier 1
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-accent-cyan mt-1.5 tracking-wider leading-none uppercase">
                  {greenDeliveriesRatio}%
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-emerald/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Renewable Energy</span>
                <span className="text-[9px] font-mono text-accent-emerald font-semibold flex items-center gap-0.5 mt-0.5">
                  Solar Generated
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-white mt-1.5 tracking-wider leading-none uppercase">
                  {(totalSolarGeneration / 1000).toFixed(1)} MWh
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-blue/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Electricity consumed</span>
                <span className="text-[9px] font-mono text-gray-400 mt-0.5">
                  Warehouse Grid
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-white mt-1.5 tracking-wider leading-none uppercase">
                  {electricityUsedThisMonth.toLocaleString()} kWh
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-cyan/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Water Consumption</span>
                <span className="text-[9px] font-mono text-accent-cyan font-semibold flex items-center gap-0.5 mt-0.5">
                  Harvester Active
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-white mt-1.5 tracking-wider leading-none uppercase">
                  {waterConsumptionThisMonth.toLocaleString()} m³
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-rose/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Total Waste Generated</span>
                <span className="text-[9px] font-mono text-accent-rose mt-0.5">
                  Recycling Diverted
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-white mt-1.5 tracking-wider leading-none uppercase">
                  {wasteGeneratedThisMonth.toLocaleString()} kg
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-emerald/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">ESG Compliance Score</span>
                <span className="text-[9px] font-mono text-accent-emerald font-semibold flex items-center gap-0.5 mt-0.5">
                  Perfect SLA
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-accent-emerald mt-1.5 tracking-wider leading-none uppercase">
                  {esgComplianceScore}%
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between group hover:border-accent-emerald/20 transition-all">
              <div>
                <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">CSO AI Advisor Health</span>
                <span className="text-[9px] font-mono text-accent-emerald font-semibold flex items-center gap-0.5 mt-0.5 animate-pulse">
                  ● ACTIVE AUDIT
                </span>
                <h4 className="text-lg font-kpi font-extrabold text-accent-emerald mt-1.5 tracking-wider leading-none uppercase">
                  {aiHealthScore}%
                </h4>
              </div>
            </div>
          </div>

          {/* Active Incidents & ESG Remediation Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <AlertTriangle className="text-accent-rose animate-pulse" size={14} /> Critical ESG Alerts &amp; Real-time Incident Feed
                  </h3>
                  <p className="text-[9px] font-mono text-gray-400 mt-0.5">C-level decision gate &amp; telemetry monitoring</p>
                </div>
                <span className="text-[8px] font-mono text-accent-rose bg-accent-rose/10 border border-accent-rose/20 px-2 py-0.5 rounded uppercase font-bold">
                  {sustainabilityAlerts.filter(a => !a.actionTaken).length} Unresolved Incidents
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px] pr-1">
                {sustainabilityAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3.5 rounded border transition-all ${
                      alert.actionTaken 
                        ? 'bg-white/[0.01] border-white/5 opacity-50' 
                        : alert.severity === 'critical'
                          ? 'bg-accent-rose/5 border-accent-rose/20'
                          : alert.severity === 'moderate'
                            ? 'bg-accent-amber/5 border-accent-amber/20'
                            : 'bg-accent-blue/5 border-accent-blue/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            alert.severity === 'critical' 
                              ? 'bg-accent-rose/15 text-accent-rose' 
                              : alert.severity === 'moderate'
                                ? 'bg-accent-amber/15 text-accent-amber'
                                : 'bg-accent-blue/15 text-accent-blue'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">{alert.type} - {alert.targetId}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">{alert.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{alert.desc}</p>
                      </div>
                      
                      {!alert.actionTaken ? (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 rounded bg-accent-emerald/10 hover:bg-accent-emerald/25 text-accent-emerald border border-accent-emerald/30 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <CheckCircle2 size={10} />
                          Mitigate AI
                        </button>
                      ) : (
                        <span className="text-[9px] font-mono text-accent-emerald font-semibold uppercase flex items-center gap-1 shrink-0">
                          <CheckCircle2 size={10} /> Mitigated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI CSO Quick Insights Panel */}
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5 mb-2">
                  <Sparkles className="text-accent-cyan" size={14} /> Virtual CSO Executive Briefing
                </h3>
                <p className="text-[10px] font-mono text-gray-400 border-b border-white/5 pb-2.5">Real-time optimization vectors</p>
                
                <div className="space-y-3.5 mt-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-accent-emerald/10 flex items-center justify-center shrink-0 text-accent-emerald mt-0.5">
                      <Trees size={10} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Carbon Credits Asset Offset</h5>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                        Purchased 42.5 tons of verified credits from Sundarbans Reforestation. Avoided emissions total count sits at <span className="text-accent-emerald font-bold">{currentAvoidedCarbon} Tons</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-accent-cyan/10 flex items-center justify-center shrink-0 text-accent-cyan mt-0.5">
                      <Zap size={10} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Peak Hour Battery Offsetting</h5>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                        Battery storage stands at <span className="text-accent-cyan font-bold">650 kWh</span>. Automated systems can run on battery power between {gridPeakUsageHrs} avoiding utility peak tariffs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-accent-rose/10 flex items-center justify-center shrink-0 text-accent-rose mt-0.5">
                      <Truck size={10} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">EV Fleet Shift Strategy</h5>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                        Dhaka-Chittagong heavy freight routes generate 62.5% of Scope 1 carbon load. An initial shift of 4 vehicles will drop fuel bills by <span className="text-accent-emerald font-bold">৳2,15,000</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3.5 mt-4">
                <button
                  onClick={() => setActiveSubTab('advisor')}
                  className="w-full py-2 rounded bg-accent-emerald/15 hover:bg-accent-emerald/25 border border-accent-emerald/20 text-[10px] font-black uppercase tracking-widest text-accent-emerald transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Ask CSO Assistant <ArrowRight size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CARBON FOOTPRINT CALCULATOR WORKSPACE */}
      {activeSubTab === 'carbon' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calculator Interface Controls */}
          <div className="lg:col-span-5 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="text-accent-emerald" size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">ISO 14064 Carbon Coefficient Engine</h3>
              </div>
              <p className="text-[10px] text-gray-400 border-b border-white/5 pb-3">
                Adjust resource volumes to compute actual Scope 1, 2, &amp; 3 equivalent carbon emissions based on certified IPCC regional coefficients.
              </p>

              <div className="space-y-4.5 mt-4.5">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1.5">
                    <span className="uppercase">Scope 1: Diesel Fleet (Liters)</span>
                    <span className="text-accent-rose font-bold">{calcFuel} L</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100000" 
                    step="500"
                    value={calcFuel}
                    onChange={(e) => setCalcFuel(e.target.value)}
                    className="w-full accent-accent-rose"
                  />
                  <span className="text-[8px] font-mono text-gray-500 mt-1 block uppercase">Emission factor: 2.68 kg CO₂ per Liter of Diesel</span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1.5">
                    <span className="uppercase">Scope 2: Facility Electricity (kWh)</span>
                    <span className="text-accent-amber font-bold">{calcElectricity} kWh</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    step="250"
                    value={calcElectricity}
                    onChange={(e) => setCalcElectricity(e.target.value)}
                    className="w-full accent-accent-amber"
                  />
                  <span className="text-[8px] font-mono text-gray-500 mt-1 block uppercase">Emission factor: 0.64 kg CO₂ per kWh (Regional Bangladesh Grid)</span>
                </div>

                <div className="border-t border-white/5 pt-3.5 mt-1">
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block mb-2.5">Scope 3: 3PL Partner Freight Calculator</span>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[8px] font-mono text-gray-400 block uppercase mb-1">Total Weight (Tons)</label>
                      <input 
                        type="number"
                        value={calcFreightWeight}
                        onChange={(e) => setCalcFreightWeight(e.target.value)}
                        className="w-full bg-brand-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-mono text-gray-400 block uppercase mb-1">Transit distance (KM)</label>
                      <input 
                        type="number"
                        value={calcFreightDistance}
                        onChange={(e) => setCalcFreightDistance(e.target.value)}
                        className="w-full bg-brand-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-gray-500 mt-1.5 block uppercase">Freight factor: 0.15 kg CO₂ per Ton-KM</span>
                </div>
              </div>
            </div>

            {/* Combined Calculation Results */}
            <div className="border-t border-white/5 pt-4 mt-6">
              <div className="bg-brand-black/50 p-4 rounded-lg border border-white/10 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 border-b border-white/5 pb-1.5">
                  <span className="uppercase">Scope 1 (Direct Fuel)</span>
                  <span className="text-accent-rose font-bold">{scope1Emissions} Tons CO₂e</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 border-b border-white/5 pb-1.5">
                  <span className="uppercase">Scope 2 (Grid Power)</span>
                  <span className="text-accent-amber font-bold">{scope2Emissions} Tons CO₂e</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 border-b border-white/5 pb-1.5">
                  <span className="uppercase">Scope 3 (Supply Chain Freight)</span>
                  <span className="text-accent-cyan font-bold">{scope3Emissions} Tons CO₂e</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Combined Total Carbon Load</span>
                  <span className="text-base font-kpi font-extrabold text-accent-emerald tracking-wide">
                    {combinedCalculatorTotal} Tons CO₂e
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Pie Chart of Apportionment */}
          <div className="lg:col-span-7 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between min-h-[400px]">
            <div className="flex-1 w-full min-h-0 relative">
              <div ref={sourceChartRef} className="w-full h-full" />
            </div>

            <div className="border-t border-white/5 pt-3 mt-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-between">
              <span>APACHE ECHARTS CORE RENDERING</span>
              <span>SLA Target Limit: 150 Tons Max</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FLEET GREEN LOG & TELEMETRY */}
      {activeSubTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Truck Selector List */}
          <div className="lg:col-span-4 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col h-[460px]">
            <div className="border-b border-white/5 pb-3 mb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                <Truck className="text-accent-emerald animate-pulse" size={14} /> Fleet Eco-Telemetry Log
              </h3>
              <p className="text-[9px] font-mono text-gray-400 mt-0.5">Select vehicle to drill down emissions rating</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none">
              {vehicles.map((v) => {
                const fuelRate = v.fuelConsumptionRate || 18.2;
                const isHighEmission = fuelRate > 30;
                const isEV = v.type.includes('Light') || v.type.includes('Electric') || fuelRate === 0;

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedTruckId(v.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      v.id === selectedTruckId
                        ? 'bg-accent-emerald/10 border-accent-emerald/40 shadow-lg'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{v.plateNumber}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        isEV 
                          ? 'bg-accent-emerald/20 text-accent-emerald'
                          : isHighEmission 
                            ? 'bg-accent-rose/20 text-accent-rose animate-pulse'
                            : 'bg-accent-cyan/15 text-accent-cyan'
                      }`}>
                        {isEV ? 'Electric EV' : isHighEmission ? 'High Load Diesel' : 'Diesel Carrier'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mt-2.5">
                      <span>Speed: <b className="text-white">{v.currentSpeed || 0} km/h</b></span>
                      <span>Fuel Rate: <b className={isHighEmission ? 'text-accent-rose' : 'text-accent-emerald'}>{fuelRate} L/100km</b></span>
                    </div>

                    <div className="w-full bg-white/5 h-1 rounded overflow-hidden mt-2">
                      <div 
                        className={`h-full ${isHighEmission ? 'bg-accent-rose' : 'bg-accent-emerald'}`}
                        style={{ width: `${Math.min(100, Math.max(10, (100 - (fuelRate / 45) * 100)))}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Truck Deep-Dive Detail */}
          <div className="lg:col-span-8 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between h-[460px]">
            {activeTruck ? (
              <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">ACTIVE VEHICLE DETAILS</span>
                        <div className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
                      </div>
                      <h3 className="text-lg font-bold text-white uppercase mt-0.5">{activeTruck.plateNumber}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest block font-kpi">Trip Efficiency Score</span>
                      <h4 className="text-xl font-kpi font-extrabold text-accent-emerald leading-none mt-1 uppercase">
                        {activeTruck.fuelConsumptionRate ? (100 - Math.round((activeTruck.fuelConsumptionRate / 45) * 100)) : 92}%
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                      <span className="text-[8px] font-mono text-gray-500 uppercase block">Vehicle Type</span>
                      <span className="text-xs font-bold text-white block mt-1 uppercase truncate">{activeTruck.type}</span>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                      <span className="text-[8px] font-mono text-gray-500 uppercase block">Driver Active</span>
                      <span className="text-xs font-bold text-accent-cyan block mt-1 uppercase truncate">Driver Assignment</span>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                      <span className="text-[8px] font-mono text-gray-500 uppercase block">Engine Health SLA</span>
                      <span className="text-xs font-bold text-white block mt-1 uppercase truncate">{activeTruck.engineHealth || 100}%</span>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                      <span className="text-[8px] font-mono text-gray-500 uppercase block">Temperature Limit</span>
                      <span className="text-xs font-bold text-accent-emerald block mt-1 uppercase truncate">Perfect Grid</span>
                    </div>
                  </div>

                  <div className="bg-brand-black/40 p-4.5 rounded-lg border border-white/5 mt-5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-accent-emerald flex items-center gap-1.5 mb-2">
                      <Sparkles size={11} /> AI Route Carbon Mitigation Analysis
                    </span>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                      This carrier is currently navigating highways with moderate gridlocks. AI suggests switching driver transmission settings to eco-mode or performing a preventive HVAC fluid replacement to lower fuel rate.
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded bg-accent-cyan/15 hover:bg-accent-cyan/25 text-accent-cyan border border-accent-cyan/20 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer">
                        Trigger Eco-Routing Command
                      </button>
                      <button className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer">
                        Schedule Carbon Audit
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  <span>GPS LAT: 23.8103° N | LNG: 90.4125° E</span>
                  <span>CO₂ Emission Density: 0.28kg CO2/km</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-white/40">
                Please select a vehicle to observe detailed carbon metrics.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT 4: FACILITY ESG GRID */}
      {activeSubTab === 'warehouse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Energy Generation & HVAC Panel */}
            <div className="lg:col-span-4 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5 mb-2.5">
                  <Zap className="text-accent-amber" size={14} /> facility smart energy monitor
                </h3>
                <p className="text-[10px] text-gray-400 border-b border-white/5 pb-2.5">Real-time solar grid &amp; HVAC telemetry</p>

                <div className="space-y-4 mt-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>SOLAR RENEWABLE CONTRIBUTION</span>
                      <span className="text-accent-emerald font-bold">48% Active</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded overflow-hidden">
                      <div className="h-full bg-accent-emerald" style={{ width: '48%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>BATTERY STORAGE CHARGE</span>
                      <span className="text-accent-cyan font-bold">650 kWh / 1000 kWh</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded overflow-hidden">
                      <div className="h-full bg-accent-cyan" style={{ width: '65%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>DIESEL GENERATOR IDLE TIME</span>
                      <span className="text-accent-rose font-bold">12 mins / day</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded overflow-hidden">
                      <div className="h-full bg-accent-rose" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand-black/40 p-3.5 border border-white/5 rounded-lg mt-5">
                <span className="text-[9px] font-black uppercase text-accent-amber block mb-1">AI Energy Saving Schedule</span>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Peak grid charges occur between {gridPeakUsageHrs}. We recommend automatic discharge of the solar batteries during these hours.
                </p>
              </div>
            </div>

            {/* Warehouse Visual Status Grid */}
            <div className="lg:col-span-8 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                      <Warehouse className="text-accent-emerald" size={14} /> Facility ESG &amp; Environmental Grid
                    </h3>
                    <p className="text-[9px] font-mono text-gray-400 mt-0.5">Real-time green scores per regional depot</p>
                  </div>
                  <span className="text-[8px] font-mono text-accent-emerald bg-accent-emerald/15 border border-accent-emerald/20 px-2 py-0.5 rounded font-bold">
                    {warehouses.length} FACILITIES ONLINE
                  </span>
                </div>

                {/* SLA Corporate Threshold Controller */}
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-accent-emerald block">Corporate Carbon Intensity SLA Threshold</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">Alert triggers globally if any depot's carbon load exceeds this limit</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="14.0"
                      max="20.0"
                      step="0.1"
                      value={carbonThreshold}
                      onChange={(e) => setCarbonThreshold(parseFloat(e.target.value))}
                      className="w-32 accent-accent-emerald h-1 bg-white/10 rounded appearance-none cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-white bg-white/5 px-2.5 py-1 rounded border border-white/10">
                      {carbonThreshold.toFixed(1)} Tons CO₂
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {warehouses.map((wh) => {
                    const carbonEquivalent = 12.4 + (wh.filledPercent / 10) - (wh.isOptimized ? 2.5 : 0);
                    const recycleRate = wh.filledPercent > 75 ? 85 : wh.filledPercent > 50 ? 72 : wh.filledPercent > 25 ? 65 : 45;
                    const exceedsThreshold = carbonEquivalent > carbonThreshold;

                    return (
                      <div
                        key={wh.id}
                        className={`p-4 bg-white/[0.02] border rounded-lg flex flex-col justify-between transition-all ${
                          exceedsThreshold
                            ? 'border-accent-rose/40 bg-accent-rose/[0.02] shadow-lg shadow-accent-rose/5'
                            : 'border-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-1">
                            <h4 className="text-xs font-bold text-white uppercase flex flex-wrap items-center gap-1.5 leading-tight">
                              <span>{wh.name}</span>
                              {wh.isOptimized && (
                                <span className="text-[8px] font-mono font-bold bg-accent-emerald/15 border border-accent-emerald/30 text-accent-emerald px-1.5 py-0.2 rounded shrink-0">
                                  ECO-OPTIMIZED
                                </span>
                              )}
                            </h4>
                            {exceedsThreshold && (
                              <span className="text-[8px] font-mono font-semibold text-accent-rose uppercase tracking-wider">
                                ⚠️ CROSSES THRESHOLD ({carbonEquivalent.toFixed(1)} &gt; {carbonThreshold.toFixed(1)} Tons)
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-accent-cyan font-bold shrink-0">{wh.location}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 text-[10px] font-mono text-gray-400">
                          <div>
                            <span className="text-[8px] text-gray-500 block">Carbon Load</span>
                            <span className={`font-bold ${exceedsThreshold ? 'text-accent-rose font-black' : 'text-white'}`}>
                              {carbonEquivalent.toFixed(1)} Tons
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block">Recycling Rate</span>
                            <span className="text-accent-emerald font-bold">{recycleRate}% Diverted</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block">Solar Panel Cover</span>
                            <span className="text-accent-cyan font-bold">450 m²</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block">Water Harvesting</span>
                            <span className="text-accent-emerald font-bold">120 m³/mo</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-4 text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-between">
                <span>HVAC TELEMETRY INTEGRATED</span>
                <span>Water Recycled Average: 84%</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 5: VENDOR ESG SCORING ENGINE */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                  <Award className="text-accent-cyan" size={14} /> Supplier ESG Rating &amp; Packaging Scoreboard
                </h3>
                <p className="text-[9px] font-mono text-gray-400 mt-0.5">Rank suppliers based on Scope 3 carbon density and sustainable material ratios</p>
              </div>
              <button 
                onClick={() => {
                  setSuppliers(prev => [...prev].sort((a,b) => b.esgScore - a.esgScore));
                }}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[9px] font-black uppercase tracking-wider cursor-pointer"
              >
                Sort by Rating
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 text-[9px] uppercase tracking-widest">
                    <th className="py-2.5">Supplier Name</th>
                    <th className="py-2.5">ESG Score</th>
                    <th className="py-2.5">Carbon Intensity</th>
                    <th className="py-2.5">Recyclable Packaging</th>
                    <th className="py-2.5">Ethical Rank</th>
                    <th className="py-2.5">Department / Category</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-white/[0.01]">
                      <td className="py-3 font-bold text-white">{sup.name}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                          sup.esgScore >= 90 
                            ? 'bg-accent-emerald/20 text-accent-emerald'
                            : sup.esgScore >= 75
                              ? 'bg-accent-cyan/20 text-accent-cyan'
                              : sup.esgScore >= 60
                                ? 'bg-accent-amber/15 text-accent-amber'
                                : 'bg-accent-rose/15 text-accent-rose animate-pulse'
                        }`}>
                          {sup.esgScore} / 100
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{sup.carbonIntensity}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white">{sup.packagingRecyclable}%</span>
                          <span className="text-[8px] text-gray-500">PCR</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-accent-cyan font-bold">{sup.ethicalRating}</span>
                      </td>
                      <td className="py-3 text-gray-400 uppercase text-[9px]">{sup.category}</td>
                      <td className="py-3 text-right">
                        {editingSupplierId === sup.id ? (
                          <div className="flex items-center justify-end gap-2 bg-brand-black/90 p-2 rounded border border-white/10 absolute right-8 z-30 shadow-2xl">
                            <div className="text-left space-y-2 text-[10px]">
                              <div>
                                <label className="block text-gray-400 mb-0.5 uppercase text-[8px]">ESG Score (0-100)</label>
                                <input 
                                  type="number" 
                                  value={editEsgVal} 
                                  onChange={(e) => setEditEsgVal(Number(e.target.value))}
                                  className="w-20 bg-brand-black border border-white/10 rounded px-1.5 py-0.5 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-400 mb-0.5 uppercase text-[8px]">Recyclable Ratio (%)</label>
                                <input 
                                  type="number" 
                                  value={editRecyclableVal} 
                                  onChange={(e) => setEditRecyclableVal(Number(e.target.value))}
                                  className="w-20 bg-brand-black border border-white/10 rounded px-1.5 py-0.5 text-white"
                                />
                              </div>
                              <div className="flex gap-1 pt-1 justify-end">
                                <button 
                                  onClick={() => handleUpdateSupplierDetails(sup.id)}
                                  className="px-2 py-0.5 bg-accent-emerald text-white rounded text-[8px] font-bold uppercase"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingSupplierId(null)}
                                  className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-[8px] font-bold uppercase"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSupplierId(sup.id);
                              setEditEsgVal(sup.esgScore);
                              setEditRecyclableVal(sup.packagingRecyclable);
                            }}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] text-gray-400 hover:text-white cursor-pointer border border-white/10 uppercase font-black"
                          >
                            Edit parameters
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-brand-black/40 p-4 rounded-lg border border-white/5 mt-5">
              <span className="text-[9px] font-black uppercase text-accent-emerald flex items-center gap-1.5 mb-1.5">
                <Sparkles size={11} /> AI Vendor Selection Logic &amp; Preferred Ranking
              </span>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Preferred partner: <span className="text-accent-emerald font-bold">Desh Green Carton Hub</span> is rated Platinum with 100% recyclable PCR cardboards. Transitioning all primary paper box contracts to Desh will reduce regional procurement carbon overhead by 12.5%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: CAPITAL OFFSETS HUB & GREEN PROJECTS */}
      {activeSubTab === 'offsets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Allocation Engine controls */}
            <div className="lg:col-span-5 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5 mb-2.5">
                  <Coins className="text-accent-emerald animate-pulse" size={14} /> Carbon credit Capital Allocator
                </h3>
                <p className="text-[10px] text-gray-400 border-b border-white/5 pb-2.5">Deploy corporate offsets capital dynamically</p>

                <div className="space-y-4.5 mt-4.5">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>Reforestation Campaigns</span>
                      <span className="text-accent-emerald font-bold">{offsetAllocation.reforestation}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={offsetAllocation.reforestation}
                      onChange={(e) => setOffsetAllocation(prev => ({ ...prev, reforestation: Number(e.target.value) }))}
                      className="w-full accent-accent-emerald"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>Solar Power &amp; Offgrid Investments</span>
                      <span className="text-accent-cyan font-bold">{offsetAllocation.solarFarm}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={offsetAllocation.solarFarm}
                      onChange={(e) => setOffsetAllocation(prev => ({ ...prev, solarFarm: Number(e.target.value) }))}
                      className="w-full accent-accent-cyan"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>Verified Gold Standard Credits</span>
                      <span className="text-accent-amber font-bold">{offsetAllocation.creditPurchase}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={offsetAllocation.creditPurchase}
                      onChange={(e) => setOffsetAllocation(prev => ({ ...prev, creditPurchase: Number(e.target.value) }))}
                      className="w-full accent-accent-amber"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <button 
                  onClick={() => {
                    alert('Offsets Portfolio Balance Locked. AI automated dispatching initiated.');
                  }}
                  className="w-full py-2 bg-accent-emerald/15 hover:bg-accent-emerald/25 border border-accent-emerald/20 text-[10px] font-black uppercase tracking-widest text-accent-emerald transition-all flex items-center justify-center cursor-pointer"
                >
                  Commit Offset Capital Allocation
                </button>
              </div>
            </div>

            {/* Visual Offset Ledger Metrics */}
            <div className="lg:col-span-7 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5 mb-2.5">
                  <Trees className="text-accent-emerald animate-bounce" size={14} /> Active Forestry &amp; Green Projects Ledger
                </h3>
                <p className="text-[10px] text-gray-400 border-b border-white/5 pb-2.5">Corporate funded environmental impact monitoring</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">Trees Equivalent Saved</span>
                    <h4 className="text-xl font-kpi font-extrabold text-white mt-1 uppercase">{treesSaved.toLocaleString()} Trees</h4>
                    <p className="text-[9px] text-gray-400 mt-1.5 leading-relaxed">Co-funded with standard forestry partners in Sylhet Division.</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">Avoided carbon output</span>
                    <h4 className="text-xl font-kpi font-extrabold text-accent-emerald mt-1 uppercase">{currentAvoidedCarbon} Tons CO₂</h4>
                    <p className="text-[9px] text-gray-400 mt-1.5 leading-relaxed">Calculated based on solar offset grids and electric delivery metrics.</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">Capital Offset Estimate</span>
                    <h4 className="text-xl font-kpi font-extrabold text-accent-cyan mt-1 uppercase">৳{carbonOffsetCostEstimate.toLocaleString()} BDT</h4>
                    <p className="text-[9px] text-gray-400 mt-1.5 leading-relaxed">Regulatory tax discount threshold under optimization.</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">Green Delivery Metric</span>
                    <h4 className="text-xl font-kpi font-extrabold text-white mt-1 uppercase">{greenDeliveriesRatio}%</h4>
                    <p className="text-[9px] text-gray-400 mt-1.5 leading-relaxed">Percentage of orders processed on EV routes.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3.5 mt-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-between">
                <span>GOLD STANDARD ENVIRO CERTIFIED</span>
                <span>Audit Period: June 2026</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 7: ESG REPORT GENERATOR */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Report settings control */}
            <div className="lg:col-span-5 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                    <FileText className="text-accent-cyan" size={14} /> ESG Report Generation Controls
                  </h3>
                  <p className="text-[9px] font-mono text-gray-400 mt-0.5">Produce audit-ready ESG disclosure reports instantly</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[8px] font-mono text-gray-400 block uppercase mb-1">Select Report Template</label>
                    <select
                      value={selectedReportType}
                      onChange={(e) => setSelectedReportType(e.target.value)}
                      className="w-full bg-brand-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan uppercase"
                    >
                      <option value="executive">Executive Sustainability Report (PDF)</option>
                      <option value="carbon">Detailed Carbon Emissions Audit (Excel)</option>
                      <option value="fleet">Fleet Sustainability SLA Report (PDF)</option>
                      <option value="warehouse">Facility Energy Audit Ledger (Excel)</option>
                      <option value="supplier">Supplier ESG Vendor Compliance Audit (PDF)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[8px] font-mono text-gray-400 block uppercase mb-1">Target Reporting Quarter</label>
                    <select
                      value={selectedReportQuarter}
                      onChange={(e) => setSelectedReportQuarter(e.target.value)}
                      className="w-full bg-brand-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan uppercase"
                    >
                      <option value="Q1 2026">Q1 2026 (Jan - Mar)</option>
                      <option value="Q2 2026">Q2 2026 (Apr - Jun)</option>
                      <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
                      <option value="Q4 2026">Q4 2026 (Oct - Dec)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="checkbox" 
                      id="ai-summary" 
                      checked={includeAISummary}
                      onChange={(e) => setIncludeAISummary(e.target.checked)}
                      className="rounded accent-accent-emerald cursor-pointer"
                    />
                    <label htmlFor="ai-summary" className="text-[10px] font-mono text-gray-400 uppercase cursor-pointer select-none">
                      Include AI-Generated Executive CSO Briefing
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <button 
                  onClick={handleExportReport}
                  disabled={isExporting}
                  className="w-full py-2.5 rounded bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/20 text-[10px] font-black uppercase tracking-widest text-accent-cyan transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw size={11} className="animate-spin" />
                      Compiling Datasets...
                    </>
                  ) : (
                    <>
                      <Download size={11} />
                      Export Disclosure Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Document preview block */}
            <div className="lg:col-span-7 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5 mb-2.5">
                  <Award className="text-accent-emerald" size={14} /> ESG Disclosure Certification Preview
                </h3>
                <p className="text-[10px] text-gray-400 border-b border-white/5 pb-2.5">Live reporting draft preview</p>

                <div className="bg-brand-black/40 p-4.5 rounded-lg border border-white/5 mt-4 space-y-3 text-[10px] font-mono leading-relaxed">
                  <div className="flex justify-between items-center text-[9px] text-gray-500">
                    <span>DOCUMENT REF: SN-ESG-2026-T1</span>
                    <span>CONFIDENTIAL DISCLOSURE</span>
                  </div>
                  <div className="border-b border-white/5 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">SupplyNova Corporate Sustainability Report</h4>
                    <p className="text-[9px] text-accent-cyan uppercase">Audit Period: {selectedReportQuarter}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-300">
                      Total Carbon Footprint registered: <span className="text-white font-bold">{totalFleetEmissionsThisMonth.toFixed(1)} Metric Tons CO₂</span>
                    </p>
                    <p className="text-gray-300">
                      Primary fuel used: <span className="text-white font-bold">{fuelConsumptionThisMonth.toLocaleString()} Liters</span> (Diesel-to-EV offset applied).
                    </p>
                    {includeAISummary && (
                      <p className="text-accent-emerald leading-relaxed italic bg-accent-emerald/[0.02] p-2.5 border border-accent-emerald/10 rounded">
                        "CSO Briefing: High-volume highway tracking optimization has successfully compressed average diesel fuel rates. Green deliveries ratio rose to {greenDeliveriesRatio}%, satisfying Tier-1 retail partner environmental SLA mandates."
                      </p>
                    )}
                  </div>
                </div>

                {exportCompleteMessage && (
                  <div className="mt-4 p-3 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[10px] rounded leading-relaxed">
                    {exportCompleteMessage}
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 pt-3.5 mt-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-between">
                <span>DIGITAL SIGNATURE SECURED</span>
                <span>SEC Directive compliant</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 8: CSO AI ASSISTANT & PREDICTIVE FORECASTING */}
      {activeSubTab === 'advisor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Predictive forecast chart */}
            <div className="lg:col-span-6 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between min-h-[420px]">
              <div className="flex-1 w-full min-h-0 relative">
                <div ref={forecastChartRef} className="w-full h-full" />
              </div>

              <div className="border-t border-white/5 pt-3 mt-3 text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-between">
                <span>PREDICTIVE ML ENGINE</span>
                <span>95% Confidence Bounds</span>
              </div>
            </div>

            {/* Virtual Assistant Chat Interface */}
            <div className="lg:col-span-6 p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between h-[420px]">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                        <Sparkles className="text-accent-cyan" size={14} /> Chief Sustainability Officer AI Assistant
                      </h3>
                      <p className="text-[9px] font-mono text-gray-400 mt-0.5">Continuous Scope 1, 2, 3 auditing system</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                  </div>

                  {/* Suggestion Prompts */}
                  <div className="flex flex-wrap gap-1.5 mb-3 select-none">
                    {[
                      { text: 'Optimize Dhaka-Comilla Fleet Emissions', prompt: 'Audit the fleet carbon footprint on the Dhaka-Comilla highway.' },
                      { text: 'Analyze Warehouse solar capacity', prompt: 'Tell me about the solar storage capacity at our warehouses.' },
                      { text: 'Review supplier ethical rankings', prompt: 'Audit and rank our suppliers based on ESG material scores.' },
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveAdvisorPrompt(s.prompt);
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] text-gray-400 hover:text-white transition-all cursor-pointer"
                      >
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation log panel */}
                <div className="flex-1 overflow-y-auto space-y-3 bg-brand-black/30 p-3 rounded-lg border border-white/5 my-2 max-h-[190px]">
                  {advisorChatLog.map((chat, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[8px] font-mono text-gray-500 mb-0.5">
                        <span>{chat.sender === 'user' ? 'Executive SMI Fahim' : 'CSO Advisor AI'}</span>
                        <span>•</span>
                        <span>{chat.date}</span>
                      </div>
                      <div 
                        className={`p-2.5 rounded text-[11px] leading-relaxed max-w-[85%] ${
                          chat.sender === 'user' 
                            ? 'bg-accent-blue/10 text-white border border-accent-blue/20 rounded-tr-none' 
                            : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none'
                        }`}
                      >
                        {chat.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Question Input form */}
                <form onSubmit={handleAskAdvisor} className="flex gap-2 border-t border-white/5 pt-3">
                  <input
                    type="text"
                    value={activeAdvisorPrompt}
                    onChange={(e) => setActiveAdvisorPrompt(e.target.value)}
                    placeholder="Ask virtual CSO about fleet, energy, or suppliers..."
                    className="flex-1 bg-brand-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-accent-emerald text-white text-xs font-bold uppercase tracking-wide rounded hover:bg-emerald-600 transition-all cursor-pointer shrink-0"
                  >
                    Ask
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
