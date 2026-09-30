import React from 'react';
import { Sparkles, Upload, Play, Package, TrendingUp, ShieldAlert, ArrowRight, BarChart3, Store, Coffee, ShoppingCart, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import { playButtonClick } from '../utils/soundEffects';

export default function HeroSection({ onLoadDemo, onOpenUpload, isGenerating, onSelectSku }) {
  const kiranaSampleHighlights = [
    {
      sku: 'SKU-STAPLE-01',
      name: 'Royal Basmati Rice 5kg',
      category: 'Staples & Grains',
      price: '₹380',
      stock: '12 bags',
      burn: '4.8 /day',
      status: '🚨 Stockout in 2.6d',
      tagColor: 'bg-red-500/15 text-red-300 border-red-500/30',
      action: 'Reorder +55 units'
    },
    {
      sku: 'SKU-DAIRY-06',
      name: 'Organic Paneer 200g',
      category: 'Dairy & Perishables',
      price: '₹120',
      stock: '38 units',
      burn: '1.5 /day',
      status: '⚠️ 7d Expiry Risk',
      tagColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      action: '20% Weekend Promo'
    },
    {
      sku: 'SKU-SNACK-03',
      name: 'Masala Chai Blend 250g',
      category: 'Snacks & Beverages',
      price: '₹190',
      stock: '45 packs',
      burn: '5.2 /day',
      status: '💡 62% Margin Cow',
      tagColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      action: 'Chai + Biscuit Bundle'
    },
    {
      sku: 'SKU-CARE-01',
      name: 'Floral Detergent 2kg',
      category: 'Personal & Home Care',
      price: '₹185',
      stock: '35 units',
      burn: '2.8 /day',
      status: '✓ Balanced Stock',
      tagColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      action: 'Steady Hold'
    }
  ];

  return (
    <div className="relative overflow-hidden pt-6 pb-16">
      {/* 3D Atmospheric Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-coral/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1b2d26]/90 border border-amber/40 text-amber text-xs font-semibold uppercase tracking-wider shadow-glow-amber backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber animate-ping" />
            <Package className="w-3.5 h-3.5 text-amber" />
            <span>AI Copilot for Kirana, Boutiques & Cafes</span>
          </div>
        </div>

        {/* Main Headline & Intro */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-headline font-bold text-[#f0f6f3] tracking-tight leading-[1.12] mb-6">
            Stop Guessing.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber via-amber-light to-[#f0f6f3] italic">
              Know Exactly
            </span>{' '}
            What to Stock, Clear & Promote.
          </h1>

          <p className="text-base sm:text-lg text-sage font-normal max-w-2xl mx-auto leading-relaxed mb-8">
            Independent retailers lose thousands in dead stock and missed sales every month. Feed in your daily sales transactions and let 5 LangGraph AI agents do the inventory math, demand forecasting, and weekly strategy.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                playButtonClick();
                onLoadDemo();
              }}
              disabled={isGenerating}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-amber hover:bg-amber-light text-[#12211c] font-bold text-sm transition-all duration-200 shadow-glow-amber hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isGenerating ? 'Synthesizing Kirana Store Data...' : 'Run Kirana Store Simulation'}</span>
            </button>

            <button
              onClick={() => {
                playButtonClick();
                onOpenUpload();
              }}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-panel/90 hover:bg-panel-light text-[#f0f6f3] border border-panel-border hover:border-amber/50 font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md"
            >
              <Upload className="w-4 h-4 text-amber" />
              <span>Upload Custom Sales CSV</span>
            </button>
          </div>
        </div>

        {/* Interactive Live Kirana Catalog Showcase Card */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="kirana-card rounded-2xl border border-panel-border p-5 sm:p-6 shadow-card-elevated relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-panel-border/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber/20 border border-amber/40 flex items-center justify-center text-amber">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-headline font-bold text-[#f0f6f3]">
                    Live Kirana Sales Stream Preview (<span className="text-amber font-mono">sample_kirana_store_sales.csv</span>)
                  </h3>
                  <p className="text-[11px] text-sage">
                    Instant mathematical ingestion: daily transactions → burn rate → 7d forecast → stock risk
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-panel text-amber border border-panel-border self-start sm:self-auto">
                Real-Time State Handoff
              </span>
            </div>

            {/* 4 SKU Mini Live Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {kiranaSampleHighlights.map((item) => (
                <div
                  key={item.sku}
                  onClick={() => {
                    playButtonClick();
                    if (onSelectSku) onSelectSku(item.sku);
                  }}
                  className="p-3.5 rounded-xl bg-[#14241e]/90 hover:bg-panel-light border border-panel-border hover:border-amber/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.tagColor}`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] font-mono text-sage/70">{item.price}</span>
                  </div>

                  <div className="text-xs font-bold text-[#f0f6f3] group-hover:text-amber transition-colors line-clamp-1 mb-1">
                    {item.name}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-sage mb-2.5 py-1 border-y border-panel-border/40">
                    <div>Stock: <span className="font-semibold text-[#f0f6f3]">{item.stock}</span></div>
                    <div>Burn: <span className="font-semibold text-amber">{item.burn}</span></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-amber-light font-medium pt-1">
                    <span className="truncate">{item.action}</span>
                    <ArrowRight className="w-3 h-3 text-amber group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Core Agent Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {/* Pillar 1 */}
          <div className="kirana-card p-6 rounded-2xl border border-panel-border hover:border-amber/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-mono font-bold text-amber uppercase mb-1">
              AGENT 1 & 2 • FORECASTING
            </div>
            <h3 className="text-lg font-headline font-bold text-[#f0f6f3] mb-2">
              Time-Series & Sparse Fallback
            </h3>
            <p className="text-xs text-sage leading-relaxed">
              Statsmodels ETS & Ridge regression compute 7/14/30-day demand curves with automatic sparse heuristics for newly launched items.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="kirana-card p-6 rounded-2xl border border-panel-border hover:border-coral/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-coral/15 border border-coral/30 flex items-center justify-center text-coral mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-mono font-bold text-coral uppercase mb-1">
              AGENT 3 • INVENTORY STRATEGY
            </div>
            <h3 className="text-lg font-headline font-bold text-[#f0f6f3] mb-2">
              Lead Time & Spoilage Protection
            </h3>
            <p className="text-xs text-sage leading-relaxed">
              Calculates safety stock buffers, flags stockout cliffs before supplier delivery lag, and prevents perishable spoilage loss.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="kirana-card p-6 rounded-2xl border border-panel-border hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-accent mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-mono font-bold text-emerald-accent uppercase mb-1">
              AGENT 4 & 5 • ACTION & Q&A
            </div>
            <h3 className="text-lg font-headline font-bold text-[#f0f6f3] mb-2">
              Single Weekly Push & Explainability
            </h3>
            <p className="text-xs text-sage leading-relaxed">
              Selects ONE focused promotion with plain-language financial trade-offs, and answers "Why this pick?" on-demand without re-running pipelines.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="scroll-3d-indicator mb-2">
            <div className="scroll-3d-wheel" />
          </div>
          <span className="text-[11px] font-mono text-sage/70 tracking-wider uppercase">
            Scroll to View LangGraph Multi-Agent Report
          </span>
        </div>

      </div>
    </div>
  );
}
