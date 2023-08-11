import { Head, Link, router, cacheManager } from '@inertiajs/react'
import Layout from '../Components/Layout'
import { useEffect } from 'react'

const Home = () => {

  useEffect(() => {
    cacheManager.prefetchAll([
      {href: '/article', options: { durationInMinutes: 10 }},
      {href: '/', options: { isStatic: true, durationInMinutes: 10 }},
      {href: '/users', options: { isStatic: true, durationInMinutes: 10 }}
    ])
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
