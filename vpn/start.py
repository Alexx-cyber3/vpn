"""
Single-command Launcher for AI-Powered IPsec VPN Protocol Analyzer & Security Framework.
Launches the FastAPI backend server and automatically opens the Web Dashboard in the default browser.
"""

import sys
import os
import webbrowser
import time
import uvicorn

def main():
    print("=======================================================================")
    print(" 🛡️  AI-Powered IPsec VPN Protocol Analyzer & Security Framework")
    print("=======================================================================")
    print(" Running server at: http://localhost:8000")
    print(" Opening web dashboard in default browser...\n")

    # Automatically open browser after 1.5 seconds
    def open_browser():
        time.sleep(1.5)
        webbrowser.open("http://localhost:8000")

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    # Start Uvicorn Server
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
