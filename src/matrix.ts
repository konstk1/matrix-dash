import { LedMatrix, LedMatrixInstance, GpioMapping, Font, FontInstance } from "rpi-led-matrix"

let matrix: LedMatrixInstance

if (process.env.NODE_ENV !== 'test') {
  matrix = new LedMatrix({
    ...LedMatrix.defaultMatrixOptions(),
    rows: 32,
    cols: 64,
    hardwareMapping: GpioMapping.AdafruitHatPwm,
    showRefreshRate: false,
  }, {
    ...LedMatrix.defaultRuntimeOptions(),
    gpioSlowdown: 2,
  })
}

export { LedMatrixInstance, Font, FontInstance, matrix }