'use client';

import { useState, useEffect } from 'react';

interface SafeEmailProps {
  user: string;
  domain: string;
  className?: string;
  /** Render as plain text instead of a mailto link */
  plain?: boolean;
}

/**
 * Renders an email address that is hidden from Cloudflare's Email Obfuscation
 * during SSR. The `@` symbol only appears in the DOM after React hydrates,
 * so Cloudflare never rewrites it into a broken /cdn-cgi/l/email-protection link.
 */
export function SafeEmail({ user, domain, className, plain }: SafeEmailProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const email = `${user}@${domain}`;

  if (plain) {
    return <span className={className}>{mounted ? email : 'Contact via email'}</span>;
  }

  return (
    <a
      href={mounted ? `mailto:${email}` : '#'}
      className={className}
    >
      {mounted ? email : 'Contact via email'}
    </a>
  );
}
