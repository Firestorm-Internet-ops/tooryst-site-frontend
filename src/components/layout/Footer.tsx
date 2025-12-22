import Link from 'next/link';
import { 
  FaTwitter, 
  FaLinkedin, 
  FaPinterest, 
  FaFacebook, 
  FaInstagram, 
  FaYoutube 
} from 'react-icons/fa';
import footerData from '@/data/footer-links.json';
import config from '@/lib/config';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Twitter: FaTwitter,
  Linkedin: FaLinkedin,
  Pinterest: FaPinterest,
  Facebook: FaFacebook,
  Instagram: FaInstagram,
  Youtube: FaYoutube,
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center gap-8">
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            {footerData.navigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-400 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex gap-4">
            {footerData.social.map((social) => {
              const Icon = iconMap[social.icon];
              if (!Icon) return null;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition hover:text-white"
                  aria-label={social.label}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400 w-full">
            <p>© {year} {config.appName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
