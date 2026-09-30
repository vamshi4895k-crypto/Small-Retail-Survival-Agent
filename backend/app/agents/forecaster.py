import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Tuple
from app.agents.state import RetailState
from app.schemas import SkuForecast, ForecastReport

try:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing
    HAS_STATSMODELS = True
except ImportError:
    HAS_STATSMODELS = False

from sklearn.linear_model import Ridge

def forecast_sku_demand(
    sku: str,
    sku_df: pd.DataFrame,
    category_df: pd.DataFrame,
    is_sparse: bool
) -> SkuForecast:
    """
    Forecasts demand for a SKU using Statsmodels Exponential Smoothing, Scikit-Learn lag regression,
    or falls back automatically to a robust moving-average category heuristic for sparse SKUs.
    """
    # Sort and reindex to full daily timeline
    sku_df = sku_df.sort_values(by="date")
    sku_df["date"] = pd.to_datetime(sku_df["date"])
    
    # Resample daily
    daily_s = sku_df.set_index("date")["units_sold"].resample("D").sum().fillna(0)
    history_len = len(daily_s)
    
    # Baseline burn rates
    recent_7d_burn = float(daily_s.iloc[-7:].mean()) if history_len >= 7 else float(daily_s.mean())
    recent_14d_burn = float(daily_s.iloc[-14:].mean()) if history_len >= 14 else recent_7d_burn
    recent_30d_burn = float(daily_s.iloc[-30:].mean()) if history_len >= 30 else recent_14d_burn
    
    # Effective burn rate (weighted towards recent 7-14 days)
    effective_burn = max(0.05, 0.5 * recent_7d_burn + 0.3 * recent_14d_burn + 0.2 * recent_30d_burn)
    
    # Determine strategy
    if is_sparse or history_len < 56 or (daily_s > 0).sum() < 10:
        # AUTOMATIC FALLBACK: Sparse Category Heuristic
        # Use category momentum + exponential moving average
        cat_daily = category_df.set_index("date")["units_sold"].resample("D").sum().fillna(0)
        cat_trend_mult = 1.0
        if len(cat_daily) >= 14:
            cat_recent = cat_daily.iloc[-7:].mean()
            cat_prev = cat_daily.iloc[-14:-7].mean()
            if cat_prev > 0:
                cat_trend_mult = max(0.8, min(1.3, cat_recent / cat_prev))
                
        daily_proj = effective_burn * cat_trend_mult
        f_7 = max(0.5, daily_proj * 7.0)
        f_14 = max(1.0, daily_proj * 14.0)
        f_30 = max(2.0, daily_proj * 30.0)
        
        # Uncertainty band is wider for sparse items
        band_pct = 0.35
        method = "sparse_category_heuristic"
        confidence = "low" if history_len < 20 else "medium"
        
    else:
        # RICH HISTORY: Try Statsmodels Exponential Smoothing or ML regression
        fitted = False
        method = "statsmodels_ets"
        confidence = "high"
        
        if HAS_STATSMODELS and history_len >= 56:
            try:
                # 7-day seasonal cycle Holt-Winters
                model = ExponentialSmoothing(
                    daily_s,
                    trend="add",
                    seasonal="add",
                    seasonal_periods=7,
                    initialization_method="estimated"
                ).fit(smoothing_level=0.3, smoothing_trend=0.1, smoothing_seasonal=0.2)
                
                fc = model.forecast(30)
                f_7 = float(max(0.0, fc.iloc[:7].sum()))
                f_14 = float(max(0.0, fc.iloc[:14].sum()))
                f_30 = float(max(0.0, fc.iloc[:30].sum()))
                fitted = True
            except Exception:
                fitted = False
                
        if not fitted:
            # Fallback to Ridge Regression with calendar features & lags
            method = "trend_lag_regression"
            confidence = "medium"
            
            # Prepare tabular features
            feat_df = pd.DataFrame({"y": daily_s})
            feat_df["dayofweek"] = feat_df.index.dayofweek
            feat_df["is_weekend"] = feat_df["dayofweek"].isin([5, 6]).astype(int)
            feat_df["day_idx"] = np.arange(len(feat_df))
            feat_df["lag1"] = feat_df["y"].shift(1).fillna(effective_burn)
            feat_df["lag7"] = feat_df["y"].shift(7).fillna(effective_burn)
            
            X = feat_df[["dayofweek", "is_weekend", "day_idx", "lag1", "lag7"]].values
            y = feat_df["y"].values
            
            reg = Ridge(alpha=1.0)
            reg.fit(X, y)
            
            # Predict next 30 days
            last_date = daily_s.index.max()
            future_preds = []
            curr_lags = [daily_s.iloc[-1], daily_s.iloc[-7] if history_len >= 7 else daily_s.iloc[-1]]
            
            for i in range(1, 31):
                f_date = last_date + pd.Timedelta(days=i)
                dow = f_date.dayofweek
                is_wk = 1 if dow in [5, 6] else 0
                idx = len(daily_s) + i
                pred = max(0.0, float(reg.predict([[dow, is_wk, idx, curr_lags[0], curr_lags[1]]])[0]))
                future_preds.append(pred)
                curr_lags[0] = pred
                
            f_7 = float(sum(future_preds[:7]))
            f_14 = float(sum(future_preds[:14]))
            f_30 = float(sum(future_preds[:30]))
            
        band_pct = 0.18

    # Confidence intervals
    lower_7 = max(0.0, round(f_7 * (1 - band_pct), 1))
    upper_7 = round(f_7 * (1 + band_pct), 1)
    lower_14 = max(0.0, round(f_14 * (1 - band_pct), 1))
    upper_14 = round(f_14 * (1 + band_pct), 1)
    lower_30 = max(0.0, round(f_30 * (1 - band_pct), 1))
    upper_30 = round(f_30 * (1 + band_pct), 1)
    
    sku_name = sku_df["sku"].iloc[0]
    cat_name = sku_df["category"].iloc[0]
    
    return SkuForecast(
        sku=sku,
        name=sku_name,
        category=cat_name,
        forecast_7d=round(f_7, 1),
        forecast_14d=round(f_14, 1),
        forecast_30d=round(f_30, 1),
        lower_7d=lower_7,
        upper_7d=upper_7,
        lower_14d=lower_14,
        upper_14d=upper_14,
        lower_30d=lower_30,
        upper_30d=upper_30,
        method_used=method,
        history_length_days=history_len,
        is_sparse=is_sparse,
        confidence_level=confidence,
        burn_rate_daily=round(effective_burn, 2)
    )

