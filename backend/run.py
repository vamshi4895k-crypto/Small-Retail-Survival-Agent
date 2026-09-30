import uvicorn
import os
import sys

# Configure UTF-8 for stdout/stderr on Windows
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure backend root is in pythonpath
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"[*] Starting Small Retail Survival Agent Backend on http://127.0.0.1:{port}...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=True)
