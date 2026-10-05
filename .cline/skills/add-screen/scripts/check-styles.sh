#!/usr/bin/env bash
# Check files for style issues that violate this project's conventions.
# Usage: ./check-styles.sh <file-or-dir> [...]
# Exits non-zero if any file has a hard violation (raw hex / magic numbers).

set -uo pipefail

if [ "$#" -eq 0 ]; then
  echo "usage: $0 <file-or-dir> [...]" >&2
  exit 2
fi

fail=0

for target in "$@"; do
  if [ ! -e "$target" ]; then
    echo "ERROR: no such path: $target" >&2
    fail=1
    continue
  fi

  # Raw hex colours, excluding the constants/ token files where they belong.
  if [ "$target" != "constants" ]; then
    hits=$(grep -rInE '#[0-9a-fA-F]{3,8}\b' "$target" \
      | grep -vE '^\S+:[0-9]+:\s*(//|\*)' \
      | grep -vE '\.clinerules|\.cline/')
    if [ -n "$hits" ]; then
      echo "RAW HEX (use Colors.*):"
      echo "$hits"
      fail=1
    fi
  fi

  # Text imported straight from react-native instead of ui/AppText.
  hits=$(grep -rInE '^\s*Text,?\s*$|^\s*\{[^}]*\bText\b[^}]*\}\s*from "react-native"' "$target" 2>/dev/null)
  if [ -n "$hits" ]; then
    echo "NATIVE Text (use ui/AppText):"
    echo "$hits"
    fail=1
  fi

  # Numeric padding/margin/gap/fontSize/borderRadius values that should be tokens.
  hits=$(grep -rInE '(padding|margin|gap|fontSize|borderRadius)[A-Za-z]*: *[0-9]+' "$target" \
    | grep -vE ':\s*(0|1)\s*[,}]?$')
  if [ -n "$hits" ]; then
    echo "HARD-CODED SPACING/TYPE (use SPACE/FONT/RADIUS):"
    echo "$hits"
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "OK: no style violations found"
else
  echo "FAILED: violations above (see .cline/skills/add-screen/SKILL.md)"
fi

exit "$fail"
