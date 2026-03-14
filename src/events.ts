
import { EventEmitter } from 'events'

export type WidgetEvent = 'RequestActive' | 'EndActive'

export const eventEmitter = new EventEmitter()

export function emitWidgetEvent(event: WidgetEvent, widget: any) {
  eventEmitter.emit(event, widget)
}

export function addWidgetEventListener(event: WidgetEvent, callback: (sender: any) => void) {
  eventEmitter.addListener(event, callback)
}

export function removeWidgetEventListener(event: WidgetEvent, callback: (sender: any) => void) {
  eventEmitter.removeListener(event, callback)
}