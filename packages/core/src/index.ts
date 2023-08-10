import { Router } from './router'
import CacheManager from './cache'

export { default as createHeadManager } from './head'
export { default as setupProgress } from './progress'
export { default as shouldIntercept } from './shouldIntercept'
export * from './types'
export { hrefToUrl, mergeDataIntoQueryString, urlWithoutHash } from './url'
export { type Router }

export const router = new Router()
export const cacheManager = CacheManager.create()

/* Used this to add cache manager to window object
declare global {
  interface Window { inertiaCacheManager: any; }
}

if (typeof window !== 'undefined') {
  window.inertiaCacheManager = CacheManager.create() || {};
} */
