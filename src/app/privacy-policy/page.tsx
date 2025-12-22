import { Metadata } from 'next'
import config from '@/lib/config'
import { seoManager } from '@/lib/seo-manager'
import privacyData from '@/data/privacy-policy.json'

export const metadata: Metadata = seoManager.generateStaticPageMetadata('privacy');

export default function PrivacyPolicyPage() {
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
            {privacyData.hero.title}
          </h1>
          <p className="text-gray-600">
            Last updated: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <div className="space-y-8 text-gray-700">

            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{privacyData.introduction.title}</h2>
              {privacyData.introduction.paragraphs.map((para, index) => (
                <p key={index} className={index > 0 ? 'mt-4' : ''}>
                  {para}
                </p>
              ))}
            </div>

            {/* Dynamic Sections */}
            {privacyData.sections.map((section) => (
              <div key={section.id}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.id}. {section.title}</h2>
                
                {section.content && (
                  <p>{section.content}</p>
                )}
                
                {section.intro && (
                  <p>{section.intro}</p>
                )}
                
                {section.subsections && (
                  <div className="space-y-4 mt-4">
                    {section.subsections.map((subsection, idx) => (
                      <div key={idx}>
                        <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">{subsection.heading}</h3>
                        <ul className="list-disc pl-6 space-y-2">
                          {subsection.items.map((item, itemIdx) => (
                            <li key={itemIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                
                {section.items && !section.subsections && (
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    {section.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
                
                {section.note && (
                  <p className="mt-4">{section.note}</p>
                )}
                
                {section.contactInfo && (
                  <div className="mt-4 p-6 bg-blue-50 rounded-lg">
                    <p><strong>Email:</strong> <a href={`mailto:${section.contactInfo.email}`} className="text-blue-600 hover:underline">{section.contactInfo.email}</a></p>
                    <p className="mt-2"><strong>Address:</strong> {section.contactInfo.address}</p>
                    <p className="mt-2"><strong>Phone:</strong> <a href={`tel:${section.contactInfo.phone}`} className="text-blue-600 hover:underline">{section.contactInfo.phone}</a></p>
                  </div>
                )}
              </div>
            ))}

          </div>
        </div>
      </section>
    </div>
  )
}
