import React from 'react';

/**
 * Stroke icons at 1.6px, sized by className (default 20px), coloured by
 * currentColor. The brand forbids emoji and icon fonts in UI, so every glyph
 * the app needs lives here as inline SVG.
 */
interface IconProps {
  className?: string;
  strokeWidth?: number;
}

function svgProps({ className = 'h-5 w-5', strokeWidth = 1.6 }: IconProps) {
  return {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

export const CloseIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);

export const CheckIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export const ChevronDownIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}><path d="M6 9l6 6 6-6" /></svg>
);

export const ArrowRightIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const CameraIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M4 8.5A1.5 1.5 0 015.5 7H8l1.5-2h5L16 7h2.5A1.5 1.5 0 0120 8.5v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 17.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const ClipboardIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M8 5H6.5A1.5 1.5 0 005 6.5v13A1.5 1.5 0 006.5 21h11a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0017.5 5H16" />
  </svg>
);

export const TicketIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M3 9V7a1 1 0 011-1h16a1 1 0 011 1v2a2 2 0 000 4v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2a2 2 0 000-4z" />
    <path d="M14 6v12" strokeDasharray="2 2" />
  </svg>
);

export const KeyIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <circle cx="8" cy="14" r="4" />
    <path d="M11 11l8-8M15 7l2 2M18 4l2 2" />
  </svg>
);

export const LockIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z" />
    <path d="M9.5 12l2 2 3.5-4" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M21 3L10 14" />
    <path d="M21 3l-7 18-4-7-7-4z" />
  </svg>
);

export const GasIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M3 21h14" />
    <path d="M15 9h2a2 2 0 012 2v5.5a1.5 1.5 0 003 0V9l-2-2" />
    <path d="M7 7h6v4H7z" />
  </svg>
);

export const DropIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z" />
  </svg>
);

export const BagIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M6 8h12l1 12H5z" />
    <path d="M9 8V6a3 3 0 016 0v2" />
  </svg>
);

/* Three sliders: settings, without borrowing the cog the admin entry uses. */
export const SlidersIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M4 7h10M18 7h2M4 12h3M11 12h9M4 17h12M20 17h0" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="9" cy="12" r="2" />
    <circle cx="18" cy="17" r="2" />
  </svg>
);

export const WalletIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M4 7.5A2.5 2.5 0 016.5 5H18a1 1 0 011 1v2" />
    <path d="M4 7.5v10A2.5 2.5 0 006.5 20H19a1 1 0 001-1v-9a1 1 0 00-1-1H6.5A2.5 2.5 0 014 7.5z" />
    <circle cx="16" cy="14.5" r="1" fill="currentColor" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.5C19.5 15.4 12 20 12 20z" />
  </svg>
);

export const CogIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" />
    <path d="M10 8l-4 4 4 4M6 12h10" />
  </svg>
);

export const ReceiveIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M12 4v12M6 10l6 6 6-6" />
    <path d="M5 20h14" />
  </svg>
);

export const SwapIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M7 4v14M3.5 7.5L7 4l3.5 3.5" />
    <path d="M17 20V6M13.5 16.5L17 20l3.5-3.5" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M20 12a8 8 0 01-14.3 4.9M4 12a8 8 0 0114.3-4.9" />
    <path d="M18.5 3v4.2h-4.2M5.5 21v-4.2h4.2" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
  </svg>
);

export const ShareIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M12 15V3M8 7l4-4 4 4" />
    <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

export const MailIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5l8.5 6 8.5-6" />
  </svg>
);

/* A plain "G" in the house stroke — a reference to the sign-in method, not the logo. */
export const GoogleIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M19.5 12H12.5M19.5 12a7.5 7.5 0 11-2.2-5.3" />
  </svg>
);

export const LinkIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}><path d="M9 6l6 6-6 6" /></svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}><path d="M15 6l-6 6 6 6" /></svg>
);

export const ExternalIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps(p)}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
  </svg>
);

/* Brand marks for the footer. Filled, so they read at 20px. */
function brandProps({ className = 'h-5 w-5' }: IconProps) {
  return { className, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true };
}

export const XIcon: React.FC<IconProps> = (p) => (
  <svg {...brandProps(p)}>
    <path d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.5L4.6 21h-3l7.5-8.6L1.3 3h6.5l4.5 6z" />
  </svg>
);

export const LinkedInIcon: React.FC<IconProps> = (p) => (
  <svg {...brandProps(p)}>
    <path d="M5 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9h4v12H3zM10 9h3.8v1.7c.5-1 1.8-2 3.7-2 4 0 4.5 2.6 4.5 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.2 1.4-2.2 2.9V21h-4z" />
  </svg>
);

export const InstagramIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps({ ...p, strokeWidth: 1.8 })}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

export const YouTubeIcon: React.FC<IconProps> = (p) => (
  <svg {...svgProps({ ...p, strokeWidth: 1.8 })}>
    <rect x="2.5" y="5" width="19" height="14" rx="4" />
    <path d="M10 9l5 3-5 3z" fill="currentColor" />
  </svg>
);

export const GitHubIcon: React.FC<IconProps> = (p) => (
  <svg {...brandProps(p)}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0022 12.25C22 6.58 17.52 2 12 2z" />
  </svg>
);

export const TelegramIcon: React.FC<IconProps> = (p) => (
  <svg {...brandProps(p)}>
    <path d="M2.5 11.2L21 3.5c.8-.3 1.6.4 1.4 1.3l-3 15.3c-.2.9-1.2 1.2-1.9.7l-4.6-3.4-2.3 2.2c-.5.5-1.3.2-1.4-.5l-.5-4.4-6-1.9c-.9-.3-.9-1.5-.2-1.6z" />
  </svg>
);
