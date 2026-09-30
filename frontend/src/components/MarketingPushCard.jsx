import React from 'react';
import { Sparkles, Calendar, Tag, ArrowRight, Check, TrendingUp, Layers } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function MarketingPushCard({ marketing, onSelectSku }) {
  if (!marketing || !marketing.selected_promotion) return null;

  const promo = marketing.selected_promotion;

  return (
    <div className="kirana-card rounded-2xl border border-amber/40 bg-gradient-to-b from-[#21382e] to-[#172922] overflow-hidden shadow-glow-amber h-full flex flex-col relative">
      {/* Accent corner sparkle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="p-5 border-b border-amber/20 bg-amber/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber text-[#12211c] flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-amber font-semibold uppercase tracking-wider">
              AGENT D: MARKETING ADVISOR
            </div>
            <h3 className="text-base font-headline font-bold text-[#f0f6f3]">
              This Week's Single Focused Push
            </h3>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber/20 text-amber font-semibold border border-amber/30">
          Single Pick
        </span>
      </div>

      <div className="p-5 space-y-5 flex-1 flex flex-col justify-between">
        {/* Promotion Hero Title & Badges */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber/20 text-amber border border-amber/40">
              {promo.promo_type}
            </span>
            <span className="text-xs text-sage flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber" />
              {promo.target_days}
            </span>
          </div>

          <h4 className="text-xl font-headline font-bold text-[#f0f6f3] mb-3 leading-snug">
            {promo.promo_title}
          </h4>

          {/* Pricing & SKU Highlight */}
          <div className="p-3.5 rounded-xl bg-[#12211c]/80 border border-panel-border/80 flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] text-sage">Featured Product(s)</div>
              <div className="text-sm font-bold text-[#f0f6f3]">
                {promo.primary_sku_name}
                {promo.paired_sku_name && (
                  <span className="text-amber"> + {promo.paired_sku_name}</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-sage">Suggested Offer</div>
              <div className="text-base font-headline font-bold text-amber">
                {promo.discount_pct}% Off ({formatCurrency(promo.suggested_retail_price)})
              </div>
            </div>
          </div>

          {/* Plain Language Friend-to-Friend Rationale */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-sage uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>Why this decision (Mentor Perspective):</span>
            </div>
            <p className="text-xs text-[#f0f6f3] bg-[#162720] p-3.5 rounded-xl border border-panel-border/60 leading-relaxed italic">
              "{promo.rationale_plain_language}"
            </p>
          </div>

          {/* Operational Trade-off */}
          <div className="p-3 rounded-xl bg-panel-light/40 border border-panel-border text-xs text-sage">
            <span className="text-amber font-semibold block mb-0.5">The Direct Trade-off:</span>
            <span>{promo.tradeoff_explanation}</span>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="pt-3 border-t border-panel-border/60 flex items-center justify-between">
          <div className="text-[11px] text-emerald-accent font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{promo.projected_revenue_lift.slice(0, 42)}...</span>
          </div>

          <button
            onClick={() => onSelectSku(promo.primary_sku)}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber hover:text-amber-light transition-colors"
          >
            <span>Explain SKU Logic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
