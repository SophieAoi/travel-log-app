export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <span className="logo">
      <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" fill="var(--color-accent)" />
        <path
          d="M32 12c-8.837 0-16 7.163-16 16 0 11 16 24 16 24s16-13 16-24c0-8.837-7.163-16-16-16z"
          fill="white"
        />
        <circle cx="32" cy="28" r="6" fill="var(--color-accent)" />
      </svg>
      {withWordmark && <span className="logo-word">Waypoint</span>}
    </span>
  );
}
