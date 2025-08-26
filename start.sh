#!/bin/sh
set -e

# Check if we should skip Tailscale (for CI/testing environments)
if [ "$SKIP_TAILSCALE" = "true" ]; then
  echo "Skipping Tailscale setup (SKIP_TAILSCALE=true)"
  echo "Starting Node app directly..."
  npm start
  exit 0
fi

# Check if Tailscale auth key is provided
if [ -z "$TAILSCALE_AUTHKEY" ]; then
  echo "WARNING: TAILSCALE_AUTHKEY not provided"
  echo "Starting Node app without Tailscale..."
  npm start
  exit 0
fi

echo "Starting Tailscale daemon..."
if ! /app/tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock &; then
  echo "ERROR: Failed to start tailscaled, falling back to Node app only"
  npm start
  exit 0
fi

# CRITICAL: Wait for daemon to start
echo "Waiting for tailscaled..."
sleep 5

echo "Authenticating with Tailscale..."
if ! /app/tailscale up --authkey="${TAILSCALE_AUTHKEY}" --hostname=return-reminder --accept-routes; then
  echo "ERROR: Failed to authenticate with Tailscale, starting Node app anyway"
  npm start
  exit 0
fi

# CRITICAL: Wait for connection
sleep 3

# CRITICAL: Show status so we can see in logs
echo "=== Tailscale Status ==="
/app/tailscale status

echo "Starting Node app..."
npm start
