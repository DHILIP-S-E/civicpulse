#!/usr/bin/env bash
# ==============================================================================
# CivicPulse — Madurai Spatial Lakehouse: Setup Script (Linux / macOS)
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo " CIVICPULSE — MADURAI SPATIAL LAKEHOUSE SETUP"
echo "=========================================================="

# 1. Environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] Initialized .env from .env.example"
fi

# 2. Python dependencies
echo "Installing Python dependencies..."
python3 -m pip install -r backend/requirements.txt

# 3. Node dependencies
echo "Installing Node dependencies..."
cd frontend
npm install
npm run build
cd ..

# 4. Validation
echo "Validating environment & Lakehouse demo fixtures..."
python3 scripts/validate_environment.py

echo "=========================================================="
echo "Setup complete! Ready for local development and deployment."
echo "=========================================================="

