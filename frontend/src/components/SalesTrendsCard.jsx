import React from 'react';
import { TrendingUp, BarChart3, Calendar, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function SalesTrendsCard({ salesSummary, onSelectSku }) {
  if (!salesSummary) return null;

  const {
    total_revenue = 0,
    total_units_sold = 0,
    active_skus_count = 0,
    best_sellers_revenue = [],
    worst_sellers_units = [],
    category_metrics = [],
    day_of_week_patterns = [],
    analyst_insights = ''
  } = salesSummary;

  return (
    <div className="kirana-card rounded-2xl border border-panel-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-panel-border bg-panel-light/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-amber font-semibold uppercase tracking-wider">
              AGENT A: SALES ANALYST
            </div>
            <h3 className="text-base font-headline font-bold text-[#f0f6f3]">
              Sales Velocity & Rhythm
            </h3>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-accent border border-emerald-500/30 font-medium">
          {active_skus_count} SKUs Analyzed
        </span>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Core Revenue Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-panel-light/60 border border-panel-border">
            <div className="text-[11px] text-sage mb-0.5">Total Revenue Ingested</div>
            <div className="text-xl font-headline font-bold text-amber">
              {formatCurrency(total_revenue)}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-panel-light/60 border border-panel-border">
            <div className="text-[11px] text-sage mb-0.5">Total Units Sold</div>
            <div className="text-xl font-headline font-bold text-[#f0f6f3]">
              {formatNumber(total_units_sold)}
            </div>
          </div>
        </div>

        {/* Day of Week Seasonality Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-sage uppercase tracking-wider">
              Day-of-Week Shopping Rhythm
            </h4>
            <span className="text-[10px] text-amber font-mono">Weekend Surge</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl bg-[#14231e] border border-panel-border">
            {day_of_week_patterns.map((dow) => {
              const isWeekend = dow.day_name === 'Saturday' || dow.day_name === 'Sunday';
              return (
                <div key={dow.day_name} className="flex flex-col items-center">
                  <div className="h-16 w-full flex items-end justify-center py-1">
                    <div
                      style={{ height: `${Math.max(15, dow.share_of_week_pct * 4.5)}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        isWeekend ? 'bg-amber' : 'bg-sage/40'
                      }`}
                      title={`${dow.day_name}: ${dow.share_of_week_pct}% (${formatCurrency(dow.avg_daily_revenue)}/day)`}
                    />
                  </div>
                  <span className={`text-[10px] font-mono mt-1 ${isWeekend ? 'text-amber font-bold' : 'text-sage'}`}>
                    {dow.day_name.slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Contribution */}
        <div>
          <h4 className="text-xs font-semibold text-sage uppercase tracking-wider mb-2">
            Category Share & Momentum
          </h4>
          <div className="space-y-2">
            {category_metrics.map((cat) => (
              <div key={cat.category} className="p-2.5 rounded-xl bg-panel-light/40 border border-panel-border/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[#f0f6f3]">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber">{formatCurrency(cat.total_revenue)}</span>
                    <span className="text-sage text-[10px]">({cat.revenue_share_pct}%)</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#12211c] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.revenue_share_pct}%` }}
                    className="h-full bg-emerald-accent rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Velocity Movers */}
        <div>
          <h4 className="text-xs font-semibold text-sage uppercase tracking-wider mb-2">
            Top Revenue Anchors
          </h4>
          <div className="space-y-1.5">
            {best_sellers_revenue.slice(0, 3).map((item) => (
              <div
                key={item.sku}
                onClick={() => onSelectSku(item.sku)}
                className="flex items-center justify-between p-2 rounded-lg bg-panel/70 hover:bg-panel-light border border-panel-border/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs text-[#f0f6f3] font-medium group-hover:text-amber truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber shrink-0 ml-2">
                  {formatCurrency(item.total_revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
