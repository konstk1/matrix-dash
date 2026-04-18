import { Widget, Size } from './widget'

type Box = { x0: number, x1: number }

type EyeConfig = {
  rowMid: number        // row drawn as a full black line when blinking
  rowsAll: number[]     // all rows that contain eye pixels
  outer: Box[]          // full eye box per eye, inclusive
  closedColor: string   // hex color painted on non-mid rows when blinking
}

type SpriteDef = {
  palette: Record<string, string>  // char -> '#RRGGBB'; '.' is implicit transparent
  rows: string[]
  eyes?: EyeConfig      // omit to disable blinking entirely
}

const BLACK = 0x000000
const TRANSPARENT = -1

function parseHex(s: string): number {
  const m = /^#([0-9a-fA-F]{6})$/.exec(s)
  if (!m) { throw new Error(`invalid hex color '${s}'`) }
  return parseInt(m[1], 16)
}

const PIKACHU: SpriteDef = {
  palette: { k: '#000000', y: '#FFD300', r: '#FF3030', w: '#FFFFFF' },
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
  eyes: {
    rowMid: 14,
    rowsAll: [13, 14, 15],
    outer: [{ x0: 7, x1: 10 }, { x0: 21, x1: 24 }],
    closedColor: '#FFD300',
  },
}

const SQUIRTLE: SpriteDef = {
  palette: { k: '#000000', b: '#66B2E0', w: '#FFFFFF', s: '#8B4513', c: '#FFE088' },
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
  eyes: {
    rowMid: 9,
    rowsAll: [7, 8, 9, 10],
    outer: [{ x0: 9, x1: 12 }, { x0: 15, x1: 18 }],
    closedColor: '#66B2E0',
  },
}

const POKEBALL: SpriteDef = {
  palette: { k: '#000000', r: '#EE1515', w: '#FFFFFF' },
  rows: [
    '................................',
    '................................',
    '............kkkkkkkk............',
    '.........krrrrrrrrrrrk..........',
    '........krrrrrrrrrrrrrrk........',
    '.......krrrrrrrrrrrrrrrrk.......',
    '......krrrrrrrrrrrrrrrrrrk......',
    '.....krrrrrrrrrrrrrrrrrrrrk.....',
    '....krrrrrrrrrrrrrrrrrrrrrrk....',
    '....krrrrrrrrrrrrrrrrrrrrrrk....',
    '...krrrrrrrrrrrrrrrrrrrrrrrrk...',
    '...krrrrrrrrrrrrrrrrrrrrrrrrk...',
    '..krrrrrrrrrrrrrrrrrrrrrrrrrrk..',
    '..krrrrrrrrrrrkkkkrrrrrrrrrrrk..',
    '..kkkkkkkkkkkkwwwwkkkkkkkkkkkk..',
    '..kkkkkkkkkkkkwwwwkkkkkkkkkkkk..',
    '..kkkkkkkkkkkkwwwwkkkkkkkkkkkk..',
    '..kwwwwwwwwwwwkkkkwwwwwwwwwwwk..',
    '..kwwwwwwwwwwwwwwwwwwwwwwwwwwk..',
    '..kwwwwwwwwwwwwwwwwwwwwwwwwwwk..',
    '...kwwwwwwwwwwwwwwwwwwwwwwwwk...',
    '...kwwwwwwwwwwwwwwwwwwwwwwwwk...',
    '....kwwwwwwwwwwwwwwwwwwwwwwk....',
    '....kwwwwwwwwwwwwwwwwwwwwwwk....',
    '.....kwwwwwwwwwwwwwwwwwwwwk.....',
    '......kwwwwwwwwwwwwwwwwwwk......',
    '.......kwwwwwwwwwwwwwwwwk.......',
    '........kwwwwwwwwwwwwwwk........',
    '.........kwwwwwwwwwwwk..........',
    '............kkkkkkkk............',
    '................................',
    '................................',
  ],
}

