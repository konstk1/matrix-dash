import { Widget, Size } from './widget'

type Box = { x0: number, x1: number }

type EyeConfig = {
  rowMid: number        // row drawn as a full black line when blinking
  rowsAll: number[]     // all rows that contain eye pixels
  outer: Box[]          // full eye box per eye, inclusive
  closedColor: string   // hex color painted on non-mid rows when blinking
}

type SpriteDef = {
  palette: Record<string, string>  // char -> '#RRGGBB'; ' ' transparent; '.' implicit black (omit #000000)
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
    '                                ',
    '         kk          kk         ',
    '        kyyk        kyyk        ',
    '        kyyk        kyyk        ',
    '       kyyyyk      kyyyyk       ',
    '       kyyyyk      kyyyyk       ',
    '      kyyyyyyk    kyyyyyyk      ',
    '      kyyyyyyk    kyyyyyyk      ',
    '     kyyyyyyyykkkkyyyyyyyyk     ',
    '     kyyyyyyyyyyyyyyyyyyyyk     ',
    '    kyyyyyyyyyyyyyyyyyyyyyyk    ',
    '    kyyyyyyyyyyyyyyyyyyyyyyk    ',
    '   kyyyyyyyyyyyyyyyyyyyyyyyyk   ',
    '   kyyyykkyyyyyyyyyyyykkyyyyk   ',
    '   kyyykwwkyyyyyyyyyykwwkyyyk   ',
    '   kyyyykkyyyyyyyyyyyykkyyyyk   ',
    '   kyrryyyyyyyyyyyyyyyyyrryyk   ',
    '   kyrrryyyyyykkkkyyyyyyrrryk   ',
    '   kyrrryyyyykkkkkkyyyyyrrryk   ',
    '   kyyrryyyyyykkkkyyyyyyrryyk   ',
    '    kyyyyyyyyyyyyyyyyyyyyyyk    ',
    '    kyyyyyyyyyyyyyyyyyyyyyyk    ',
    '     kyyyyyyyyyyyyyyyyyyyyk     ',
    '      kyyyyyyyyyyyyyyyyyyk      ',
    '       kkyyyyyyyyyyyyyykk       ',
    '         kkkkkkkkkkkkkk         ',
    '                                ',
    '                                ',
    '                                ',
    '                                ',
    '                                ',
    '                                ',
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
    '                                ',
    '                                ',
    '           kkkkkk               ',
    '         kkbbbbbbkk             ',
    '        kbbbbbbbbbbk            ',
    '       kbbbbbbbbbbbbk           ',
    '       kbbbbbbbbbbbbk           ',
    '       kbbkkbbbbkkbbk           ',
    '       kbkwwkbbkwwkbk           ',
    '       kbkwkkbbkkwkbk           ',
    '       kbbkkbbbbkkbbk           ',
    '       kbbbbbbbbbbbbk           ',
    '       kbbbbkkkkbbbbk           ',
    '        kbbbbbbbbbbk            ',
    '         kkbbbbbbkk             ',
    '          kbbbbbbk              ',
    '       kbbsccccccccsbbk         ',
    '     kbbbsccccccccccsbbbk       ',
    '    kbbbbsccccccccccccsbbbbk    ',
    '    kbbbbsccccccccccccsbbbbk    ',
    '    kbbbbsccccccccccccsbbbbk    ',
    '     kbbbsccccccccccsbbbk       ',
    '       kbbsccccccccsbbk         ',
    '        kbbbbbbbbbbbbk          ',
    '        kbbk      kbbk          ',
    '        kbbk      kbbk          ',
    '         kk        kk           ',
    '                                ',
    '                                ',
    '                                ',
    '                                ',
    '                                ',
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
    '                                ',
    '                                ',
    '            kkkkkkkk            ',
    '         krrrrrrrrrrrk          ',
    '        krrrrrrrrrrrrrrk        ',
    '       krrrrrrrrrrrrrrrrk       ',
    '      krrrrrrrrrrrrrrrrrrk      ',
    '     krrrrrrrrrrrrrrrrrrrrk     ',
    '    krrrrrrrrrrrrrrrrrrrrrrk    ',
    '    krrrrrrrrrrrrrrrrrrrrrrk    ',
    '   krrrrrrrrrrrrrrrrrrrrrrrrk   ',
    '   krrrrrrrrrrrrrrrrrrrrrrrrk   ',
    '  krrrrrrrrrrrrrrrrrrrrrrrrrrk  ',
    '  krrrrrrrrrrrkkkkrrrrrrrrrrrk  ',
    '  kkkkkkkkkkkkwwwwkkkkkkkkkkkk  ',
    '  kkkkkkkkkkkkwwwwkkkkkkkkkkkk  ',
    '  kkkkkkkkkkkkwwwwkkkkkkkkkkkk  ',
    '  kwwwwwwwwwwwkkkkwwwwwwwwwwwk  ',
    '  kwwwwwwwwwwwwwwwwwwwwwwwwwwk  ',
    '  kwwwwwwwwwwwwwwwwwwwwwwwwwwk  ',
    '   kwwwwwwwwwwwwwwwwwwwwwwwwk   ',
    '   kwwwwwwwwwwwwwwwwwwwwwwwwk   ',
    '    kwwwwwwwwwwwwwwwwwwwwwwk    ',
    '    kwwwwwwwwwwwwwwwwwwwwwwk    ',
    '     kwwwwwwwwwwwwwwwwwwwwk     ',
    '      kwwwwwwwwwwwwwwwwwwk      ',
    '       kwwwwwwwwwwwwwwwwk       ',
    '        kwwwwwwwwwwwwwwk        ',
    '         kwwwwwwwwwwwk          ',
    '            kkkkkkkk            ',
    '                                ',
    '                                ',
  ],
}

