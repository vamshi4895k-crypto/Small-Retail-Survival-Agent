import random
import datetime
import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

# Fixed seed for perfect reproducibility
SEED = 42

SKU_CATALOG = [
    # Category 1: Staples & Grains
    {"sku": "SKU-STAPLE-01", "name": "Royal Basmati Rice 5kg", "category": "Staples & Grains", "cost_price": 380.0, "shelf_life_days": None, "reorder_lead_time_days": 7},
    {"sku": "SKU-STAPLE-02", "name": "Sharbati Whole Wheat Atta 10kg", "category": "Staples & Grains", "cost_price": 320.0, "shelf_life_days": None, "reorder_lead_time_days": 5},
    {"sku": "SKU-STAPLE-03", "name": "Organic Toor Dal 1kg", "category": "Staples & Grains", "cost_price": 140.0, "shelf_life_days": None, "reorder_lead_time_days": 4},
    {"sku": "SKU-STAPLE-04", "name": "Refined Sunflower Oil 1L", "category": "Staples & Grains", "cost_price": 115.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-STAPLE-05", "name": "Cold Pressed Mustard Oil 1L", "category": "Staples & Grains", "cost_price": 160.0, "shelf_life_days": None, "reorder_lead_time_days": 4},
    {"sku": "SKU-STAPLE-06", "name": "Pure Sulphurless Sugar 1kg", "category": "Staples & Grains", "cost_price": 42.0, "shelf_life_days": None, "reorder_lead_time_days": 2},
    {"sku": "SKU-STAPLE-07", "name": "Iodized Crystal Salt 1kg", "category": "Staples & Grains", "cost_price": 20.0, "shelf_life_days": None, "reorder_lead_time_days": 2},
    {"sku": "SKU-STAPLE-08", "name": "Kabuli Chana 1kg", "category": "Staples & Grains", "cost_price": 130.0, "shelf_life_days": None, "reorder_lead_time_days": 4},
    {"sku": "SKU-STAPLE-09", "name": "Poha Medium 1kg", "category": "Staples & Grains", "cost_price": 55.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-STAPLE-10", "name": "Roasted Sooji Rava 1kg", "category": "Staples & Grains", "cost_price": 48.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-STAPLE-11", "name": "Premium Ghee 500ml", "category": "Staples & Grains", "cost_price": 310.0, "shelf_life_days": None, "reorder_lead_time_days": 5},
    {"sku": "SKU-STAPLE-12", "name": "Red Chilli Powder 200g", "category": "Staples & Grains", "cost_price": 50.0, "shelf_life_days": None, "reorder_lead_time_days": 4},
    
    # Category 2: Dairy & Perishables (with shelf_life_days)
    {"sku": "SKU-DAIRY-01", "name": "Farm Fresh Toned Milk 1L", "category": "Dairy & Perishables", "cost_price": 52.0, "shelf_life_days": 3, "reorder_lead_time_days": 1},
    {"sku": "SKU-DAIRY-02", "name": "Full Cream Milk 1L", "category": "Dairy & Perishables", "cost_price": 64.0, "shelf_life_days": 3, "reorder_lead_time_days": 1},
    {"sku": "SKU-DAIRY-03", "name": "Natural Set Curd 400g", "category": "Dairy & Perishables", "cost_price": 35.0, "shelf_life_days": 5, "reorder_lead_time_days": 1},
    {"sku": "SKU-DAIRY-04", "name": "Fresh Salted Butter 200g", "category": "Dairy & Perishables", "cost_price": 95.0, "shelf_life_days": 30, "reorder_lead_time_days": 2},
    {"sku": "SKU-DAIRY-05", "name": "Farm Fresh Brown Eggs (Pack of 6)", "category": "Dairy & Perishables", "cost_price": 54.0, "shelf_life_days": 14, "reorder_lead_time_days": 2},
    {"sku": "SKU-DAIRY-06", "name": "Artisanal Organic Paneer 200g", "category": "Dairy & Perishables", "cost_price": 98.0, "shelf_life_days": 7, "reorder_lead_time_days": 2},
    {"sku": "SKU-DAIRY-07", "name": "Whole Wheat Sliced Bread 400g", "category": "Dairy & Perishables", "cost_price": 36.0, "shelf_life_days": 5, "reorder_lead_time_days": 1},
    {"sku": "SKU-DAIRY-08", "name": "Probiotic Greek Yogurt 150g", "category": "Dairy & Perishables", "cost_price": 45.0, "shelf_life_days": 10, "reorder_lead_time_days": 2},
    {"sku": "SKU-DAIRY-09", "name": "Fresh Paneer Malai Block 500g", "category": "Dairy & Perishables", "cost_price": 190.0, "shelf_life_days": 6, "reorder_lead_time_days": 2},
    {"sku": "SKU-DAIRY-10", "name": "Cheddar Cheese Slices 200g", "category": "Dairy & Perishables", "cost_price": 125.0, "shelf_life_days": 45, "reorder_lead_time_days": 3},

    # Category 3: Snacks & Beverages
    {"sku": "SKU-SNACK-01", "name": "Classic Filter Coffee Powder 200g", "category": "Snacks & Beverages", "cost_price": 110.0, "shelf_life_days": None, "reorder_lead_time_days": 4},
    {"sku": "SKU-SNACK-02", "name": "Assam Strong CTC Tea 500g", "category": "Snacks & Beverages", "cost_price": 165.0, "shelf_life_days": None, "reorder_lead_time_days": 4},
    {"sku": "SKU-SNACK-03", "name": "Grand Reserve Masala Chai 250g", "category": "Snacks & Beverages", "cost_price": 135.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-SNACK-04", "name": "Roasted Cashews Masala 200g", "category": "Snacks & Beverages", "cost_price": 190.0, "shelf_life_days": None, "reorder_lead_time_days": 5},
    {"sku": "SKU-SNACK-05", "name": "California Almonds 250g", "category": "Snacks & Beverages", "cost_price": 210.0, "shelf_life_days": None, "reorder_lead_time_days": 5},
    {"sku": "SKU-SNACK-06", "name": "Spiced Aloo Bhujia 400g", "category": "Snacks & Beverages", "cost_price": 75.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-SNACK-07", "name": "Crispy Banana Chips 200g", "category": "Snacks & Beverages", "cost_price": 60.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-SNACK-08", "name": "Golden Crunch Butter Biscuits 300g", "category": "Snacks & Beverages", "cost_price": 40.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-SNACK-09", "name": "Dark Chocolate Digestives 150g", "category": "Snacks & Beverages", "cost_price": 65.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-SNACK-10", "name": "Sparkling Lemon Drink 750ml", "category": "Snacks & Beverages", "cost_price": 32.0, "shelf_life_days": None, "reorder_lead_time_days": 2},
    {"sku": "SKU-SNACK-11", "name": "Tender Coconut Water 200ml", "category": "Snacks & Beverages", "cost_price": 38.0, "shelf_life_days": 60, "reorder_lead_time_days": 3},
    {"sku": "SKU-SNACK-12", "name": "Salted Peanuts 150g", "category": "Snacks & Beverages", "cost_price": 28.0, "shelf_life_days": None, "reorder_lead_time_days": 2},

    # Category 4: Personal & Home Care
    {"sku": "SKU-CARE-01", "name": "Active Floral Detergent Powder 2kg", "category": "Personal & Home Care", "cost_price": 185.0, "shelf_life_days": None, "reorder_lead_time_days": 4},
    {"sku": "SKU-CARE-02", "name": "Lemon Dishwash Bar (Pack of 3)", "category": "Personal & Home Care", "cost_price": 45.0, "shelf_life_days": None, "reorder_lead_time_days": 2},
    {"sku": "SKU-CARE-03", "name": "Antibacterial Bath Soap 125g x 4", "category": "Personal & Home Care", "cost_price": 110.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-CARE-04", "name": "Herbal Anti-Dandruff Shampoo 340ml", "category": "Personal & Home Care", "cost_price": 190.0, "shelf_life_days": None, "reorder_lead_time_days": 4},
    {"sku": "SKU-CARE-05", "name": "Complete Care Toothpaste 150g", "category": "Personal & Home Care", "cost_price": 75.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-CARE-06", "name": "Pine Disinfectant Floor Cleaner 1L", "category": "Personal & Home Care", "cost_price": 120.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-CARE-07", "name": "Ultra Soft Facial Tissues (100 pulls)", "category": "Personal & Home Care", "cost_price": 50.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-CARE-08", "name": "Mosquito Repellent Vaporizer Refill", "category": "Personal & Home Care", "cost_price": 68.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-CARE-09", "name": "Kitchen Paper Towel (2 rolls)", "category": "Personal & Home Care", "cost_price": 85.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    {"sku": "SKU-CARE-10", "name": "Gentle Handwash Liquid Refill 750ml", "category": "Personal & Home Care", "cost_price": 95.0, "shelf_life_days": None, "reorder_lead_time_days": 3},
    
    # Deliberately Sparse SKUs (Sparse History Fallback demonstration)
    {"sku": "SKU-CARE-11", "name": "Organic Bamboo Charcoal Toothbrush", "category": "Personal & Home Care", "cost_price": 80.0, "shelf_life_days": None, "reorder_lead_time_days": 6},
    {"sku": "SKU-CARE-12", "name": "Herbal Neem Floor Cleaner 1L (New Launch)", "category": "Personal & Home Care", "cost_price": 135.0, "shelf_life_days": None, "reorder_lead_time_days": 5},
    {"sku": "SKU-SNACK-13", "name": "Matcha Green Tea Latte Sachet 100g", "category": "Snacks & Beverages", "cost_price": 180.0, "shelf_life_days": None, "reorder_lead_time_days": 6}
]

def generate_synthetic_retail_data(days: int = 365) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Generates 12 months of daily transactions with realistic seasonality, weekend surges,
    month-start salary bumps, and the 3 deliberately engineered showcase SKUs.
    """
    random.seed(SEED)
    np.random.seed(SEED)
    
    end_date = datetime.date(2026, 9, 27)
    start_date = end_date - datetime.timedelta(days=days - 1)
    
    skus_metadata = SKU_CATALOG.copy()
    transactions = []
    
    # Keep track of stock on hand for each SKU
    # Base markup: Staples ~ 20-25%, Dairy ~ 15-20%, Snacks ~ 35-50%, Care ~ 30-40%
    sku_markup = {
        "Staples & Grains": 1.25,
        "Dairy & Perishables": 1.20,
        "Snacks & Beverages": 1.45,
        "Personal & Home Care": 1.35
    }
    
    # Initial stock allocations
    current_stocks = {}
    for item in skus_metadata:
        sku = item["sku"]
        if item["category"] == "Dairy & Perishables":
            current_stocks[sku] = random.randint(20, 50)
        elif item["category"] == "Staples & Grains":
            current_stocks[sku] = random.randint(40, 100)
        else:
            current_stocks[sku] = random.randint(30, 80)
            
    # Base daily velocity per SKU
    base_velocities = {
        "SKU-STAPLE-01": 5.5,  # Basmati Rice (Showcase 1: Stockout catch)
        "SKU-STAPLE-02": 6.0,  # Atta
        "SKU-STAPLE-03": 4.0,  # Toor Dal
        "SKU-STAPLE-04": 7.0,  # Oil
        "SKU-DAIRY-01": 18.0,  # Milk
        "SKU-DAIRY-02": 12.0,  # Full cream milk
        "SKU-DAIRY-03": 9.0,   # Curd
        "SKU-DAIRY-05": 8.0,   # Eggs
        "SKU-DAIRY-06": 1.5,   # Organic Paneer (Showcase 2: Clearance catch - slow mover, high stock)
        "SKU-SNACK-01": 4.5,   # Coffee
        "SKU-SNACK-02": 6.5,   # Tea
        "SKU-SNACK-03": 5.0,   # Masala Chai (Showcase 3: Promo pick)
        "SKU-SNACK-08": 8.0,   # Biscuits (Promo pair)
        "SKU-CARE-01": 3.0,    # Detergent
        "SKU-CARE-02": 7.0,    # Dishwash
        "SKU-CARE-11": 0.3,    # Bamboo toothbrush (Sparse)
        "SKU-CARE-12": 0.4,    # Herbal Neem (Sparse new launch)
        "SKU-SNACK-13": 0.2,   # Matcha (Sparse)
    }
    
    # Fill defaults for remaining
    for item in skus_metadata:
        sku = item["sku"]
        if sku not in base_velocities:
            if item["category"] == "Dairy & Perishables":
                base_velocities[sku] = random.uniform(3.0, 7.0)
            elif item["category"] == "Staples & Grains":
                base_velocities[sku] = random.uniform(2.5, 5.0)
            else:
                base_velocities[sku] = random.uniform(2.0, 4.5)

    # Generate daily sales
    for day_offset in range(days):
        cur_date = start_date + datetime.timedelta(days=day_offset)
        date_str = cur_date.strftime("%Y-%m-%d")
        weekday = cur_date.weekday()  # 0=Mon, 5=Sat, 6=Sun
        day_of_month = cur_date.day
        
        # Seasonality factors:
        # Weekend bump: +25% on Saturday, +35% on Sunday
        weekend_mult = 1.35 if weekday == 6 else (1.25 if weekday == 5 else (0.95 if weekday in (1, 2) else 1.0))
        # Month start salary bump (days 1 to 7 of month): +20%
        salary_mult = 1.22 if day_of_month <= 7 else (0.92 if day_of_month >= 24 else 1.0)
        
        for item in skus_metadata:
            sku = item["sku"]
            cat = item["category"]
            cost = item["cost_price"]
            markup = sku_markup.get(cat, 1.30)
            unit_price = round(cost * markup, 1)
            
            # Sparse SKU handling: only active in recent ~20 days or intermittent
            if sku in ["SKU-CARE-11", "SKU-CARE-12", "SKU-SNACK-13"]:
                if day_offset < days - 22:
                    continue  # Not launched yet
                if random.random() < 0.65:
                    continue  # Zero sales day
            
            base_v = base_velocities.get(sku, 3.0)
            
            # ENGINEERED SCENARIOS in the final 2 weeks:
            is_recent_2w = (day_offset >= days - 14)
            
            # 1. Stockout Catch: SKU-STAPLE-01 (Basmati Rice) demand spikes in recent 2w, stock gets critically depleted
            if sku == "SKU-STAPLE-01":
                if is_recent_2w:
                    base_v = 8.5  # Surge
            
            # 2. Clearance Catch: SKU-DAIRY-06 (Artisanal Organic Paneer) demand dips, stock was over-ordered
            if sku == "SKU-DAIRY-06":
                if is_recent_2w:
                    base_v = 1.2  # Slowdown
                    
            # 3. Promotion Candidate: SKU-SNACK-03 (Chai) steady high margin
            if sku == "SKU-SNACK-03":
                pass
                
            expected_units = base_v * weekend_mult * salary_mult
            units_sold = max(0, int(np.random.poisson(expected_units)))
            
            # Stock simulation
            # Every few days, shopkeeper reorders when stock is low, except for our engineered scenarios:
            stock = current_stocks[sku]
            
            # Restock logic (unless deliberately held back)
            if stock < 15 and sku != "SKU-STAPLE-01":  # Allow Basmati rice stock to drop low
                # Restock event
                restock_amt = random.randint(40, 80) if cat != "Dairy & Perishables" else random.randint(25, 45)
                stock += restock_amt
            
            # Cap units sold by available stock
            actual_sold = min(units_sold, stock)
            stock = max(0, stock - actual_sold)
            
            # Special manual tuning for the final day's stock_on_hand:
            if day_offset == days - 1:
                if sku == "SKU-STAPLE-01":
                    stock = 12  # Only 12 bags left! Burn rate is ~4.5/day -> 2.6 days left, lead time is 7 days!
                elif sku == "SKU-DAIRY-06":
                    stock = 38  # 38 units left! Shelf life is 7 days, burn rate is only 1.5/day -> 25 days of stock!
                elif sku == "SKU-SNACK-03":
                    stock = 45  # Good stock, high margin (62%), ready for promotion
                elif sku == "SKU-SNACK-08":
                    stock = 60  # Paired biscuit stock ready
                elif sku == "SKU-CARE-12":
                    stock = 25  # Sparse new launch
            
            current_stocks[sku] = stock
            
            transactions.append({
                "date": date_str,
                "sku": sku,
                "category": cat,
                "units_sold": actual_sold,
                "unit_price": unit_price,
                "stock_on_hand": stock
            })
            
    return skus_metadata, transactions

def get_engineered_showcase_skus_info() -> List[Dict[str, Any]]:
    """Returns metadata for the 3 showcase demo scenarios."""
    return [
        {
            "tag": "STOCKOUT_ALERT",
            "badge": "🚨 Stockout Catch",
            "sku": "SKU-STAPLE-01",
            "name": "Royal Basmati Rice 5kg",
            "category": "Staples & Grains",
            "scenario": "Demand surged (+55% in last 14 days), but current stock is only 12 bags with a 7-day reorder lead time (only ~2.6 days of supply remaining).",
            "agent_trigger": "Inventory Strategist flags Critical Stockout Risk and suggests immediate reorder of 55 bags with safety buffer."
        },
        {
            "tag": "CLEARANCE_ALERT",
            "badge": "⚠️ Clearance Catch",
            "sku": "SKU-DAIRY-06",
            "name": "Artisanal Organic Paneer 200g",
            "category": "Dairy & Perishables",
            "scenario": "38 units in stock with only 7 days shelf-life remaining, but sales velocity slowed to 1.5 units/day (25 days of inventory). ₹3,724 in capital at risk of total spoilage.",
            "agent_trigger": "Inventory Strategist & Marketing Advisor flag Clearance Risk and suggest an immediate 20% discount or recipe bundle before expiration."
        },
        {
            "tag": "PROMOTION_PICK",
            "badge": "💡 Strategic Promo",
            "sku": "SKU-SNACK-03",
            "name": "Grand Reserve Masala Chai 250g",
            "category": "Snacks & Beverages",
            "scenario": "High gross margin (62%), healthy inventory, pairs naturally with Butter Biscuits (SKU-SNACK-08) for morning weekend shoppers.",
            "agent_trigger": "Marketing Advisor picks this as the single weekly promotion: 'Morning Chai & Biscuit Combo' to drive high-margin basket size."
        }
    ]
