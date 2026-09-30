import React from 'react';
import { Sparkles, Bot, RefreshCw, Download, CheckSquare, ShieldAlert, TrendingUp, Calendar, HeartPulse } from 'lucide-react';
import StockAlertsCard from './StockAlertsCard';
import MarketingPushCard from './MarketingPushCard';
import SalesTrendsCard from './SalesTrendsCard';
import ShowcaseBanner from './ShowcaseBanner';
import SkuTable from './SkuTable';
import { formatCurrency } from '../utils/formatters';

export default function WeeklyReportView({
  report,
  onReRunAnalysis,
  onOpenChat,
  onSelectSku,
  selectedSku,
  isAnalyzing
}) {
  if (!report) return null;

  const {
    id = '',
    created_at = '',
    date_range_start = '',
    date_range_end = '',
    executive_summary = '',
    orchestrator,
    sales_summary,
    strategist,
    marketing
  } = report;

  const healthScore = orchestrator?.overall_health_score ?? 85;
  const actionChecklist = orchestrator?.action_checklist ?? [];

  const handleDownloadReport = () => {
    const reportText = `# SMALL RETAIL SURVIVAL AGENT — WEEKLY ACTION REPORT
Report ID: ${id}
Period: ${date_range_start} to ${date_range_end}
Generated: ${new Date(created_at).toLocaleString()}
Store Health Score: ${healthScore}/100

================================================================================
EXECUTIVE SUMMARY
================================================================================
${executive_summary}

================================================================================
ACTION CHECKLIST (BY PRIORITY)
================================================================================
${actionChecklist.map((item, idx) => `[ ] ${idx + 1}. ${item}`).join('\n')}

================================================================================
AGENT D: THIS WEEK'S PROMOTION PUSH
================================================================================
Promo: ${marketing?.selected_promotion?.promo_title}
Offer: ${marketing?.selected_promotion?.discount_pct}% Off (${marketing?.selected_promotion?.suggested_retail_price} suggested)
Timing: ${marketing?.selected_promotion?.target_days}
Trade-off: ${marketing?.selected_promotion?.tradeoff_explanation}

================================================================================
AGENT C: CRITICAL INVENTORY ALERTS
================================================================================
Stockout Hazards: ${strategist?.stockout_risks?.length || 0} items
Reorder Investment Needed: ₹${strategist?.total_reorder_investment_needed || 0}
Dead Capital in Sluggish Stock: ₹${strategist?.total_capital_in_dead_stock || 0}
`;

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `retail_action_report_${id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Actions Bar */}
      <div className="kirana-card p-6 rounded-2xl border border-panel-border mb-8 shadow-card-elevated">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono text-amber font-semibold">REPORT ID: {id}</span>
              <span className="text-xs text-sage">• Generated {new Date(created_at).toLocaleDateString()}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-[#f0f6f3]">
              Weekly Store Action Report
            </h2>
            <p className="text-xs text-sage mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber" />
              <span>Reporting Horizon: {date_range_start} to {date_range_end}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Health Score Pill */}
            <div className="px-4 py-2 rounded-xl bg-[#14241e] border border-panel-border flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-accent flex items-center justify-center font-bold font-mono text-sm">
                {healthScore}
              </div>
              <div>
                <div className="text-[10px] text-sage uppercase font-semibold">Store Health</div>
                <div className="text-xs font-bold text-[#f0f6f3]">
                  {healthScore >= 80 ? 'Robust' : healthScore >= 60 ? 'Needs Attention' : 'Critical Action'}
                </div>
              </div>
            </div>

            {/* Re-run Pipeline Button */}
            <button
              onClick={onReRunAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-panel hover:bg-panel-light text-[#f0f6f3] border border-panel-border text-xs font-semibold transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Re-analyzing...' : 'Refresh Pipeline'}</span>
            </button>

            {/* Ask Copilot Button */}
            <button
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber hover:bg-amber-light text-[#12211c] font-bold text-xs transition-all shadow-glow-amber active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Orchestrator Copilot</span>
            </button>

            {/* Export Report */}
            <button
              onClick={handleDownloadReport}
              className="p-2.5 rounded-xl bg-panel hover:bg-panel-light text-sage hover:text-[#f0f6f3] border border-panel-border transition-colors"
              title="Download Report Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orchestrator Executive Summary */}
      <div className="kirana-card p-6 sm:p-7 rounded-2xl border border-amber/30 bg-gradient-to-r from-[#1c3028] to-[#162720] mb-8 shadow-card-elevated">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber" />
          <span className="text-xs font-mono font-semibold text-amber uppercase tracking-wider">
            AGENT E: ORCHESTRATOR EXECUTIVE BRIEFING
          </span>
        </div>

        <div className="text-sm sm:text-base text-[#f0f6f3] font-body leading-relaxed whitespace-pre-line mb-6">
          {executive_summary}
        </div>

        {/* Prioritized Action Checklist */}
        {actionChecklist.length > 0 && (
          <div className="pt-5 border-t border-panel-border/70">
            <h4 className="text-xs font-semibold text-sage uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-amber" />
              <span>Shop Owner's Priority Checklist</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {actionChecklist.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#12211c]/70 border border-panel-border/60 text-xs text-[#f0f6f3]"
                >
                  <span className="w-5 h-5 rounded-md bg-amber/20 text-amber font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="leading-tight">{task}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3 Deliberately Engineered Showcase Scenarios */}
      <ShowcaseBanner onSelectSku={onSelectSku} selectedSku={selectedSku} />

      {/* 3 Main Agent Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Agent C: Strategist */}
        <StockAlertsCard strategist={strategist} onSelectSku={onSelectSku} />

        {/* Agent D: Marketing Advisor */}
        <MarketingPushCard marketing={marketing} onSelectSku={onSelectSku} />

        {/* Agent A: Sales Analyst */}
        <SalesTrendsCard salesSummary={sales_summary} onSelectSku={onSelectSku} />
      </div>

      {/* Full SKU Inventory & Forecast Ledger Table */}
      <SkuTable report={report} onSelectSku={onSelectSku} />
    </div>
  );
}
