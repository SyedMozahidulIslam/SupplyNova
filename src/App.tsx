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
import ComplianceAuditLog from './components/ComplianceAuditLog';

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
import { Employee, PurchaseOrder, RFQ, Warehouse, Vehicle, Alert, FinancialRecord, BeatPlan, ComplianceAuditLogEntry } from './types';

const INITIAL_AUDIT_LOGS: ComplianceAuditLogEntry[] = [
  {
    id: 'aud-seed-1',
    timestamp: '2026-07-03T18:30:15-07:00',
    userId: 'emp-1',
    userName: 'SMI Fahim',
    userRole: 'Super Admin',
    department: 'Executive',
    actionType: 'approve',
    module: 'procurement',
    description: 'Approved purchase order PO-2026-0812 for Dhaka Central Mega-Hub replenishment.',
    ipAddress: '192.168.10.155',
    hashSignature: '7d5e4a8b2c1f9e8d3a4c5e6f7d8e9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c',
    stateBefore: 'status: pending_approval',
    stateAfter: 'status: approved',
    severity: 'medium',
  },
  {
    id: 'aud-seed-2',
    timestamp: '2026-07-03T19:15:00-07:00',
    userId: 'emp-1',
    userName: 'SMI Fahim',
    userRole: 'Super Admin',
    department: 'Executive',
    actionType: 'configure',
    module: 'sustainability',
    description: 'Updated Corporate Carbon Intensity SLA Threshold from 19.5 Tons to 18.0 Tons.',
    ipAddress: '192.168.10.155',
    hashSignature: '3a4c5e6f7d8e9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7d5e4a8b2c1f9e8d',
    stateBefore: 'threshold: 19.5',
    stateAfter: 'threshold: 18.0',
    severity: 'high',
  },
  {
    id: 'aud-seed-3',
    timestamp: '2026-07-03T20:02:44-07:00',
    userId: 'emp-5',
    userName: 'Ayesha Rahman',
    userRole: 'Warehouse Manager',
    department: 'Warehouse',
    actionType: 'update',
    module: 'warehouse',
    description: 'Completed physical cycle count audit for Gazipur Industrial Transit - Zone A.',
    ipAddress: '192.168.12.82',
    hashSignature: 'f8e7d6c5b4a3f2e1d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6',
    stateBefore: 'stock_deviation: unchecked',
    stateAfter: 'stock_deviation: 0.0%',
    severity: 'low',
  },
  {
    id: 'aud-seed-4',
    timestamp: '2026-07-03T21:11:00-07:00',
    userId: 'emp-5',
    userName: 'Ayesha Rahman',
    userRole: 'Warehouse Manager',
    department: 'Warehouse',
    actionType: 'create',
    module: 'warehouse',
    description: 'Reported inventory damage for SKU SKU-RETAIL-012 (250 units quarantined in Zone D).',
    ipAddress: '192.168.12.82',
    hashSignature: '9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    stateBefore: 'quarantined: 0',
    stateAfter: 'quarantined: 250',
    severity: 'high',
  }
];

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
  const [auditLogs, setAuditLogs] = useState<ComplianceAuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Helper to add audit logs
  const addAuditLog = (
    actionType: ComplianceAuditLogEntry['actionType'],
    module: ComplianceAuditLogEntry['module'],
    description: string,
    severity: ComplianceAuditLogEntry['severity'] = 'low',
    stateBefore?: string,
    stateAfter?: string
  ) => {
    // Generate simple fake hash signature
    const randHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    const hash = Array.from({ length: 8 }, randHex).join('') + '...' + Array.from({ length: 4 }, randHex).join('');
    
    // Fake IP based on department
    const deptIps: Record<string, string> = {
      'Executive': '192.168.10.155',
      'Warehouse': '192.168.12.82',
      'Logistics': '192.168.15.41',
      'Sales': '10.0.12.103',
      'Finance': '192.168.10.42',
    };
    const ipAddress = deptIps[currentEmployee.department] || '192.168.1.100';

    const newLog: ComplianceAuditLogEntry = {
      id: `aud-real-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentEmployee.id,
      userName: currentEmployee.name,
      userRole: currentEmployee.role,
      department: currentEmployee.department,
      actionType,
      module,
      description,
      ipAddress,
      hashSignature: hash,
      stateBefore,
      stateAfter,
      severity,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

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
          
          addAuditLog(
            'approve',
            'procurement',
            `Co-signed & approved Purchase Order ${po.poNumber} for BDT ${po.totalAmountBDT.toLocaleString()} BDT.`,
            'medium',
            `approvals: [${po.approvalsCompleted.join(', ')}]`,
            `approvals: [${updatedApprovals.join(', ')}] (${isComplete ? 'Approved Complete' : 'Pending Co-Sign'})`
          );

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

    addAuditLog(
      'create',
      'procurement',
      `Drafted and registered purchase order ${newPo.poNumber} value ৳${newPo.totalAmountBDT.toLocaleString()} for supplier ${newPo.supplierName}.`,
      'medium',
      'po_record: empty',
      `po_record: pending_approval_by_role_[${newPo.approvalsNeeded.join(', ')}]`
    );
  };

  // Handler: Create RFQ
  const handleCreateRFQ = (newRfq: RFQ) => {
    setRfqs((prev) => [newRfq, ...prev]);

    addAuditLog(
      'create',
      'procurement',
      `Dispatched new Request for Quotation (RFQ) ${newRfq.rfqNumber}: "${newRfq.title}".`,
      'low',
      'rfq_record: empty',
      'rfq_status: active_open'
    );
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

    addAuditLog(
      'update',
      'warehouse',
      `Completed cycle counting stock correction for SKU ${sku} setting local capacity to ${newQty} items.`,
      'medium',
      'stock_audit: unverified',
      `stock_verified: ${newQty}_units_locked`
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

    addAuditLog(
      'create',
      'warehouse',
      `Initiated inventory damage quarantine report. Isolated ${qty} units of SKU ${sku}. Reason: ${comment}.`,
      'high',
      'safety_audit: safe',
      `quarantined: ${qty}_units_sku_${sku}`
    );
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

    addAuditLog(
      'override',
      'coldchain',
      `Executed Emergency Cooling Override for Cold-Chain vehicle ${vehicleId}. Target set to 4.0°C.`,
      'critical',
      'reefer_compressor: normal',
      'reefer_compressor: emergency_boost_4.0C'
    );
  };

  // Handler: Geo Check-in on SFA Beat Plan
  const handleTriggerCheckIn = (beatId: string) => {
    setBeatPlans((prev) =>
      prev.map((bp) => {
        if (bp.id === beatId) {
          addAuditLog(
            'update',
            'sales',
            `Validated geological mobile GPS check-in for Sales Agent ${bp.salesRepName} on Beat Plan ${beatId}.`,
            'low',
            'check_in: pending',
            'check_in: verified_09:15_AM'
          );
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
          addAuditLog(
            'create',
            'sales',
            `Recorded wholesale order collection for representative ${bp.salesRepName} on SFA Beat ID ${beatId} valued at ৳${amount.toLocaleString()} BDT.`,
            'medium',
            `order_collected: ৳${bp.orderCollectedBDT.toLocaleString()}`,
            `order_collected: ৳${(bp.orderCollectedBDT + amount).toLocaleString()}`
          );
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
          addAuditLog(
            'override',
            'fleet',
            `Triggered GPS Fleet route optimization for vehicle ${v.plateNumber} targeting destination ${v.destination}.`,
            'medium',
            `est_arrival: ${v.estArrival}`,
            'est_arrival: 45 Mins (AI Rerouted)'
          );
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
    let targetedAlert: any = null;

    setAlerts((prev) =>
      prev.map((alt) => {
        if (alt.id === alertId) {
          targetedAlert = alt;
          return { ...alt, actionTaken: true, title: alt.title.includes('[RESOLVED VIA AI]') ? alt.title : `${alt.title} [RESOLVED VIA AI]` };
        }
        return alt;
      })
    );

    if (targetedAlert) {
      addAuditLog(
        'mitigate',
        'general',
        `Acknowledged and mitigated alert: "${targetedAlert.title}". Handled corrective actions.`,
        targetedAlert.severity === 'critical' ? 'high' : 'medium',
        'alert_status: active_unresolved',
        'alert_status: closed_mitigated'
      );
    }

    // If it is a sustainability critical facility alert, update the facility to be optimized and reduce emission intensity!
    if (alertId.startsWith('sus-crit-')) {
      const whId = alertId.replace('sus-crit-', '');
      setWarehouses((prevWhs) =>
        prevWhs.map((wh) => {
          if (wh.id === whId) {
            addAuditLog(
              'override',
              'sustainability',
              `Triggered AI Carbon Eco-optimization on ${wh.name}. Adjusted facility climate threshold to 21.0°C to lower energy sags.`,
              'high',
              `emissions_filled: ${wh.filledPercent}%`,
              `emissions_filled: ${Math.max(10, wh.filledPercent - 12)}%`
            );
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

  // Handler: Update Carbon Threshold with audit trail tracking
  const handleUpdateCarbonThreshold = (newVal: number) => {
    addAuditLog(
      'configure',
      'sustainability',
      `Recalibrated corporate carbon intensity alert threshold to ${newVal.toFixed(1)} Tons CO₂e.`,
      'high',
      `threshold: ${carbonThreshold.toFixed(1)}`,
      `threshold: ${newVal.toFixed(1)}`
    );
    setCarbonThreshold(newVal);
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
              onAddAuditLog={addAuditLog}
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
              setCarbonThreshold={handleUpdateCarbonThreshold}
              onAddAuditLog={addAuditLog}
            />
          )}

          {activeTab === 'ai-center' && (
            <AiAdvisor onApplyStrategy={handleTriggerRerouting} />
          )}

          {activeTab === 'audit-log' && (
            <ComplianceAuditLog
              auditLogs={auditLogs}
              onAddAuditLog={addAuditLog}
              currentEmployee={currentEmployee}
            />
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
