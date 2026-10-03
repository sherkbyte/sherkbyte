# SherkByte 3D Site

Next.js 15 + React 19 + TypeScript + Tailwind + React Three Fiber / drei + Framer Motion.

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run typecheck
    npm run build

## Structure
- `app/page.tsx`: hero, services, scroll story, CTA (all content is real DOM text)
- `components/LazyScene.tsx`: IntersectionObserver + WebGL detection + dynamic import (three.js loads only when needed)
- `components/SceneHost.tsx`: Canvas, FPS cap (60 / 30 lite), pause off-screen, PerformanceMonitor degrade -> static fallback
- `components/*Scene.tsx`: Hero, Infrastructure, Cloud, DataAnalytics, AIIntegration, QualityAssurance
- `components/three/*`: ServerRack, CloudNode, NetworkConnection, DataPacket, AnalyticsPanel, AIWorkflowNode, ValidationIndicator
- `lib/MotionContext.tsx`: prefers-reduced-motion + user toggles (persisted in localStorage)

## Behavior notes
- No GLB models; everything is procedural geometry (small bundle).
- Reduce Motion: no parallax, no camera/scroll motion, no packets; scenes paint a still frame.
- Mobile / Simplify / low cores / slow FPS: fewer objects and packets, 30 fps, lower DPR; story section becomes a plain list.
- Canvas containers are `aria-hidden`; nothing in the canvas is focusable. Stage buttons on service cards are real buttons.
- AWS / Google Cloud appear as editable text labels in `CloudScene.tsx` (`LABELS`). No logos.
- Replace `CONTACT_EMAIL` in `CTASection.tsx` with a real address or form endpoint.
