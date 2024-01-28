import { Widget } from './widget'
import log from '../log'

type WidgetEntry = {
  widget: Widget,
  displayTimeSec: number,
  defaultPriority: number,
  activePriority: number,
  lastDisplayTime: number,
}

export class CarouselWidget extends Widget {
  private widgets: WidgetEntry[] = [];
  private currentWidget = -1; // on activate, will be incremented to 0

  public override updateIntervalMs: number = 5000;

  constructor(size: { width: number, height: number }, border: number = 0) {
    super(size, border)
  }

  public addWidget(widget: Widget,
    { displayTimeSec, defaultPriority, activePriority }:
      { displayTimeSec: number, defaultPriority: number, activePriority: number }) {
    this.widgets.push({
      widget,
      displayTimeSec,
      defaultPriority,
      activePriority,
      lastDisplayTime: 0,
    })
  }

  public numWidgets(): number {
    return this.widgets.length
  }

  public activeWidget(): Widget {
    return this.widgets[this.currentWidget].widget
  }

  public override update() {
    this.currentWidget = (this.currentWidget + 1) % this.widgets.length
    log.debug(`CarouselWidget: switching to widget ${this.currentWidget}`)
  }

  public override draw(sync: boolean = true): void {
    super.draw(false)

    if (!this.matrix) { return }

    if (this.widgets.length == 0) {
      log.warn('No widgets to draw')
      return
    }

    this.activeWidget().draw(false)

    // if (this.widgets[this.currentWidget].isDone()) {
    //   this.currentWidget = (this.currentWidget + 1) % this.widgets.length
    // }

    if (sync) {
      this.matrix.sync()
    }
  }
}