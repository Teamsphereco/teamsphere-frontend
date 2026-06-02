const iconPaths = {
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0",
  shield: "M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6l7-3Z",
  devices: "M4 6h11v10H4z M17 9h3v8h-3z M8 19h4",
  bell: "M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z M10 21h4",
  palette: "M12 4a8 8 0 0 0 0 16h1.5a1.5 1.5 0 0 0 0-3H15a2 2 0 0 1 0-4h1a4 4 0 0 0 0-8 8 8 0 0 0-4-1Z M7.5 10h.01 M10 7.5h.01 M14 7.5h.01 M6.8 14h.01",
  message: "M4 5h16v11H8l-4 4V5Z",
  video: "M4 6h11v12H4z M15 10l5-3v10l-5-3z",
  accessibility: "M12 5.5h.01 M5 9h14 M12 10v10 M8 20l4-10 4 10",
  lock: "M7 10V8a5 5 0 0 1 10 0v2 M6 10h12v10H6z",
  ban: "M5 5l14 14 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  contacts: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M3 20a6 6 0 0 1 12 0 M17 8a2.5 2.5 0 1 0 0-5 M16 14a5 5 0 0 1 5 5",
  database: "M5 6c0 1.7 3.1 3 7 3s7-1.3 7-3-3.1-3-7-3-7 1.3-7 3Z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3",
  cloud: "M7 18h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.3 9.2 4.5 4.5 0 0 0 7 18Z",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3c2 2.4 3 5.4 3 9s-1 6.6-3 9 M12 3c-2 2.4-3 5.4-3 9s1 6.6 3 9",
  plug: "M9 7V3 M15 7V3 M7 7h10v5a5 5 0 0 1-10 0V7Z M12 17v4",
  terminal: "M4 6h16v12H4z M7 10l3 2-3 2 M12 15h5",
  help: "M9.5 9a2.7 2.7 0 1 1 4.7 1.8c-.9.6-1.7 1.1-1.7 2.2 M12 17h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  search: "M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z M16 16l5 5",
  arrowLeft: "M15 6l-6 6 6 6",
  external: "M14 4h6v6 M20 4l-9 9 M20 14v5H5V4h5",
  check: "M5 13l4 4L19 7",
  x: "M6 6l12 12 M18 6 6 18",
};

export const Icon = ({ name, className = "h-4 w-4" }) => {
  const path = iconPaths[name] || iconPaths.help;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
};

export const StatusPill = ({ label, tone = "neutral" }) => {
  const tones = {
    success: "border-[#d3e5ff] bg-[#eef6ff] text-[#0761d1]",
    warning: "border-[#ffefcf] bg-[#fff8ea] text-[#ab570a]",
    danger: "border-[#f7d4d6] bg-[#fff1f2] text-[#c50000]",
    neutral: "border-[#ebebeb] bg-[#fafafa] text-[#4d4d4d]",
  };

  return (
    <span className={`inline-flex min-h-7 items-center rounded-md border px-2 text-xs font-medium ${tones[tone] || tones.neutral}`}>
      {label}
    </span>
  );
};

export const ToggleSwitch = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 ${
      checked ? "border-[#0070f3] bg-[#0070f3]" : "border-[#d4d4d4] bg-[#f5f5f5]"
    }`}
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export const SelectControl = ({ value, options, onChange, label }) => (
  <select
    aria-label={label}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="min-h-10 rounded-md border border-[#ebebeb] bg-white px-3 text-sm font-medium text-[#171717] outline-none transition focus:border-[#0070f3] focus:ring-2 focus:ring-[#d3e5ff]"
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export const SegmentedControl = ({ value, options, onChange, label }) => (
  <div
    role="radiogroup"
    aria-label={label}
    className="inline-flex min-h-10 flex-wrap items-center gap-1 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-1"
  >
    {options.map((option) => {
      const active = value === option.value;

      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(option.value)}
          className={`min-h-8 rounded-md px-3 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-[#0070f3] ${
            active ? "bg-white text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-[#4d4d4d] hover:text-[#171717]"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export const RangeControl = ({ value, min, max, step, suffix, onChange, label }) => (
  <div className="flex min-w-[170px] items-center gap-3">
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-28 accent-[#0070f3]"
    />
    <span className="w-12 rounded-md border border-[#ebebeb] bg-[#fafafa] px-2 py-1 text-center font-mono text-xs text-[#4d4d4d]">
      {value}{suffix}
    </span>
  </div>
);

export const ActionButton = ({ children, onClick, variant = "secondary", disabled = false }) => {
  const variants = {
    primary: "border-[#171717] bg-[#171717] text-white hover:bg-black",
    secondary: "border-[#ebebeb] bg-white text-[#171717] hover:border-[#a1a1a1]",
    danger: "border-[#f7d4d6] bg-[#fff7f7] text-[#c50000] hover:border-[#c50000]",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] || variants.secondary}`}
    >
      {children}
    </button>
  );
};