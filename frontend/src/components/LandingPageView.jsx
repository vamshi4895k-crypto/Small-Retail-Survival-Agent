import React, { useState } from 'react';
import { Store, ShoppingCart, Package, Sparkles, TrendingUp, ShieldAlert, ArrowRight, Play, Upload, Scan, Tag, RefreshCw, BarChart2, CheckCircle2, ChevronRight } from 'lucide-react';
import RetailShelfScene from './RetailShelfScene';
import { playButtonClick, playTransition } from '../utils/soundEffects';

export default function LandingPageView({ onEnterDashboard, onLoadDemo, onOpenUpload, onSelectSku, isGenerating }) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const retailItems = [
    {
      sku: 'SKU-STAPLE-01',
      name: 'Royal Basmati Rice 5kg',
      category: 'Staples & Grains',
      price: '₹380',
      stock: 12,
      maxStock: 50,
      burnRate: '4.8 /day',
      leadTime: '7 days',
      urgency: 'CRITICAL',
      status: '🚨 Stockout in 2.6d',
      action: 'Reorder +55 units',
      icon: '🌾',
      tagColor: 'border-red-500/40 bg-red-500/15 text-red-300',
      glow: 'hover:border-red-500 hover:shadow-[0_0_25px_rgba(248,113,113,0.3)]',
    },
    {
      sku: 'SKU-STAPLE-02',
      name: 'Sharbati Whole Wheat Atta 10kg',
      category: 'Staples & Grains',
      price: '₹320',
      stock: 39,
      maxStock: 60,
      burnRate: '6.2 /day',
      leadTime: '5 days',
      urgency: 'HEALTHY',
      status: '✓ Healthy Supply',
      action: 'Stocked for 6.5d',
      icon: '🍞',
      tagColor: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
      glow: 'hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(52,211,153,0.25)]',
    },
    {
      sku: 'SKU-DAIRY-01',
      name: 'Farm Fresh Toned Milk 1L',
      category: 'Dairy & Perishables',
      price: '₹52',
      stock: 28,
      maxStock: 40,
      burnRate: '18.0 /day',
      leadTime: '1 day',
      urgency: 'HEALTHY',
      status: '✓ Fast Velocity',
      action: 'Daily Restock',
      icon: '🥛',
      tagColor: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
      glow: 'hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(52,211,153,0.25)]',
    },
    {
      sku: 'SKU-DAIRY-06',
      name: 'Artisanal Organic Paneer 200g',
      category: 'Dairy & Perishables',
      price: '₹120',
      stock: 38,
      maxStock: 40,
      burnRate: '1.5 /day',
      leadTime: '2 days',
      urgency: 'CLEARANCE',
      status: '⚠️ 7d Expiration Risk',
      action: '20% Weekend Promo',
      icon: '🧀',
      tagColor: 'border-orange-500/40 bg-orange-500/15 text-orange-300',
      glow: 'hover:border-orange-500 hover:shadow-[0_0_25px_rgba(251,146,60,0.3)]',
    },
    {
      sku: 'SKU-SNACK-03',
      name: 'Grand Reserve Masala Chai 250g',
      category: 'Snacks & Beverages',
      price: '₹190',
      stock: 45,
      maxStock: 50,
      burnRate: '5.0 /day',
      leadTime: '3 days',
      urgency: 'PROMO',
      status: '💡 62% Margin Cow',
      action: 'Chai + Biscuit Bundle',
      icon: '☕',
      tagColor: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
      glow: 'hover:border-amber hover:shadow-[0_0_25px_rgba(230,169,74,0.35)]',
    },
    {
      sku: 'SKU-SNACK-08',
      name: 'Golden Crunch Butter Biscuits 300g',
      category: 'Snacks & Beverages',
      price: '₹55',
      stock: 60,
      maxStock: 70,
      burnRate: '8.0 /day',
      leadTime: '3 days',
      urgency: 'PROMO_PAIR',
      status: '★ Bundle Pairing',
      action: 'Attach to Chai Promo',
      icon: '🍪',
      tagColor: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
      glow: 'hover:border-amber hover:shadow-[0_0_25px_rgba(230,169,74,0.35)]',
    },
    {
      sku: 'SKU-CARE-01',
      name: 'Active Floral Detergent 2kg',
      category: 'Personal & Home Care',
      price: '₹185',
      stock: 35,
      maxStock: 45,
      burnRate: '3.0 /day',
      leadTime: '4 days',
      urgency: 'HEALTHY',
      status: '✓ Balanced',
      action: 'Steady Inventory',
      icon: '🧼',
      tagColor: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
      glow: 'hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(52,211,153,0.25)]',
    },
    {
      sku: 'SKU-CARE-02',
      name: 'Lemon Dishwash Bar (Pack of 3)',
      category: 'Personal & Home Care',
      price: '₹45',
      stock: 52,
      maxStock: 60,
      burnRate: '7.0 /day',
      leadTime: '2 days',
      urgency: 'HEALTHY',
      status: '✓ High Velocity',
      action: 'Weekly Reorder',
      icon: '🍋',
      tagColor: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
      glow: 'hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(52,211,153,0.25)]',
    }
  ];

  const filteredItems = activeCategory === 'ALL'
    ? retailItems
    : retailItems.filter((i) => i.category === activeCategory);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] pb-20 overflow-hidden">
      {/* 3D Background Lighting Ambient Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-amber/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
        
        {/* Top Floating Retail Shop Badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b2d26]/90 border border-amber/40 text-amber text-xs font-semibold uppercase tracking-wider shadow-glow-amber backdrop-blur-md">
            <Store className="w-4 h-4 animate-crate-bounce text-amber" />
            <span>Autonomous AI Retail Analyst for Kirana & Small Shops</span>
          </div>
        </div>

        {/* Hero Title & Subheading */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-headline font-bold text-[#f0f6f3] tracking-tight leading-[1.12] mb-6">
            The Smart Kirana Store.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber via-amber-light to-[#f0f6f3] italic">
              Automated in 3D.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-sage font-normal max-w-2xl mx-auto leading-relaxed mb-8">
            Manage your store with AI-driven inventory intelligence. Ingest raw POS sales history and let 5 LangGraph agents calculate exact reorder buffers, spot expiring items, and pick weekly promotion bundles.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                playTransition();
                onEnterDashboard();
              }}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-amber hover:bg-amber-light text-[#12211c] font-bold text-sm transition-all duration-200 shadow-glow-amber hover:scale-105 active:scale-95 group"
            >
              <span>View Weekly Store Action Report</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                playButtonClick();
                onLoadDemo();
              }}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-panel/90 hover:bg-panel-light text-[#f0f6f3] border border-panel-border hover:border-amber/50 font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md"
            >
              <Play className="w-4 h-4 text-amber fill-current" />
              <span>{isGenerating ? 'Synthesizing Data...' : 'Run Simulation'}</span>
            </button>

            <button
              onClick={() => {
                playButtonClick();
                onOpenUpload();
              }}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-panel/90 hover:bg-panel-light text-sage hover:text-[#f0f6f3] border border-panel-border text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md"
            >
              <Upload className="w-4 h-4 text-amber" />
              <span>Upload Sales CSV</span>
            </button>
          </div>
        </div>

        {/* 3D Animated Kirana Shelf Scene */}
        <RetailShelfScene onSelectSku={onSelectSku} />

        {/* Animated Retail Items Grid Showcase */}
        <div className="mt-14 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-mono font-bold text-amber uppercase tracking-wider">
                🏪 LIVE STORE INVENTORY LEDGER
              </span>
              <h2 className="text-2xl font-headline font-bold text-[#f0f6f3]">
                Animated Product Showcase & Health Vitals
              </h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'Staples & Grains', 'Dairy & Perishables', 'Snacks & Beverages', 'Personal & Home Care'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playButtonClick();
                    setActiveCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-amber text-[#12211c] shadow-glow-amber'
                      : 'bg-panel text-sage hover:text-[#f0f6f3] border border-panel-border'
                  }`}
                >
                  {cat === 'ALL' ? 'All Items' : cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 8 Product Animated Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredItems.map((item, idx) => (
              <div
                key={item.sku}
                onClick={() => {
                  playButtonClick();
                  if (onSelectSku) onSelectSku(item.sku);
                }}
                className={`kirana-card p-5 rounded-2xl border border-panel-border ${item.glow} transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Top Badge & Icon */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-panel-light border border-panel-border flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-md">
                      {item.icon}
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.tagColor}`}>
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#f0f6f3] group-hover:text-amber transition-colors line-clamp-1 mb-0.5">
                    {item.name}
                  </h3>
                  <div className="text-[11px] text-sage/70 font-mono mb-3">{item.sku} • {item.price}</div>

                  {/* Stock Level Progress Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-[11px] text-sage">
                      <span>Stock: <strong className="text-[#f0f6f3]">{item.stock} units</strong></span>
                      <span>Burn: <strong className="text-amber">{item.burnRate}</strong></span>
                    </div>
                    <div className="w-full h-1.5 bg-[#12211c] rounded-full overflow-hidden border border-panel-border/50">
                      <div
                        style={{ width: `${Math.min(100, (item.stock / item.maxStock) * 100)}%` }}
                        className={`h-full rounded-full transition-all ${
                          item.urgency === 'CRITICAL'
                            ? 'bg-red-500'
                            : item.urgency === 'CLEARANCE'
                            ? 'bg-orange-400'
                            : 'bg-emerald-accent'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-panel-border/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-amber-light font-medium truncate">
                    {item.action}
                  </span>
                  <div className="flex items-center text-amber font-bold group-hover:translate-x-1 transition-transform shrink-0 ml-1">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Agent LangGraph Pillar Showcase */}
        <div className="kirana-card p-8 rounded-3xl border border-panel-border mb-12 shadow-card-elevated">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold text-amber uppercase tracking-wider">
              MULTI-AGENT GENAI PIPELINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-[#f0f6f3] mt-1">
              5 LangGraph Agents Working in Harmony
            </h2>
            <p className="text-xs text-sage mt-2">
              Explicit state handoff passes verified transaction metrics, demand probability bands, and risk factors through each node.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { num: '01', title: 'Sales Analyst', desc: 'Validates raw POS CSV, checks dates, computes sell-through velocity & seasonality.' },
              { num: '02', title: 'Demand Forecaster', desc: 'Statsmodels ETS 7/14/30d projection with automatic sparse-data fallback.' },
              { num: '03', title: 'Inventory Strategist', desc: 'Calculates safety buffers, flags lead-time cliffs and perishable spoilage risks.' },
              { num: '04', title: 'Marketing Advisor', desc: 'Selects ONE high-impact weekly promotion with friend-to-friend trade-offs.' },
              { num: '05', title: 'Orchestrator', desc: 'Reconciles cross-agent tensions, writes executive brief, and answers SKU Q&A.' },
            ].map((agent) => (
              <div key={agent.num} className="p-4 rounded-2xl bg-panel-light/60 border border-panel-border">
                <div className="w-8 h-8 rounded-xl bg-amber/20 text-amber font-mono font-bold flex items-center justify-center text-xs mb-3">
                  {agent.num}
                </div>
                <h4 className="text-xs font-bold text-[#f0f6f3] mb-1">{agent.title}</h4>
                <p className="text-[11px] text-sage leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                playTransition();
                onEnterDashboard();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber hover:bg-amber-light text-[#12211c] font-bold text-xs transition-all shadow-glow-amber"
            >
              <span>Launch Full Multi-Agent Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
