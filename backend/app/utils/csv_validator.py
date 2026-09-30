import pandas as pd
import io
from typing import Dict, Any, List, Tuple

REQUIRED_COLUMNS = ["date", "sku", "category", "units_sold", "unit_price", "stock_on_hand"]

def validate_sales_csv(file_content: bytes) -> Tuple[bool, List[str], List[str], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Validates CSV content and returns (is_valid, errors, warnings, cleaned_transactions, inferred_skus).
    """
    errors = []
    warnings = []
    
    try:
        df = pd.read_csv(io.BytesIO(file_content))
    except Exception as e:
        return False, [f"Failed to parse CSV file: {str(e)}"], [], [], []
        
    # Check lowercase column mapping
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        return False, [f"Missing required CSV columns: {', '.join(missing_cols)}. Expected columns: {', '.join(REQUIRED_COLUMNS)}"], [], [], []
        
    initial_row_count = len(df)
    if initial_row_count == 0:
        return False, ["CSV file contains zero data rows."], [], [], []
        
    # Check for negative values
    invalid_units = df[df["units_sold"] < 0]
    if len(invalid_units) > 0:
        sample_rows = invalid_units.index[:3].tolist()
        errors.append(f"Found {len(invalid_units)} rows with negative units_sold (e.g., row {sample_rows[0] + 2}: units_sold={invalid_units.iloc[0]['units_sold']}). Corrected/Ignored.")
        df = df[df["units_sold"] >= 0]
        
    invalid_prices = df[df["unit_price"] < 0]
    if len(invalid_prices) > 0:
        errors.append(f"Found {len(invalid_prices)} rows with negative unit_price. Cleaned out.")
        df = df[df["unit_price"] >= 0]
        
    invalid_stocks = df[df["stock_on_hand"] < 0]
    if len(invalid_stocks) > 0:
        errors.append(f"Found {len(invalid_stocks)} rows with negative stock_on_hand. Reset to 0.")
        df.loc[df["stock_on_hand"] < 0, "stock_on_hand"] = 0

    # Date parsing
    try:
        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
    except Exception as e:
        errors.append(f"Some dates could not be parsed: {str(e)}")
        # drop invalid dates
        df["parsed_date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.dropna(subset=["parsed_date"])
        df["date"] = df["parsed_date"].dt.strftime("%Y-%m-%d")
        df = df.drop(columns=["parsed_date"])

    # Missing SKU or Category
    df = df.dropna(subset=["sku", "category"])
    df["sku"] = df["sku"].astype(str).str.strip()
    df["category"] = df["category"].astype(str).str.strip()
    
    # Remove duplicate transactions (same date + same sku)
    duplicates_count = df.duplicated(subset=["date", "sku"]).sum()
    if duplicates_count > 0:
        warnings.append(f"Detected and merged {duplicates_count} duplicate date+sku records by summing units_sold.")
        df = df.groupby(["date", "sku", "category"], as_index=False).agg({
            "units_sold": "sum",
            "unit_price": "mean",
            "stock_on_hand": "last"
        })

    # Build inferred SKU metadata if sku catalog details not present
    sku_groups = df.groupby("sku")
    inferred_skus = []
    
    has_name_col = "name" in df.columns
    has_cost_col = "cost_price" in df.columns
    has_shelf_col = "shelf_life_days" in df.columns
    has_lead_col = "reorder_lead_time_days" in df.columns
    
    for sku, grp in sku_groups:
        category = grp["category"].iloc[0]
        avg_price = grp["unit_price"].mean()
        
        name = grp["name"].iloc[0] if has_name_col and pd.notna(grp["name"].iloc[0]) else f"Item {sku}"
        cost_price = float(grp["cost_price"].iloc[0]) if has_cost_col and pd.notna(grp["cost_price"].iloc[0]) else round(avg_price * 0.75, 2)
        shelf_life = int(grp["shelf_life_days"].iloc[0]) if has_shelf_col and pd.notna(grp["shelf_life_days"].iloc[0]) else (7 if "Dairy" in category or "Perishable" in category else None)
        lead_time = int(grp["reorder_lead_time_days"].iloc[0]) if has_lead_col and pd.notna(grp["reorder_lead_time_days"].iloc[0]) else 3
        
        inferred_skus.append({
            "sku": sku,
            "name": name,
            "category": category,
            "cost_price": cost_price,
            "shelf_life_days": shelf_life,
            "reorder_lead_time_days": lead_time
        })
        
    transactions = df[["date", "sku", "category", "units_sold", "unit_price", "stock_on_hand"]].to_dict(orient="records")
    
    is_valid = len(transactions) > 0
    return is_valid, errors, warnings, transactions, inferred_skus
