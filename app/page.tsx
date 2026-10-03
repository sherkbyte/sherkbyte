import LazyScene from '@/components/LazyScene';
import ReduceMotionToggle from '@/components/ReduceMotionToggle';
import ServiceCard from '@/components/ServiceCard';
import StoryScroll from '@/components/StoryScroll';
import CTASection from '@/components/CTASection';
import { SERVICES } from '@/lib/services';

const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400';
const FLOW = ['Infrastructure', 'Network', 'Cloud', 'Data Analytics', 'AI Workflows', 'Quality Assurance'];

export default function Page() {
  return (
    <>
      <a href="#main" className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black ${focus}`}>Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3" aria-label="Primary">
          <a href="#" className={`text-lg font-semibold tracking-[0.2em] text-white ${focus}`}>SHERKBYTE</a>
          <ul className="hidden gap-6 text-sm text-slate-200 md:flex">
            <li><a className={`hover:text-white ${focus}`} href="#services">Services</a></li>
            <li><a className={`hover:text-white ${focus}`} href="#approach">Approach</a></li>
            <li><a className={`hover:text-white ${focus}`} href="#contact">Contact</a></li>
          </ul>
          <a href="#contact" className={`rounded-md border border-cyan-400/60 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-400/10 ${focus}`}>Request a Consultation</a>
        </nav>
      </header>

      <main id="main">
        <section className="bg-hero" aria-labelledby="hero-h">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-12 lg:grid-cols-[1fr_1.15fr] lg:py-20">
            <div className="animate-rise">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">IT Services and Consulting</p>
              <h1 id="hero-h" className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
                End-to-End IT Solutions for Modern Business.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-200">
                From the server rack to AI workflows, SherkByte designs, deploys, optimizes, and manages the technology that keeps your business moving.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#contact" className={`rounded-md bg-cobalt px-6 py-3 font-semibold text-white hover:bg-blue-500 ${focus}`}>Request a Consultation</a>
                <a href="#services" className={`rounded-md border border-slate-500 px-6 py-3 font-semibold text-white hover:border-slate-300 ${focus}`}>Explore Services</a>
              </div>
              <div className="mt-6"><ReduceMotionToggle /></div>
            </div>
            <div className="h-[320px] overflow-hidden rounded-2xl border border-line md:h-[440px] lg:h-[600px]">
              <LazyScene scene="hero" mode="hero" className="h-full w-full" />
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-6 pb-10">
            <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-300" aria-label="Technology stack">
              {FLOW.map((f, i) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="rounded border border-line bg-panel px-2 py-1">{f}</span>
                  {i < FLOW.length - 1 && <span aria-hidden="true" className="text-cyan-400">→</span>}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="services-h">
          <h2 id="services-h" className="text-3xl font-semibold text-white md:text-4xl">Services</h2>
          <p className="mt-3 max-w-2xl text-slate-300">Five connected capabilities, delivered by one team.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {SERVICES.map((s) => <ServiceCard key={s.id} s={s} />)}
          </div>
        </section>

        <StoryScroll />
        <CTASection />
      </main>

      <footer className="border-t border-line px-6 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} SherkByte. All rights reserved.
      </footer>
    </>
  );
}
