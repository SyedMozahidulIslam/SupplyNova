import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import AlertCenter from './components/AlertCenter';

import DashboardOverview from './components/DashboardOverview';
import ProcurementModule from './components/ProcurementModule';
import WarehouseModule from './components/WarehouseModule';
import FleetModule from './components/FleetModule';
import ColdChainModule from './components/ColdChainModule';
import SalesForceModule from './components/SalesForceModule';
import FinanceModule from './components/FinanceModule';
import AiAdvisor from './components/AiAdvisor';
import SustainabilityModule from './components/SustainabilityModule';

import {
  EMPLOYEES,
  WAREHOUSES,
  PRODUCTS,
  SUPPLIERS,
  VEHICLES,
  PURCHASE_ORDERS,
  RFQS,
  ALERTS,
  FINANCIAL_RECORDS,
  BEAT_PLANS,
  getUpdatedTelemetry,
} from './data/mockData';
import { Employee, PurchaseOrder, RFQ, Warehouse, Vehicle, Alert, FinancialRecord, BeatPlan } from './types';

export default function App() {
  // Impersonated Employee State (defaults to CEO/Super Admin SMI Fahim)
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(EMPLOYEES[0]);

  // Dynamic SCM Database States
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [rfqs, setRfqs] = useState<RFQ[]>(RFQS);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(WAREHOUSES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);
  const [alerts, setAlerts] = useState<Alert[]>(ALERTS);
  const [financials, setFinancials] = useState<FinancialRecord[]>(FINANCIAL_RECORDS);
  const [beatPlans, setBeatPlans] = useState<BeatPlan[]>(BEAT_PLANS);
  const [carbonThreshold, setCarbonThreshold] = useState<number>(18.0);

  // Real-time telemetry simulation interval (updates vehicle telemetry every 4 seconds)
  const [telemetryTick, setTelemetryTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTick((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (telemetryTick > 0) {
      setVehicles((prevVehicles) => getUpdatedTelemetry(prevVehicles, telemetryTick));
    }
  }, [telemetryTick]);

  // Sustainability Critical alerts checker based on facility carbon emission intensity crossing threshold
  useEffect(() => {
    const criticalFacilities = warehouses.filter(wh => {
      const carbonEquivalent = 12.4 + (wh.filledPercent / 10) - (wh.isOptimized ? 2.5 : 0);
      return carbonEquivalent > carbonThreshold;
    });

    if (criticalFacilities.length > 0) {
      setAlerts(prev => {
        let updated = false;
        const newAlerts = [...prev];

        criticalFacilities.forEach(wh => {
          const carbonEquivalent = 12.4 + (wh.filledPercent / 10) - (wh.isOptimized ? 2.5 : 0);
          const alertId = `sus-crit-${wh.id}`;
          const alreadyExists = prev.some(alt => alt.id === alertId && !alt.actionTaken);

          if (!alreadyExists) {
            // Get AI-suggested corrective action based on warehouse ID
            let correctiveAction = "Optimize facility lighting runtimes and recalibrate climate controls to eco-mode (Target 21°C instead of 18°C) for general storage zones.";
            if (wh.id === 'wh-1') {
              correctiveAction = "Reroute 25% of low-priority retail stock to Gazipur Industrial Transit to balance storage load and reduce cooling-driven Scope 2 power demand, saving estimated 2.8 Tons of daily CO₂e.";
            } else if (wh.id === 'wh-2') {
              correctiveAction = "Curtail non-essential high-power logistics conveyor operation during peak grid load hours. Dispatch 15 Tons of cold storage shipments earlier to maximize off-peak solar-battery discharge.";
            } else if (wh.id === 'wh-3') {
              correctiveAction = "Initiate power load-shedding to active auxiliary HVAC units. Transition backup diesel generator dispatch to verified bio-diesel blends to lower Scope 1 intensity.";
            } else if (wh.id === 'wh-4') {
              correctiveAction = "Calibrate climate controls to eco-mode (Target 21°C) and restrict non-essential auxiliary systems during high temperature hours.";
            } else if (wh.id === 'wh-5') {
              correctiveAction = "Schedule preventive maintenance for the industrial refrigeration compressors to restore peak heat pump efficiency, avoiding 1.5 Tons of excess electrical emissions.";
            }

            // Also check if there's an already action-taken one. We don't want to re-trigger if they already resolved it.
            const resolvedExists = prev.some(alt => alt.id === alertId && alt.actionTaken);
            if (!resolvedExists) {
              const newAlert: Alert = {
                id: alertId,
                title: 'Sustainability Critical: Carbon Limit Cross',
                description: `${wh.name} emissions intensity is at ${carbonEquivalent.toFixed(1)} Tons, crossing the corporate threshold of ${carbonThreshold.toFixed(1)} Tons. Immediate remediation required.`,
                severity: 'critical',
                timestamp: new Date().toISOString(),
                module: 'sustainability',
                actionTaken: false,
                correctiveAction: correctiveAction,
              };
              newAlerts.unshift(newAlert);
              updated = true;
            }
          }
        });

        return updated ? newAlerts : prev;
      });
    }
  }, [warehouses, carbonThreshold]);

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);

  // Keyboard shortcut listener for Command Palette (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handler: Impersonate any corporate role
  const handleSelectEmployee = (emp: Employee) => {
    setCurrentEmployee(emp);
  };

  // Handler: Purchase Order approval co-signing flow
  const handleApprovePO = (poId: string, employeeName: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          const updatedApprovals = [...po.approvalsCompleted, currentEmployee.role];
          const isComplete = po.approvalsNeeded.every((r) => updatedApprovals.includes(r));
          return {
            ...po,
            approvalsCompleted: updatedApprovals,
            status: isComplete ? 'approved' : po.status,
            dateApproved: isComplete ? '2026-07-03' : undefined,
          };
        }
        return po;
      })
    );
  };

  // Handler: Create PO
  const handleCreatePO = (newPo: PurchaseOrder) => {
    setPurchaseOrders((prev) => [newPo, ...prev]);
    // Log expense to financials
    const newRecord: FinancialRecord = {
      id: `fin-${Date.now()}`,
      category: 'procurement',
      description: `Committed PO Funds for ${newPo.supplierName}`,
      amountBDT: newPo.totalAmountBDT,
      date: '2026-07-03',
      type: 'expense',
    };
    setFinancials((prev) => [newRecord, ...prev]);
  };

  // Handler: Create RFQ
  const handleCreateRFQ = (newRfq: RFQ) => {
    setRfqs((prev) => [newRfq, ...prev]);
  };

  // Handler: Warehouse cycle counting audit
  const handleUpdateStock = (sku: string, newQty: number) => {
    setWarehouses((prev) =>
      prev.map((wh) => ({
        ...wh,
        zones: wh.zones.map((zone) => ({
          ...zone,
          filledPercent: Math.min(100, Math.max(10, Math.floor(zone.filledPercent * (newQty / 10000)))),
          racks: zone.racks.map((rack) => ({
            ...rack,
            fillStatus: Math.min(100, Math.max(10, Math.floor(rack.fillStatus * (newQty / 10000)))),
          })),
        })),
      }))
    );
  };

  // Handler: SCM Damage quarantined log
  const handleReportDamage = (sku: string, qty: number, comment: string) => {
    // Generate an in-app alert for quarantined inventory
    const newAlert: Alert = {
      id: `alt-${Date.now()}`,
      title: 'Quarantine Action Triggered',
      description: `Quarantined ${qty} units of SKU ${sku} due to: "${comment}". Isolated in Zone D, Rack Val-R2.`,
      severity: 'warning',
      timestamp: '2026-07-03T21:11:00-07:00',
      module: 'warehouse',
      actionTaken: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Handler: Trigger emergency cooling sequence (Drops reefer temps, clears hazard alerts!)
  const handleTriggerEmergencyCooling = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return { ...v, tempCelsius: 4.0 };
        }
        return v;
      })
    );

    // Automatically resolve any critical cold chain temperature alerts!
    setAlerts((prev) =>
      prev.map((alt) => {
        if (alt.module === 'coldchain' && alt.severity === 'critical') {
          return { ...alt, actionTaken: true, title: 'Cold Chain Temp Hazard [RESOLVED]' };
        }
        return alt;
      })
    );
  };

  // Handler: Geo Check-in on SFA Beat Plan
  const handleTriggerCheckIn = (beatId: string) => {
    setBeatPlans((prev) =>
      prev.map((bp) => {
        if (bp.id === beatId) {
          return { ...bp, geoCheckIn: '09:15 AM' };
        }
        return bp;
      })
    );
  };

  // Handler: Collect wholesale order in field
  const handleCollectOrder = (beatId: string, amount: number) => {
    setBeatPlans((prev) =>
      prev.map((bp) => {
        if (bp.id === beatId) {
          return { ...bp, orderCollectedBDT: bp.orderCollectedBDT + amount };
        }
        return bp;
      })
    );

    // Update financial income statement ledger
    const newRecord: FinancialRecord = {
      id: `fin-${Date.now()}`,
      category: 'revenue',
      description: `Wholesale Beat Revenue captured in field`,
      amountBDT: amount,
      date: '2026-07-03',
      type: 'income',
    };
    setFinancials((prev) => [newRecord, ...prev]);
  };

  // Handler: Optimize Route paths
  const handleTriggerRerouting = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return { ...v, estArrival: '45 Mins', currentSpeed: 68 };
        }
        return v;
      })
    );

    // Resolve active routing delay alerts!
    setAlerts((prev) =>
      prev.map((alt) => {
        if (alt.module === 'fleet' && alt.title.includes('Obstruction')) {
          return { ...alt, actionTaken: true, title: 'Route Obstruction [RESOLVED VIA AI]' };
        }
        return alt;
      })
    );
  };

  // Handler: Resolve / Acknowledge active notifications manually
  const handleTakeActionOnAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alt) => {
        if (alt.id === alertId) {
          return { ...alt, actionTaken: true, title: alt.title.includes('[RESOLVED VIA AI]') ? alt.title : `${alt.title} [RESOLVED VIA AI]` };
        }
        return alt;
      })
    );

    // If it is a sustainability critical facility alert, update the facility to be optimized and reduce emission intensity!
    if (alertId.startsWith('sus-crit-')) {
      const whId = alertId.replace('sus-crit-', '');
      setWarehouses((prevWhs) =>
        prevWhs.map((wh) => {
          if (wh.id === whId) {
            return {
              ...wh,
              filledPercent: Math.max(10, wh.filledPercent - 12), // Reduce occupancy to simulate stock rerouting
              isOptimized: true,
              activeIncidents: Math.max(0, wh.activeIncidents - 1),
            };
          }
          return wh;
        })
      );
    }
  };

  return (
    <div className="flex bg-brand-black min-h-screen text-white font-sans antialiased overflow-hidden">
      {/* Impersonator Sidebar Control Tower */}
      <Sidebar
        currentEmployee={currentEmployee}
        onSelectEmployee={handleSelectEmployee}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Console Layout */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Navigation */}
        <Header
          currentEmployee={currentEmployee}
          alerts={alerts}
          onOpenAlertCenter={() => setIsAlertCenterOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Dynamic Body Scroll Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {activeTab === 'overview' && (
            <DashboardOverview
              currentEmployee={currentEmployee}
              alerts={alerts}
              warehouses={warehouses}
              vehicles={vehicles}
              financials={financials}
              onNavigateTab={setActiveTab}
              onTakeActionOnAlert={handleTakeActionOnAlert}
            />
          )}

          {activeTab === 'procurement' && (
            <ProcurementModule
              currentEmployee={currentEmployee}
              purchaseOrders={purchaseOrders}
              rfqs={rfqs}
              onApprovePO={handleApprovePO}
              onCreatePO={handleCreatePO}
              onCreateRFQ={handleCreateRFQ}
            />
          )}

          {activeTab === 'warehouse' && (
            <WarehouseModule
              warehouses={warehouses}
              onUpdateStock={handleUpdateStock}
              onReportDamage={handleReportDamage}
            />
          )}

          {activeTab === 'fleet' && (
            <FleetModule
              vehicles={vehicles}
              onTriggerRerouting={handleTriggerRerouting}
            />
          )}

          {activeTab === 'coldchain' && (
            <ColdChainModule
              vehicles={vehicles}
              onTriggerEmergencyCooling={handleTriggerEmergencyCooling}
            />
          )}

          {activeTab === 'sales' && (
            <SalesForceModule
              currentEmployee={currentEmployee}
              beatPlans={beatPlans}
              onTriggerCheckIn={handleTriggerCheckIn}
              onCollectOrder={handleCollectOrder}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceModule financials={financials} />
          )}

          {activeTab === 'sustainability' && (
            <SustainabilityModule
              vehicles={vehicles}
              warehouses={warehouses}
              carbonThreshold={carbonThreshold}
              setCarbonThreshold={setCarbonThreshold}
            />
          )}

          {activeTab === 'ai-center' && (
            <AiAdvisor onApplyStrategy={handleTriggerRerouting} />
          )}
        </main>
      </div>

      {/* Global Command Palette search overlay (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
      />

      {/* Real-time incident alert control tower sidebar drawer */}
      <AlertCenter
        isOpen={isAlertCenterOpen}
        onClose={() => setIsAlertCenterOpen(false)}
        alerts={alerts}
        onTakeActionOnAlert={handleTakeActionOnAlert}
      />
    </div>
  );
}
