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


export function BackIcon() {
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
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}


// Shared look for the line-style icons below
const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function FaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
    </svg>
  );
}

export function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <path d="M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}