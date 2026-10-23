import "./DropLogo.css";

// size: any CSS width ("64px", "20vw"...). animated: drop-in + pulsing strokes.
function DropLogo({ size = "96px", animated = false }) {
  return (
    <svg
      viewBox="0 0 130 130"
      aria-hidden="true"
      className={`drop-logo ${animated ? "drop-logo--animated" : ""}`}
      style={{ width: size }}
    >
      <defs>
        <linearGradient id="dropGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef2a37" />
          <stop offset="100%" stopColor="#9b0612" />
        </linearGradient>
      </defs>

      <path
        d="M50 4 C50 4 12 52 12 82 A38 38 0 0 0 88 82 C88 52 50 4 50 4 Z"
        fill="url(#dropGradient)"
      />
      <path
        d="M34 52 C26 64 22 74 23 84"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="34" y="76" width="32" height="16" rx="4" fill="#ffffff" />
      <rect x="42" y="68" width="16" height="32" rx="4" fill="#ffffff" />

      <g className="drop-logo__pulse" stroke="#d61423" strokeWidth="5" strokeLinecap="round">
        <line x1="96" y1="30" x2="102" y2="17" />
        <line x1="104" y1="38" x2="116" y2="28" />
        <line x1="108" y1="50" x2="122" y2="46" />
      </g>
    </svg>
  );
}

export default DropLogo;