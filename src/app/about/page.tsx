import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import config from '@/lib/config'
import aboutData from '@/content/about.json'
import { seoManager } from '@/lib/seo-manager'
import { MapPin, Users, Globe, Zap, Clock, Award } from 'lucide-react'

export const metadata: Metadata = seoManager.generateStaticPageMetadata('about');

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full py-16 px-4">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 text-center">
          About {config.appName}
        </h1>

        {/* Tagline */}
        <p className="text-lg font-semibold text-blue-600 mb-6 text-center">
          {config.companyTagline}
        </p>

        {/* Description */}
        <p className="text-lg text-gray-700 mb-8 leading-relaxed text-center">
          {config.companyDescription}
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {config.stats.destinations.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">Destinations</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {config.stats.attractions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">Attractions</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {config.stats.users.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">Users</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {config.stats.reviews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">Reviews</div>
          </div>
        </div>

        {/* Mission */}
        <div className="mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src={aboutData.mission.image}
                alt="Our Mission"
                width={600}
                height={400}
                className="rounded-lg shadow-md"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {aboutData.mission.title}
              </h2>
              {aboutData.mission.paragraphs.map((para, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose Attraction Storyboard */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            {aboutData.whyChoose.title}
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed text-center">
            {aboutData.whyChoose.subtitle}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {aboutData.whyChoose.features.map((feature, index) => {
              const IconComponent = feature.icon === 'Clock' ? Clock : feature.icon === 'Globe' ? Globe : Award;
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md text-center">
                  <div className="flex justify-center mb-4">
                    <IconComponent className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            {aboutData.cta.text}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {aboutData.cta.buttons.map((button, index) => (
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
