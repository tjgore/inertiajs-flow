import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default function CacheList() {

  const [cachedPages, setCachedPages] = useState<{key:string, pending: boolean}[]>([])

  const handleCacheUpdated = () =>  {
    const pages = router.cache().all()
    setCachedPages(Object.keys(pages).map((key) => {
      return { key: key, pending: pages[key].pending || false }
    }))
  }

  useEffect(() => {
    document.addEventListener('cache:updated', handleCacheUpdated)

    return () => { document.removeEventListener('cache:updated', handleCacheUpdated) }
  }, [])

  return (
    <>
      <div className="mb-10">
          <p className="font-bold mb-3">Cached Pages</p>
          <div className="flex gap-4 flex-wrap p-5 rounded-md bg-gray-100">
            {cachedPages.map((path) => {
              return <div className="p-1 rounded-md text-white bg-gray-800">{path.key}: {path.pending ? 'pending' : 'loaded'}</div>
            })}
          </div>
        </div>
    </>
  )
}
