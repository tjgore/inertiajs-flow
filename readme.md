## About
This repo is an experimental project to make inertia js work similar to nextjs.

Next js uses cache to make page links and transitions appear faster. 

Links are fetch on page load and the response is cache/saved in react, so when a user clicks a link the next page loads instantly without making a server request.

Additional we are using the laravel page-cache package to create static pages in a public folder to reduce server load.


## How to use

### Prefetching on demand
```js
useEffect(() => {
  router.cache().prefetchAll([
    {href: '/article', options: { durationInMinutes: 1 }},
    {href: '/', options: { isStatic: true, durationInMinutes: 2 }},
    {href: '/users', options: { isStatic: true, durationInMinutes: 10 }}
  ])
}, [])
```
`isStatic` tells the router to use a static endpoint to dynamically create static files or to fetch static files (no server load).
Laravel must use the `page-cache` middleware to dynamically create the static pages.

`durationInMinutes` is how long the page is cached for


If path `/users` with `isStatic: true` is visited, the router will send a fetch request to `/users__static__`. Laravel has a route with a where condition to handle both `/users` and `/users__static`. Take a look at routes.

If you don't want to prefetch on page load, we can prefetch on hover.

```jsx
<Link href="/form" onMouseEnter={() => router.cache().prefetch('/article')}>
  Hover Prefetch
</Link>
```
On hover we fetch the request. If the link is clicked before the response is returned, we wait for the already in flight fetch request to finish and then show that response.

If the request is done before we click, the page is returned instantly.


### Accessing Cache

We extended the inertia router to be able to access all the cache methods.

The cache default duration is 1 minute and the total pages we can hold in cache is 30.

```js
router.cache().all()

router.cache().isPending(path) // '/users'

router.cache().has(path) // '/'

router.cache().get(path)

router.cache().set(url, pageResponse)

router.cache().remove(path)

router.cache().removeAll()

```

Other things we can do are
- Turn on and off the cache. Don't cache anything
- Ignore certain paths
- Event listener for cache updates `cache:updated`

## Wrap up

Things are not in the best shape but it works as expected.

The Router class is a bit difficult to extend, given it is a singleton and some useful methods are protected.

Would be nice to be able to do the following`routerCache = new CacheManager(router)`
and have access to the `router.setPage()` method.


Future goals, Maybe?
- Request a PR to add to inertia
- Take some time to clean up and restructure better
- Make a separate package
- Add loading Page components - Render the component instantly with loading state (no server request) while another request is sent to get the component's data.
- Prefetch all links on page without manually doing it.
- Set Cache config: durationInMinutes, total pages to cache, refetch on visit count. 
- Look for bugs
- Create CacheLink component


[![Inertia.js](https://raw.githubusercontent.com/inertiajs/inertia/master/.github/LOGO.png)](https://inertiajs.com/)

Inertia.js lets you quickly build modern single-page React, Vue and Svelte apps using classic server-side routing and controllers. Find full documentation at [inertiajs.com](https://inertiajs.com/).

## Contributing

If you're interested in contributing to Inertia.js, please read our [contributing guide](https://github.com/inertiajs/inertia/blob/master/.github/CONTRIBUTING.md).

## Sponsors

A huge thanks to all [our sponsors](https://inertiajs.com/sponsors) who help push Inertia.js development forward! In particular, we'd like to say a special thank you to our partners:

<p>
  <a href="https://forge.laravel.com">
    <img src="./.github/sponsors/forge.svg" width="150" alt="Laravel Forge">
  </a>
</p>

If you'd like to become a sponsor, please [see here](https://inertiajs.com/sponsors) for more information. 💜

