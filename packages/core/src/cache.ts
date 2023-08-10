import {
Page,
PreserveStateOption,
} from './types'
import { hrefToUrl, urlWithoutHash } from './url'
import { default as Axios } from 'axios'

export type PageCache = { [key: string]: {
  pageResponse: Page,
  visitId?: unknown,
  replace?: boolean,
  preserveScroll?: PreserveStateOption,
  preserveState?: PreserveStateOption,
  expiresAt: Date,
  updatedAt?: Date,
} }  

export type PrefetchOptions = {
  durationInMinutes?: number,
  isStatic?: boolean,
  visit?: () => void,
}

export default class CacheManager {
  public on: boolean = true
  public version: string | null = null
  private static instance: CacheManager
  protected pages: PageCache = {}
  protected sizeLimit: number = 20
  protected ignoredUrl: string[] = []
  protected prefetchRetries: number = 0
  protected totalPrefetchRetries: number = 3

  public static create() {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  public isEmpty() {
    return Object.keys(this.pages).length === 0
  }

  public set(key: string, value: PageCache[keyof PageCache]) {
    if (!this.shouldCache(key)) {
      return;
    }

    const total = Object.keys(this.pages).length

    if (total >= this.sizeLimit) {
      const leastUsedPage = Object.keys(this.pages).sort(
        (a, b) => {
          let aTime = this.pages[a].updatedAt?.getTime() || 0;
          let bTime = this.pages[b].updatedAt?.getTime() || 0;
          return aTime - bTime
        },
      )[0]
      delete this.pages[leastUsedPage]
    }

    this.pages[key] = value
  }

  public setWithExpiration(key: string, value: PageCache[keyof PageCache]) {
    this.set(key, {...value, expiresAt: this.getTimestamp()})
  }

  public all() {
    return this.pages
  }

  public get(key: string) {
    if (!this.shouldCache(key)) {
      return undefined
    }

    const current = new Date()

    if (this.has(key) && current.getTime() > this.pages[key].expiresAt.getTime()) {
      delete this.pages[key]
      return undefined
    }

    if (this.has(key)) {
      this.pages[key].updatedAt = current
    }

    return this.pages[key]
  }

  public has(key: string) {
    return this.pages[key] !== undefined
  }

  public remove(key: string) {
    if (this.has(key)) {
      delete this.pages[key]
    }
  }

  public removeAll() {
    this.pages = {}
  }

  public getTimestamp(minutes: number = 1) {
    const cacheDate = new Date()
    return new Date(cacheDate.getTime() + minutes * 60000) // cache for 60 seconds
  }

  /**
   * Never ccache these urls
   * @param url string[]
   */
  public ignore(url: string[]) {
    this.ignoredUrl.push(...url)
  }

  /**
   * Remove urls from ignore list
   * @param url string[]
   */
  public accept(url: string[]) {
    this.ignoredUrl = this.ignoredUrl.filter((item) => url.indexOf(item) !== -1)
  }

  public shouldCache(url: string) {
    return this.on && this.ignoredUrl.indexOf(url) === -1
  }

  public prefetch(href: string, options: PrefetchOptions = {}): Promise<void> | void {
    const { durationInMinutes = 1, isStatic = false } = options
    // retry prefetching if version is not set yet
    if (!this.version) {
      console.log('Missed version')
      if (this.prefetchRetries <= this.totalPrefetchRetries) {
        this.prefetchRetries++
        setTimeout(() => {
          this.prefetch(href, options)
        }, 700);
      }
      return;
    }

    const url = typeof href === 'string' ? hrefToUrl(href) : href
    const urlWithHash = url.href.split(url.host)[1]

    // Page already exists in cache
    if (this.get(urlWithHash)) {
      return;
    }

    let browserUrl = urlWithoutHash(url).href
    browserUrl = isStatic ? `${browserUrl}__static__` : browserUrl

    return Axios({
      method: 'get',
      url: browserUrl,
      headers: {
        Accept: 'text/html, application/xhtml+xml',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true,
        'X-Inertia-Version': this.version
      }
    })
    .then((response) => {
      const isStaticResponse = response.data.props.static;
      if (!response?.headers['x-inertia'] && !isStaticResponse) {
        return Promise.reject({ response })
      }
      const pageResponse: Page = response.data

      const requestUrl = url
      const responseUrl = isStaticResponse ? url :hrefToUrl(pageResponse.url)
      if (requestUrl.hash && !responseUrl.hash && urlWithoutHash(requestUrl).href === responseUrl.href) {
        responseUrl.hash = requestUrl.hash
        pageResponse.url = responseUrl.href
      }

      if(isStaticResponse) {
        pageResponse.url = url.toString();
      }

      this.set(urlWithHash, {
        pageResponse: pageResponse,
        expiresAt: this.getTimestamp(durationInMinutes),
      });

      return Promise.resolve()
    })
    .catch(() => {
      console.log('Prefetch failed')
    })
  }
}