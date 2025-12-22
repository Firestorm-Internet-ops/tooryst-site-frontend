'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import faqData from '@/data/faq.json'

const faqItems = faqData.items

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleFAQ = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {faqData.hero.title}
          </h1>
          <p className="text-xl text-gray-600">
            {faqData.hero.subtitle}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Search hint */}
          <div className="mb-12 p-6 bg-blue-50 rounded-lg">
            <p className="text-gray-700">
              <strong>{faqData.searchHint.text}</strong> Feel free to{' '}
              <a href={faqData.searchHint.linkHref} className="text-blue-600 hover:underline">
                {faqData.searchHint.linkText}
              </a>{' '}
              with any questions not covered here.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.id} className="border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full px-6 py-4 bg-white hover:bg-gray-50 transition flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      expandedId === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedId === item.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-300">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="mt-16 p-8 bg-blue-600 text-white rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">
              {faqData.cta.title}
            </h2>
            <p className="text-blue-100 mb-6">
              {faqData.cta.subtitle}
            </p>
            <a
              href={faqData.cta.buttonHref}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              {faqData.cta.buttonText}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
