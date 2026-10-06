# Candlelit pumpkin patch

The 64 × 16 main-screen idle strip now displays option 1, Gentle candlelight, from `previews/pumpkin-flames/index.html`. Three pumpkins alternate with three candles. Each independently flickering flame controls the illumination of nearby pumpkin surfaces and the ground; pumpkin faces retain a faint inner glow.

`scene.ts` renders original pixel art procedurally with no image assets or dependencies. `widget.ts` updates every 60 ms, paints the entire strip including black pixels, and uses the existing widget timer lifecycle. Aircraft alerts retain their higher carousel priority. The clock, weather, auto dimmer, and full-screen Halloween rotation are unchanged.

To restore the dots, swap `PumpkinPatchWidget` back to `CanvasWidget` in `src/pages/aircraft.ts`.
