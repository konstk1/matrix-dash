import { Widget, Size } from './widget'

const K = 0x000000 // black outline + pupils
const W = 0xFFFFFF // eye white
const T = -1       // transparent

// pikachu palette
const Y = 0xFFD300 // yellow body
const R = 0xFF3030 // red cheeks

// squirtle palette
const B = 0x66B2E0 // blue body
const S = 0x8B4513 // shell rim brown
const C = 0xFFE088 // cream belly

type Box = { x0: number, x1: number }

type SpriteDef = {
  palette: Record<string, number>
  rows: string[]
  eyeRowMid: number         // row drawn as a full black line when blinking
  eyeRowsAll: number[]      // all rows that contain eye pixels
  eyesOuter: Box[]          // full eye box (edges + interior) per eye, inclusive
  eyesInner: Box[]          // interior only (where pupil/white lives) per eye, inclusive
  closedInterior: number    // color to paint eye interior when blinking (body color)
}

const PIKACHU: SpriteDef = {
  palette: { '.': T, k: K, y: Y, r: R, w: W },
  rows: [
    '................................',
    '.........kk..........kk.........',
    '........kyyk........kyyk........',
    '........kyyk........kyyk........',
    '.......kyyyyk......kyyyyk.......',
    '.......kyyyyk......kyyyyk.......',
    '......kyyyyyyk....kyyyyyyk......',
    '......kyyyyyyk....kyyyyyyk......',
    '.....kyyyyyyyykkkkyyyyyyyyk.....',
    '.....kyyyyyyyyyyyyyyyyyyyyk.....',
    '....kyyyyyyyyyyyyyyyyyyyyyyk....',
    '....kyyyyyyyyyyyyyyyyyyyyyyk....',
    '...kyyyyyyyyyyyyyyyyyyyyyyyyk...',
    '...kyyyykkyyyyyyyyyyyykkyyyyk...',
    '...kyyykwwkyyyyyyyyyykwwkyyyk...',
    '...kyyyykkyyyyyyyyyyyykkyyyyk...',
    '...kyrryyyyyyyyyyyyyyyyyrryyk...',
    '...kyrrryyyyyykkkkyyyyyyrrryk...',
    '...kyrrryyyyykkkkkkyyyyyrrryk...',
    '...kyyrryyyyyykkkkyyyyyyrryyk...',
    '....kyyyyyyyyyyyyyyyyyyyyyyk....',
    '....kyyyyyyyyyyyyyyyyyyyyyyk....',
    '.....kyyyyyyyyyyyyyyyyyyyyk.....',
    '......kyyyyyyyyyyyyyyyyyyk......',
    '.......kkyyyyyyyyyyyyyykk.......',
    '.........kkkkkkkkkkkkkk.........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
  eyeRowMid: 14,
  eyeRowsAll: [13, 14, 15],
  eyesOuter: [{ x0: 7, x1: 10 }, { x0: 21, x1: 24 }],
  eyesInner: [{ x0: 8, x1: 9 }, { x0: 22, x1: 23 }],
  closedInterior: Y,
}

const SQUIRTLE: SpriteDef = {
  palette: { '.': T, k: K, b: B, w: W, s: S, c: C },
  rows: [
    '................................',
    '................................',
    '...........kkkkkk...............',
    '.........kkbbbbbbkk.............',
    '........kbbbbbbbbbbk............',
    '.......kbbbbbbbbbbbbk...........',
    '.......kbbbbbbbbbbbbk...........',
    '.......kbbkkbbbbkkbbk...........',
    '.......kbkwwkbbkwwkbk...........',
    '.......kbkwkkbbkkwkbk...........',
    '.......kbbkkbbbbkkbbk...........',
    '.......kbbbbbbbbbbbbk...........',
    '.......kbbbbkkkkbbbbk...........',
    '........kbbbbbbbbbbk............',
    '.........kkbbbbbbkk.............',
    '..........kbbbbbbk..............',
    '.......kbbsccccccccsbbk.........',
    '.....kbbbsccccccccccsbbbk.......',
    '....kbbbbsccccccccccccsbbbbk....',
    '....kbbbbsccccccccccccsbbbbk....',
    '....kbbbbsccccccccccccsbbbbk....',
    '.....kbbbsccccccccccsbbbk.......',
    '.......kbbsccccccccsbbk.........',
    '........kbbbbbbbbbbbbk..........',
    '........kbbk......kbbk..........',
    '........kbbk......kbbk..........',
    '.........kk........kk...........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
  eyeRowMid: 9,
  eyeRowsAll: [7, 8, 9, 10],
  eyesOuter: [{ x0: 9, x1: 12 }, { x0: 15, x1: 18 }],
  eyesInner: [{ x0: 10, x1: 11 }, { x0: 16, x1: 17 }],
  closedInterior: B,
}

const DEFS = {
  pikachu: PIKACHU,
  squirtle: SQUIRTLE,
} as const

export type PokemonName = keyof typeof DEFS

type CompiledSprite = {
  def: SpriteDef
  pixels: number[][]
}

function compile(name: string, def: SpriteDef): CompiledSprite {
  const pixels = def.rows.map((row, i) => {
    if (row.length !== 32) {
      throw new Error(`${name} sprite row ${i} has length ${row.length}, expected 32`)
    }
    return row.split('').map(c => {
      const v = def.palette[c]
      if (v === undefined) {
        throw new Error(`${name} sprite row ${i} has unknown char '${c}'`)
      }
      return v
    })
  })
  return { def, pixels }
}

const SPRITES: Record<PokemonName, CompiledSprite> = {
  pikachu: compile('pikachu', PIKACHU),
  squirtle: compile('squirtle', SQUIRTLE),
}

export const POKEMON_NAMES: PokemonName[] = Object.keys(SPRITES) as PokemonName[]

function pickRandom(): PokemonName {
  return POKEMON_NAMES[Math.floor(Math.random() * POKEMON_NAMES.length)]
}

function inBox(x: number, boxes: Box[]): boolean {
  return boxes.some(b => x >= b.x0 && x <= b.x1)
}

function closedEyePixel(def: SpriteDef, x: number, y: number): number | null {
  if (!def.eyeRowsAll.includes(y)) { return null }
  if (y === def.eyeRowMid) {
    return inBox(x, def.eyesOuter) ? K : null
  }
  return inBox(x, def.eyesInner) ? def.closedInterior : null
}

export type PokemonSelection = PokemonName | 'random'

export class PokemonWidget extends Widget {
  protected override updateIntervalMs = 50

  private readonly selection: PokemonSelection
  private current: PokemonName

  private blinking = false
  private nextBlinkAt = 0
  private blinkEndAt = 0
  private pendingDoubleBlink = false

  constructor(selection: PokemonSelection, size: Size = { width: 32, height: 32 }, border: number = 0) {
    super(size, border)
    this.selection = selection
    this.current = selection === 'random' ? pickRandom() : selection
  }

  public override activate(): void {
    const repicked = this.selection === 'random'
    if (repicked) {
      this.current = pickRandom()
    }
    this.blinking = false
    this.pendingDoubleBlink = false
    this.scheduleNextBlink(500)
    super.activate()
    // Page.activate() draws before activating widgets, so a freshly-picked
    // random pokemon wouldn't appear until the first blink. Force a redraw.
    if (repicked) {
      this.draw(true)
    }
  }

  private scheduleNextBlink(minMs: number = 1200): void {
    this.nextBlinkAt = Date.now() + minMs + Math.random() * 2500
  }

  protected override update(): void {
    const now = Date.now()
    let changed = false

    if (!this.blinking && now >= this.nextBlinkAt) {
      this.blinking = true
      this.blinkEndAt = now + 90 + Math.random() * 80
      changed = true
    } else if (this.blinking && now >= this.blinkEndAt) {
      this.blinking = false
      if (this.pendingDoubleBlink) {
        this.pendingDoubleBlink = false
        this.scheduleNextBlink(120)
      } else {
        this.pendingDoubleBlink = Math.random() < 0.2
        this.scheduleNextBlink()
      }
      changed = true
    }

    if (changed && this.isActive) {
      this.draw(true)
    }
  }

  public override draw(sync: boolean = true): void {
    super.draw(false)
    if (!this.matrix) { return }

    const sprite = SPRITES[this.current]
    const pixels = sprite.pixels
    const spriteH = pixels.length
    const spriteW = pixels[0].length
    const offsetX = this.origin.x + Math.floor((this.size.width - spriteW) / 2)
    const offsetY = this.origin.y + Math.floor((this.size.height - spriteH) / 2)

    for (let y = 0; y < spriteH; y++) {
      for (let x = 0; x < spriteW; x++) {
        let color = pixels[y][x]
        if (this.blinking) {
          const override = closedEyePixel(sprite.def, x, y)
          if (override !== null) { color = override }
        }
        if (color < 0) { continue }
        this.matrix.fgColor(color).setPixel(offsetX + x, offsetY + y)
      }
    }

    if (sync) {
      this.matrix.sync()
    }
  }
}
