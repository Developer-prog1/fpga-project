export function Crest({ className = "size-11" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="24.5" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
      <path
        d="M32 14c3.2 5.4 8.4 8.6 14 10-5.6 1.4-10.8 4.6-14 10-3.2-5.4-8.4-8.6-14-10 5.6-1.4 10.8-4.6 14-10Z"
        fill="currentColor"
      />
      <circle cx="32" cy="32" r="3.2" fill="currentColor" />
    </svg>
  );
}

export function IconOverview() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="3" width="8" height="5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="10" width="8" height="11" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13" width="8" height="8" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconFaculties() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <path
        d="M4 19V8.5L12 5l8 3.5V19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 19v-6h8v6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconCourses() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4H20v13.5H7.5A2.5 2.5 0 0 0 5 20V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M5 17.5H20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconAdmins() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19.2c.8-3.1 3.4-5 6.5-5s5.7 1.9 6.5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
