import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Vehicle, Warehouse, Outlet } from '../types';
import { OUTLETS, WAREHOUSES } from '../data/mockData';
import { Activity, BarChart3, Map, Play, Pause, RefreshCw, Layers } from 'lucide-react';

interface ScmEChartsPanelProps {
  vehicles: Vehicle[];
  warehouses?: Warehouse[];
}

interface HistoricalDataPoint {
  time: string;
  avgFuel: number;
  avgSpeed: number;
  avgEngineHealth: number;
}

export default function ScmEChartsPanel({ vehicles, warehouses = WAREHOUSES }: ScmEChartsPanelProps) {
  const [activeMode, setActiveMode] = useState<'line' | 'bar' | 'heatmap' | 'executive'>('line');
  const [executiveMetric, setExecutiveMetric] = useState<'combined' | 'efficiency' | 'carbon' | 'sales'>('combined');
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  // 1. Maintain historical data buffer for the real-time line chart
  useEffect(() => {
    if (!isLiveStream) return;

    // Calculate current fleet metrics
    const transitVehicles = vehicles.filter((v) => v.status === 'in_transit');
    const avgFuel = transitVehicles.length
      ? Number((transitVehicles.reduce((sum, v) => sum + (v.fuelConsumptionRate || 0), 0) / transitVehicles.length).toFixed(1))
      : 18.5;
    const avgSpeed = transitVehicles.length
      ? Number((transitVehicles.reduce((sum, v) => sum + (v.currentSpeed || 0), 0) / transitVehicles.length).toFixed(1))
      : 54.2;
    const avgEngineHealth = transitVehicles.length
      ? Number((transitVehicles.reduce((sum, v) => sum + (v.engineHealth || 100), 0) / transitVehicles.length).toFixed(1))
      : 92.5;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setHistory((prev) => {
      const next = [...prev, { time: timestamp, avgFuel, avgSpeed, avgEngineHealth }];
      // Limit to last 15 ticks for a clean sliding window
      if (next.length > 15) {
        return next.slice(next.length - 15);
      }
      return next;
    });
  }, [vehicles, isLiveStream]);

  // Seed initial history if empty
  useEffect(() => {
    if (history.length === 0) {
      const baseTime = Date.now();
      const initial: HistoricalDataPoint[] = [];
      for (let i = 12; i >= 0; i--) {
        const timeStr = new Date(baseTime - i * 4000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        // Generate realistic seed values with small variations
        const randSeed = Math.sin(i * 0.5);
        initial.push({
          time: timeStr,
          avgFuel: Number((16.4 + randSeed * 2).toFixed(1)),
          avgSpeed: Number((52.8 + randSeed * 5).toFixed(1)),
          avgEngineHealth: Number((91.5 + randSeed * 1.5).toFixed(1)),
        });
      }
      setHistory(initial);
    }
  }, []);

  // 2. Initialize and re-render the ECharts instance when active mode, history, or vehicles change
  useEffect(() => {
    if (!chartRef.current) return;

    // Dispose any existing instance first to prevent layout collisions or memory leaks
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
    }

    // Initialize custom dark-themed ECharts instance
    const chart = echarts.init(chartRef.current, 'dark', { renderer: 'canvas' });
    chartInstanceRef.current = chart;

    // Define option configurations depending on the current active mode
    let option: echarts.EChartsOption = {};

    if (activeMode === 'line') {
      // --- REAL-TIME SCM TELEMETRY STREAM (LINE CHART) ---
      const times = history.map((h) => h.time);
      const fuels = history.map((h) => h.avgFuel);
      const speeds = history.map((h) => h.avgSpeed);
      const healths = history.map((h) => h.avgEngineHealth);

      option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross', label: { backgroundColor: '#1f2937' } },
          backgroundColor: '#121214',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#f3f4f6', fontSize: 11, fontFamily: 'monospace' },
        },
        legend: {
          data: ['Avg Fleet Fuel Rate (L/100km)', 'Avg Fleet Speed (km/h)', 'Engine Thermal Coefficient (%)'],
          textStyle: { color: '#9ca3af', fontSize: 9, fontFamily: 'sans-serif' },
          top: 0,
        },
        grid: {
          top: 45,
          left: '4%',
          right: '4%',
          bottom: '8%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: times,
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            axisLabel: { color: '#6b7280', fontSize: 9, fontFamily: 'monospace' },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Fuel Rate / Health',
            min: 0,
            max: 120,
            interval: 20,
            axisLabel: { formatter: '{value}', color: '#6b7280', fontSize: 9 },
            axisLine: { show: false },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
          },
          {
            type: 'value',
            name: 'Speed (km/h)',
            min: 0,
            max: 100,
            interval: 20,
            axisLabel: { formatter: '{value} km/h', color: '#6b7280', fontSize: 9 },
            axisLine: { show: false },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: 'Avg Fleet Fuel Rate (L/100km)',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 3, color: '#f43f5e' },
            itemStyle: { color: '#f43f5e' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(244, 63, 94, 0.25)' },
                { offset: 1, color: 'rgba(244, 63, 94, 0)' },
              ]),
            },
            data: fuels,
          },
          {
            name: 'Avg Fleet Speed (km/h)',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 3, color: '#06b6d4' },
            itemStyle: { color: '#06b6d4' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(6, 182, 212, 0.25)' },
                { offset: 1, color: 'rgba(6, 182, 212, 0)' },
              ]),
            },
            data: speeds,
          },
          {
            name: 'Engine Thermal Coefficient (%)',
            type: 'line',
            smooth: true,
            symbol: 'emptyCircle',
            symbolSize: 4,
            lineStyle: { width: 1.5, color: '#10b981', type: 'dotted' },
            itemStyle: { color: '#10b981' },
            data: healths,
          },
        ],
      };
    } else if (activeMode === 'bar') {
      // --- BAR COMPARISONS: FUEL RATE & LOAD VS SPEED ---
      const activeVehicles = vehicles.filter((v) => v.status === 'in_transit');
      const plateNumbers = activeVehicles.map((v) => `${v.plateNumber.split(' ')[1] || v.plateNumber} (${v.type.includes('Light') ? 'L' : v.type.includes('Frozen') ? 'F' : 'H'})`);
      const fuelConsumption = activeVehicles.map((v) => v.fuelConsumptionRate);
      const speeds = activeVehicles.map((v) => v.currentSpeed);
      const healths = activeVehicles.map((v) => v.engineHealth);

      option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#121214',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#f3f4f6', fontSize: 11, fontFamily: 'monospace' },
        },
        legend: {
          data: ['Fuel Consumption (L/100km)', 'Current Speed (km/h)', 'Engine Health (SLA %)'],
          textStyle: { color: '#9ca3af', fontSize: 9 },
          top: 0,
        },
        grid: {
          top: 45,
          left: '3%',
          right: '3%',
          bottom: '5%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: plateNumbers.length ? plateNumbers : ['No active trucks'],
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            axisLabel: { color: '#9ca3af', fontSize: 8, interval: 0, rotate: 12 },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Fuel / Health',
            axisLabel: { color: '#6b7280', fontSize: 9 },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
          },
          {
            type: 'value',
            name: 'Speed (km/h)',
            max: 120,
            axisLabel: { color: '#6b7280', fontSize: 9 },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: 'Fuel Consumption (L/100km)',
            type: 'bar',
            barGap: '15%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#f43f5e' },
                { offset: 1, color: '#be123c' },
              ]),
              borderRadius: [3, 3, 0, 0],
            },
            data: fuelConsumption.length ? fuelConsumption : [0],
          },
          {
            name: 'Current Speed (km/h)',
            type: 'bar',
            yAxisIndex: 1,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#06b6d4' },
                { offset: 1, color: '#0891b2' },
              ]),
              borderRadius: [3, 3, 0, 0],
            },
            data: speeds.length ? speeds : [0],
          },
          {
            name: 'Engine Health (SLA %)',
            type: 'line',
            symbol: 'diamond',
            symbolSize: 7,
            lineStyle: { width: 2, color: '#f59e0b' },
            itemStyle: { color: '#f59e0b' },
            data: healths.length ? healths : [0],
          },
        ],
      };
    } else if (activeMode === 'heatmap') {
      // --- GEOGRAPHIC HOTSPOTS & KPI ENGINE HEALTH SCALING ---
      // Map coordinates to a normalized [0, 100] grid for abstract high-impact rendering
      // SCM Regional Hubs of Bangladesh
      const hubs = [
        { name: 'Dhaka Hub (HQ)', value: [50, 48, 15] },
        { name: 'Chittagong Terminal', value: [82, 20, 12] },
        { name: 'Sylhet Depot', value: [80, 80, 8] },
        { name: 'Bogra Depot', value: [25, 78, 10] },
        { name: 'Jessore Port', value: [15, 32, 9] },
        { name: 'Comilla Node', value: [68, 38, 7] },
      ];

      // Convert vehicles to scatter heat points
      // We scale the "intensity" based on fuel consumption rate and ENGINE STATUS (health/wear)
      // Strain/Wear scales glow. (100 - engineHealth) represents strain factor.
      const vehicleHeatPoints = vehicles
        .filter((v) => v.status === 'in_transit' && v.routeCoordinates && v.routeCoordinates.length > 0)
        .map((v) => {
          // Calculate logical percentage coordinate along Bangladesh map box limits:
          // MinLng: 88.0, MaxLng: 92.8 => Map to x: [5, 95]
          // MinLat: 20.5, MaxLat: 26.6 => Map to y: [5, 95]
          const curRouteIdx = v.currentRouteIndex ?? 0;
          const coords = v.routeCoordinates[curRouteIdx % v.routeCoordinates.length] || [90.4125, 23.8103];
          
          const x = Math.min(95, Math.max(5, ((coords[0] - 88.0) / (92.8 - 88.0)) * 90 + 5));
          const y = Math.min(95, Math.max(5, ((coords[1] - 20.5) / (26.6 - 20.5)) * 90 + 5));

          const fuel = v.fuelConsumptionRate || 0;
          const engineHealth = v.engineHealth || 100;
          const engineStrain = (100 - engineHealth) / 100; // 0.0 to 1.0 (higher is worse)
          
          // Combine fuel and engine status to scale heat intensity
          // High fuel + damaged engine creates massive heat glow
          const heatIntensity = Number((fuel * (1 + engineStrain * 1.5)).toFixed(1));

          return {
            name: `${v.plateNumber} [${v.type}]`,
            value: [x, y, heatIntensity, fuel, engineHealth],
          };
        });

      option = {
        backgroundColor: 'transparent',
        title: {
          text: '2D SCM Logistical Heatmap - Bangladesh Corridor',
          left: 'center',
          textStyle: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
          top: 0,
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: '#121214',
          borderColor: 'rgba(255,255,255,0.1)',
          formatter: (params: any) => {
            const data = params.data;
            if (!data) return '';
            if (data.value && data.value.length > 3) {
              return `
                <div style="font-family: monospace; font-size: 11px; padding: 4px;">
                  <b style="color: #fff; font-size: 12px;">${params.name}</b><br/>
                  <hr style="border-color: rgba(255,255,255,0.1); margin: 6px 0;" />
                  Position Grid: [${data.value[0].toFixed(0)}, ${data.value[1].toFixed(0)}]<br/>
                  <span style="color: #f43f5e">Fuel Rate: ${data.value[3]} L/100km</span><br/>
                  <span style="color: #f59e0b">Engine Health: ${data.value[4]}%</span><br/>
                  <span style="color: #06b6d4; font-weight: bold;">Combined Heat Intensity: ${data.value[2]}</span>
                </div>
              `;
            }
            return `<div style="font-family: monospace;"><b>${params.name}</b><br/>Strategic Depot Hub</div>`;
          },
        },
        grid: {
          top: 35,
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: false,
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 100,
          show: false,
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          show: false,
        },
        visualMap: {
          min: 0,
          max: 55,
          splitNumber: 5,
          color: ['#f43f5e', '#f97316', '#f59e0b', '#10b981', '#06b6d4'],
          textStyle: { color: '#6b7280', fontSize: 8 },
          bottom: '5%',
          left: '2%',
          calculable: true,
          dimension: 2,
        },
        series: [
          // SCM Depot Hub reference points
          {
            name: 'Depot Nodes',
            type: 'effectScatter',
            symbolSize: 12,
            rippleEffect: { brushType: 'stroke', scale: 3.5 },
            itemStyle: { color: '#3b82f6', shadowBlur: 10, shadowColor: '#3b82f6' },
            label: {
              show: true,
              formatter: '{b}',
              position: 'right',
              color: '#9ca3af',
              fontSize: 9,
              fontFamily: 'monospace',
            },
            data: hubs,
          },
          // Vehicles rendering as glowing Heat points (visualized via varying sizes and colors)
          {
            name: 'Active Transit Thermal Signature',
            type: 'scatter',
            symbolSize: (val: any) => {
              // Base radius + heat load intensity modifier
              const intensity = val[2] || 10;
              return Math.min(50, Math.max(12, 12 + intensity * 0.7));
            },
            itemStyle: {
              shadowBlur: 18,
              shadowColor: 'rgba(244, 63, 94, 0.4)',
              opacity: 0.85,
            },
            data: vehicleHeatPoints,
          },
        ],
      };
    } else if (activeMode === 'executive') {
      // --- EXECUTIVE HEATMAP OVERLAY ---
      // Define regions with their geographical positions on the grid [0, 100]
      const regions = [
        { name: 'Dhaka Division (Central HQ)', key: 'Dhaka', coords: [50, 48], whId: 'wh-1', baseSales: 185 },
        { name: 'Chittagong Division (Southeast Coast)', key: 'Chittagong', coords: [82, 20], whId: 'wh-2', baseSales: 125 },
        { name: 'Sylhet Division (Northeast Tea Belt)', key: 'Sylhet', coords: [80, 80], whId: 'wh-3', baseSales: 62 },
        { name: 'Bogra / Rajshahi (Northwest Agro)', key: 'Bogra', coords: [25, 78], whId: 'wh-4', baseSales: 88 },
        { name: 'Jessore / Khulna (Southwest Trade)', key: 'Jessore', coords: [15, 32], whId: 'wh-5', baseSales: 74 },
        { name: 'Comilla Node (Eastern Supply Corridor)', key: 'Comilla', coords: [68, 38], whId: null, baseSales: 45 },
      ];

      const regionData = regions.map(reg => {
        // 1. Warehouse Efficiency
        let efficiency = 95; // default for Comilla Node
        if (reg.whId) {
          const wh = warehouses.find(w => w.id === reg.whId);
          if (wh) {
            efficiency = Math.round(100 - (wh.activeIncidents * 15) - Math.abs(wh.filledPercent - 75) * 0.4);
            efficiency = Math.max(40, Math.min(100, efficiency));
          }
        }

        // 2. Fleet Carbon Impact (kg CO2 / hr)
        // CO2 = fuel consumed (liters) * 2.68
        const regionVehicles = vehicles.filter(v => 
          v.status === 'in_transit' && 
          (v.destination.toLowerCase().includes(reg.key.toLowerCase()) || 
           v.plateNumber.toLowerCase().includes(reg.key.toLowerCase()))
        );
        const carbonRate = regionVehicles.reduce((sum, v) => {
          const speed = v.currentSpeed || 50;
          const rate = v.fuelConsumptionRate || 15;
          const emissions = (rate * (speed / 100)) * 2.68; // kg CO2 / hour
          return sum + emissions;
        }, 0);

        // 3. Sales Territory Performance (Lakh BDT / Month)
        const regionOutlets = OUTLETS.filter(o => 
          o.district.toLowerCase().includes(reg.key.toLowerCase()) || 
          o.territory.toLowerCase().includes(reg.key.toLowerCase()) ||
          o.location.toLowerCase().includes(reg.key.toLowerCase())
        );
        let salesTotal = regionOutlets.reduce((sum, o) => sum + o.monthlySalesBDT, 0) / 100000;
        if (salesTotal === 0) {
          salesTotal = reg.baseSales;
        }

        // 4. Combined Score
        const salesScore = Math.min(100, (salesTotal / 200) * 100);
        const carbonScore = Math.max(0, 100 - Math.min(100, (carbonRate / 60) * 100));
        const combinedScore = (efficiency * 0.4) + (salesScore * 0.4) + (carbonScore * 0.2);

        // Determine what value is used as the heat visualization metric
        let primaryValue = combinedScore;
        if (executiveMetric === 'efficiency') {
          primaryValue = efficiency;
        } else if (executiveMetric === 'carbon') {
          primaryValue = carbonRate;
        } else if (executiveMetric === 'sales') {
          primaryValue = salesTotal;
        }

        return {
          name: reg.name,
          value: [reg.coords[0], reg.coords[1], Number(primaryValue.toFixed(1)), efficiency, Number(carbonRate.toFixed(1)), Number(salesTotal.toFixed(1)), Number(combinedScore.toFixed(1))]
        };
      });

      let minVal = 0;
      let maxVal = 100;
      let colors = ['#f43f5e', '#3b82f6', '#10b981']; 
      let labelFormatter = '{value}';

      if (executiveMetric === 'combined') {
        minVal = 50;
        maxVal = 100;
        colors = ['#f43f5e', '#f97316', '#f59e0b', '#3b82f6', '#10b981']; 
        labelFormatter = '{value} pts';
      } else if (executiveMetric === 'efficiency') {
        minVal = 60;
        maxVal = 100;
        colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981']; 
        labelFormatter = '{value}%';
      } else if (executiveMetric === 'carbon') {
        minVal = 0;
        maxVal = 50;
        colors = ['#10b981', '#22c55e', '#eab308', '#f97316', '#ef4444']; 
        labelFormatter = '{value} kg/h';
      } else if (executiveMetric === 'sales') {
        minVal = 0;
        maxVal = 250;
        colors = ['#475569', '#3b82f6', '#06b6d4', '#8b5cf6', '#d946ef']; 
        labelFormatter = '৳{value}L';
      }

      option = {
        backgroundColor: 'transparent',
        title: {
          text: `Executive Heatmap Overlay (${executiveMetric.toUpperCase()})`,
          left: 'center',
          textStyle: { color: '#ffffff', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
          top: 0,
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: '#121214',
          borderColor: 'rgba(255,255,255,0.1)',
          formatter: (params: any) => {
            const data = params.data;
            if (!data) return '';
            const val = data.value;
            return `
              <div style="font-family: monospace; font-size: 11px; padding: 6px; line-height: 1.5; color: #fff;">
                <b style="color: #06b6d4; font-size: 13px;">${params.name}</b><br/>
                <hr style="border-color: rgba(255,255,255,0.1); margin: 6px 0;" />
                <span style="color: #10b981">● Warehouse Efficiency: <b>${val[3]}%</b></span><br/>
                <span style="color: #ef4444">● Fleet Carbon Impact: <b>${val[4]} kg CO2/h</b></span><br/>
                <span style="color: #d946ef">● Sales Performance: <b>৳${val[5]} Lakh/mo</b></span><br/>
                <hr style="border-color: rgba(255,255,255,0.1); margin: 6px 0;" />
                <span style="color: #f59e0b; font-weight: bold; font-size: 12px;">Combined Regional Score: <b>${val[6]}/100</b></span>
              </div>
            `;
          }
        },
        grid: {
          top: 35,
          left: '5%',
          right: '5%',
          bottom: '5%',
          containLabel: false,
        },
        xAxis: { type: 'value', min: 0, max: 100, show: false },
        yAxis: { type: 'value', min: 0, max: 100, show: false },
        visualMap: {
          min: minVal,
          max: maxVal,
          splitNumber: 5,
          color: colors,
          textStyle: { color: '#6b7280', fontSize: 8 },
          bottom: '5%',
          left: '2%',
          calculable: true,
          dimension: 2,
          formatter: labelFormatter,
        },
        series: [
          {
            name: 'Executive Hotspots',
            type: 'effectScatter',
            symbolSize: (val: any) => {
              const normVal = Math.min(100, ((val[2] - minVal) / (maxVal - minVal || 1)) * 100);
              return Math.min(45, Math.max(16, 16 + normVal * 0.25));
            },
            rippleEffect: { brushType: 'stroke', scale: 3.2, period: 4 },
            itemStyle: {
              shadowBlur: 15,
              opacity: 0.9,
            },
            label: {
              show: true,
              formatter: '{b}',
              position: 'top',
              color: '#ffffff',
              fontSize: 9,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(18, 18, 20, 0.7)',
              padding: [2, 4],
              borderRadius: 3,
            },
            data: regionData,
          },
        ],
      };
    }

    // Set Option Configuration
    chart.setOption(option);

    // Dynamic resize hook
    const resizeHandler = () => {
      chart.resize();
    };
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      chart.dispose();
    };
  }, [activeMode, history, vehicles, warehouses, executiveMetric]);

  return (
    <div id="scm-echarts-panel" className="p-6 rounded border border-white/10 bg-white/5 flex flex-col h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Activity className="text-accent-rose animate-pulse" size={14} /> Supply Chain Analytics Core
          </h3>
          <p className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase tracking-wider">
            Powered by Apache ECharts &amp; Real-time GPS Streams
          </p>
        </div>

        {/* Option Modes Toggle */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded border border-white/10 shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveMode('line')}
            className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              activeMode === 'line' ? 'bg-accent-rose text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity size={10} />
            Live Telemetry
          </button>
          <button
            onClick={() => setActiveMode('bar')}
            className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              activeMode === 'bar' ? 'bg-accent-blue text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 size={10} />
            Bar Comparison
          </button>
          <button
            onClick={() => setActiveMode('heatmap')}
            className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              activeMode === 'heatmap' ? 'bg-accent-cyan text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Map size={10} />
            Hotspot Heatmap
          </button>
          <button
            onClick={() => setActiveMode('executive')}
            className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              activeMode === 'executive' ? 'bg-accent-emerald text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers size={10} />
            Executive Heatmap
          </button>
        </div>
      </div>

      {/* Interactive Metric Selectors for Executive Heatmap overlay */}
      {activeMode === 'executive' && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 bg-white/[0.02] border border-white/5 p-1.5 rounded text-[9px] font-mono">
          <span className="text-gray-400 uppercase tracking-wider font-bold mr-1 pl-1">Heat Overlay:</span>
          <button
            onClick={() => setExecutiveMetric('combined')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              executiveMetric === 'combined' ? 'bg-accent-cyan/25 text-accent-cyan font-bold border border-accent-cyan/30' : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            Combined Executive Score
          </button>
          <button
            onClick={() => setExecutiveMetric('efficiency')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              executiveMetric === 'efficiency' ? 'bg-accent-emerald/25 text-accent-emerald font-bold border border-accent-emerald/30' : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            Warehouse Efficiency
          </button>
          <button
            onClick={() => setExecutiveMetric('carbon')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              executiveMetric === 'carbon' ? 'bg-accent-rose/25 text-accent-rose font-bold border border-accent-rose/30' : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            Fleet Carbon Impact
          </button>
          <button
            onClick={() => setExecutiveMetric('sales')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              executiveMetric === 'sales' ? 'bg-accent-amber/25 text-accent-amber font-bold border border-accent-amber/30' : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            Sales Performance
          </button>
        </div>
      )}

      {/* Interactive Chart Canvas Stage */}
      <div className="flex-1 w-full min-h-0 relative">
        <div ref={chartRef} className="w-full h-full" />
      </div>

      {/* Control Actions footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2 text-[9px] font-mono text-gray-500 uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
          <span>SLA Constraint: ৳/KM &amp; L/100KM under optimization</span>
        </div>
        <button
          onClick={() => setIsLiveStream(!isLiveStream)}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {isLiveStream ? <Pause size={10} /> : <Play size={10} />}
          {isLiveStream ? 'Pause Stream' : 'Resume Stream'}
        </button>
      </div>
    </div>
  );
}
