
import 'dotenv/config'
import { matrix } from './matrix'
import { Page } from './widgets/page'
import { createAircraftPage } from './pages/aircraft'
import { createMedsPage } from './pages/meds'
import { BabyTracker } from './services/babytracker'
import log from './log'

const BH1750 = require('bh1750-sensor')

const options = { readMode: BH1750.ONETIME_H_RESOLUTION_MODE }
const bh1750 = new BH1750(options)
const bt = new BabyTracker()

function autoDimmer(page: Page) {
  if (!matrix) {
    return
  }

  const currentBrightness = matrix.brightness()
  let newBrightness = currentBrightness

  let level = bh1750.readData()
  if (level < 5) {
    newBrightness = 20
  } else if (level < 10) {
    newBrightness = 35
  } else {
    newBrightness = 50
  }

  if (newBrightness !== currentBrightness) {
    matrix.brightness(newBrightness)
    page.draw()
  }

  // console.log('Light level:', level.toFixed(2));
}

process.on('SIGINT', () => {
  log.warn('SIGINT, exiting...')
  process.exit(0)
})

async function main() {
  await bt.login()
  try {
    log.verbose('Matrix dash starting...')

    matrix && matrix.brightness(20)

    let page1: Page

    const showMeds = false
    
    if (showMeds) {
      page1 = await createMedsPage(bt)
    } else {
      page1 = await createAircraftPage()
    }

    let currentPage: Page = page1
    page1.activate()

    setInterval(() => autoDimmer(currentPage), 1000 * 1)
  } catch (error) {
    console.error(error)
  }
}

main()
