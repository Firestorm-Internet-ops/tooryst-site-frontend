/**
 * Contact Form Component
 * Stub implementation for testing
 */

import React from 'react';

export interface ContactFormProps {
  onSubmit: (data: any) => Promise<void> | void;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    consent: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        aria-label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        aria-label="Email Address"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        aria-label="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
      />
      <textarea
        aria-label="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />
      <input
        type="checkbox"
        role="checkbox"
        checked={formData.consent}
        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
      />
      <button role="button" name="Send Message">
        Send Message
      </button>
    </form>
  );
}
