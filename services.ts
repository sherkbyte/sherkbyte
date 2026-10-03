import type { SceneKind } from '@/components/types';

export type Service = {
  id: string; scene: SceneKind; title: string; summary: string;
  bullets: string[]; stages?: string[]; overlay?: string;
};

export const SERVICES: Service[] = [
  {
    id: 'infrastructure', scene: 'infrastructure', title: 'Infrastructure Installs & Removals',
    summary: 'Physical deployments done right: racks, switching, cabling, and clean, documented decommissions.',
    bullets: ['Rack-and-stack servers, switches, and storage', 'Structured cabling, labeling, and power planning', 'Configuration, burn-in, and handoff documentation', 'Planned removals and decommissioning'],
    stages: ['Deploy', 'Configure', 'Validate', 'Decommission']
  },
  {
    id: 'cloud', scene: 'cloud', title: 'Cloud Architecture & IT Management',
    summary: 'Secure, scalable cloud environments that connect cleanly to the infrastructure you already run.',
    bullets: ['AWS and Google Cloud architecture and migration', 'Hybrid connectivity between on-premises and cloud', 'Infrastructure as code and environment standardization', 'Ongoing IT management and optimization']
  },
  {
    id: 'analytics', scene: 'data', title: 'Data Analytics & Business Intelligence',
    summary: 'Turn scattered operational data into dashboards your team can act on.',
    bullets: ['Data source integration and pipelines', 'Dashboards and KPI reporting', 'Trend analysis for operations and planning', 'Clear, decision-ready visualizations'],
    overlay: 'Raw Data → Clear Decisions'
  },
  {
    id: 'ai', scene: 'ai', title: 'Prompt Engineering & AI Integration',
    summary: 'Practical AI workflows with structured prompts, guardrails, and measurable output.',
    bullets: ['Prompt design and evaluation', 'Workflow automation with human review points', 'Secure integration with your existing systems', 'Training your team to use AI well']
  },
  {
    id: 'qa', scene: 'qa', title: 'Quality Assurance & System Validation',
    summary: 'Test before you trust. Verify that every component performs as designed.',
    bullets: ['Test plans and acceptance criteria', 'Connectivity, failover, and performance checks', 'Validation reports and sign-off', 'Regression checks after changes'],
    stages: ['Testing', 'Validated']
  }
];

export const STORY = [
  { key: 'Infrastructure', msg: 'Start with a reliable foundation.', detail: 'Racks, networking, and on-premises environments built to be dependable and documented.' },
  { key: 'Cloud', msg: 'Extend your capabilities with scalable cloud architecture.', detail: 'Connect physical systems to secure, scalable cloud services.' },
  { key: 'Data', msg: 'Turn operational data into actionable insight.', detail: 'Follow your data into dashboards, graphs, and analytics.' },
  { key: 'AI', msg: 'Put AI to work where it delivers practical value.', detail: 'Organized AI workflows with clear inputs, guardrails, and outputs.' },
  { key: 'Quality Assurance', msg: 'Deploy with confidence. Validate for performance.', detail: 'The full system, tested and verified end to end.' }
];
