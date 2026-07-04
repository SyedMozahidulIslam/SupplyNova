import React, { useState } from 'react';
import { Brain, Sparkles, Send, ShieldAlert, CheckCircle, HelpCircle, Shuffle, ChevronRight } from 'lucide-react';
import { AiStrategySuggestion } from '../types';
import { AI_STRATEGIES } from '../data/mockData';

interface AiAdvisorProps {
  onApplyStrategy: (strategyId: string) => void;
}

export default function AiAdvisor({ onApplyStrategy }: AiAdvisorProps) {
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: "Salutations. I am SupplyNova's Executive AI SCM Optimizer. Ask me to formulate strategies for festival demands (Eid, Ramadan), optimize reorder points, reduce freight fuel consumption, or evaluate supplier risk ratings." }
  ]);
  const [appliedStrategies, setAppliedStrategies] = useState<string[]>([]);

  const handleApply = (id: string) => {
    onApplyStrategy(id);
    setAppliedStrategies([...appliedStrategies, id]);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMsg = chatQuery;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatQuery('');

    // Generate responsive smart enterprise SCM replies!
    setTimeout(() => {
      let reply = "I have analyzed your query based on our active logistics telemetry database. Could you clarify which region or product category you want to evaluate?";
      const lower = userMsg.toLowerCase();
      if (lower.includes('eid') || lower.includes('festival') || lower.includes('ramadan')) {
        reply = "Strategic SCM Model for Festival demands: During Eid-ul-Fitr, local transport rules restrict daytime heavy hauls. We suggest shifting all PRAN and Unilever bulk stock transfers to night windows (10 PM to 5 AM) on the N1/N5 highways. Raising regional safety stock levels by 30% avoids stockouts caused by high distributor latency.";
      } else if (lower.includes('fuel') || lower.includes('route') || lower.includes('optimize')) {
        reply = "Active Route Telemetry Optimization: Sino-trackers show traffic congested on the N1 highway at Feni bypass. Diverting refrigerated reefers through the Comilla-Chandpur-Lakshmipur bypass is estimated to cut fuel burn by 18% and save 110 idle-minutes, reducing transport overhead by BDT 4,200 per haul.";
      } else if (lower.includes('insulin') || lower.includes('cold') || lower.includes('temp')) {
        reply = "Cold Chain SCM Safety Assessment: Strict HACCP parameters dictate biological pharmaceuticals (Insulin Glargine) remain within 2.0°C to 8.0°C. In case of telemetry anomalies, the system automatically triggers an emergency cooling signal to the vehicle's secondary electrical compressor, protecting asset value.";
      } else if (lower.includes('soap') || lower.includes('lotion') || lower.includes('safety') || lower.includes('stock')) {
        reply = "Inventory Reorder Parameter Analysis: For high-demand Vaseline Healthy White, raising minSafetyStock thresholds to 4,200 units at Tejgaon hub avoids stock deficits during transit delays. Auto-procure rules will trigger purchase orders to Unilever when inventory levels fall below 4,500.";
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* SCM Advisor Header */}
      <div className="p-6 rounded border border-white/10 bg-white/5 flex items-start gap-4">
        <div className="w-12 h-12 rounded bg-accent-blue flex items-center justify-center text-white shrink-0">
          <Brain size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
            AI Decision Optimizer <span className="text-accent-cyan text-[10px] font-black uppercase tracking-widest bg-accent-cyan/10 px-2 py-1 rounded">Co-Pilot v2.4</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-wider">
            Formulate strategic festival demand forecasts, optimize material reorder points, minimize hauler fuel burn rates, and mitigate supply chain risk vectors
          </p>
        </div>
      </div>

      {/* Grid: AI Strategy Presets vs Conversational Chat Co-Pilot */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Col: Strategy Suggestion Presets */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-cyan" />
            <h3 className="text-sm font-bold text-white font-display">Simulated AI Strategy Optimizations</h3>
          </div>

          <div className="space-y-4">
            {AI_STRATEGIES.map(strat => {
              const applied = appliedStrategies.includes(strat.id);
              return (
                <div
                  key={strat.id}
                  className={`p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                    applied
                      ? 'bg-accent-emerald/[0.02] border-accent-emerald/30'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/[0.01] rounded-full filter blur-2xl group-hover:bg-accent-blue/[0.03]"></div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-accent-cyan uppercase">{strat.topic}</h4>
                      <p className="text-xs text-white/50 mt-1 font-mono">SCM Scenario: "{strat.prompt}"</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded">
                      Confidence: {strat.confidenceScore}%
                    </span>
                  </div>

                  {/* Recommendation Text */}
                  <div className="bg-brand-black/50 border border-white/5 p-4 rounded-xl mt-4 text-[11px] text-white/80 whitespace-pre-line leading-relaxed">
                    {strat.suggestion}
                  </div>

                  {/* Strategy metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-mono">
                    <div className="bg-white/[0.01] p-2 rounded-lg border border-white/5">
                      <span className="text-white/40 block text-[8px] uppercase">Freight Savings</span>
                      <strong className="text-accent-emerald block mt-0.5">৳ {strat.costReductionPercent}% saved</strong>
                    </div>
                    <div className="bg-white/[0.01] p-2 rounded-lg border border-white/5">
                      <span className="text-white/40 block text-[8px] uppercase">Risk Mitigation</span>
                      <strong className="text-white block mt-0.5 truncate">{strat.riskMitigationValue}</strong>
                    </div>
                    <div className="flex items-center justify-end">
                      {applied ? (
                        <span className="text-[10px] font-bold text-accent-emerald flex items-center gap-1 bg-accent-emerald/10 border border-accent-emerald/20 px-3 py-1.5 rounded-lg">
                          ✓ Strategy Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(strat.id)}
                          className="px-4 py-2 rounded-lg bg-accent-cyan hover:bg-accent-cyan/80 text-black text-[10px] font-bold transition-all cursor-pointer shadow shadow-accent-cyan/10 flex items-center gap-1"
                        >
                          Execute Optimization <ChevronRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Interactive Co-Pilot Conversation Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between h-[600px]">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent-cyan" /> Conversational Co-Pilot
            </h3>
            <p className="text-[10px] text-white/40 mt-1">Chat naturally with SCM decision models</p>
          </div>

          {/* Chat log */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-accent-blue text-white rounded-tr-none'
                      : 'bg-white/[0.03] border border-white/10 text-white/90 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleSendChat} className="flex gap-2 pt-4 border-t border-white/5">
            <input
              type="text"
              placeholder="Query reorder points, N1 traffic bypass, etc..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-accent-cyan hover:bg-accent-cyan/80 text-black cursor-pointer flex items-center justify-center shadow-lg shadow-accent-cyan/10 transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
