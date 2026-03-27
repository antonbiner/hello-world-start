#!/bin/bash

# Auto-update version.json during build
# This ensures every Vercel deployment gets a new version automatically

# Generate semantic version based on timestamp and git
TIMESTAMP=$(date +%s)000
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VERSION_STRING="${GIT_SHA}-${TIMESTAMP}"

# Create version.json with timestamp and metadata
cat > public/version.json << EOF
{
  "v": "${VERSION_STRING}",
  "timestamp": ${TIMESTAMP},
  "deployed": "${BUILD_TIME}",
  "environment": "vercel",
  "git": "${GIT_SHA}"
}
EOF

echo "✓ Version file updated: ${VERSION_STRING}"
echo "  Timestamp: ${TIMESTAMP}"
echo "  Deployed: ${BUILD_TIME}"
echo "  Git SHA: ${GIT_SHA}"
