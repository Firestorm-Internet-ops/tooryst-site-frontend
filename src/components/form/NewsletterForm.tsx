/**
 * Newsletter Form Component
 * Stub implementation for testing
 */

import React from 'react';

export interface NewsletterFormProps {
  onSubmit: (data: any) => Promise<void> | void;
}

export function NewsletterForm({ onSubmit }: NewsletterFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <input aria-label="Email" />
      <button>Subscribe</button>
    </form>
  );
}
