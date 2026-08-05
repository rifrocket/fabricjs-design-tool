import type {ReactNode} from 'react';

type IconProps = {className?: string};

// Simple, original, hand-drawn line icons (no external icon library dependency) — deliberately
// abstract/geometric rather than literal illustrations, so they read consistently in both themes
// via currentColor and don't need separate light/dark art.

export function LayersIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <path d="M12 3 21 8l-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 12l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PluginIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="2.5" y="9.5" width="9" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="12.5" y="4.5" width="9" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11.5 14h4v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AdapterIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="19" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 6.8v4.4M12 11.2 6.6 16M12 11.2 17.4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
