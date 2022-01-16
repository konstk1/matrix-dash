import { LedMatrix, GpioMapping } from 'rpi-led-matrix';

export const matrix = new LedMatrix({
    ...LedMatrix.defaultMatrixOptions(),
    rows: 32,
    cols: 64,
    hardwareMapping: GpioMapping.AdafruitHat,
    showRefreshRate: true,
    // pixelMapper: PixelMapperType.Simple,
}, {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 2,
});