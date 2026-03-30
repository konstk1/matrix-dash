import { Page } from './pages/page'
import log from './log'

export type PageConfig = {
  page: Page
  durationSec: number
}

export class PageCarousel {
  private pages: PageConfig[]
  private currentIndex = 0
  private timer?: NodeJS.Timeout

  constructor(pages: PageConfig[]) {
    this.pages = pages
  }

  public currentPage(): Page {
    return this.pages[this.currentIndex].page
  }

  public start(): void {
    this.currentIndex = 0
    this.currentPage().activate()
    this.scheduleNext()
  }

  public stop(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    this.currentPage().deactivate()
  }

  private scheduleNext(): void {
    const duration = this.pages[this.currentIndex].durationSec
    this.timer = setTimeout(() => this.advance(), duration * 1000)
    log.verbose(`PageCarousel: showing "${this.currentPage().title}" for ${duration}s`)
  }

  private advance(): void {
    this.currentPage().deactivate()
    this.currentIndex = (this.currentIndex + 1) % this.pages.length
    this.currentPage().activate()
    this.scheduleNext()
  }
}
