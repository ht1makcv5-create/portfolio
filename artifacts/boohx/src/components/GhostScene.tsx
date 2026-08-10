import { useEffect, useRef, useState } from 'react';

export default function GhostScene() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  // pupils follow the pointer, with a touch more travel than before
  const pupilX = mouse.x * 7;
  const pupilY = mouse.y * 5;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-visible"
      aria-hidden
    >
      {/* Ambient ground glow — breathing */}
      <div
        className="absolute bottom-[6%] left-1/2 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          width: '72%',
          height: '20%',
          background: 'radial-gradient(ellipse, rgba(90,72,255,0.32) 0%, transparent 70%)',
          animation: 'ghostGlow 4s ease-in-out infinite',
        }}
      />

      {/* Faint orbit sparkles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            background: '#a89bff',
            filter: 'blur(0.5px)',
            top: `${18 + i * 14}%`,
            left: `${12 + ((i * 37) % 76)}%`,
            opacity: 0.55,
            animation: `sparkleFloat ${4.5 + i}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}

      {/* Ghost wrapper — floats in a smooth circular drift */}
      <div
        style={{
          animation: 'ghostOrbit 7s ease-in-out infinite',
          width: '78%',
          maxWidth: 480,
        }}
      >
        <svg
          viewBox="0 0 220 240"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible', filter: 'drop-shadow(0 0 36px rgba(90,72,255,0.5))' }}
        >
          <defs>
            <radialGradient id="ghBody" cx="42%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#9c8fff" />
              <stop offset="45%" stopColor="#6a55ff" />
              <stop offset="100%" stopColor="#2c1fa8" />
            </radialGradient>
            <radialGradient id="ghGlow" cx="50%" cy="42%" r="58%">
              <stop offset="0%" stopColor="#8b7fff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#5b4aff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ghHighlight" cx="35%" cy="24%" r="32%">
              <stop offset="0%" stopColor="#e4e0ff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#e4e0ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ghEye" cx="38%" cy="30%" r="62%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d8d4ff" />
            </radialGradient>
          </defs>

          {/* Outer glow */}
          <ellipse cx="110" cy="118" rx="92" ry="94" fill="url(#ghGlow)" />

          {/* Round, jelly-ish body — animated blob path */}
          <path fill="url(#ghBody)" style={{ animation: 'ghostBlob 5.5s ease-in-out infinite' }}>
            <animate
              attributeName="d"
              dur="5.5s"
              repeatCount="indefinite"
              values="
                M110 20 C160 20 196 62 196 112 C196 168 158 214 110 214 C62 214 24 168 24 112 C24 62 60 20 110 20 Z;
                M110 24 C156 18 200 58 198 110 C200 166 154 210 110 210 C64 208 22 164 26 110 C22 60 64 22 110 24 Z;
                M110 20 C160 20 196 62 196 112 C196 168 158 214 110 214 C62 214 24 168 24 112 C24 62 60 20 110 20 Z
              "
            />
          </path>

          {/* Highlight sheen */}
          <ellipse cx="82" cy="72" rx="46" ry="34" fill="url(#ghHighlight)" />

          {/* Eyes */}
          <ellipse cx="80" cy="116" rx="19" ry="21" fill="url(#ghEye)" />
          <ellipse cx="140" cy="116" rx="19" ry="21" fill="url(#ghEye)" />

          <ellipse
            cx={80 + pupilX}
            cy={116 + pupilY}
            rx="9.5"
            ry="11"
            fill="#160f30"
            style={{ transition: 'cx 0.12s ease-out, cy 0.12s ease-out' }}
          />
          <ellipse
            cx={140 + pupilX}
            cy={116 + pupilY}
            rx="9.5"
            ry="11"
            fill="#160f30"
            style={{ transition: 'cx 0.12s ease-out, cy 0.12s ease-out' }}
          />

          <circle cx={76 + pupilX * 0.4} cy={110 + pupilY * 0.4} r="3.4" fill="white" opacity="0.85" />
          <circle cx={136 + pupilX * 0.4} cy={110 + pupilY * 0.4} r="3.4" fill="white" opacity="0.85" />

          {/* Smile — a proper upward-curving arc */}
          <path
            d="M 90 156 Q 110 174 130 156"
            fill="none"
            stroke="#160f30"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Rosy cheeks */}
          <ellipse cx="60" cy="140" rx="9" ry="6" fill="#ff9fd6" opacity="0.28" />
          <ellipse cx="160" cy="140" rx="9" ry="6" fill="#ff9fd6" opacity="0.28" />
        </svg>
      </div>

      <style>{`
        @keyframes ghostOrbit {
          0%   { transform: translate(0px, 0px) rotate(0deg); }
          25%  { transform: translate(10px, -14px) rotate(1deg); }
          50%  { transform: translate(0px, -24px) rotate(0deg); }
          75%  { transform: translate(-10px, -14px) rotate(-1deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes ghostBlob {
          0%   { transform: scale(1, 1); }
          50%  { transform: scale(1.015, 0.985); }
          100% { transform: scale(1, 1); }
        }
        @keyframes ghostGlow {
          0%   { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
          50%  { opacity: 1;   transform: translateX(-50%) scaleX(0.85); }
          100% { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
        }
        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.25; }
          50%      { transform: translateY(-14px); opacity: 0.75; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
