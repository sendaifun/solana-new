#!/usr/bin/env bash
# Package skills into a tarball for remote install
# Run: ./scripts/package-skills.sh
# Output: public/skills.tar.gz
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT="$ROOT/public/skills.tar.gz"

mkdir -p "$ROOT/public"

# Package skills/ directory (idea, build, launch, data, SKILL_ROUTER.md)
tar -czf "$OUT" \
  -C "$ROOT" \
  skills/idea \
  skills/build \
  skills/launch \
  skills/data \
  skills/SKILL_ROUTER.md \
  skills/README.md

SIZE=$(du -h "$OUT" | cut -f1)
echo "Packaged: $OUT ($SIZE)"