const EEVEE: SpriteDef = {
  palette: {
    k: '#000000', w: '#FFFFFF',
    E: '#C88A50', D: '#5A3018', M: '#F0D4A0',
  },
  rows: [
    '                                ',
    '                                ',
    '       kk            kk         ',
    '       kDk          kDk         ',
    '      kDDk          kDDk        ',
    '      kDDDk        kDDDk        ',
    '      kDDDk        kDDDk        ',
    '      kDDDkkkkkkkkkDDDk         ',
    '      kEEEEEEEEEEEEEEEEk        ',
    '      kEEEEEEEEEEEEEEEEk        ',
    '      kEEEEEEEEEEEEEEEEk        ',
    '      kEEkkEEEEEEEEkkEEk        ',
    '      kEkwwkEEEEEEkwwkEk        ',
    '      kEEkkEEEEEEEEkkEEk        ',
    '      kEEEEEEEEEEEEEEEEk        ',
    '      kEEEEEEEkkkEEEEEEk        ',
    '      kEEEEEEEEEEEEEEEEk        ',
    '       kEEEEEEEEEEEEEEk         ',
    '       kMMMMMMMMMMMMMMk         ',
    '      kMMMMMMMMMMMMMMMMk        ',
    '     kMMMMMMMMMMMMMMMMMMk       ',
    '     kMMMMMMMMMMMMMMMMMMk       ',
    '     kkMMMMMMMMMMMMMMMMkk       ',
    '      kEEEEEEEEEEEEEEEEk        ',
    '      kEEEEEEEEEEEEEEEEk        ',
    '      kkEEEEEEEEEEEEEEkk        ',
    '        kkkk    kkkk            ',
    '        kEEk    kEEk            ',
    '        kkkk    kkkk            ',
    '                                ',
    '                                ',
    '                                ',
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

const BULBASAUR: SpriteDef = {
  palette: {
    a: '#03a9f4',
    b: '#4caf50',
    c: '#000000',
    d: '#80d8ff',
    e: '#ffffff',
    f: '#cddc39',
    g: '#3f51b5',
    h: '#33691e',
    i: '#455a64',
    j: '#8bc34a',
    k: '#b71c1c',
    l: '#e57373',
    m: '#e0e0e0',
    n: '#f44336',
  },
  rows: [
    '                                ',
    '                                ',
    '                             h  ',
    '                           hhbcc',
    '                   hhhhhhhhbhhhb',
    '                 hhffffffbbbhbhb',
    '                hfffffffffhhbbbh',
    '     cc        hfffffcchhhfbbbbh',
    '    iadcc iiiiccccfccdacffffbbbh',
    '    iaadiiadddddddcadaacffffbbbh',
    '    iaiaaddddggddaaaaaacffffbbbh',
    '    iiadddddgggddaaaaaaacfffbbbh',
    '    iaddddggggdddaaaaaaacffbbbbh',
    '    iaddddgggdddaaccaaaacfbbbbbh',
    '   icaddddddddddacmmcaaaacbbbbhb',
    '   cncaddddggddacnkemcaaaacbbbhb',
    '   cncadddgggdaacnkeecaaaacbbhbb',
    '  imnecaddggddacnekkemaaacccbhbb',
    '  iekecadddddaackellemaaaicccbbb',
    '  imkkcaaaaaaaackklleaaaaaaaaccb',
    '  ccaaaaaaaaaaaaaaaaaacaaaaaaaac',
    '  caccaacaacaaaaaaicccaaiaaaggaa',
    '   caiekaaaaaicccceiaaaacaaaggga',
    '    caaikkkkkkkkkkiaaaacaaaaagga',
    '     ccaaiknlllliaaaaccaaaaaiaaa',
    '       ccaaaaaaaaacccaaaaaacaaag',
    '       cacccccccccaaaaaaacacaagg',
    '       cdddacaaaaaacddagaacaaagg',
    '        caddacaaaacaaddaaacaaagg',
    '        caddacaaaacaaggaaacaaagg',
    '        iaddaaccccadaggaaacaaaag',
    '        adddaac   addddaacacaaaa',
  ],
}

const DRAGONITE: SpriteDef = {
  palette: {
    a: '#b7b7b5',
    b: '#c8c8c6',
    c: '#d6d6d4',
    d: '#a9a9a7',
    e: '#959593',
    f: '#e9b748',
    g: '#f3c550',
    h: '#e9e9e7',
    i: '#af6f29',
    j: '#d5d3ae',
    k: '#3b3b43',
    l: '#069677',
    m: '#0dd698',
    n: '#404048',
    o: '#bcb860',
  },
  rows: [
    '                                ',
    '                                ',
    '                                ',
    '                                ',
    '                                ',
    '     .       ..                 ',
    '    .f.     .ik.   ..           ',
    '    .g.    .iii.  .j.           ',
    '     .j..  .klik..j.  ..        ',
    '      .oo..ffkkjjj.  .ff.       ',
    '       .k.fiikjk..   .flf.      ',
    '        .fffkjkg.   .ffllf.     ',
    '      ..kfffgigg.   .fllmf.     ',
    '    ..ikfffh.gggg. .flmlmmf.    ',
    '   .aikffff..hggg..glmm...f.    ',
    '   .iikffffinhggggg..m.   .     ',
    '    .ikffifgggggggggg..         ',
    '     ...fffginggnggggff.  .     ',
    '        ..kknjiggnggffhk..i.    ',
    '          .kjjjgggnghikiiii.    ',
    '         .ikgggggifkkkiiii.     ',
    '         .iikjjjiffffkiii.      ',
    '          .kikggifffffk..       ',
    '           ....jkfffff.         ',
    '               ...fff.          ',
    '                  .cic.         ',
  ],
}

const CHARMANDER: SpriteDef = {
  palette: {
    a: '#fefefe',
    b: '#aa5504',
    c: '#fc7605',
    d: '#050101',
    e: '#fdb370',
    f: '#5c0201',
    g: '#fab307',
    h: '#b18154',
    i: '#fcf809',
    j: '#f30909',
    k: '#b97d4f',
    l: '#279753',
    m: '#e8b394',
    n: '#ffffbf',
    o: '#f2f163',
    p: '#c17d50',
  },
  rows: [
    '                                ',
    '                                ',
    '                                ',
    '                 cff            ',
    '               ggccccf          ',
    '              cggccccc          ',
    '             ccgccccccf         ',
    '             dbcccbdbbd         ',
    '             lbccccdfbd         ',
    '             dccccgddbd         ',
    '          no ggcccclbbd         ',
    '        gij  bccccbfbb  bbd     ',
    '      jiii    bffbmbfbbbccgd    ',
    '      giij     dbffbbbbbbbd     ',
    '     jijij      bddbeefb        ',
    '     jiiijji   cgcbbeecd        ',
    '    jiiggj     fcgccfeee        ',
    '    jgijjj      fccccdee        ',
    '      ff   ff  fdbddmeeed       ',
    '      gb  f   bcccbeeeeed       ',
    '      gb  dhbfbcccceeeeebd      ',
    '      bc  fbhbbccceeeeepbd      ',
    '      bcbb fkbbbbceeeekbbd      ',
    '      bbccccbbddfkkkkhdbd       ',
    '       fbbccddbbbfhhhhbb        ',
    '        dfhbbbbhhhkdbbd         ',
    '          dfhhhhhddbbbf         ',
    '                   dbcbb        ',
    '                     ddd        ',
    '                                ',
    '                                ',
    '                                ',
  ],
}

const ZUBAT: SpriteDef = {
  palette: {
    a: '#ffffff',
    b: '#211f1d',
    c: '#7299af',
    d: '#404040',
    e: '#c18bc3',
    f: '#c0c0c0',
    g: '#4e7083',
    h: '#070707',
    i: '#27272d',
    j: '#161514',
    k: '#956497',
    l: '#121c20',
    m: '#ecb9ee',
    n: '#395363',
    o: '#2a3f4a',
    p: '#b08ab2',
  },
  rows: [
    '     bb            bbbbb        ',
    '    bccbb         bccccgb       ',
    '    bckccbb      bccbkkgb       ',
    '   jhlkhhiih     hihiklh        ',
    '    bgebbccb     bcbkegb        ',
    '     bgekbccb  hbcbkeegb        ',
    '      bgekbgbbblgcbeegb    bjb  ',
    '       bgebccccccckggb   bbcgcb ',
    '        bbcbbbbiccgbb  bbccbjb  ',
    '        bcbbbbbhbbccb bccgb     ',
    '       bcbabbbbbabccbbggbb      ',
    '        bcbbbbbhbbbccbbb        ',
    '        bgbabbahbbbcbbkb        ',
    '       bgbcbbbbhbccbbgbeb       ',
    '      bgbkbccccccbbgbgbeb       ',
    '     bgbkkbbbbgggggb bcbeb      ',
    '   j glekkhhhhlhlllh hiieh      ',
    '  bhbcbeekb   bbbbb  bcbeeb     ',
    ' bcicbgeeeb          bcbeeb     ',
    'bcbhbegceeeb        bcbcceb     ',
    'bcbheeegceeb       bccbcgcb     ',
    'bcglbeeegceb       bgcbeeggbj   ',
    ' bcibemeegcb        bgcbeeeekb  ',
    '  bhcbemmegb         bbcbemekb  ',
    '    bcbemmeb           bcbempeb ',
    '    bcbeeeb             bcbekeb ',
    '     bcbeeb              bcbjeb ',
    '      bcbeb               bcgbb ',
    '       jgjj               jnogj ',
    '       jgjj               jnogj ',
    '        bcgb               bjcb ',
    '         bb                  b  ',
  ],
};


const DEFS = {
  pikachu: PIKACHU,
  squirtle: SQUIRTLE,
  pokeball: POKEBALL,
  eevee: EEVEE,
  eevee2: EEVEE2,
  bulbasaur: BULBASAUR,
  dragonite: DRAGONITE,
  charmander: CHARMANDER,
  zubat: ZUBAT,
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
      if (c === ' ') { return TRANSPARENT }
      if (c === '.') { return BLACK }
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
  bulbasaur: compile('bulbasaur', BULBASAUR),
  dragonite: compile('dragonite', DRAGONITE),
  charmander: compile('charmander', CHARMANDER),
  zubat: compile('zubat', ZUBAT),
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
