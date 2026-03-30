import { Page } from './page'
import { FireworksWidget } from '../widgets/fireworks-widget'

const COLS = 64
const ROWS = 32

export function createFireworksPage(): Page {
  const page = new Page('fireworks')
  const fireworks = new FireworksWidget({ width: COLS, height: ROWS })
  page.addWidget(fireworks, { x: 0, y: 0 })
  return page
}
