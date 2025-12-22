import { Metadata } from 'next'
import config from '@/lib/config'

export const metadata: Metadata = {
  title: `Cookie Policy - ${config.appName}`,
  description: 'Our cookie policy and how we use cookies',
}

export default function CookiePolicyPage() {
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
            Cookie Policy
          </h1>
          <p className="text-gray-600">
            Last updated: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 text-gray-700">

          {/* Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit our website.
              They help us remember your preferences, improve your browsing experience, and analyze
              how you use our site. Cookies can be stored for different lengths of time, from a single
              session to several years.
            </p>
          </div>

          {/* Types of Cookies */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
            <p className="mb-4">We use the following types of cookies on {config.appName}:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly.
                They enable you to navigate the site and use its features.
              </li>
              <li>
                <strong>Performance Cookies:</strong> These cookies help us understand how visitors use our website.
                They collect information about page views, bounce rates, and traffic sources.
              </li>
              <li>
                <strong>Functional Cookies:</strong> These cookies remember your preferences and choices to provide
                a personalized experience on your next visit.
              </li>
              <li>
                <strong>Marketing Cookies:</strong> These cookies track your browsing activity to display relevant
                advertisements and measure the effectiveness of marketing campaigns.
              </li>
            </ul>
          </div>

          {/* Cookie Management */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookies</h2>
            <p className="mb-4">
              You have full control over cookies. You can accept or reject cookies through your browser settings.
              Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>View what cookies have been set</li>
              <li>Delete cookies from your device</li>
              <li>Block cookies from being set in the future</li>
              <li>Set preferences for specific websites</li>
            </ul>
            <p className="mt-4">
              Please note that disabling cookies may affect the functionality of our website and your user experience.
            </p>
          </div>

          {/* Third-Party Cookies */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p>
              We may use third-party services that set their own cookies. These may include analytics services,
              advertising networks, and social media platforms. These third parties are responsible for their own
              cookie policies and we are not responsible for their practices.
            </p>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Security</h2>
            <p>
              We take the security of your data seriously. All cookies are transmitted using secure protocols
              and we implement industry-standard security measures to protect your information from unauthorized access.
            </p>
          </div>

          {/* Changes to Policy */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other
              operational, legal, or regulatory reasons. We will notify you of any significant changes by updating
              the &quot;Last updated&quot; date at the top of this policy.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have questions about our Cookie Policy, please contact us at:
            </p>
            <div className="p-6 bg-blue-50 rounded-lg">
              <p><strong>Email:</strong> <a href={`mailto:${config.contactEmail}`} className="text-blue-600 hover:underline">{config.contactEmail}</a></p>
              <p className="mt-2"><strong>Address:</strong> {config.officeAddress}</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
