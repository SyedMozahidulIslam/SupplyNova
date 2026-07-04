import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Vehicle } from '../types';
import { Activity, BarChart3, Map, Play, Pause, RefreshCw } from 'lucide-react';

interface ScmEChartsPanelProps {
  vehicles: Vehicle[];
}

interface HistoricalDataPoint {
  time: string;
  avgFuel: number;
  avgSpeed: number;
  avgEngineHealth: number;
}

export default function ScmEChartsPanel({ vehicles }: ScmEChartsPanelProps) {
  const [activeMode, setActiveMode] = useState<'line' | 'bar' | 'heatmap'>('line');
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
  }, [activeMode, history, vehicles]);

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
        </div>
      </div>

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
