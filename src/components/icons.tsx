type IconProps = { filled?: boolean };

const svgProps = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function HomeIcon({ filled }: IconProps) {
  return (
    <svg {...svgProps}>
      <path
        d="M3.5 11 12 3.5l8.5 7.5M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

export function CalendarIcon({ filled }: IconProps) {
  return (
    <svg {...svgProps}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <g fill="currentColor" stroke="none">
        {[8, 12, 16].flatMap((x) =>
          [13.5, 17].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={filled ? 1.3 : 0.9} />),
        )}
      </g>
    </svg>
  );
}

export function StatsIcon({ filled }: IconProps) {
  return (
    <svg {...svgProps} strokeWidth={filled ? 2.4 : svgProps.strokeWidth}>
      <path d="M3 17l5.5-5.5 4 3.5L20 7.5M15 7.5h5v5" />
    </svg>
  );
}

export function ProfileIcon({ filled }: IconProps) {
  return (
    <svg {...svgProps} fill={filled ? 'currentColor' : 'none'}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20.5c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5z" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg {...svgProps} width={22} height={22} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg {...svgProps} width={22} height={22} strokeWidth={2}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...svgProps} width={22} height={22}>
      <path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13h10l1-13M10 11v5.5M14 11v5.5" />
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg {...svgProps} width={24} height={24} strokeWidth={2}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg {...svgProps} width={24} height={24} strokeWidth={2}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function MedicationIcon() {
  return (
    <svg {...svgProps} width={24} height={24}>
      <rect x="3.5" y="7" width="17" height="13" rx="2.5" />
      <path d="M9 7V5h6v2M12 10.5v6M9 13.5h6" />
    </svg>
  );
}

export function PreventionIcon() {
  return (
    <svg {...svgProps} width={24} height={24}>
      <path d="M12 3.5 19 6v5.5c0 4.2-3 7.6-7 9-4-1.4-7-4.8-7-9V6z" />
    </svg>
  );
}

export function LifeEventIcon() {
  return (
    <svg {...svgProps} width={24} height={24}>
      <path d="M6 20.5V4M6 4.5h11l-2.5 4 2.5 4H6" />
    </svg>
  );
}

/** Trend arrow: rising, falling or sideways. */
export function TrendIcon({ direction }: { direction: 'up' | 'down' | 'mixed' }) {
  const path = {
    up: 'M6 16.5 16.5 6M9 6h7.5v7.5',
    down: 'M6 7.5 16.5 18M16.5 10.5V18H9',
    mixed: 'M5 12h13.5M13.5 7l5 5-5 5',
  }[direction];
  return (
    <svg {...svgProps} width={22} height={22} strokeWidth={2}>
      <path d={path} />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg {...svgProps} width={24} height={24}>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
    </svg>
  );
}

export function UploadIcon() {
  return (
    <svg {...svgProps} width={24} height={24}>
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg {...svgProps} width={24} height={24}>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5h4" />
    </svg>
  );
}

export function DocumentIcon() {
  return (
    <svg {...svgProps} width={24} height={24}>
      <path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12.5h6M9 16h6" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...svgProps} width={24} height={24}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg {...svgProps} width={24} height={24}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.5v.5" />
    </svg>
  );
}
