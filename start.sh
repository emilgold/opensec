#!/bin/bash
# OpenSEC - One-click startup script
# Usage: ./start.sh

set -e

echo "=============================="
echo "  Starting OpenSEC..."
echo "=============================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed."
    echo "  Download it from: https://www.python.org/downloads/"
    echo "  IMPORTANT: Check 'Add Python to PATH' during installation."
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "  Download it from: https://nodejs.org/ (pick the LTS version)"
    exit 1
fi

echo "[1/4] Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
pip install -q -r requirements.txt 2>/dev/null || pip3 install -q -r requirements.txt 2>/dev/null
mkdir -p data

echo "[2/4] Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install --silent 2>/dev/null

echo "[3/4] Starting backend server..."
cd "$SCRIPT_DIR/backend"
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
sleep 2

echo "[4/4] Starting frontend server..."
cd "$SCRIPT_DIR/frontend"
npx vite --host 127.0.0.1 --port 3000 &
FRONTEND_PID=$!
sleep 3

echo ""
echo "=============================="
echo "  OpenSEC is running!"
echo ""
echo "  Open your browser and go to:"
echo ""
echo "    http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop."
echo "=============================="

# Stop both servers when user presses Ctrl+C
trap "echo ''; echo 'Stopping OpenSEC...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'; exit 0" INT TERM

# Keep script running
wait
