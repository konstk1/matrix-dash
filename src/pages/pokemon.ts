import { Page } from './page'
import { PokemonWidget, PokemonSelection } from '../widgets/pokemon-widget'

const COLS = 64
const ROWS = 32

export function createPokemonPage(selection: PokemonSelection = 'random'): Page {
  const page = new Page(`pokemon:${selection}`)
  const widget = new PokemonWidget(selection, { width: COLS, height: ROWS })
  page.addWidget(widget, { x: 0, y: 0 })
  return page
}
