export function NurseLogo() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-6"
    >
      {/* Nurse hat */}
      <path
        d="M25 35 C25 30, 30 25, 50 25 C70 25, 75 30, 75 35 L75 40 L25 40 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Cross on hat */}
      <path
        d="M48 28 L52 28 L52 32 L56 32 L56 36 L52 36 L52 40 L48 40 L48 36 L44 36 L44 32 L48 32 Z"
        fill="white"
      />
      {/* Face */}
      <circle cx="50" cy="50" r="15" fill="currentColor" stroke="currentColor" strokeWidth="2" />
      {/* Hair */}
      <path
        d="M35 45 C35 35, 42 30, 50 30 C58 30, 65 35, 65 45 L65 50 C65 50, 60 48, 50 48 C40 48, 35 50, 35 50 Z"
        fill="currentColor"
      />
      {/* Eyes */}
      <circle cx="45" cy="48" r="2" fill="white" />
      <circle cx="55" cy="48" r="2" fill="white" />
      {/* Smile */}
      <path
        d="M45 52 Q50 56, 55 52"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Body */}
      <path
        d="M35 65 L35 85 L42 85 L42 75 L58 75 L58 85 L65 85 L65 65 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Collar */}
      <path
        d="M42 65 L50 70 L58 65"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Clipboard */}
      <rect x="65" y="60" width="15" height="20" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      <rect x="67" y="62" width="11" height="16" fill="white" />
      {/* Clipboard lines */}
      <line x1="69" y1="65" x2="76" y2="65" stroke="currentColor" strokeWidth="1" />
      <line x1="69" y1="68" x2="76" y2="68" stroke="currentColor" strokeWidth="1" />
      <line x1="69" y1="71" x2="76" y2="71" stroke="currentColor" strokeWidth="1" />
      <line x1="69" y1="74" x2="76" y2="74" stroke="currentColor" strokeWidth="1" />
      {/* Clipboard clip */}
      <rect x="70" y="58" width="5" height="4" fill="currentColor" />
      {/* Arms */}
      <path
        d="M35 70 L25 75 L25 80 L35 75"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M65 70 L75 65 L80 70 L70 75"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}