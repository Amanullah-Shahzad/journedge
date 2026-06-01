#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

cp -n .env.example .env.local || true
npm install
npm run dev
