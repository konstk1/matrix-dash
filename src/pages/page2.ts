import { Page } from '../widgets/page'
import { TextWidget } from '../widgets/text-widget'

const COLS = 64
const ROWS = 32

export function createPage2(): Page {
  const page2 = new Page('page2')
  const text = new TextWidget({ width: COLS, height: ROWS }, 0)
  text.setText('Page 2')
  text.fgColor = 0xffffff
  page2.addWidget(text, { x: 0, y: 0 })
  return page2
}
