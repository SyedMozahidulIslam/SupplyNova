import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Award,
  Users,
  CheckCircle,
  Clock,
  Shield,
  Upload,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { PurchaseOrder, RFQ, Supplier, Employee } from '../types';
import { SUPPLIERS } from '../data/mockData';

interface ProcurementModuleProps {
  currentEmployee: Employee;
  purchaseOrders: PurchaseOrder[];
  rfqs: RFQ[];
  onApprovePO: (poId: string, employeeName: string) => void;
  onCreatePO: (po: any) => void;
  onCreateRFQ: (rfq: any) => void;
}

export default function ProcurementModule({
  currentEmployee,
  purchaseOrders,
  rfqs,
  onApprovePO,
  onCreatePO,
  onCreateRFQ,
}: ProcurementModuleProps) {
  const [activeTab, setActiveTab] = useState<'po' | 'rfq' | 'suppliers'>('po');
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [showCreateRFQ, setShowCreateRFQ] = useState(false);

  // New PO form state
  const [poSupplierId, setPoSupplierId] = useState('sup-1');
  const [poProductName, setPoProductName] = useState('Vaseline Healthy White Lotion 400ml');
  const [poQty, setPoQty] = useState(1000);
  const [poPrice, setPoPrice] = useState(650);

  // New RFQ form state
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqProduct, setRfqProduct] = useState('');
  const [rfqQty, setRfqQty] = useState(1000);
  const [rfqTargetPrice, setRfqTargetPrice] = useState(100);

  // Check if current user is allowed to approve a specific PO
  const canApprove = (po: PurchaseOrder) => {
    const isApprovalNeededByRole = po.approvalsNeeded.includes(currentEmployee.role);
    const alreadyApprovedByMe = po.approvalsCompleted.includes(currentEmployee.role);
    return isApprovalNeededByRole && !alreadyApprovedByMe && po.status === 'pending_approval';
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = SUPPLIERS.find(s => s.id === poSupplierId);
    const total = poQty * poPrice;
    
    onCreatePO({
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(Math.random() * 900) + 100}`,
      supplierName: sup ? sup.name : 'Unilever Bangladesh Sourcing',
      supplierId: poSupplierId,
      totalAmountBDT: total,
      dateCreated: '2026-07-03',
      status: 'pending_approval',
      itemsCount: 1,
      approvalsNeeded: ['Finance Manager', 'Procurement Director', 'Supply Chain Director'],
      approvalsCompleted: [],
      items: [{ productName: poProductName, quantity: poQty, priceBDT: poPrice }],
    });

    setShowCreatePO(false);
  };

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRFQ({
      id: `rfq-${Date.now()}`,
      rfqNumber: `RFQ-2026-${Math.floor(Math.random() * 900) + 100}`,
      title: rfqTitle,
      createdDate: '2026-07-03',
      deadline: '2026-07-15',
      submissionsCount: 0,
      status: 'open',
      items: [{ productName: rfqProduct, quantity: rfqQty, targetPriceBDT: rfqTargetPrice }],
    });
    setShowCreateRFQ(false);
    setRfqTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded border border-white/10 bg-white/5">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
            <FileText size={20} className="text-accent-cyan" /> Enterprise Sourcing & Procurement
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
            Supplier verification, quotation comparison, Purchase Orders, and multi-role approvals
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab('po');
              setShowCreatePO(true);
            }}
            className="px-4 py-2.5 rounded bg-accent-blue hover:bg-accent-blue/80 text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle size={14} /> Raise Purchase Order
          </button>
          <button
            onClick={() => {
              setActiveTab('rfq');
              setShowCreateRFQ(true);
            }}
            className="px-4 py-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle size={14} /> Open RFQ
          </button>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('po')}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
            activeTab === 'po' ? 'border-accent-blue text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('rfq')}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
            activeTab === 'rfq' ? 'border-accent-blue text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Request for Quotations ({rfqs.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
            activeTab === 'suppliers' ? 'border-accent-blue text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Supplier Scorecards ({SUPPLIERS.length})
        </button>
      </div>

      {/* Create PO Form Modal */}
      {showCreatePO && (
        <div className="p-6 rounded-2xl border border-white/10 bg-brand-dark-grey/95 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Raise SCM Purchase Requisition</h3>
            <button onClick={() => setShowCreatePO(false)} className="text-white/40 hover:text-white text-xs">
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreatePO} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Select Partner Supplier</label>
              <select
                value={poSupplierId}
                onChange={(e) => setPoSupplierId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-accent-cyan"
              >
                {SUPPLIERS.map(s => (
                  <option key={s.id} value={s.id} className="bg-brand-black">{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Select Inventory Item</label>
              <select
                value={poProductName}
                onChange={(e) => setPoProductName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="Vaseline Healthy White Lotion 400ml" className="bg-brand-black">Vaseline Lotion 400ml</option>
                <option value="Lux Soft Touch Soap 100g (Pack of 4)" className="bg-brand-black">Lux Soap Pack</option>
                <option value="Aarong Premium Ghee 1kg Tin" className="bg-brand-black">Aarong Ghee 1kg</option>
                <option value="Insulin Glargine Bio-Sim 100 IU/ml" className="bg-brand-black">Insulin Bio-Sim 100 IU</option>
              </select>
            </div>
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Sourcing Quantity (units)</label>
              <input
                type="number"
                value={poQty}
                onChange={(e) => setPoQty(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Unit Sourcing Cost (BDT)</label>
              <input
                type="number"
                value={poPrice}
                onChange={(e) => setPoPrice(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 pt-2 flex items-center justify-between bg-white/[0.01] p-3 rounded-lg">
              <div>
                <span className="text-white/40 block">Estimated Sourcing Capital:</span>
                <span className="text-sm font-bold text-accent-emerald">৳{(poQty * poPrice).toLocaleString()} BDT</span>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-accent-emerald text-xs font-bold text-black hover:bg-accent-emerald/80 cursor-pointer"
              >
                Submit PO for Multi-Role Approval
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create RFQ Form Modal */}
      {showCreateRFQ && (
        <div className="p-6 rounded-2xl border border-white/10 bg-brand-dark-grey/95 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Create Request for Sourcing quotation (RFQ)</h3>
            <button onClick={() => setShowCreateRFQ(false)} className="text-white/40 hover:text-white text-xs">
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateRFQ} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">RFQ Bid Title</label>
              <input
                type="text"
                placeholder="e.g. Bulk Raw Soap Noodles Sourcing Q3 Contract"
                value={rfqTitle}
                onChange={(e) => setRfqTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Product / Material Requirement</label>
              <input
                type="text"
                placeholder="e.g. Lauric acid chemical feedstocks"
                value={rfqProduct}
                onChange={(e) => setRfqProduct(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Target Qty</label>
              <input
                type="number"
                value={rfqQty}
                onChange={(e) => setRfqQty(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-white/60 mb-1 font-mono uppercase tracking-wider text-[10px]">Target Price (BDT/unit)</label>
              <input
                type="number"
                value={rfqTargetPrice}
                onChange={(e) => setRfqTargetPrice(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
              />
            </div>
            <div className="md:col-span-2 pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-accent-blue text-xs font-bold text-white hover:bg-accent-blue/80 cursor-pointer"
              >
                Broadcast RFQ to Verified Suppliers
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PO View */}
      {activeTab === 'po' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {purchaseOrders.map(po => (
              <div key={po.id} className="p-5 rounded-xl glass-panel border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white bg-white/5 px-2.5 py-1 rounded">
                      {po.poNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      po.status === 'approved'
                        ? 'bg-accent-emerald/20 text-accent-emerald'
                        : po.status === 'pending_approval'
                        ? 'bg-accent-amber/20 text-accent-amber animate-pulse'
                        : po.status === 'rejected'
                        ? 'bg-accent-rose/20 text-accent-rose'
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {po.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs text-white/40 font-mono">Supplier Partner:</h4>
                    <p className="text-sm font-semibold text-white">{po.supplierName}</p>
                  </div>

                  <div className="flex items-center gap-6 text-[11px] text-white/60 font-mono">
                    <div>
                      <span>Total: </span>
                      <strong className="text-white">৳{po.totalAmountBDT.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Items: </span>
                      <strong className="text-white">{po.itemsCount}</strong>
                    </div>
                  </div>

                  {/* Multi-tier Approval Tracker */}
                  <div className="pt-2">
                    <h5 className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Required SCM Sign-Off Flow:</h5>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {po.approvalsNeeded.map((role, idx) => {
                        const approved = po.approvalsCompleted.includes(role);
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded text-[9px] font-mono font-medium flex items-center gap-1 ${
                              approved
                                ? 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald'
                                : 'bg-white/[0.03] border border-white/5 text-white/40'
                            }`}>
                              {approved ? '✓' : '⏰'} {role}
                            </span>
                            {idx < po.approvalsNeeded.length - 1 && <ArrowRight size={10} className="text-white/20" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SCM Approval Action Trigger */}
                <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                  {canApprove(po) ? (
                    <button
                      onClick={() => onApprovePO(po.id, currentEmployee.name)}
                      className="px-4 py-2.5 rounded-xl bg-accent-emerald hover:bg-accent-emerald/80 text-xs font-bold text-black shadow-lg shadow-accent-emerald/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle size={14} /> Co-Sign & Approve PO
                    </button>
                  ) : po.status === 'pending_approval' ? (
                    <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] font-mono text-white/40 text-center flex items-center gap-1.5 justify-center">
                      <Clock size={12} /> Pending co-sign from: {po.approvalsNeeded.filter(r => !po.approvalsCompleted.includes(r)).join(', ')}
                    </div>
                  ) : null}

                  {/* Invoice upload center for suppliers */}
                  <div className="border border-white/5 bg-white/[0.01] p-3 rounded-xl flex items-center gap-2.5 text-[10px]">
                    <Upload size={14} className="text-white/40" />
                    <div className="flex-1 text-left">
                      <span className="text-white/70 block font-semibold">Upload Digital SCM Invoice</span>
                      <span className="text-white/40 text-[9px]">Requires PDF, BDT verification, BIN, TIN</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RFQ View */}
      {activeTab === 'rfq' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfqs.map(rfq => (
              <div key={rfq.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded">
                      {rfq.rfqNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5 font-display leading-tight">{rfq.title}</h4>
                    <p className="text-[11px] text-white/50 font-mono mt-1">Due deadline: {rfq.deadline}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    rfq.status === 'open' ? 'bg-accent-emerald/20 text-accent-emerald animate-pulse' : 'bg-white/10 text-white/40'
                  }`}>
                    {rfq.status}
                  </span>
                </div>

                <div className="bg-white/[0.01] border border-white/5 p-3 rounded-lg text-xs space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">Required Materials:</span>
                  {rfq.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between font-mono">
                      <span className="text-white font-medium">{item.productName}</span>
                      <span className="text-white/60">{item.quantity} Units</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                  <span className="text-white/40">{rfq.submissionsCount} Supplier quotations received</span>
                  <button className="text-accent-cyan hover:underline flex items-center gap-1 font-semibold cursor-pointer">
                    Compare Quotations <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supplier Scorecard list */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPLIERS.map(s => (
            <div key={s.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-4 relative group hover:border-white/10 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-accent-cyan transition-colors">{s.name}</h4>
                  <p className="text-[10px] text-white/40 mt-1">{s.location}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  s.status === 'verified' ? 'bg-accent-emerald/20 text-accent-emerald' : 'bg-accent-rose/20 text-accent-rose'
                }`}>
                  {s.status}
                </span>
              </div>

              {/* KPI Score and stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-white/5 font-mono">
                <div>
                  <span className="text-white/40 block text-[9px]">SCM Compliance Score</span>
                  <strong className={`text-sm ${s.performanceScore > 90 ? 'text-accent-emerald' : 'text-accent-amber'}`}>
                    {s.performanceScore}%
                  </strong>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px]">Active Contracts</span>
                  <strong className="text-sm text-white">{s.activeContracts} Contracts</strong>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px]">Government BIN</span>
                  <span className="text-white/80 font-mono text-[10px]">{s.BIN}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px]">Supplier Rating</span>
                  <span className="text-accent-amber font-semibold text-[10px]">★ {s.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
