#!/usr/bin/env python3
"""Rebuild project-owned diagram images. Requires Graphviz `dot` on PATH.

The .dot files are editable architecture source. No network or AI image service
is involved. Images are generated deterministically by installed Graphviz.
"""
from pathlib import Path
import shutil
import struct
import subprocess


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def png_dimensions(path: Path) -> tuple[int, int]:
    """Read IHDR dimensions without adding an image-library dependency."""
    with path.open("rb") as stream:
        header = stream.read(24)
    if len(header) != 24 or header[:8] != PNG_SIGNATURE or header[12:16] != b"IHDR":
        raise SystemExit(f"Invalid PNG output: {path}")
    return struct.unpack(">II", header[16:24])


def main() -> None:
    directory = Path(__file__).resolve().parent
    dot = shutil.which("dot")
    if dot is None:
        raise SystemExit("Graphviz is required: install the graphviz package, then rerun.")
    sources = sorted(directory.glob("*.dot"))
    if not sources:
        raise SystemExit("No diagram sources found.")
    for source in sources:
        svg = source.with_suffix(".svg")
        png = source.with_suffix(".png")
        subprocess.run([dot, "-Tsvg", str(source), "-o", str(svg)], check=True)
        # 144 dpi keeps dense ERDs readable in reports and on high-density displays.
        subprocess.run([dot, "-Tpng", "-Gdpi=144", str(source), "-o", str(png)], check=True)
        if svg.stat().st_size == 0 or png.stat().st_size == 0:
            raise SystemExit(f"Empty rendered image for {source.stem}")
        width, height = png_dimensions(png)
        if max(width, height) < 1600 or min(width, height) < 800:
            raise SystemExit(f"Diagram is below review resolution: {png} ({width}x{height})")
        print(f"Rendered {source.stem}: SVG + PNG ({width}x{height})")


if __name__ == "__main__":
    main()