def run_forecaster_agent(state: RetailState) -> RetailState:
    """
    Demand Forecaster Agent Node:
    Takes cleaned sales transactions and computes 7, 14, 30 day demand forecasts per SKU
    with automatic sparse fallback.
    """
    state.current_active_agent = "DEMAND_FORECASTER"
    state.agent_logs.append({
        "agent": "Demand Forecaster",
        "stage": "FORECASTING_EXECUTION",
        "message": "Generating 7, 14, and 30-day probabilistic demand forecasts per SKU with automatic sparse fallback...",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    df = pd.DataFrame(state.raw_transactions)
    df["date"] = pd.to_datetime(df["date"])
    df["units_sold"] = pd.to_numeric(df["units_sold"], errors="coerce").fillna(0).astype(int)
    
    sku_forecasts: Dict[str, SkuForecast] = {}
    high_growth_skus: List[str] = []
    declining_skus: List[str] = []
    
    sparse_count = 0
    statsmodels_count = 0
    
    grouped = df.groupby("sku")
    for sku, grp in grouped:
        sku_metric = state.sales_summary.sku_metrics_map.get(sku) if state.sales_summary else None
        is_sparse = sku_metric.is_sparse if sku_metric else False
        cat_name = grp["category"].iloc[0]
        cat_df = df[df["category"] == cat_name]
        
        forecast = forecast_sku_demand(sku, grp, cat_df, is_sparse)
        
        # Populate friendly display name from metadata if available
        if sku in state.skus_metadata:
            forecast.name = state.skus_metadata[sku].name
        
        sku_forecasts[sku] = forecast
        
        if forecast.method_used == "sparse_category_heuristic":
            sparse_count += 1
        else:
            statsmodels_count += 1
            
        # Growth categorization
        if sku_metric and sku_metric.recent_trend_direction == "rising":
            high_growth_skus.append(forecast.name)
        elif sku_metric and sku_metric.recent_trend_direction == "falling":
            declining_skus.append(forecast.name)
            
    notes = (
        f"Forecasted demand for {len(sku_forecasts)} SKUs. "
        f"{statsmodels_count} modeled via Time-Series / Statsmodels ETS, "
        f"{sparse_count} handled via Sparse Category Momentum Heuristic."
    )
    
    state.forecast_report = ForecastReport(
        generated_at=datetime.utcnow().isoformat(),
        sku_forecasts=sku_forecasts,
        high_growth_skus=high_growth_skus[:5],
        declining_skus=declining_skus[:5],
        forecaster_notes=notes
    )
    
    state.agent_logs.append({
        "agent": "Demand Forecaster",
        "stage": "COMPLETED",
        "message": f"Demand forecasting finished. High growth items: {', '.join(high_growth_skus[:3]) or 'None'}. {sparse_count} sparse SKUs automatically adapted.",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return state
