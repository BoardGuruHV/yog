import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yoga-50 to-sage-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-yoga-primary/20">404</div>
          <h1 className="text-3xl font-bold text-gray-900 -mt-8 relative">
            Page Not Found
          </h1>
        </div>

        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yoga-primary text-white rounded-lg hover:bg-yoga-primary/90 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <Link
            href="/asana"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200"
          >
            <Search className="w-4 h-4" />
            Browse Asanas
          </Link>
        </div>

        <div className="mt-12">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  )
}
