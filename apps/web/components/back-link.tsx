import Link from "next/link";

function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden>
      <path
        d="M14.5 6.5 9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BackLink({ href = "/", label = "Գլխավոր" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-paper py-1.5 pr-4 pl-1.5 text-ink shadow-[0_10px_18px_-16px_rgba(26,18,14,0.45)] transition hover:border-gold/70"
    >
      <span className="grid size-8 place-items-center rounded-full bg-ink text-cream transition group-hover:bg-garnet">
        <BackArrow />
      </span>
      <span className="font-serif text-[1.05rem] leading-none tracking-wide">{label}</span>
    </Link>
  );
}
