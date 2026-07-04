import React from 'react';
import { Coins, TrendingUp, TrendingDown, DollarSign, FileText, CheckCircle, Percent } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { FinancialRecord } from '../types';

interface FinanceModuleProps {
  financials: FinancialRecord[];
}

export default function FinanceModule({ financials }: FinanceModuleProps) {
  // Compute calculations
  const totalIncome = financials.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amountBDT, 0);
  const totalExpense = financials.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amountBDT, 0);
  const netCapital = totalIncome - totalExpense;

  // Breakdown by SCM category
  const categorySummary = financials.reduce((acc: Record<string, number>, curr) => {
    if (!acc[curr.category]) acc[curr.category] = 0;
    acc[curr.category] += curr.amountBDT;
    return acc;
  }, {});

  const chartData = Object.entries(categorySummary).map(([key, val]) => ({
    name: key.toUpperCase(),
    amount: val,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Finance Ledger Title */}
      <div className="p-6 rounded border border-white/10 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
            <Coins size={20} className="text-accent-cyan" /> Corporate SCM Ledger
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
            Capital budgets, SCM freight tariffs, procurement outlays, and corporate VAT / BIN validations
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-gray-400 border border-white/10 bg-white/5 p-3 rounded">
          <div className="border-r border-white/10 pr-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-0.5">NBR BIN</span>
            <span className="text-white font-bold block">000192837-0101</span>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-0.5">SCM FLAT VAT</span>
            <span className="text-accent-cyan font-bold block">15.0% BDT flat</span>
          </div>
        </div>
      </div>

      {/* Account Ledgers grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Receivables */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-white/40 font-kpi text-[8px] uppercase tracking-widest font-bold">SCM Receivables / Income</span>
            <h4 className="text-base sm:text-lg font-kpi font-extrabold text-accent-emerald mt-2 leading-none uppercase tracking-wider">
              ৳{totalIncome.toLocaleString()} BDT
            </h4>
          </div>
          <span className="text-[10px] text-white/30 font-mono mt-4 block">Accounts cleared from Daraz, Shwapno</span>
        </div>

        {/* Total Payables */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-white/40 font-kpi text-[8px] uppercase tracking-widest font-bold">SCM Payables / Expenses</span>
            <h4 className="text-base sm:text-lg font-kpi font-extrabold text-accent-rose mt-2 leading-none uppercase tracking-wider">
              ৳{totalExpense.toLocaleString()} BDT
            </h4>
          </div>
          <span className="text-[10px] text-white/30 font-mono mt-4 block">Settlements for Unilever, Aarong Sourcing</span>
        </div>

        {/* Net Profit Surplus */}
        <div className="p-5 rounded-xl bg-gradient-to-tr from-accent-blue/10 to-accent-cyan/10 border border-accent-blue/20 flex flex-col justify-between shadow-lg shadow-accent-blue/5">
          <div>
            <span className="text-white/40 font-kpi text-[8px] uppercase tracking-widest font-bold">Net SCM Profit Surplus</span>
            <h4 className="text-base sm:text-lg font-kpi font-extrabold text-white mt-2 leading-none uppercase tracking-wider">
              ৳{netCapital.toLocaleString()} BDT
            </h4>
          </div>
          <span className="text-[10px] text-accent-cyan font-mono mt-4 block flex items-center gap-1">
            <TrendingUp size={12} /> Positive treasury ratio stabilized
          </span>
        </div>
      </div>

      {/* Main Breakdown Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost breakdown bar chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between h-[320px]">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Capital Allocation Breakdown</h3>
            <p className="text-[10px] text-white/40">Outlays across procurement, warehousing, and freight logistics</p>
          </div>

          <div className="flex-1 w-full min-h-0 text-[10px] font-mono text-white/40 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121214', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* National tax registry details */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-1">
              <Percent size={14} className="text-accent-cyan" /> Tax Certificates BDT
            </h3>
            <p className="text-[10px] text-white/40 mt-1">NBR registered tax identifiers</p>
          </div>

          <div className="space-y-4 text-xs font-mono my-4">
            <div className="bg-white/[0.01] p-3 rounded-lg border border-white/5">
              <span className="text-white/40 text-[9px] block">Corporate TIN Certificate</span>
              <strong className="text-white block mt-0.5">TIN: 304958671234</strong>
              <span className="text-[9px] text-accent-emerald">✓ Verified Active status</span>
            </div>
            <div className="bg-white/[0.01] p-3 rounded-lg border border-white/5">
              <span className="text-white/40 text-[9px] block">National Trade License</span>
              <strong className="text-white block mt-0.5">License: TR-DHAKA-2026-9283</strong>
              <span className="text-[9px] text-white/40">Expires: 30-June-2027</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 text-[10px] text-white/30 font-mono text-center">
            Audits checked by Nasib ul awal
          </div>
        </div>
      </div>
    </div>
  );
}
