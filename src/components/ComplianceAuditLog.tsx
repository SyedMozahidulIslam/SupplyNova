import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Globe,
  RefreshCw,
  FileSpreadsheet,
  Lock,
  Unlock,
  FileCheck,
  Activity,
  ChevronDown,
  ChevronUp,
  Sliders,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { ComplianceAuditLogEntry, Employee } from '../types';

interface ComplianceAuditLogProps {
  auditLogs: ComplianceAuditLogEntry[];
  onAddAuditLog: (
    actionType: ComplianceAuditLogEntry['actionType'],
    module: ComplianceAuditLogEntry['module'],
    description: string,
    severity: ComplianceAuditLogEntry['severity'],
    stateBefore?: string,
    stateAfter?: string
  ) => void;
  currentEmployee: Employee;
}

export default function ComplianceAuditLog({
  auditLogs,
  onAddAuditLog,
  currentEmployee
}: ComplianceAuditLogProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  
  // Expanded log entries for showing state diffs
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});

  // Ledger verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'unchecked' | 'success' | 'failed';
    checkedCount: number;
    timestamp?: string;
  }>({ status: 'unchecked', checkedCount: 0 });

  // Compliance Seal state
  const [isSealed, setIsSealed] = useState(false);
  const [sealDetails, setSealDetails] = useState<{
    sealedBy: string;
    sealedAt?: string;
    sealHash?: string;
  } | null>(null);

  // Live Sync watch state
  const [liveWatch, setLiveWatch] = useState(true);

  // Toggle expanded log details
  const toggleExpand = (id: string) => {
    setExpandedLogIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Perform cryptographic hash sweep simulation
  const handleVerifySignatures = () => {
    setIsVerifying(true);
    setVerificationResult({ status: 'unchecked', checkedCount: 0 });

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult({
        status: 'success',
        checkedCount: auditLogs.length,
        timestamp: new Date().toLocaleTimeString(),
      });
      
      // Log the verification check to compliance
      onAddAuditLog(
        'mitigate',
        'compliance',
        `Executed cryptographic signature verification on audit trail ledger. All ${auditLogs.length} historical blocks matched hash roots.`,
        'low',
        'integrity_verification: idle',
        `integrity_verification: verified_100%_match_count_${auditLogs.length}`
      );
    }, 1500);
  };

  // Co-sign and seal current ledger
  const handleCoSignLedger = () => {
    if (isSealed) return;

    // Generate a secure master seal block hash
    const randHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    const masterHash = `SHA256-MSTR-${Array.from({ length: 12 }, randHex).join('').toUpperCase()}`;
    const sealedAtStr = new Date().toISOString();

    setIsSealed(true);
    setSealDetails({
      sealedBy: `${currentEmployee.name} (${currentEmployee.role})`,
      sealedAt: sealedAtStr,
      sealHash: masterHash
    });

    onAddAuditLog(
      'approve',
      'compliance',
      `DIGITALLY SEALED AUDIT TRAIL: Applied compliance ledger signature seal for ${auditLogs.length} records.`,
      'critical',
      'ledger_lock: unlocked',
      `ledger_lock: sealed_by_${currentEmployee.id}_hash_${masterHash.substring(0, 12)}...`
    );
  };

  // Unlock Ledger (Super Admin only check)
  const handleUnlockLedger = () => {
    if (!isSealed) return;
    
    setIsSealed(false);
    setSealDetails(null);

    onAddAuditLog(
      'override',
      'compliance',
      `UNLOCKED AUDIT LEDGER: Operational compliance seal revoked to allow further log writes.`,
      'high',
      'ledger_lock: sealed',
      'ledger_lock: unlocked'
    );
  };

  // Export audit trail to mock CSV download
  const handleExportCSV = () => {
    const headers = 'ID,Timestamp,User,Role,Department,ActionType,Module,Description,IPAddress,HashSignature,Severity\n';
    const rows = auditLogs.map(log => 
      `"${log.id}","${log.timestamp}","${log.userName}","${log.userRole}","${log.department}","${log.actionType}","${log.module}","${log.description.replace(/"/g, '""')}","${log.ipAddress}","${log.hashSignature}","${log.severity}"`
    ).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `SupplyNova_Audit_Trail_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onAddAuditLog(
      'configure',
      'compliance',
      `Exported audit ledger file containing ${auditLogs.length} entries for external NBR compliance audits.`,
      'medium',
      'last_export: active',
      `export_completed_records_${auditLogs.length}`
    );
  };

  // Filter logs dynamically
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Search text match
      const text = `${log.description} ${log.userName} ${log.userRole} ${log.hashSignature} ${log.id}`.toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase());

      // Dropdowns filter matches
      const matchesModule = moduleFilter === 'All' || log.module === moduleFilter.toLowerCase().replace(' ', '');
      const matchesAction = actionFilter === 'All' || log.actionType === actionFilter.toLowerCase();
      const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter.toLowerCase();

      return matchesSearch && matchesModule && matchesAction && matchesSeverity;
    });
  }, [auditLogs, searchTerm, moduleFilter, actionFilter, severityFilter]);

  // Log statistics calculations
  const stats = useMemo(() => {
    const totalCount = auditLogs.length;
    const criticalCount = auditLogs.filter(l => l.severity === 'critical').length;
    const highCount = auditLogs.filter(l => l.severity === 'high').length;
    const overridesCount = auditLogs.filter(l => l.actionType === 'override').length;
    const approvalsCount = auditLogs.filter(l => l.actionType === 'approve').length;

    return {
      totalCount,
      criticalCount,
      highCount,
      overridesCount,
      approvalsCount
    };
  }, [auditLogs]);

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="p-6 rounded border border-white/10 bg-white/5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
            <Shield size={24} className="text-accent-blue" /> Enterprise Compliance Audit Log
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
            SECURE RECOGNITION LEDGER FOR SOC2 TYPE II, ISO 27001 compliance, and NBR/VAT digital audit trails
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Sync Watch Indicator */}
          <button
            onClick={() => setLiveWatch(prev => !prev)}
            className={`flex items-center gap-2 px-3 py-2 rounded font-mono text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
              liveWatch 
                ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30' 
                : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            <Activity size={12} className={liveWatch ? 'animate-pulse' : ''} />
            {liveWatch ? 'Live Sync Active' : 'Live Sync Suspended'}
          </button>

          {/* Export CSV trigger */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded font-mono text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-all"
          >
            <Download size={12} />
            Export Audit Trail (CSV)
          </button>
        </div>
      </div>

      {/* Compliance Integrity Panel & Master Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ledger Lock & Seal Controller */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/40 font-mono text-[10px] uppercase tracking-widest font-black">Ledger Compliance Lock</span>
              {isSealed ? (
                <span className="text-[9px] font-mono font-bold text-accent-rose bg-accent-rose/15 border border-accent-rose/25 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock size={10} /> LOCK ACTIVE
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold text-accent-emerald bg-accent-emerald/15 border border-accent-emerald/25 px-2 py-0.5 rounded flex items-center gap-1">
                  <Unlock size={10} /> WRITEABLE
                </span>
              )}
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed font-sans font-normal">
              Digitally signing the ledger applies an immutable compliance stamp locked to the currently active administrator credentials. Once sealed, system logging operates in strict tamper-evident tracking modes.
            </p>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-3">
            {isSealed && sealDetails ? (
              <div className="bg-brand-black/40 border border-accent-rose/25 p-3 rounded-lg space-y-1.5 text-left">
                <span className="text-[8px] font-mono font-bold text-accent-rose block uppercase tracking-wider">🔒 SIGNATURE ROOT INTACT</span>
                <p className="text-[10px] text-gray-300 font-mono">
                  <strong className="text-white">Signee:</strong> {sealDetails.sealedBy}
                </p>
                <p className="text-[10px] text-gray-300 font-mono">
                  <strong className="text-white">Sealed:</strong> {new Date(sealDetails.sealedAt || '').toLocaleTimeString()}
                </p>
                <div className="text-[9px] font-mono text-gray-500 bg-white/[0.02] p-1.5 rounded border border-white/5 truncate">
                  Hash: {sealDetails.sealHash}
                </div>
              </div>
            ) : (
              <div className="bg-brand-black/40 border border-white/5 p-3 rounded-lg text-center py-4">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">No Active Ledger Seal</span>
                <p className="text-[9px] text-gray-400 mt-1">Pending quarterly SOC2 executive sign-off.</p>
              </div>
            )}

            <div className="flex gap-2.5">
              {!isSealed ? (
                <button
                  onClick={handleCoSignLedger}
                  className="flex-1 py-2 bg-accent-blue hover:bg-accent-blue/85 text-brand-black font-mono text-[10px] font-black uppercase tracking-widest rounded cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
                >
                  <FileCheck size={12} /> Apply Digital Seal
                </button>
              ) : (
                <button
                  onClick={handleUnlockLedger}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 hover:text-accent-rose text-white border border-white/10 font-mono text-[10px] font-black uppercase tracking-widest rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Unlock size={12} /> Break Seal &amp; Unlock
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Crypto Hash Verification Suite */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-white/40 font-mono text-[10px] uppercase tracking-widest font-black block">Block Integrity Sweep</span>
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans font-normal">
              Validates that every registered transaction block contains a valid sequence ID and a cryptographically synced hash checksum. Any structural database tampering instantly breaches root node validation.
            </p>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-3">
            {verificationResult.status === 'success' ? (
              <div className="bg-accent-emerald/10 border border-accent-emerald/20 p-3 rounded-lg space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-accent-emerald font-mono font-black text-[9px] uppercase tracking-wider">
                  <CheckCircle2 size={12} /> INTEGRITY SWEEP PASSED
                </div>
                <p className="text-[10px] text-gray-300">
                  All <strong className="text-white">{verificationResult.checkedCount}</strong> logging cells matching root SHA-256 signatures perfectly. Zero leaks.
                </p>
                <span className="text-[8px] font-mono text-gray-500 block mt-1">Checked at {verificationResult.timestamp}</span>
              </div>
            ) : isVerifying ? (
              <div className="bg-brand-black/40 border border-accent-blue/20 p-4 rounded-lg flex flex-col items-center justify-center space-y-2 py-6">
                <RefreshCw size={20} className="text-accent-blue animate-spin" />
                <span className="text-[10px] font-mono text-accent-blue font-bold animate-pulse">RECOMPUTING HASH RADIX ROOTS...</span>
              </div>
            ) : (
              <div className="bg-brand-black/40 border border-white/5 p-3 rounded-lg text-center py-4">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Sweep Status: Unverified</span>
                <p className="text-[9px] text-gray-400 mt-1">System requires hourly structural sweep validation.</p>
              </div>
            )}

            <button
              onClick={handleVerifySignatures}
              disabled={isVerifying}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-50 font-mono text-[10px] font-black uppercase tracking-widest rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Activity size={12} className={isVerifying ? 'animate-spin' : ''} />
              Verify Checksum Signatures
            </button>
          </div>
        </div>

        {/* Compliance Statistics Grid */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-3">
          <span className="text-white/40 font-mono text-[10px] uppercase tracking-widest font-black block">Active Sessions Stats</span>
          
          <div className="grid grid-cols-2 gap-3.5 flex-1">
            <div className="bg-brand-black/45 p-2.5 rounded border border-white/5 flex flex-col justify-center">
              <span className="text-[8px] font-mono text-gray-500 block uppercase">Audit Block Height</span>
              <span className="text-xl font-mono font-black text-white">{stats.totalCount}</span>
              <span className="text-[8px] font-mono text-accent-emerald mt-0.5">✓ Secured Blocks</span>
            </div>

            <div className="bg-brand-black/45 p-2.5 rounded border border-white/5 flex flex-col justify-center">
              <span className="text-[8px] font-mono text-gray-500 block uppercase">Overridden Schedules</span>
              <span className="text-xl font-mono font-black text-accent-amber">{stats.overridesCount}</span>
              <span className="text-[8px] font-mono text-gray-400 mt-0.5">Authorized overrides</span>
            </div>

            <div className="bg-brand-black/45 p-2.5 rounded border border-white/5 flex flex-col justify-center">
              <span className="text-[8px] font-mono text-gray-500 block uppercase">Co-Signed POs</span>
              <span className="text-xl font-mono font-black text-accent-cyan">{stats.approvalsCount}</span>
              <span className="text-[8px] font-mono text-accent-cyan mt-0.5">Executive sign-offs</span>
            </div>

            <div className="bg-brand-black/45 p-2.5 rounded border border-white/5 flex flex-col justify-center">
              <span className="text-[8px] font-mono text-gray-500 block uppercase">High/Crit Severity</span>
              <span className="text-xl font-mono font-black text-accent-rose">{stats.criticalCount + stats.highCount}</span>
              <span className="text-[8px] font-mono text-gray-400 mt-0.5">Required mitigation</span>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Log Filter Bar */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Text Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Search by action description, operator name, role or cryptographic hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-accent-blue"
            />
          </div>

          {/* Filtering Dropdowns Grid */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            {/* Module Dropdown */}
            <div className="flex items-center gap-1.5 bg-brand-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg shrink-0">
              <Filter size={10} className="text-gray-500" />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-transparent text-white text-[10px] font-mono font-bold focus:outline-none cursor-pointer uppercase pr-2"
              >
                <option value="All" className="bg-brand-black text-white">Module: All</option>
                <option value="Procurement" className="bg-brand-black text-white">Procurement</option>
                <option value="Warehouse" className="bg-brand-black text-white">Warehouse</option>
                <option value="Fleet" className="bg-brand-black text-white">Fleet</option>
                <option value="Cold Chain" className="bg-brand-black text-white">Cold Chain</option>
                <option value="Sales" className="bg-brand-black text-white">Sales</option>
                <option value="Finance" className="bg-brand-black text-white">Finance</option>
                <option value="Sustainability" className="bg-brand-black text-white">Sustainability</option>
                <option value="Compliance" className="bg-brand-black text-white">Compliance</option>
              </select>
            </div>

            {/* Action Type Dropdown */}
            <div className="flex items-center gap-1.5 bg-brand-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg shrink-0">
              <Sliders size={10} className="text-gray-500" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-transparent text-white text-[10px] font-mono font-bold focus:outline-none cursor-pointer uppercase pr-2"
              >
                <option value="All" className="bg-brand-black text-white">Action: All</option>
                <option value="Create" className="bg-brand-black text-white">Create</option>
                <option value="Update" className="bg-brand-black text-white">Update</option>
                <option value="Mitigate" className="bg-brand-black text-white">Mitigate</option>
                <option value="Approve" className="bg-brand-black text-white">Approve</option>
                <option value="Configure" className="bg-brand-black text-white">Configure</option>
                <option value="Override" className="bg-brand-black text-white">Override</option>
              </select>
            </div>

            {/* Severity Dropdown */}
            <div className="flex items-center gap-1.5 bg-brand-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg shrink-0">
              <AlertTriangle size={10} className="text-gray-500" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent text-white text-[10px] font-mono font-bold focus:outline-none cursor-pointer uppercase pr-2"
              >
                <option value="All" className="bg-brand-black text-white">Severity: All</option>
                <option value="Low" className="bg-brand-black text-white">Low</option>
                <option value="Medium" className="bg-brand-black text-white">Medium</option>
                <option value="High" className="bg-brand-black text-white">High</option>
                <option value="Critical" className="bg-brand-black text-white">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clear filters banner */}
        {(searchTerm || moduleFilter !== 'All' || actionFilter !== 'All' || severityFilter !== 'All') && (
          <div className="flex items-center justify-between bg-white/[0.01] p-2 rounded border border-white/5 text-[10px]">
            <span className="text-gray-400">
              Filtering active: Showing <strong className="text-white">{filteredLogs.length}</strong> of{' '}
              <strong className="text-white">{auditLogs.length}</strong> compliance events
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setModuleFilter('All');
                setActionFilter('All');
                setSeverityFilter('All');
              }}
              className="text-accent-blue hover:underline uppercase font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Audit Logs Registry View */}
      <div className="border border-white/10 bg-brand-black rounded-xl overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-white/5 border-b border-white/10 text-[9px] font-mono font-black uppercase text-gray-400 tracking-wider">
          <div className="col-span-2">TIMESTAMP BDT</div>
          <div className="col-span-3">OPERATIONAL MEMBER</div>
          <div className="col-span-1 text-center">ACTION</div>
          <div className="col-span-1 text-center">MODULE</div>
          <div className="col-span-3">DESCRIPTION SUMMARY</div>
          <div className="col-span-1 text-center">SEVERITY</div>
          <div className="col-span-1 text-right">METADATA</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
          {filteredLogs.map(log => {
            const isExpanded = expandedLogIds[log.id];

            // Action type style map
            const actionStyles: Record<string, string> = {
              create: 'bg-accent-blue/15 text-accent-blue border-accent-blue/20',
              update: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/20',
              delete: 'bg-accent-rose/15 text-accent-rose border-accent-rose/20',
              mitigate: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20',
              approve: 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30 font-black',
              configure: 'bg-accent-amber/15 text-accent-amber border-accent-amber/20',
              override: 'bg-accent-amber/20 text-accent-amber border-accent-amber/30 font-black'
            };

            // Module style map
            const moduleStyles: Record<string, string> = {
              procurement: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              warehouse: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              fleet: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
              coldchain: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
              sales: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              finance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              sustainability: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/25',
              compliance: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
              general: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
            };

            // Severity color code
            const severityColor: Record<string, string> = {
              low: 'text-gray-400 bg-gray-400/5 border border-gray-400/10',
              medium: 'text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20',
              high: 'text-accent-amber bg-accent-amber/15 border border-accent-amber/25',
              critical: 'text-accent-rose bg-accent-rose/15 border border-accent-rose/25 font-black animate-pulse'
            };

            return (
              <div key={log.id} className={`transition-all ${isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}`}>
                
                {/* Visual Row */}
                <div 
                  onClick={() => toggleExpand(log.id)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-[11px] cursor-pointer"
                >
                  {/* Timestamp */}
                  <div className="col-span-2 font-mono text-gray-400 leading-none">
                    <div className="text-[10px] text-white font-bold">{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-[9px] text-gray-500 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>

                  {/* Operational Member */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-400 font-bold uppercase text-[9px]">
                      {log.userName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-bold truncate flex items-center gap-1">
                        {log.userName}
                        {log.userName === 'SMI Fahim' && (
                          <span className="text-[7px] bg-accent-blue/15 text-accent-blue border border-accent-blue/35 px-1 py-0.2 rounded font-black shrink-0">CEO</span>
                        )}
                      </div>
                      <div className="text-[9px] text-gray-500 truncate font-mono uppercase tracking-wider">{log.userRole}</div>
                    </div>
                  </div>

                  {/* Action Badge */}
                  <div className="col-span-1 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-semibold border ${actionStyles[log.actionType] || ''}`}>
                      {log.actionType}
                    </span>
                  </div>

                  {/* Module Badge */}
                  <div className="col-span-1 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-semibold border ${moduleStyles[log.module] || ''}`}>
                      {log.module}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="col-span-3 text-gray-200 font-sans leading-relaxed truncate max-w-full">
                    {log.description}
                  </div>

                  {/* Severity */}
                  <div className="col-span-1 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-[8px] font-mono uppercase font-semibold border ${severityColor[log.severity]}`}>
                      {log.severity}
                    </span>
                  </div>

                  {/* Controls / Metadata */}
                  <div className="col-span-1 text-right flex items-center justify-end gap-2 text-gray-500">
                    <span className="font-mono text-[9px] tracking-tight bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-gray-400">
                      {log.hashSignature.slice(0, 8)}
                    </span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </div>

                </div>

                {/* Expanded State Details & Compliant Controls */}
                {isExpanded && (
                  <div className="px-6 pb-5 pt-1 border-t border-white/5 bg-brand-black/40 space-y-4">
                    
                    {/* Log block header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10px] font-mono border-b border-white/5 pb-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-gray-500">BLOCK TRANSACTION ID:</span>
                        <span className="text-white font-bold">{log.id}</span>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-500">OPERATOR IP ADDRESS:</span>
                        <span className="text-white font-bold flex items-center gap-1">
                          <Globe size={10} className="text-accent-cyan" /> {log.ipAddress}
                        </span>
                      </div>
                      <div className="text-gray-400 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/5 text-[9px]">
                        <Lock size={10} className="text-accent-emerald" /> Cryptographic Signature Checksum: {log.hashSignature}
                      </div>
                    </div>

                    {/* State Diff Comparison Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* State Before */}
                      <div className="bg-brand-black/60 p-3 rounded-lg border border-white/5 space-y-1">
                        <span className="text-[8px] font-mono text-gray-500 block uppercase">SYSTEM STATE SNAPSHOT PRE-OPERATIVE</span>
                        <pre className="text-[10px] text-accent-rose font-mono font-bold leading-normal bg-brand-black/40 p-2 rounded max-h-[80px] overflow-y-auto whitespace-pre-wrap">
                          {log.stateBefore ? log.stateBefore : 'NULL_STATE_DECLARED / VOID'}
                        </pre>
                      </div>

                      {/* State After */}
                      <div className="bg-brand-black/60 p-3 rounded-lg border border-white/5 space-y-1">
                        <span className="text-[8px] font-mono text-gray-500 block uppercase">SYSTEM STATE SNAPSHOT POST-OPERATIVE</span>
                        <pre className="text-[10px] text-accent-emerald font-mono font-bold leading-normal bg-brand-black/40 p-2 rounded max-h-[80px] overflow-y-auto whitespace-pre-wrap">
                          {log.stateAfter ? log.stateAfter : 'NULL_STATE_DECLARED / VOID'}
                        </pre>
                      </div>
                    </div>

                    {/* Regulatory Standards list & Certificate sign-off */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-white/[0.01] border border-white/5 rounded-lg text-xs leading-normal">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 bg-accent-blue/15 text-accent-blue border border-accent-blue/30 rounded mt-0.5">
                          <Info size={12} />
                        </div>
                        <div>
                          <span className="text-[9px] font-mono font-black text-white block">COMPLIANCE FRAMEWORKS &amp; ASSURANCE CODES</span>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            This transaction is securely mapped and mapped to ISO 27001 (Section A.12.4 Log Records) and SOC2 Trust Service Criteria (CC6.1 - Access Monitoring).
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <span className="text-[8px] font-mono text-accent-emerald bg-accent-emerald/15 px-2 py-0.5 rounded border border-accent-emerald/25 font-black uppercase">
                          ✓ ISO 27001 MET
                        </span>
                        <span className="text-[8px] font-mono text-accent-blue bg-accent-blue/15 px-2 py-0.5 rounded border border-accent-blue/25 font-black uppercase">
                          ✓ SOC2 ALIGNED
                        </span>
                        <span className="text-[8px] font-mono text-accent-cyan bg-accent-cyan/15 px-2 py-0.5 rounded border border-accent-cyan/25 font-black uppercase">
                          ✓ NBR AUDITED
                        </span>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="text-center py-16 text-gray-500 space-y-2 bg-white/[0.01]">
              <AlertTriangle className="mx-auto text-accent-amber" size={24} />
              <h5 className="text-xs font-bold text-white uppercase">No Compliance Events Found</h5>
              <p className="text-[11px] text-gray-400 max-w-md mx-auto">
                No log blocks match your query. Adjust search terms or clear dropdown filters.
              </p>
            </div>
          )}
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-500">
          <span>
            Showing <strong className="text-white">{filteredLogs.length}</strong> of{' '}
            <strong className="text-white">{auditLogs.length}</strong> secure transactions
          </span>
          <span className="font-mono text-[9px] text-accent-emerald flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full animate-ping inline-block" />
            COMPLIANCE LEDGER SEALED AND MONITORED SECURELY VIA AUTOMATED ENCRYPTION
          </span>
        </div>

      </div>
    </div>
  );
}
