import React from 'react';
import { AlertTriangle, TrendingUp, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export default function ShowcaseBanner({ onSelectSku, selectedSku }) {
  const showcases = [
    {
      id: 'stockout',
      sku: 'SKU-STAPLE-01',
      title: 'Showcase 1: Critical Stockout Catch',
      badge: '🚨 Stockout Risk',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      itemName: 'Royal Basmati Rice 5kg',
      category: 'Staples & Grains',
      description: 'Demand spiked +55% in the last 14 days. Current inventory is down to 12 bags (~2.6 days left) with a 7-day lead time.',
      agentOutcome: 'Inventory Strategist flags immediate reorder of 55 units with safety buffer before shelf goes empty.',
      icon: ShieldAlert,
      accentBorder: 'hover:border-red-500/60'
    },
    {
      id: 'clearance',
      sku: 'SKU-DAIRY-06',
      title: 'Showcase 2: Spoilage Clearance Catch',
      badge: '⚠️ Clearance Alert',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      itemName: 'Artisanal Organic Paneer 200g',
      category: 'Dairy & Perishables',
      description: '38 units in stock with 7 days shelf-life remaining, but burning at only 1.5 units/day (25 days of inventory). ₹3,724 capital at 100% loss risk.',
      agentOutcome: 'Strategist & Marketing propose immediate 20% weekend markdown to recover cash before expiration.',
      icon: AlertTriangle,
      accentBorder: 'hover:border-orange-500/60'
    },
    {
      id: 'promo',
      sku: 'SKU-SNACK-03',
      title: 'Showcase 3: High-Conviction Promo',
      badge: '💡 Single Weekly Push',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      itemName: 'Grand Reserve Masala Chai 250g',
      category: 'Snacks & Beverages',
      description: 'High 62% gross margin item with steady demand. Pairs naturally with Butter Biscuits (SKU-SNACK-08).',
      agentOutcome: 'Marketing Advisor selects this as the ONE weekly promotion: Morning Chai Combo for +28% weekend volume lift.',
      icon: Sparkles,
      accentBorder: 'hover:border-amber-500/60'
    }
  ];

  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber uppercase font-mono">
            ★ Hackathon & Resume Showcase
          </span>
          <h3 className="text-xl font-headline font-bold text-[#f0f6f3]">
            3 Deliberately Engineered Multi-Agent Scenarios
          </h3>
        </div>
        <p className="text-xs text-sage max-w-md">
          Click any scenario to see real LangGraph multi-agent reasoning, mathematical grounding, and the Orchestrator explainability trace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {showcases.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedSku === item.sku;
          return (
            <div
              key={item.id}
              onClick={() => onSelectSku(item.sku)}
              className={`kirana-card p-5 rounded-2xl cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                isSelected
                  ? 'border-amber ring-2 ring-amber/30 bg-[#223930]'
                  : `border-panel-border ${item.accentBorder} bg-panel/90`
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className="text-xs font-mono text-sage/70">{item.sku}</span>
              </div>

              <h4 className="text-base font-headline font-bold text-[#f0f6f3] group-hover:text-amber transition-colors line-clamp-1 mb-1">
                {item.itemName}
              </h4>
              <p className="text-xs text-sage font-medium mb-3">{item.category}</p>

              <p className="text-xs text-sage/90 leading-relaxed mb-3">
                {item.description}
              </p>

              <div className="pt-3 border-t border-panel-border/60 flex items-center justify-between">
                <span className="text-[11px] text-amber-light font-medium line-clamp-1">
                  {item.agentOutcome.slice(0, 48)}...
                </span>
                <div className="flex items-center text-xs text-amber font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
