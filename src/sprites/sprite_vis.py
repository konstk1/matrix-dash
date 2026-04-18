#!/usr/bin/env python3
"""Render sprite_conv / SpriteDef text to a PNG (preview for CI or quick checks)."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from PIL import Image


def parse_palette_line(line: str) -> Optional[Tuple[str, Optional[str]]]:
    line = line.strip().rstrip(",")
    if not line or line == "{":
        return None
    if ":" not in line:
        return None
    key_part, rest = line.split(":", 1)
    key = key_part.strip().strip("'\"")
    rest = rest.strip().rstrip(",")
    if rest == "T":
        return (key, None)
    m = re.fullmatch(r"'#([0-9a-fA-F]{6})'", rest)
    if m:
        return (key, f"#{m.group(1).lower()}")
    return None


def parse_sprite_text(text: str) -> Tuple[str, Dict[str, Optional[str]], List[str]]:
    name_m = re.search(r"const\s+(\w+)\s*:\s*SpriteDef", text)
    name = name_m.group(1) if name_m else "sprite"

    palette_m = re.search(r"palette:\s*\{([\s\S]*?)\}\s*,?", text)
    if not palette_m:
        raise ValueError("no palette: { block")
    palette: Dict[str, Optional[str]] = {}
    for part in palette_m.group(1).split(","):
        frag = part.strip()
        if not frag:
            continue
        p = parse_palette_line(frag)
        if p:
            palette[p[0]] = p[1]

    lines = text.splitlines()
    i = 0
    while i < len(lines) and not re.search(r"\brows:\s*\[", lines[i]):
        i += 1
    if i >= len(lines):
        raise ValueError("no rows: [ block")
    i += 1

    rows: List[str] = []
    row_re = re.compile(r"^\s*'(.*)'\s*,?\s*$")
    while i < len(lines):
        raw = lines[i]
        i += 1
        if re.match(r"^\s*\],?\s*$", raw):
            break
        m = row_re.match(raw)
        if m:
            rows.append(m.group(1))

    return name, palette, rows


def hex_to_rgb(h: str) -> Tuple[int, int, int]:
    m = re.fullmatch(r"#([0-9a-fA-F]{6})", h.strip())
    if not m:
        return (0, 0, 0)
    n = int(m.group(1), 16)
    return ((n >> 16) & 255, (n >> 8) & 255, n & 255)


def render_png(
    palette: Dict[str, Optional[str]],
    rows: List[str],
    scale: int,
) -> Image.Image:
    w = max((len(r) for r in rows), default=0)
    h = len(rows)
    out = Image.new("RGBA", (w * scale, h * scale), (0, 0, 0, 255))
    px = out.load()

    for y, row in enumerate(rows):
        for x in range(w):
            ch = row[x] if x < len(row) else " "
            if ch not in palette:
                c = (0, 0, 0, 255)
            elif palette[ch] is None:
                c = (0, 0, 0, 255)
            else:
                r0, g0, b0 = hex_to_rgb(palette[ch])
                c = (r0, g0, b0, 255)
            for dy in range(scale):
                for dx in range(scale):
                    px[x * scale + dx, y * scale + dy] = c

    return out


def main() -> None:
    p = argparse.ArgumentParser(description="Render SpriteDef text to PNG")
    p.add_argument(
        "input",
        type=Path,
        nargs="?",
        default=None,
        help="File with sprite TS (default: stdin)",
    )
    p.add_argument("-o", "--output", type=Path, required=True, help="Output PNG path")
    p.add_argument("--scale", type=int, default=8, help="Pixels per cell (default: 8)")
    args = p.parse_args()

    if args.input is None:
        text = sys.stdin.read()
    else:
        text = args.input.read_text(encoding="utf-8")

    _name, palette, rows = parse_sprite_text(text)
    img = render_png(palette, rows, max(1, args.scale))
    img.save(args.output)
    print(f"Wrote {args.output} ({img.size[0]}×{img.size[1]})", file=sys.stderr)


if __name__ == "__main__":
    main()
