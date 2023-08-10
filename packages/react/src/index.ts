import { router as Router, cacheManager as CacheManager } from '@inertiajs/core'

export const router = Router
export const cacheManager = CacheManager
export { default as createInertiaApp } from './createInertiaApp'
export { default as Head } from './Head'
export { default as Link, InertiaLinkProps } from './Link'
export { default as useForm } from './useForm'
export { default as usePage } from './usePage'
export { default as useRemember } from './useRemember'
