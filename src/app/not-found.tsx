import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-10 text-center border border-gray-200">
        {/* Icon */}
        <div className="mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 text-blue-600 shadow-inner">
            <MapPin className="w-8 h-8 md:w-10 md:h-10" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-2">
          404
        </h1>

        {/* Description */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 md:mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8 text-sm md:text-base mx-auto">
          We couldn&apos;t find the attraction you&apos;re looking for. It seems like this page has wandered off the map!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm shadow-sm"
          >
            Go Home
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition text-sm"
          >
            Report Issue
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500">
          Need help? Visit our <Link href="/faq" className="text-blue-600 hover:underline">FAQ</Link> or{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">contact us</Link>.
        </p>
      </div>
    </div>
  )
}
