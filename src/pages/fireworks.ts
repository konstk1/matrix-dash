import { Page } from './page'
import { FireworksWidget } from '../widgets/fireworks-widget'

const COLS = 64
const ROWS = 32

export function createFireworksPage(): Page {
  const page = new Page('fireworks')
  const fireworks = new FireworksWidget({ width: COLS, height: ROWS })
  // Light pink: 0xFFB6C1
  // fireworks.setOverlayText(["Happy B'Day", 'Maya'], 0xFFB6C1)
  page.addWidget(fireworks, { x: 0, y: 0 })
  return page
}
