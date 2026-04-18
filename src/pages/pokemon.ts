import { Page } from './page'
import { PokemonWidget, PokemonName, POKEMON_NAMES } from '../widgets/pokemon-widget'

const SPRITE = 32

export type PokemonSelection = PokemonName | 'random'

function pickRandom(exclude?: PokemonName): PokemonName {
  const pool = exclude ? POKEMON_NAMES.filter(n => n !== exclude) : POKEMON_NAMES
  return pool[Math.floor(Math.random() * pool.length)]
}

function pickPair(selection: PokemonSelection): [PokemonName, PokemonName] {
  const first = selection === 'random' ? pickRandom() : selection
  return [first, pickRandom(first)]
}

class PokemonPage extends Page {
  constructor(
    private readonly selection: PokemonSelection,
    private readonly left: PokemonWidget,
    private readonly right: PokemonWidget,
  ) {
    super(`pokemon:${selection}`)
  }

  public override activate(): void {
    const [a, b] = pickPair(this.selection)
    this.left.setPokemon(a)
    this.right.setPokemon(b)
    super.activate()
  }
}

export function createPokemonPage(selection: PokemonSelection = 'random'): Page {
  const [a, b] = pickPair(selection)
  const left = new PokemonWidget(a, { width: SPRITE, height: SPRITE })
  const right = new PokemonWidget(b, { width: SPRITE, height: SPRITE })
  const page = new PokemonPage(selection, left, right)
  page.addWidget(left, { x: 0, y: 0 })
  page.addWidget(right, { x: SPRITE, y: 0 })
  return page
}
