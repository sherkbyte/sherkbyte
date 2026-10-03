'use client';
import { useState } from 'react';

const CONTACT_EMAIL = 'contact@sherkbyte.com'; // TODO: replace with your real address or a form endpoint

export default function CTASection() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = `Name: ${d.get('name')}\nCompany: ${d.get('company')}\nEmail: ${d.get('email')}\n\n${d.get('message')}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Consultation request')}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  const field = 'mt-1 w-full rounded-md border border-slate-600 bg-ink px-3 py-2 text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400';
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="cta-h">
      <div className="grid gap-10 rounded-2xl border border-line bg-panel/70 p-8 md:grid-cols-2 md:p-12">
        <div>
          <h2 id="cta-h" className="text-3xl font-semibold text-white md:text-4xl">Ready to connect your technology stack?</h2>
          <p className="mt-4 text-slate-300">Tell us what you are running today and where you want to go. We will respond with a practical plan.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm text-slate-200">Name
            <input name="name" required autoComplete="name" className={field} /></label>
          <label className="block text-sm text-slate-200">Work email
            <input name="email" type="email" required autoComplete="email" className={field} /></label>
          <label className="block text-sm text-slate-200">Company
            <input name="company" autoComplete="organization" className={field} /></label>
          <label className="block text-sm text-slate-200">What do you need help with?
            <textarea name="message" rows={4} required className={field} /></label>
          <button type="submit" className="rounded-md bg-cobalt px-5 py-3 font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
            Request a Consultation
          </button>
          {sent && <p role="status" className="text-sm text-ok">Opening your email app…</p>}
        </form>
      </div>
    </section>
  );
}
