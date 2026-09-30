import React from 'react';
import { CheckCircle2, Loader2, Sparkles, Database, TrendingUp, ShieldAlert, ShoppingBag, Cpu } from 'lucide-react';

export default function AgentExecutionStream({ activeNode, logs = [], isRunning }) {
  const steps = [
    { id: 'sales_analyst', label: 'Sales Analyst', icon: Database, desc: 'Clean CSV, date validation, velocity & season metrics' },
    { id: 'demand_forecaster', label: 'Demand Forecaster', icon: TrendingUp, desc: 'Statsmodels ETS & Sparse Category Fallback (7/14/30d)' },
    { id: 'inventory_strategist', label: 'Inventory Strategist', icon: ShieldAlert, desc: 'Stockout risk, lead times, safety buffers & dead capital' },
    { id: 'marketing_advisor', label: 'Marketing Advisor', icon: ShoppingBag, desc: 'Single high-impact promotion & friend-to-friend trade-offs' },
    { id: 'orchestrator', label: 'Orchestrator', icon: Cpu, desc: 'Conflict resolution, executive summary & report finalization' },
  ];

  const getNodeStatus = (stepId, index) => {
    const activeIndex = steps.findIndex((s) => s.id === activeNode);
    if (!isRunning) return 'done';
    if (activeIndex === -1) return 'pending';
    if (index < activeIndex) return 'done';
    if (index === activeIndex) return 'running';
    return 'pending';
  };

  return (
    <div className="kirana-card p-6 rounded-2xl border border-panel-border mb-8 shadow-card-elevated">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse" />
          <h4 className="text-sm font-headline font-bold text-[#f0f6f3]">
            LangGraph Multi-Agent State Handoff Pipeline
          </h4>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-panel-light text-amber border border-panel-border">
          {isRunning ? `Running: ${activeNode || 'Initializing'}` : 'Pipeline Ready'}
        </span>
      </div>

      {/* Steps Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const status = getNodeStatus(step.id, idx);

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all duration-300 relative ${
                status === 'running'
                  ? 'bg-amber/10 border-amber ring-2 ring-amber/20'
                  : status === 'done'
                  ? 'bg-panel-light/70 border-emerald-500/30'
                  : 'bg-panel/40 border-panel-border/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    status === 'running'
                      ? 'bg-amber text-[#12211c]'
                      : status === 'done'
                      ? 'bg-emerald-500/20 text-emerald-accent'
                      : 'bg-panel text-sage'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {status === 'running' && <Loader2 className="w-4 h-4 text-amber animate-spin" />}
                {status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-accent" />}
              </div>

              <div className="text-xs font-bold text-[#f0f6f3] truncate">{step.label}</div>
              <div className="text-[10px] text-sage leading-tight line-clamp-2 mt-0.5">{step.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Terminal Live State Logs */}
      <div className="bg-[#0e1a16] p-3.5 rounded-xl border border-panel-border/80 font-mono text-xs max-h-36 overflow-y-auto">
        <div className="text-[11px] text-sage/70 mb-1 border-b border-panel-border/40 pb-1 flex items-center justify-between">
          <span>REAL-TIME AGENT LOG STREAM</span>
          <span>Explicit State Handoff</span>
        </div>
        {logs.length === 0 ? (
          <div className="text-sage/50 text-[11px] py-1">Waiting for agent execution trigger...</div>
        ) : (
          logs.slice(-5).map((log, i) => (
            <div key={i} className="py-0.5 text-sage flex items-start gap-2">
              <span className="text-amber shrink-0 font-bold">[{log.agent || 'SYSTEM'}]</span>
              <span className="text-[#e2e8f0]">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
