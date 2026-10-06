import { Page } from '../../pages/page'
import { HalloweenAnimation, pickAnimation } from './animation'
import { HalloweenWidget } from './widget'

export class HalloweenPage extends Page {
  private previous?: HalloweenAnimation
  private readonly animationWidget = new HalloweenWidget()

  constructor() {
    super('halloween')
    this.addWidget(this.animationWidget, { x: 0, y: 0 })
  }

  public override activate(): void {
    const animation = pickAnimation(this.previous)
    this.previous = animation
    this.title = `halloween:${animation}`
    this.animationWidget.restart(animation)
    super.activate()
  }
}

export function createHalloweenPage(): Page {
  return new HalloweenPage()
}
