import { LedMatrix, LedMatrixInstance, GpioMapping, Font } from "rpi-led-matrix";

let matrix: LedMatrixInstance;

if (process.env.NODE_ENV !== 'test') {
    matrix = new LedMatrix({
        ...LedMatrix.defaultMatrixOptions(),
        rows: 32,
        cols: 64,
        hardwareMapping: GpioMapping.AdafruitHat,
        showRefreshRate: true,
    }, {
        ...LedMatrix.defaultRuntimeOptions(),
        gpioSlowdown: 2,
    });
}

export { LedMatrixInstance, Font, matrix };