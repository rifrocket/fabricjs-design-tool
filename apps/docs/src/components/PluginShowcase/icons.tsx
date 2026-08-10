import type {ReactNode} from 'react';

type IconProps = {className?: string};

// Same hand-drawn, currentColor-based line-icon style as HomepageFeatures/icons.tsx — one
// glyph per official plugin so the showcase grid reads as a set, not a wall of identical dots.

export function ShapesIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="12" y="12" width="9" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function QrCodeIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="3" y="3" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14.5" y="3" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.5 15h3v3h3v3h-6.5v-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function SvgImportIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <path d="M12 3v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.5 10 12 14.5 16.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17.5v2A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ImageIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1.7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 17.5 9 12l3 3 4-4.5 4.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClipboardIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="5" y="4.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9" y="3" width="6" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 12h7M8.5 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ExportPdfIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11v6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.3 15.2 12 17.9l2.7-2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImportJsonIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <path
        d="M9.5 3.5c-2 0-2.5 1-2.5 2.5v3c0 1.2-.5 2-2 2 1.5 0 2 .8 2 2v3c0 1.5.5 2.5 2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 3.5c2 0 2.5 1 2.5 2.5v3c0 1.2.5 2 2 2-1.5 0-2 .8-2 2v3c0 1.5-.5 2.5-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EffectsIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <path
        d="M12 3.5 13.6 9l5.4 1.5-5.4 1.5L12 17.5 10.4 12 5 10.5 10.4 9 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M18.5 16.5v3.5M16.75 18.25h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LocalStorageIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7.5" ry="2.7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 6v6c0 1.5 3.4 2.7 7.5 2.7s7.5-1.2 7.5-2.7V6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 12v6c0 1.5 3.4 2.7 7.5 2.7s7.5-1.2 7.5-2.7v-6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function AlignmentIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <path d="M4 4v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7" y="6" width="10" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="7" y="14" width="6" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function SnappingIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <path
        d="M7 3.5h4v7.5a3 3 0 0 1-6 0v-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 3.5h-4v7.5a3 3 0 0 0 6 0v-3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 7.5h3.5M15.5 7.5H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DevtoolsIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 9 10 12l-3.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PanZoomIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PagesIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="6.5" y="3.5" width="12" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 8v9.5a1.5 1.5 0 0 0 1.5 1.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function EffectsPanelIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8h10M7 12h6M7 16h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ShapesBasicPanelIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 20 10 13.5 13.5 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="15" y="15" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function MediaFieldsIcon({className}: IconProps): ReactNode {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="3.5" y="5" width="9" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11.5" y="10" width="9" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
