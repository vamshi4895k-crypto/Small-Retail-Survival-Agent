import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, RefreshCw, PackageX, Sparkles } from 'lucide-react';
import { formatCurrency, getUrgencyBadge } from '../utils/formatters';

export default function StockAlertsCard({ strategist, onSelectSku }) {
  if (!strategist) return null;

  const {
    stockout_risks = [],
    clearance_candidates = [],
    overstock_candidates = [],
    total_capital_in_dead_stock = 0,
    total_reorder_investment_needed = 0,
    strategic_summary = ''
  } = strategist;

  return (
    <div className="kirana-card rounded-2xl border border-panel-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-panel-border bg-panel-light/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-coral/15 border border-coral/30 flex items-center justify-center text-coral">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-coral font-semibold uppercase tracking-wider">
              AGENT C: INVENTORY STRATEGIST
            </div>
            <h3 className="text-base font-headline font-bold text-[#f0f6f3]">
              Stock Alerts & Reorder Plan
            </h3>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-medium">
          {stockout_risks.length} Urgent Restocks
        </span>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Strategic Reasoning Narrative */}
        <div className="p-3.5 rounded-xl bg-[#14231e] border border-panel-border text-xs text-sage leading-relaxed">
          <span className="text-amber font-semibold">Strategist Grounding: </span>
          {strategic_summary}
        </div>

        {/* Capital Summary Pills */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-panel-light/60 border border-panel-border">
            <div className="text-[11px] text-sage mb-0.5">Reorder Cash Required</div>
            <div className="text-lg font-headline font-bold text-amber">
              {formatCurrency(total_reorder_investment_needed)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-panel-light/60 border border-panel-border">
            <div className="text-[11px] text-sage mb-0.5">Sluggish / Dead Stock</div>
            <div className="text-lg font-headline font-bold text-coral">
              {formatCurrency(total_capital_in_dead_stock)}
            </div>
          </div>
        </div>

        {/* Critical Stockouts List */}
        <div>
          <h4 className="text-xs font-semibold text-sage uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>🚨 Impending Stockout Hazards</span>
            <span className="text-[10px] text-sage/70">Runs out before supplier lead time</span>
          </h4>

          <div className="space-y-2.5">
            {stockout_risks.length === 0 ? (
              <div className="p-3 rounded-xl bg-panel-light/30 text-xs text-sage text-center">
                All fast-moving staples are currently stocked within safe buffer thresholds.
              </div>
            ) : (
              stockout_risks.slice(0, 3).map((item) => (
                <div
                  key={item.sku}
                  onClick={() => onSelectSku(item.sku)}
                  className="p-3.5 rounded-xl bg-[#182a23] border border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-bold text-[#f0f6f3] group-hover:text-amber transition-colors">
                      {item.name}
                    </span>
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                      {item.days_of_stock_left}d Left
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-sage my-2 bg-panel/60 p-2 rounded-lg">
                    <div>
                      <span className="text-sage/70 block">Current Stock</span>
                      <span className="font-semibold text-[#f0f6f3]">{item.current_stock} units</span>
                    </div>
                    <div>
                      <span className="text-sage/70 block">Lead Time</span>
                      <span className="font-semibold text-[#f0f6f3]">{item.lead_time_days} days</span>
                    </div>
                    <div>
                      <span className="text-sage/70 block">Order Rec.</span>
                      <span className="font-semibold text-amber">+{item.suggested_reorder_qty} units</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-sage/90 line-clamp-2">
                    {item.reasoning_rationale}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clearance Candidates (Perishables / Dead stock) */}
        {clearance_candidates.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-sage uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>⚠️ Perishable Spoilage / Clearance Risk</span>
              <span className="text-[10px] text-orange-400 font-medium">Act before shelf expiry</span>
            </h4>

            <div className="space-y-2">
              {clearance_candidates.slice(0, 2).map((item) => (
                <div
                  key={item.sku}
                  onClick={() => onSelectSku(item.sku)}
                  className="p-3 rounded-xl bg-[#192b24] border border-orange-500/20 hover:border-orange-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-bold text-[#f0f6f3] group-hover:text-amber">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-semibold text-orange-300">
                      {formatCurrency(item.capital_tied_up)} at risk
                    </span>
                  </div>
                  <p className="text-[11px] text-sage line-clamp-2">
                    {item.reasoning_rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
