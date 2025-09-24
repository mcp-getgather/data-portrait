#!/bin/sh
set -e

if [ -n "${TAILSCALE_AUTHKEY}" ]; then
    /app/tailscaled --state=/var/lib/tailscale/tailscaled.state --socket=/var/run/tailscale/tailscaled.sock &
    /app/tailscale up --authkey="${TAILSCALE_AUTHKEY}" --hostname=data-portrait &
else
    echo "TAILSCALE_AUTHKEY not set, skipping Tailscale setup"
fi

echo "Starting Node app..."
npm start
