import { Page } from './page'
import { CountdownWidget } from '../widgets/countdown-widget'

const COLS = 64
const ROWS = 32

export function createCountdownPage(label: string, targetDate: Date): Page {
  const page = new Page('countdown')
  const countdown = new CountdownWidget({ width: COLS, height: ROWS }, label, targetDate)
  countdown.fgColor = 0xFFFFFF
  page.addWidget(countdown, { x: 0, y: 0 })
  return page
}
