import React, { useState, useMemo } from 'react';
import { Search, Filter, HelpCircle, ArrowUpDown, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { formatCurrency, getUrgencyBadge } from '../utils/formatters';

export default function SkuTable({ report, onSelectSku }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');

  const skuList = useMemo(() => {
    if (!report || !report.sales_summary) return [];

    const metricsMap = report.sales_summary.sku_metrics_map || {};
    const forecastsMap = report.forecast_report?.sku_forecasts || {};
    const alertsMap = report.strategist?.all_sku_alerts || {};

    return Object.keys(metricsMap).map((sku) => {
      const metric = metricsMap[sku];
      const forecast = forecastsMap[sku];
      const alert = alertsMap[sku];

      return {
        sku,
        name: metric.name || sku,
        category: metric.category,
        current_stock: metric.current_stock,
        daily_velocity: metric.daily_velocity_7d,
        days_of_stock_left: alert ? alert.days_of_stock_left : 99,
        urgency: alert ? alert.urgency : 'HEALTHY',
        forecast_7d: forecast ? forecast.forecast_7d : 0,
        forecast_method: forecast ? forecast.method_used : 'N/A',
        is_sparse: forecast ? forecast.is_sparse : false,
        suggested_reorder: alert ? alert.suggested_reorder_qty : 0,
        margin_pct: alert ? alert.margin_pct : 25,
      };
    });
  }, [report]);

  const categories = useMemo(() => {
    const set = new Set(skuList.map((s) => s.category));
    return ['ALL', ...Array.from(set)];
  }, [skuList]);

  const filteredSkus = useMemo(() => {
    return skuList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesUrgency =
        selectedUrgency === 'ALL' ||
        (selectedUrgency === 'STOCKOUT' && (item.urgency === 'CRITICAL' || item.urgency === 'WARNING')) ||
        (selectedUrgency === 'CLEARANCE' && item.urgency === 'CLEARANCE_EXPIRY') ||
        (selectedUrgency === 'OVERSTOCK' && item.urgency === 'OVERSTOCK') ||
        (selectedUrgency === 'HEALTHY' && item.urgency === 'HEALTHY');

      return matchesSearch && matchesCategory && matchesUrgency;
    });
  }, [skuList, searchQuery, selectedCategory, selectedUrgency]);

  return (
    <div className="kirana-card rounded-2xl border border-panel-border overflow-hidden mb-12 shadow-card-elevated">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-panel-border bg-panel-light/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-headline font-bold text-[#f0f6f3]">
              SKU Inventory & Multi-Agent Forecasting Ledger
            </h3>
            <p className="text-xs text-sage">
              Comprehensive inventory status across all catalog items with ML time-series forecasts and AI reasoning.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-sage absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU or item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#12211c] border border-panel-border text-xs text-[#f0f6f3] placeholder-sage/60 focus:outline-none focus:border-amber transition-colors"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-sage mr-2">
            <Filter className="w-3.5 h-3.5 text-amber" />
            <span>Filter:</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#12211c] border border-panel-border text-xs text-[#f0f6f3] focus:outline-none focus:border-amber"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Urgency Filter buttons */}
          {[
            { id: 'ALL', label: 'All SKUs' },
            { id: 'STOCKOUT', label: '🚨 Stockout Risks' },
            { id: 'CLEARANCE', label: '⚠️ Clearance / Expiry' },
            { id: 'OVERSTOCK', label: '📦 Overstock' },
            { id: 'HEALTHY', label: '✓ Balanced' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedUrgency(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedUrgency === pill.id
                  ? 'bg-amber text-[#12211c] font-bold shadow-glow-amber'
                  : 'bg-panel-light text-sage hover:text-[#f0f6f3] border border-panel-border'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-sage">
          <thead className="bg-[#14241f] text-sage/80 font-mono uppercase tracking-wider text-[11px] border-b border-panel-border">
            <tr>
              <th className="py-3 px-4 font-semibold">SKU & Item Name</th>
              <th className="py-3 px-3 font-semibold">Category</th>
              <th className="py-3 px-3 font-semibold">Stock</th>
              <th className="py-3 px-3 font-semibold">Burn Rate</th>
              <th className="py-3 px-3 font-semibold">Days Left</th>
              <th className="py-3 px-3 font-semibold">7d Forecast</th>
              <th className="py-3 px-3 font-semibold">Urgency Status</th>
              <th className="py-3 px-3 font-semibold">Recommended Action</th>
              <th className="py-3 px-4 font-semibold text-right">Explainability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border/50 font-sans">
            {filteredSkus.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-sage">
                  No SKUs matched the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredSkus.map((item) => {
                const badge = getUrgencyBadge(item.urgency);
                return (
                  <tr
                    key={item.sku}
                    className="hover:bg-panel-light/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectSku(item.sku)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#f0f6f3] group-hover:text-amber transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-sage/70">{item.sku}</div>
                    </td>

                    <td className="py-3.5 px-3 text-[#f0f6f3]">{item.category}</td>

                    <td className="py-3.5 px-3 font-semibold text-[#f0f6f3]">
                      {item.current_stock} units
                    </td>

                    <td className="py-3.5 px-3 text-sage">
                      {item.daily_velocity.toFixed(1)} /day
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`font-mono font-bold ${
                          item.days_of_stock_left <= 3
                            ? 'text-red-400'
                            : item.days_of_stock_left <= 7
                            ? 'text-amber'
                            : 'text-emerald-accent'
                        }`}
                      >
                        {item.days_of_stock_left > 90 ? '90+d' : `${item.days_of_stock_left}d`}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#f0f6f3]">{item.forecast_7d} units</div>
                      <span className="text-[10px] font-mono text-sage/70">
                        {item.is_sparse ? 'Sparse Heuristic' : 'Statsmodels ETS'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {item.suggested_reorder > 0 ? (
                        <span className="text-amber font-bold">
                          Reorder +{item.suggested_reorder} units
                        </span>
                      ) : item.urgency === 'CLEARANCE_EXPIRY' ? (
                        <span className="text-orange-400 font-bold">
                          20% Clearance Markdown
                        </span>
                      ) : (
                        <span className="text-emerald-accent font-medium">Balanced Stock</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSku(item.sku);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-panel hover:bg-amber text-sage hover:text-[#12211c] border border-panel-border transition-all text-xs font-semibold"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Why?</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
