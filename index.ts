import { LedMatrix, GpioMapping } from 'rpi-led-matrix';

const matrix = new LedMatrix({
  ...LedMatrix.defaultMatrixOptions(),
  rows: 32,
  cols: 64,
  hardwareMapping: GpioMapping.AdafruitHat,
  // pixelMapper: PixelMapperType.Simple,
}, {
  ...LedMatrix.defaultRuntimeOptions(),
  gpioSlowdown: 2,
});

console.log('Writing screen...');

matrix
  .clear()
  .brightness(100)
  .fgColor(0x0000FF)
  .fill()

console.log('Done');