const EEVEE: SpriteDef = {
  palette: {
    k: '#000000', w: '#FFFFFF',
    E: '#C88A50', D: '#5A3018', M: '#F0D4A0',
  },
  rows: [
    '................................',
    '................................',
    '.......kk............kk.........',
    '.......kDk..........kDk.........',
    '......kDDk..........kDDk........',
    '......kDDDk........kDDDk........',
    '......kDDDk........kDDDk........',
    '......kDDDkkkkkkkkkDDDk.........',
    '......kEEEEEEEEEEEEEEEEk........',
    '......kEEEEEEEEEEEEEEEEk........',
    '......kEEEEEEEEEEEEEEEEk........',
    '......kEEkkEEEEEEEEkkEEk........',
    '......kEkwwkEEEEEEkwwkEk........',
    '......kEEkkEEEEEEEEkkEEk........',
    '......kEEEEEEEEEEEEEEEEk........',
    '......kEEEEEEEkkkEEEEEEk........',
    '......kEEEEEEEEEEEEEEEEk........',
    '.......kEEEEEEEEEEEEEEk.........',
    '.......kMMMMMMMMMMMMMMk.........',
    '......kMMMMMMMMMMMMMMMMk........',
    '.....kMMMMMMMMMMMMMMMMMMk.......',
    '.....kMMMMMMMMMMMMMMMMMMk.......',
    '.....kkMMMMMMMMMMMMMMMMkk.......',
    '......kEEEEEEEEEEEEEEEEk........',
    '......kEEEEEEEEEEEEEEEEk........',
    '......kkEEEEEEEEEEEEEEkk........',
    '........kkkk....kkkk............',
    '........kEEk....kEEk............',
    '........kkkk....kkkk............',
    '................................',
    '................................',
    '................................',
  ],
  eyes: {
    rowMid: 12,
    rowsAll: [11, 12, 13],
    outer: [{ x0: 8, x1: 11 }, { x0: 18, x1: 21 }],
    closedColor: '#C88A50',
  },
}

const EEVEE2: SpriteDef = {
  palette: {
    a: '#f9f9f9', b: '#282828', c: '#f0d9bc', d: '#8c603e',
    e: '#f1d9bc', f: '#ba8d57', g: '#572f20', h: '#ddb68a',
  },
  rows: [
    'cccccccagdgbbgdbaccccccaaddffffb',
    'eeecheeagdgbbddbaeeeeaaadffdbbdb',
    'cccgheeagdgbbdbaaeceaagdfdbbbdba',
    'chgbhecagdgbddbaeceaagffbbggbdba',
    'cghgaeeagdbbdbaaccaagffbbggbdbaa',
    'cccccccaagbfgbgaaaagdfbbgggbdbac',
    'ceegecaagdgffgfbbagffbbggggdbaac',
    'cegheaagfdfdfdffdbgfbbbgggdbaacc',
    'cceeeagfffffffdffgfdfbbbddbaacaa',
    'ceecaagfffffffffffffggddbbaaaaag',
    'ccccadfffffffffffffgddgbaaaaaghc',
    'ceecadgffffffffffffdggaaacaaghec',
    'ceecagagfffffffffffddbaccaaghcec',
    'ceeeabbbffffffdgffffdbacaagfceec',
    'ceeaabgbffffffgabfffdbacagfhceec',
    'cccadfbdffffffbbbffddbaaagfhhfhc',
    'cccagfffgfffffbgbffddbaagddhfdfh',
    'cceagfffffffffgbdfddghbagddfddfd',
    'cccaadfdgfffgfffffddghhgdddddddd',
    'ceeaagfffdggfffffddghhhhbddddddd',
    'ceaafcbdfffffffddddghhhhbddddddd',
    'caafchfgbdfffddddgghhhfhhgdddddd',
    'eafehccffegggggggfhhhhhfbgdddddd',
    'cafchefeeeeehhhhhhfhhhhhbggddddd',
    'cafhcheceeceechfhhhfhhfbgggggddd',
    'caaghfceeeeeeeehfhhfhhfbbggggggg',
    'ccaghfeceeceecehfhhfhhbdbggggggg',
    'ccaaggeceeceechhfhfhhbdddbgggggg',
    'cccaaagheeeehhhfhhfbgddddbgggggd',
    'cccccagfhhhhfhhbgfbdddddddbggeeh',
    'cccceaaghfhhfhbgdbddgdddddbggegf',
    'ccccccaagbhfhbggddddgdddddbbbfaa',
  ],
}

