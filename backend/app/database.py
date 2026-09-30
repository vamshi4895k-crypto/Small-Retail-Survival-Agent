import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_PATH = os.environ.get("RETAIL_DB_PATH", os.path.join(os.path.dirname(__file__), "retail.db"))

def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema if tables do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table: skus
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skus (
        sku TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        cost_price REAL NOT NULL,
        shelf_life_days INTEGER,
        reorder_lead_time_days INTEGER NOT NULL DEFAULT 3
    );
    """)
    
    # Table: sales_transactions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        sku TEXT NOT NULL,
        category TEXT NOT NULL,
        units_sold INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        stock_on_hand INTEGER NOT NULL,
        FOREIGN KEY (sku) REFERENCES skus (sku)
    );
    """)
    
    # Create indexes for fast querying
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sales_sku ON sales_transactions (sku);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_transactions (date);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sales_category ON sales_transactions (category);")
    
    # Table: reports
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        date_range_start TEXT,
        date_range_end TEXT,
        report_data_json TEXT NOT NULL,
        executive_summary TEXT NOT NULL
    );
    """)
    
    # Table: agent_chat_history
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS agent_chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT,
        sku TEXT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)
    
    conn.commit()
    conn.close()

def save_skus(skus_data: List[Dict[str, Any]]):
    """Inserts or replaces SKUs."""
    conn = get_db_connection()
    cursor = conn.cursor()
    for item in skus_data:
        cursor.execute("""
        INSERT OR REPLACE INTO skus (sku, name, category, cost_price, shelf_life_days, reorder_lead_time_days)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            item["sku"],
            item["name"],
            item["category"],
            float(item["cost_price"]),
            item.get("shelf_life_days"),
            int(item.get("reorder_lead_time_days", 3))
        ))
    conn.commit()
    conn.close()

def save_sales_transactions(transactions: List[Dict[str, Any]]):
    """Inserts batch of sales transactions."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.executemany("""
    INSERT INTO sales_transactions (date, sku, category, units_sold, unit_price, stock_on_hand)
    VALUES (:date, :sku, :category, :units_sold, :unit_price, :stock_on_hand)
    """, transactions)
    conn.commit()
    conn.close()

def clear_data():
    """Clears sales transactions and SKUs."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sales_transactions;")
    cursor.execute("DELETE FROM skus;")
    conn.commit()
    conn.close()

def save_report(report_id: str, report_data: Dict[str, Any], executive_summary: str, start_date: str = "", end_date: str = ""):
    """Saves a generated report to the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO reports (id, created_at, date_range_start, date_range_end, report_data_json, executive_summary)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        report_id,
        datetime.utcnow().isoformat(),
        start_date,
        end_date,
        json.dumps(report_data),
        executive_summary
    ))
    conn.commit()
    conn.close()

def get_latest_report() -> Optional[Dict[str, Any]]:
    """Fetches the latest generated report."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports ORDER BY created_at DESC LIMIT 1;")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    data = json.loads(row["report_data_json"])
    data["id"] = row["id"]
    data["created_at"] = row["created_at"]
    data["executive_summary"] = row["executive_summary"]
    return data

def get_all_skus() -> List[Dict[str, Any]]:
    """Fetches all registered SKUs with latest stock on hand."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.sku, s.name, s.category, s.cost_price, s.shelf_life_days, s.reorder_lead_time_days,
           COALESCE(latest_st.stock_on_hand, 0) as current_stock,
           COALESCE(latest_st.unit_price, s.cost_price * 1.3) as current_price,
           COALESCE(latest_st.date, '') as last_recorded_date
    FROM skus s
    LEFT JOIN (
        SELECT st1.sku, st1.stock_on_hand, st1.unit_price, st1.date
        FROM sales_transactions st1
        INNER JOIN (
            SELECT sku, MAX(date) as max_date, MAX(id) as max_id
            FROM sales_transactions
            GROUP BY sku
        ) st2 ON st1.sku = st2.sku AND st1.date = st2.max_date AND st1.id = st2.max_id
    ) latest_st ON s.sku = latest_st.sku
    ORDER BY s.category, s.name;
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
