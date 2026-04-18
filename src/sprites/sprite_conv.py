from __future__ import annotations

import argparse
import math
from collections import Counter, deque
from pathlib import Path
from typing import Dict, Iterable, List, Sequence, Tuple

from PIL import Image

RGBA = Tuple[int, int, int, int]


DEFAULT_LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$%&*+=?"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert a PNG into a TypeScript-style sprite definition."
    )
    parser.add_argument("input", type=Path, help="Input PNG path")
    parser.add_argument("--output", type=Path, default=None, help="Optional output text file")
    parser.add_argument("--name", default="SPRITE", help="Sprite constant name")
    parser.add_argument("--width", type=int, default=None, help="Resize width in pixels")
    parser.add_argument("--height", type=int, default=None, help="Resize height in pixels")
    parser.add_argument(
        "--colors",
        type=int,
        default=8,
        help="Maximum palette size after quantization (default: 8)",
    )
    parser.add_argument(
        "--transparent-letter",
        default=".",
        help="Letter to use for transparent pixels (default: .)",
    )
    parser.add_argument(
        "--remove-edge-bg",
        action="store_true",
        help=(
            "Remove background connected to image edges using the edge color and a tolerance. "
            "Useful for sprites on a solid/light background."
        ),
    )
    parser.add_argument(
        "--bg-tolerance",
        type=int,
        default=18,
        help="Color-distance tolerance for edge background removal (default: 18)",
    )
    parser.add_argument(
        "--merge-near-colors",
        type=int,
        default=0,
        help="Merge similar palette colors within this RGB distance after quantization (default: 0)",
    )
    parser.add_argument(
        "--letters",
        default=DEFAULT_LETTERS,
        help="Characters available for palette entries",
    )
    parser.add_argument(
        "--keep-alpha-threshold",
        type=int,
        default=1,
        help="Pixels with alpha below this are treated as transparent (default: 1)",
    )
    return parser.parse_args()


def resize_image(img: Image.Image, width: int | None, height: int | None) -> Image.Image:
    if width is None and height is None:
        return img
    if width is None:
        width = img.width
    if height is None:
        height = img.height
    return img.resize((width, height), Image.Resampling.NEAREST)


def rgba_distance(a: RGBA, b: RGBA) -> float:
    return math.sqrt(
        (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2 + ((a[3] - b[3]) * 0.5) ** 2
    )


def rgb_distance3(a: RGBA, b: RGBA) -> float:
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)


def most_common_edge_color(img: Image.Image, alpha_threshold: int) -> RGBA:
    px = img.load()
    samples: List[RGBA] = []
    for x in range(img.width):
        samples.append(px[x, 0])
        samples.append(px[x, img.height - 1])
    for y in range(img.height):
        samples.append(px[0, y])
        samples.append(px[img.width - 1, y])

    filtered = [c for c in samples if c[3] >= alpha_threshold]
    if not filtered:
        return (255, 255, 255, 0)
    return Counter(filtered).most_common(1)[0][0]


def remove_edge_connected_background(
    img: Image.Image, tolerance: int, alpha_threshold: int
) -> Image.Image:
    img = img.copy().convert("RGBA")
    bg = most_common_edge_color(img, alpha_threshold)
    px = img.load()
    w, h = img.size
    visited = [[False] * w for _ in range(h)]
    q: deque[Tuple[int, int]] = deque()

    def try_add(x: int, y: int) -> None:
        if not (0 <= x < w and 0 <= y < h):
            return
        if visited[y][x]:
            return
        visited[y][x] = True
        c = px[x, y]
        if c[3] < alpha_threshold or rgb_distance3(c, bg) <= tolerance:
            q.append((x, y))

    for x in range(w):
        try_add(x, 0)
        try_add(x, h - 1)
    for y in range(h):
        try_add(0, y)
        try_add(w - 1, y)

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                visited[ny][nx] = True
                c = px[nx, ny]
                if c[3] < alpha_threshold or rgb_distance3(c, bg) <= tolerance:
                    q.append((nx, ny))

    return img


def quantize_image(img: Image.Image, colors: int) -> Image.Image:
    if colors < 1:
        raise ValueError("--colors must be >= 1")
    return (
        img.convert("RGBA")
        .quantize(colors=colors, method=Image.Quantize.FASTOCTREE)
        .convert("RGBA")
    )


