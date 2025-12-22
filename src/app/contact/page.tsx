import { Metadata } from 'next'
import Link from 'next/link'
import config from '@/lib/config'
import { seoManager } from '@/lib/seo-manager'
import contactData from '@/content/contact.json'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = seoManager.generateStaticPageMetadata('contact');

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full py-16 px-4">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {contactData.hero.title}
          </h1>
          <p className="text-lg font-semibold text-blue-600 mb-4">
            {contactData.hero.subtitle}
          </p>
          <p className="text-lg text-gray-700">
            {contactData.hero.description}
          </p>
        </div>

        {/* Intro Section */}
        <div className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {contactData.intro.title}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            {contactData.intro.description}
          </p>
        </div>

        {/* Contact Information */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactData.details.map((detail, index) => {
              const IconComponent = 
                detail.title === 'Email' ? Mail : 
                detail.title === 'Phone' ? Phone : 
                MapPin;
              
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {detail.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 break-words">
                    {detail.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email Note */}
        <div className="mb-12 max-w-3xl mx-auto bg-blue-50 rounded-lg p-6 border border-blue-200">
          <p className="text-gray-700 text-center">
            <span className="font-semibold">For both travel and advertising queries:</span> Email us at{' '}
            <a href={`mailto:${contactData.contactInfo.email.value}`} className="text-blue-600 hover:underline font-semibold">
              {contactData.contactInfo.email.value}
            </a>
          </p>
          <p className="text-gray-600 text-center mt-2">
            {contactData.contactInfo.responseTime}
          </p>
        </div>

        {/* Business Hours */}
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">
                {contactData.businessHours.title}
              </h3>
            </div>
            <div className="space-y-3">
              {contactData.businessHours.hours.map((hour, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-3 last:border-b-0">
                  <span className="font-semibold text-gray-900">{hour.day}</span>
                  <span className="text-gray-700">{hour.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            {contactData.cta.text}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {contactData.cta.buttons.map((button, index) => (
              <Link
                key={index}
                href={button.href}
                className={`inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg transition ${index === 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}`}
              >
                {button.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
