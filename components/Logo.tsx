import Link from "next/link";

// Saguizinho geométrico do Sauim (mesmo desenho do arquivo de identidade)
export function Mark({ size = 32 }: { size?: number }) {
  return (
    <span className="sa-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" width={size * 0.62} height={size * 0.62}>
        <circle cx="14.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="2" />
        <path d="M16.5 6C17.6 5.2 18.8 5.6 19 6.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12.5 9.8C10.2 11 9.5 13.5 10.5 15.8C11.4 17.8 9.2 19.5 7 19.2C5.2 18.9 4.5 17.2 5.4 15.8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M14.5 11.5L17.5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link className="sa-logo" href={href} aria-label="Sauim, início">
      <Mark />
      <span className="sa-word">Sauim<small>.com.br</small></span>
    </Link>
  );
}
