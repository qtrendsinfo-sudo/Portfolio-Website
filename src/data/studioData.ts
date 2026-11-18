export interface ProcessStage {
  id: string;
  step: string;
  title: string;
  summary: string;
  deliverable: string;
  focus: string;
}

export const PROCESS_STAGES: ProcessStage[] = [
  {
    id: 'idea',
    step: '01',
    title: 'IDEA',
    summary:
      'Every system begins by stripping away noise. We interrogate the core problem, define product boundaries, and map the real constraints before writing a single line of code.',
    deliverable: 'Product Brief & Technical Framing',
    focus: 'Problem Definition · Scope Architecture',
  },
  {
    id: 'design',
    step: '02',
    title: 'DESIGN',
    summary:
      'We shape visual language, typography, spatial hierarchy, and interaction grammar into an unmistakable product identity rather than assembling off-the-shelf UI kits.',
    deliverable: 'Design Language & Component System',
    focus: 'Visual Direction · Interface Systems',
  },
  {
    id: 'prototype',
    step: '03',
    title: 'PROTOTYPE',
    summary:
      'Critical flows are tested early in interactive motion and real layout conditions—verifying ergonomics, responsiveness, and tactile feel before full-scale engineering.',
    deliverable: 'Interactive Flow Validation',
    focus: 'Motion Studies · Usability Proof',
  },
  {
    id: 'build',
    step: '04',
    title: 'BUILD',
    summary:
      'Modular, strongly typed frontend and backend architectures engineered for long-term maintainability, clean API contracts, and consistent 60fps execution.',
    deliverable: 'Production Application Codebase',
    focus: 'Mobile, Web & Systems Engineering',
  },
  {
    id: 'test',
    step: '05',
    title: 'TEST',
    summary:
      'Device-matrix verification, accessibility audits, state resilience checks, and performance profiling ensure the software behaves calmly under real-world edge cases.',
    deliverable: 'Quality & Performance Sign-off',
    focus: 'Accessibility · Edge-Case Hardening',
  },
  {
    id: 'launch',
    step: '06',
    title: 'LAUNCH',
    summary:
      'Controlled deployment across app distribution channels and web infrastructure, accompanied by clean documentation and readiness for subsequent iteration cycles.',
    deliverable: 'Distribution & Release Readiness',
    focus: 'Store Deployment · Web Production',
  },
];

export interface StudioService {
  id: string;
  index: string;
  name: string;
  summary: string;
  scope: string[];
  projectTypeOption: string;
}

export const STUDIO_SERVICES: StudioService[] = [
  {
    id: 'mobile-apps',
    index: '01',
    name: 'Mobile Applications',
    summary:
      'Focused, responsive mobile products built for clarity, tactile speed, and dependable distribution across Android and cross-platform ecosystems.',
    scope: ['Product Architecture', 'Native & Cross-Platform UI', 'Distribution Packaging'],
    projectTypeOption: 'Mobile Application',
  },
  {
    id: 'web-apps',
    index: '02',
    name: 'Web Applications',
    summary:
      'Browser-native applications and interactive digital Flagships engineered with semantic precision, adaptive layouts, and smooth spatial rendering.',
    scope: ['Interactive Web Systems', 'Full-Stack Architecture', 'WebGL & Spatial Motion'],
    projectTypeOption: 'Web Application',
  },
  {
    id: 'saas-products',
    index: '03',
    name: 'SaaS Products',
    summary:
      'End-to-end software platforms structured around multi-role workflows, resilient data models, and calm operational interfaces.',
    scope: ['Core Product Systems', 'Workflow Engineering', 'Scalable Data Foundations'],
    projectTypeOption: 'SaaS Product',
  },
  {
    id: 'ui-ux-design',
    index: '04',
    name: 'UI/UX Design',
    summary:
      'Editorial art direction, cohesive design systems, and purposeful interaction choreography crafted so complex software feels effortless.',
    scope: ['Art Direction', 'Design Systems', 'Interactive Prototyping'],
    projectTypeOption: 'UI/UX Design',
  },
  {
    id: 'digital-products',
    index: '05',
    name: 'Digital Products',
    summary:
      'From zero-to-one concept validation through launch-ready release, turning ambitious hypotheses into cohesive, shippable digital utilities.',
    scope: ['Zero-to-One Framing', 'MVP Execution', 'Iterative Refinement'],
    projectTypeOption: 'Digital Product',
  },
  {
    id: 'custom-software',
    index: '06',
    name: 'Custom Software',
    summary:
      'Tailored engineering for specialized operational tools, bespoke integrations, and proprietary technical pipelines built to exact specifications.',
    scope: ['Bespoke Tooling', 'API & Data Pipelines', 'System Modernization'],
    projectTypeOption: 'Custom Software',
  },
];

export interface StudioLocationConfig {
  label: string;
  regionPlaceholder: string;
  coordinatesLabel: string;
  operatingMode: string;
  note: string;
}

export const STUDIO_LOCATION_CONFIG: StudioLocationConfig = {
  label: 'STUDIO BASE — CONFIGURABLE',
  regionPlaceholder: 'Configurable Studio Location',
  coordinatesLabel: '00.0000° N · 00.0000° E',
  operatingMode: 'Global Remote & Direct Collaboration',
  note: 'Physical studio address intentionally left configurable in studio configuration.',
};

export const STUDIO_HERO_IMAGE = '/src/assets/images/studio_architecture_monolith_1794914852488.jpg';