def merge_similar_colors(img: Image.Image, threshold: int, alpha_threshold: int) -> Image.Image:
    if threshold <= 0:
        return img

    img = img.copy().convert("RGBA")
    px = img.load()
    colors = Counter(
        px[x, y]
        for y in range(img.height)
        for x in range(img.width)
        if px[x, y][3] >= alpha_threshold
    )
    ordered = [c for c, _ in colors.most_common()]
    representatives: List[RGBA] = []
    mapping: Dict[RGBA, RGBA] = {}

    for color in ordered:
        target = None
        for rep in representatives:
            if rgb_distance3(color, rep) <= threshold:
                target = rep
                break
        if target is None:
            representatives.append(color)
            mapping[color] = color
        else:
            mapping[color] = target

    for y in range(img.height):
        for x in range(img.width):
            c = px[x, y]
            if c[3] >= alpha_threshold:
                px[x, y] = mapping.get(c, c)

    return img


def sorted_palette(img: Image.Image, alpha_threshold: int) -> List[RGBA]:
    px = img.load()
    counts = Counter(
        px[x, y]
        for y in range(img.height)
        for x in range(img.width)
        if px[x, y][3] >= alpha_threshold
    )
    return [c for c, _ in counts.most_common()]


def assign_letters(
    palette: Sequence[RGBA],
    transparent_letter: str,
    letters: str,
) -> Dict[RGBA, str]:
    usable = [ch for ch in letters if ch != transparent_letter]
    if len(palette) > len(usable):
        raise ValueError(
            f"Not enough letters for palette: need {len(palette)}, have {len(usable)}"
        )
    return {color: usable[i] for i, color in enumerate(palette)}


def image_to_rows(
    img: Image.Image,
    mapping: Dict[RGBA, str],
    transparent_letter: str,
    alpha_threshold: int,
) -> List[str]:
    px = img.load()
    rows: List[str] = []
    for y in range(img.height):
        chars: List[str] = []
        for x in range(img.width):
            c = px[x, y]
            if c[3] < alpha_threshold:
                chars.append(transparent_letter)
            else:
                chars.append(mapping[c])
        rows.append("".join(chars))
    return rows


def hex_rgb(c: RGBA) -> str:
    return f"#{c[0]:02x}{c[1]:02x}{c[2]:02x}"


def format_sprite(
    name: str,
    palette: Sequence[RGBA],
    mapping: Dict[RGBA, str],
    rows: Sequence[str],
    transparent_letter: str,
) -> str:
    lines: List[str] = []
    lines.append(f"const {name}: SpriteDef = {{")
    lines.append("  palette: {")
    lines.append(f"    {transparent_letter!s}: T,")
    for color in palette:
        lines.append(f"    {mapping[color]}: '{hex_rgb(color)}',")
    lines.append("  },")
    lines.append("  rows: [")
    for row in rows:
        lines.append(f"    '{row}',")
    lines.append("  ],")
    lines.append("};")
    return "\n".join(lines)


def main() -> None:
    args = parse_args()
    img = Image.open(args.input).convert("RGBA")
    img = resize_image(img, args.width, args.height)

    if args.remove_edge_bg:
        img = remove_edge_connected_background(
            img, tolerance=args.bg_tolerance, alpha_threshold=args.keep_alpha_threshold
        )

    img = quantize_image(img, args.colors)
    img = merge_similar_colors(img, args.merge_near_colors, args.keep_alpha_threshold)

    palette = sorted_palette(img, args.keep_alpha_threshold)
    mapping = assign_letters(palette, args.transparent_letter, args.letters)
    rows = image_to_rows(img, mapping, args.transparent_letter, args.keep_alpha_threshold)
    sprite_text = format_sprite(
        name=args.name,
        palette=palette,
        mapping=mapping,
        rows=rows,
        transparent_letter=args.transparent_letter,
    )

    if args.output:
        args.output.write_text(sprite_text, encoding="utf-8")
        print(f"Wrote sprite to {args.output}")
    else:
        print(sprite_text)


if __name__ == "__main__":
    main()
