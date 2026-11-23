/** Abstract partner marks for the Expo-style trust strip (original artwork). */
const LOGOS = [
  {
    id: 'blocks',
    label: 'Blocks',
    svg: (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#111" />
        <rect x="9" y="8" width="9" height="9" rx="2" fill="#f97316" />
        <rect x="9" y="19" width="9" height="9" rx="2" fill="#fb923c" />
        <rect x="20" y="19" width="9" height="9" rx="2" fill="#fdba74" />
        <rect x="9" y="30" width="9" height="2.5" rx="1" fill="#ea580c" />
      </svg>
    ),
  },
  {
    id: 'peak',
    label: 'Peak',
    svg: (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#ff5d01" />
        <path d="M8 30 L20 10 L32 30 Z" fill="#fff" />
        <path d="M14 30 L20 20 L26 30 Z" fill="#ff5d01" />
      </svg>
    ),
  },
  {
    id: 'orb',
    label: 'Orb',
    svg: (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#c4b5fd" />
        <path
          d="M12 14c0-2 2-4 8-4s8 2 8 4v10c0 3-2 6-8 7-6-1-8-4-8-7V14Z"
          fill="#fff"
        />
        <circle cx="16.5" cy="18" r="1.6" fill="#a78bfa" />
        <circle cx="23.5" cy="18" r="1.6" fill="#a78bfa" />
      </svg>
    ),
  },
  {
    id: 'wave',
    label: 'Wave',
    svg: (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#0ea5e9" />
        <path
          d="M8 22c3-4 6-4 9 0s6 4 9 0 6-4 9 0"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M8 28c3-4 6-4 9 0s6 4 9 0 6-4 9 0"
          fill="none"
          stroke="#e0f2fe"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'bolt',
    label: 'Bolt',
    svg: (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#111827" />
        <path d="M22 7 L12 22h7l-2 11 12-16h-8l3-10Z" fill="#facc15" />
      </svg>
    ),
  },
  {
    id: 'leaf',
    label: 'Leaf',
    svg: (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#16a34a" />
        <path
          d="M12 26c8-14 16-16 18-16-2 10-6 18-18 20 2-6 4-10 0-4Z"
          fill="#fff"
        />
      </svg>
    ),
  },
  {
    id: 'ring',
    label: 'Ring',
    svg: (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#db2777" />
        <circle cx="20" cy="20" r="9" fill="none" stroke="#fff" strokeWidth="3.5" />
        <circle cx="20" cy="20" r="3.5" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'grid',
    label: 'Grid',
    svg: (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#1d4ed8" />
        <rect x="9" y="9" width="9" height="9" rx="2" fill="#93c5fd" />
        <rect x="22" y="9" width="9" height="9" rx="2" fill="#fff" />
        <rect x="9" y="22" width="9" height="9" rx="2" fill="#fff" />
        <rect x="22" y="22" width="9" height="9" rx="2" fill="#60a5fa" />
      </svg>
    ),
  },
] as const;

/** Enough repeats that one half is always wider than the content rail (~1080px). */
const SETS_PER_HALF = 3;

function LogoSet({ suffix }: { suffix: string }) {
  const items = Array.from({ length: SETS_PER_HALF }, () => LOGOS).flat();
  return (
    <div className="logo-carousel__set">
      {items.map((logo, index) => (
        <div className="logo-carousel__item" key={`${suffix}-${logo.id}-${index}`}>
          <div className="logo-carousel__icon">{logo.svg}</div>
        </div>
      ))}
    </div>
  );
}

export function LogoCarousel() {
  return (
    <div className="logo-carousel" aria-hidden="true">
      <div className="logo-carousel__mask">
        <div className="logo-carousel__track">
          <LogoSet suffix="a" />
          <LogoSet suffix="b" />
        </div>
      </div>
    </div>
  );
}
