export default function MiniGhost() {
  return (
    <div
      className="relative w-full"
      style={{ animation: 'miniGhostFloat 5.5s ease-in-out infinite' }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 130"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 0 14px rgba(90,72,255,0.45))' }}
      >
        <defs>
          <radialGradient id="miniGhBody" cx="42%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#9c8fff" />
            <stop offset="45%" stopColor="#6a55ff" />
            <stop offset="100%" stopColor="#2c1fa8" />
          </radialGradient>
          <radialGradient id="miniGhHighlight" cx="34%" cy="20%" r="30%">
            <stop offset="0%" stopColor="#e4e0ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#e4e0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          d="
            M 50 8
            C 27 8, 9 26, 9 49
            L 9 98
            Q 15 91, 21 98
            Q 27 105, 33 98
            Q 39 91, 45 98
            Q 50 104, 55 98
            Q 61 91, 67 98
            Q 73 105, 79 98
            Q 85 91, 91 98
            L 91 49
            C 91 26, 73 8, 50 8
            Z
          "
          fill="url(#miniGhBody)"
          style={{ animation: 'miniGhostWobble 4s ease-in-out infinite', transformOrigin: '50px 65px' }}
        />
        <ellipse cx="36" cy="33" rx="21" ry="16" fill="url(#miniGhHighlight)" />
      </svg>

      <style>{`
        @keyframes miniGhostFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes miniGhostWobble {
          0%, 100% { transform: scale(1, 1); }
          50%      { transform: scale(1.02, 0.98); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
