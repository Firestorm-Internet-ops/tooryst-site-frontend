import { Metadata } from 'next'
import config from '@/lib/config'
import { seoManager } from '@/lib/seo-manager'
import tosData from '@/data/terms-of-service.json'

export const metadata: Metadata = seoManager.generateStaticPageMetadata('terms');

export default function TermsOfServicePage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {tosData.hero.title}
          </h1>
          <p className="text-gray-600">
            Last updated: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 text-gray-700">
          {tosData.sections.map((section) => (
            <div key={section.id}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.id}. {section.title}</h2>
              
              {section.content && (
                <p>{section.content}</p>
              )}
              
              {section.intro && (
                <p>{section.intro}</p>
              )}
              
              {section.items && (
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  {section.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
              
              {section.contactInfo && (
                <div className="mt-4 p-6 bg-blue-50 rounded-lg">
                  <p><strong>Email:</strong> <a href={`mailto:${section.contactInfo.email}`} className="text-blue-600 hover:underline">{section.contactInfo.email}</a></p>
                  <p className="mt-2"><strong>Address:</strong> {section.contactInfo.address}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
