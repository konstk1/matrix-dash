# Halloween animations

The dashboard's seasonal slot chooses Porch pals, Moon patrol, or Something brewing randomly on each activation, excluding the previous scene. It keeps the existing rotation: 300 seconds of the main dashboard, then 10 seconds of seasonal animation. There is no automatic seasonal cutoff.

Everything for these animations lives here:

- `assets/`: original Twemoji PNGs, attribution license, and reviewable 64 × 32 animated GIFs.
- `generate.py`: reproducibly rasterizes the approved preview scenes at 10 fps (requires Python and Pillow).
- `frames.ts`: generated, compressed RGB888 frames embedded in the compiled application.
- `animation.ts`, `widget.ts`, `page.ts`: frame lookup, matrix playback, and random selection.

Rebuild artwork with `python3 src/animations/halloween/generate.py`, then run `pnpm build`. Runtime requires no image decoder or Python. The widget paints every pixel, including black, and stops its timer when the page is inactive. Brightness remains controlled by the existing auto dimmer.

Artwork source: https://github.com/jdecked/twemoji/tree/v17.0.2/assets/72x72
Twemoji graphics © Twitter and contributors, CC BY 4.0 (see `assets/LICENSE-GRAPHICS`). Images are downsampled, scaled, animated, and composited. The cauldron, trees, ground, and effects are original drawings. Scenes correspond to options 1, 3, and 4 in `previews/fall-halloween/index.html`.