const DEFS = {
  pikachu: PIKACHU,
  squirtle: SQUIRTLE,
  pokeball: POKEBALL,
  eevee: EEVEE,
  eevee2: EEVEE2,
} as const

export type PokemonName = keyof typeof DEFS

type CompiledEyes = {
  rowMid: number
  rowsAll: number[]
  outer: Box[]
  closedColor: number
}

type CompiledSprite = {
  pixels: number[][]
  eyes?: CompiledEyes
}

function compile(name: string, def: SpriteDef): CompiledSprite {
  const pixels = def.rows.map((row, i) => {
    if (row.length !== 32) {
      throw new Error(`${name} sprite row ${i} has length ${row.length}, expected 32`)
    }
    return row.split('').map(c => {
      if (c === '.') { return TRANSPARENT }
      const v = def.palette[c]
      if (v === undefined) {
        throw new Error(`${name} sprite row ${i} has unknown char '${c}'`)
      }
      return parseHex(v)
    })
  })
  const eyes = def.eyes ? {
    rowMid: def.eyes.rowMid,
    rowsAll: def.eyes.rowsAll,
    outer: def.eyes.outer,
    closedColor: parseHex(def.eyes.closedColor),
  } : undefined
  return { pixels, eyes }
}

const SPRITES: Record<PokemonName, CompiledSprite> = {
  pikachu: compile('pikachu', PIKACHU),
  squirtle: compile('squirtle', SQUIRTLE),
  pokeball: compile('pokeball', POKEBALL),
  eevee: compile('eevee', EEVEE),
  eevee2: compile('eevee2', EEVEE2),
}

export const POKEMON_NAMES: PokemonName[] = Object.keys(SPRITES) as PokemonName[]

function inBox(x: number, boxes: Box[]): boolean {
  return boxes.some(b => x >= b.x0 && x <= b.x1)
}

function closedEyePixel(eyes: CompiledEyes | undefined, x: number, y: number): number | null {
  if (!eyes || !eyes.rowsAll.includes(y)) { return null }
  if (!inBox(x, eyes.outer)) { return null }
  return y === eyes.rowMid ? BLACK : eyes.closedColor
}

export class PokemonWidget extends Widget {
  protected override updateIntervalMs = 50

  private current: PokemonName

  private blinking = false
  private nextBlinkAt = 0
  private blinkEndAt = 0
  private pendingDoubleBlink = false

  constructor(name: PokemonName, size: Size = { width: 32, height: 32 }, border: number = 0) {
    super(size, border)
    this.current = name
  }

  public setPokemon(name: PokemonName): void {
    this.current = name
  }

  public override activate(): void {
    this.blinking = false
    this.pendingDoubleBlink = false
    if (this.hasBlink()) {
      this.scheduleNextBlink(500)
    }
    super.activate()
  }

  private hasBlink(): boolean {
    return SPRITES[this.current].eyes !== undefined
  }

  private scheduleNextBlink(minMs: number = 1200): void {
    this.nextBlinkAt = Date.now() + minMs + Math.random() * 2500
  }

  protected override update(): void {
    if (!this.hasBlink()) { return }

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
          const override = closedEyePixel(sprite.eyes, x, y)
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
