import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, ShieldAlert, TrendingUp, AlertTriangle, CheckCircle2, Loader2, HelpCircle } from 'lucide-react';
import { explainSku } from '../services/api';
import { formatCurrency, getUrgencyBadge } from '../utils/formatters';

export default function SkuDetailModal({ sku, report, onClose }) {
  const [loading, setLoading] = useState(true);
  const [explanationData, setExplanationData] = useState(null);
  const [chatQuestion, setChatQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!sku) return;
    let isMounted = true;
    setLoading(true);
    setCustomAnswer(null);

    explainSku(sku)
      .then((data) => {
        if (isMounted) {
          setExplanationData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sku]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;

    setAsking(true);
    try {
      const res = await explainSku(sku, chatQuestion);
      setCustomAnswer({
        question: chatQuestion,
        answer: res.explanation,
      });
      setChatQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setAsking(false);
    }
  };

  if (!sku) return null;

  const skuForecast = report?.forecast_report?.sku_forecasts?.[sku];
  const skuAlert = report?.strategist?.all_sku_alerts?.[sku];
  const badge = getUrgencyBadge(skuAlert?.urgency || 'HEALTHY');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="kirana-card rounded-2xl border border-panel-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-panel hover:bg-panel-light text-sage hover:text-[#f0f6f3] border border-panel-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-panel-border bg-panel-light/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-amber font-semibold">{sku}</span>
            <span className="text-xs text-sage">• {skuAlert?.category || 'Catalog Item'}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          <h2 className="text-2xl font-headline font-bold text-[#f0f6f3]">
            {skuAlert?.name || sku}
          </h2>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Key Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-panel-light/50 border border-panel-border">
              <div className="text-[11px] text-sage">Current Stock</div>
              <div className="text-base font-bold text-[#f0f6f3]">
                {skuAlert?.current_stock ?? 0} units
              </div>
            </div>

            <div className="p-3 rounded-xl bg-panel-light/50 border border-panel-border">
              <div className="text-[11px] text-sage">Daily Burn Rate</div>
              <div className="text-base font-bold text-amber">
                {skuAlert?.daily_burn_rate ?? 0} /day
              </div>
            </div>

            <div className="p-3 rounded-xl bg-panel-light/50 border border-panel-border">
              <div className="text-[11px] text-sage">Days Left</div>
              <div className={`text-base font-bold ${
                (skuAlert?.days_of_stock_left || 99) <= 3 ? 'text-red-400' : 'text-[#f0f6f3]'
              }`}>
                {skuAlert?.days_of_stock_left ?? 'N/A'} days
              </div>
            </div>

            <div className="p-3 rounded-xl bg-panel-light/50 border border-panel-border">
              <div className="text-[11px] text-sage">Supplier Lead Time</div>
              <div className="text-base font-bold text-[#f0f6f3]">
                {skuAlert?.lead_time_days ?? 3} days
              </div>
            </div>
          </div>

          {/* Forecasting Projections */}
          {skuForecast && (
            <div className="p-4 rounded-xl bg-[#13231e] border border-panel-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-sage uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber" />
                  <span>Demand Forecast Confidence Bands</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel text-amber">
                  Method: {skuForecast.method_used}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-panel/80">
                  <div className="text-[10px] text-sage">Next 7 Days</div>
                  <div className="text-sm font-bold text-[#f0f6f3]">{skuForecast.forecast_7d} units</div>
                  <div className="text-[10px] text-sage/70 font-mono">
                    [{skuForecast.lower_7d} – {skuForecast.upper_7d}]
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-panel/80">
                  <div className="text-[10px] text-sage">Next 14 Days</div>
                  <div className="text-sm font-bold text-[#f0f6f3]">{skuForecast.forecast_14d} units</div>
                  <div className="text-[10px] text-sage/70 font-mono">
                    [{skuForecast.lower_14d} – {skuForecast.upper_14d}]
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-panel/80">
                  <div className="text-[10px] text-sage">Next 30 Days</div>
                  <div className="text-sm font-bold text-[#f0f6f3]">{skuForecast.forecast_30d} units</div>
                  <div className="text-[10px] text-sage/70 font-mono">
                    [{skuForecast.lower_30d} – {skuForecast.upper_30d}]
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orchestrator Stored Reasoning & Explanation */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber" />
              <h4 className="text-sm font-headline font-bold text-[#f0f6f3]">
                Orchestrator Explainability: "Why this recommendation?"
              </h4>
            </div>

            {loading ? (
              <div className="p-6 rounded-xl bg-panel-light/30 flex items-center justify-center gap-2 text-xs text-sage">
                <Loader2 className="w-4 h-4 animate-spin text-amber" />
                <span>Querying stored multi-agent reasoning trace...</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gradient-to-b from-[#1c3028] to-[#162720] border border-amber/30 text-xs text-[#f0f6f3] leading-relaxed space-y-3">
                <div className="whitespace-pre-line">
                  {explanationData?.explanation || skuAlert?.reasoning_rationale}
                </div>

                {customAnswer && (
                  <div className="mt-4 pt-4 border-t border-panel-border/60">
                    <div className="text-amber font-semibold mb-1">
                      Q: "{customAnswer.question}"
                    </div>
                    <div className="text-sage italic whitespace-pre-line">
                      {customAnswer.answer}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ask Follow-up Q&A input */}
          <form onSubmit={handleAskQuestion} className="relative">
            <input
              type="text"
              placeholder="Ask Orchestrator a question about this SKU (e.g. 'Why not discount it 50%?')..."
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              disabled={asking}
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#12211c] border border-panel-border text-xs text-[#f0f6f3] placeholder-sage/60 focus:outline-none focus:border-amber transition-colors"
            />
            <button
              type="submit"
              disabled={asking || !chatQuestion.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-amber hover:bg-amber-light text-[#12211c] transition-colors disabled:opacity-40"
            >
              {asking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
