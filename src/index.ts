
import 'dotenv/config'
import { matrix } from './matrix'
import { Page } from './pages/page'
import { createAircraftPage } from './pages/aircraft'
import { createMedsPage } from './pages/meds'
import { createCountdownPage } from './pages/countdown'
import { createFireworksPage } from './pages/fireworks'
import { createPokemonPage } from './pages/pokemon'
import { PageCarousel } from './page-carousel'
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
    newBrightness = 70 // 35
  } else {
    newBrightness = 100 // 50
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

    matrix && matrix.brightness(50)

    // @ts-ignore
    let page1: Page

    const showMeds = false
    const testPage: string | false = false //'fireworks' // set to page name or false to run normally

    if (testPage) {
      let page: Page
      switch (testPage) {
        case 'meds':
          page = await createMedsPage(bt)
          break
        case 'fireworks':
          page = createFireworksPage()
          break
        case 'countdown':
          page = createCountdownPage('Maya\'s B-Day', new Date('2026-04-06T07:00:00-04:00'))
          break
        case 'pokemon':
          page = createPokemonPage('eevee2')
          break
        default:
          page = await createAircraftPage()
      }
      page.activate()
      setInterval(() => autoDimmer(page), 1000 * 5)
      return
    }

    if (showMeds) {
      page1 = await createMedsPage(bt)
    } else {
      page1 = await createAircraftPage()
    }

    // @ts-ignore
    const countdownPage = createCountdownPage(' Kai\'s B\'Day', new Date('2026-04-26T06:00:00-04:00'))
    const fireworksPage = createFireworksPage()
    const pokemonPage = createPokemonPage('random')

    const carousel = new PageCarousel([
      { page: page1, durationSec: 10 },
      { page: fireworksPage, durationSec: 15 },
      { page: pokemonPage, durationSec: 10 },
    ])
    carousel.start()

    setInterval(() => autoDimmer(carousel.currentPage()), 1000 * 2)
  } catch (error) {
    console.error(error)
  }
}

main()
