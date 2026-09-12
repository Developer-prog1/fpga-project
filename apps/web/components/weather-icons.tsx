export function MetricIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "airTemp":
      return (
        <svg {...common}>
          <path d="M10 14.5V6.2a2 2 0 1 1 4 0v8.3a3.2 3.2 0 1 1-4 0Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 16.8v1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "airHumidity":
      return (
        <svg {...common}>
          <path
            d="M12 4.5c3.4 4.2 6 7.2 6 10a6 6 0 1 1-12 0c0-2.8 2.6-5.8 6-10Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "windSpeed":
      return (
        <svg {...common}>
          <path d="M4 9h11.2a2.4 2.4 0 1 0-1.1-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 13h13a2.6 2.6 0 1 1-1.2 4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 17h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "rainfallMm":
      return (
        <svg {...common}>
          <path d="M7 10a5 5 0 0 1 10 0c0 3.4-2.4 5.6-5 8.5C9.4 15.6 7 13.4 7 10Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 10.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "pressureHpa":
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 13V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 5.5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "dewPoint":
      return (
        <svg {...common}>
          <path d="M8 16.5c0-2.4 1.8-4.2 4-6.8 2.2 2.6 4 4.4 4 6.8a4 4 0 1 1-8 0Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9.5 7.2 12 4.5l2.5 2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "soilMoisture":
      return (
        <svg {...common}>
          <path d="M4.5 17.5c1.4-3 3.4-5 7.5-5s6.1 2 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 12.5c.2-2.6-1-4.8-3.4-6.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 12.5c1.6-2.2 3.8-3.2 6-3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "soilTemp":
      return (
        <svg {...common}>
          <path d="M4 18.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M7 18.5V14l5-4 5 4v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="14.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case "lightLux":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 4.5v1.6M12 17.9v1.6M4.5 12h1.6M17.9 12h1.6M6.4 6.4l1.1 1.1M16.5 16.5l1.1 1.1M17.6 6.4l-1.1 1.1M7.5 16.5l-1.1 1.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "uvIndex":
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 5.5h8M10 3.8h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
  }
}
