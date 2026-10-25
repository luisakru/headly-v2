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
