// Small inline icons. `currentColor` means they take the text colour of
// whatever they sit in, so the same icon works on red and on white.

export function DropIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2Z" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.6 3.1-6 7-6s7 2.4 7 6z" />
      <circle cx="17" cy="9" r="2.8" />
      <path d="M16 14.3c3.6.1 6 2 6 5.7h-4.5c0-2.2-.6-4.2-1.5-5.7z" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}