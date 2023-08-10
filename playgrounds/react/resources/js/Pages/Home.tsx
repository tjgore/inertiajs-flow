import { Head, Link, router, cacheManager } from '@inertiajs/react'
import Layout from '../Components/Layout'
import { useEffect } from 'react'

const Home = () => {

  useEffect(() => {
    cacheManager.prefetch('/article', {
      durationInMinutes: 10
    })
    cacheManager.prefetch('/', {
      isStatic: true
    })
    cacheManager.prefetch('/users')
  }, [])

  return (
    <>
      <Head title="Home" />
      <h1 className="text-3xl">Home</h1>
      <p className="mt-6">
        <Link href="/article#far-down" className="text-blue-700 underline">
          Link to bottom of article page
        </Link>
      </p>
    </>
  )
}

Home.layout = (page) => <Layout children={page} />

export default Home
