'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-10 text-center border border-gray-200">
        {/* Icon */}
        <div className="mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-100 text-red-600 shadow-inner">
            <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-2">
          500
        </h1>

        {/* Description */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 md:mb-4">
          Something Went Wrong
        </h2>

        <p className="text-gray-600 mb-8 text-sm md:text-base mx-auto">
          We&apos;re sorry, but something unexpected happened. Our team has been notified and is working to fix it.
          Please try again or come back later.
        </p>

        {/* Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-red-900 mb-2 text-sm">
              Error Details (Development Only)
            </h3>
            <pre className="text-xs text-red-800 overflow-auto max-h-48">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-4 mb-6">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm shadow-sm"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition text-sm"
          >
            Go Home
          </Link>
        </div>

        {/* Support Message */}
        <div className="mt-8 p-4 md:p-6 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-3">
            Need further assistance?
          </p>
          <Link
            href="/contact"
            className="text-blue-600 font-semibold hover:underline text-sm"
          >
            Contact our support team →
          </Link>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-xs text-gray-500">
          Error ID: {error.digest || 'unknown'}
        </p>
      </div>
    </div>
  )
}
