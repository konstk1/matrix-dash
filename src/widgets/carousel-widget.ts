import { onWidgetEvent, type WidgetEvent } from '../events'
import { Widget } from './widget'
import log from '../log'

type WidgetEntry = {
  widget: Widget,
  displayTimeSec: number, // 0 means display indefinitely
  priority: number,
  defaultPriority: number,
  activePriority: number,
  lastDisplayTime: number,
}

export class CarouselWidget extends Widget {
  private widgets: WidgetEntry[] = []
  private currentWidget?: WidgetEntry

  // public override updateIntervalMs: number = 0;

  private widgetDisplayTimer?: NodeJS.Timeout

  constructor(size: { width: number, height: number }, border: number = 0) {
    super(size, border)

    onWidgetEvent('RequestActive', (sender: any) => {
      this.processWidgetEvent('RequestActive', sender)
    })

    onWidgetEvent('EndActive', (sender: any) => {
      this.processWidgetEvent('EndActive', sender)
    })
  }

  private processWidgetEvent(event: WidgetEvent, sender: any) {
    const widget = this.widgets.find(w => w.widget == sender)

    if (!widget) {
      log.warn(`CarouselWidget: unknown widget ${sender}`)
      return
    }

    if (event === 'RequestActive') {
      widget.priority = widget.activePriority
    } else if (event === 'EndActive') {
      widget.priority = widget.defaultPriority
    } else {
      log.warn(`CarouselWidget: unknown event ${event}`)
      return
    }

    this.activateNextWidget()
  }

  public override activate(): void {
    // this.widgets.forEach(w => w.widget.activate())
    this.activateNextWidget()
  }

  public override deactivate(): void {
    this.widgets.forEach(w => w.widget.deactivate())
  }

  public addWidget(widget: Widget,
    { displayTimeSec, defaultPriority, activePriority }:
      { displayTimeSec: number, defaultPriority: number, activePriority: number }) {
    this.widgets.push({
      widget,
      displayTimeSec,
      priority: defaultPriority,
      defaultPriority,
      activePriority,
      lastDisplayTime: 0,
    })

    // if (!this.currentWidget || this.currentWidget.priority < defaultPriority) {
    //   this.activateNextWidget()
    // }
  }

  public numWidgets(): number {
    return this.widgets.length
  }

  public activeWidget(): Widget | undefined {
    return this.currentWidget?.widget
  }

  private activateNextWidget() {
    // find the highest priority widgets that are not the current widget
    const highestPriority = Math.max(...this.widgets.map(w => w.priority))
    const highestWidgets = this.widgets.filter(w => w.priority == highestPriority && w.widget != this.activeWidget())
    if (highestWidgets.length == 0) {
      return
    }

    // find oldest displayed widget
    const oldestWidget = highestWidgets.reduce((prev, curr) => {
      return curr.lastDisplayTime < prev.lastDisplayTime ? curr : prev
    })

    if (!oldestWidget) {
      return
    }

    this.currentWidget?.widget.deactivate()
    clearInterval(this.widgetDisplayTimer)

    // set interval to display the next widget
    this.currentWidget = oldestWidget
    this.currentWidget.lastDisplayTime = Date.now()

    // set current widget origin to this origin
    if (this.currentWidget) {
      this.currentWidget.widget.origin = this.origin
    }
    this.currentWidget?.widget.activate()

    if (this.currentWidget.displayTimeSec > 0) {
      this.widgetDisplayTimer = setInterval(this.activateNextWidget.bind(this), this.currentWidget.displayTimeSec * 1000)
    }

    log.info(`CarouselWidget: switching to widget ${this.widgets.indexOf(this.currentWidget)}`)
  }

  public override draw(sync: boolean = true): void {
    super.draw(false)

    if (!this.matrix) { return }

    if (this.widgets.length == 0) {
      log.warn('No widgets to draw')
      return
    }

    this.activeWidget()?.draw(false)

    // if (this.widgets[this.currentWidget].isDone()) {
    //   this.currentWidget = (this.currentWidget + 1) % this.widgets.length
    // }

    if (sync) {
      this.matrix.sync()
    }
  }
}