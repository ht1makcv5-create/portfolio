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

  const pupilX = mouse.x * 6;
  const pupilY = mouse.y * 4.5;

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
            top: `${16 + i * 14}%`,
            left: `${10 + ((i * 37) % 78)}%`,
            opacity: 0.55,
            animation: `sparkleFloat ${4.5 + i}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}

      {/* Ghost wrapper — floats in a smooth circular drift */}
      <div
        style={{
          animation: 'ghostOrbit 7s ease-in-out infinite',
          width: '72%',
          maxWidth: 440,
        }}
      >
        <svg
          viewBox="0 0 200 260"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible', filter: 'drop-shadow(0 0 36px rgba(90,72,255,0.5))' }}
        >
          <defs>
            <radialGradient id="ghBody" cx="42%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#9c8fff" />
              <stop offset="45%" stopColor="#6a55ff" />
              <stop offset="100%" stopColor="#2c1fa8" />
            </radialGradient>
            <radialGradient id="ghGlow" cx="50%" cy="42%" r="60%">
              <stop offset="0%" stopColor="#8b7fff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#5b4aff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ghHighlight" cx="34%" cy="20%" r="30%">
              <stop offset="0%" stopColor="#e4e0ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#e4e0ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ghEye" cx="38%" cy="30%" r="62%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d8d4ff" />
            </radialGradient>
          </defs>

          {/* Outer glow */}
          <ellipse cx="100" cy="112" rx="86" ry="90" fill="url(#ghGlow)" />

          {/* Classic ghost silhouette: rounded dome + wavy hem, gently wobbling */}
          <path
            d="
              M 100 16
              C 54 16, 18 52, 18 98
              L 18 196
              Q 30 182, 42 196
              Q 54 210, 66 196
              Q 78 182, 90 196
              Q 100 208, 110 196
              Q 122 182, 134 196
              Q 146 210, 158 196
              Q 170 182, 182 196
              L 182 98
              C 182 52, 146 16, 100 16
              Z
            "
            fill="url(#ghBody)"
            style={{ animation: 'ghostWobble 4.2s ease-in-out infinite', transformOrigin: '100px 130px' }}
          />

          {/* Highlight sheen */}
          <ellipse cx="72" cy="66" rx="42" ry="32" fill="url(#ghHighlight)" />

          {/* Eyes */}
          <ellipse cx="72" cy="104" rx="17" ry="19" fill="url(#ghEye)" />
          <ellipse cx="128" cy="104" rx="17" ry="19" fill="url(#ghEye)" />

          <ellipse
            cx={72 + pupilX}
            cy={104 + pupilY}
            rx="8.5"
            ry="10"
            fill="#160f30"
            style={{ transition: 'cx 0.12s ease-out, cy 0.12s ease-out' }}
          />
          <ellipse
            cx={128 + pupilX}
            cy={104 + pupilY}
            rx="8.5"
            ry="10"
            fill="#160f30"
            style={{ transition: 'cx 0.12s ease-out, cy 0.12s ease-out' }}
          />

          <circle cx={68 + pupilX * 0.4} cy={98 + pupilY * 0.4} r="3" fill="white" opacity="0.85" />
          <circle cx={124 + pupilX * 0.4} cy={98 + pupilY * 0.4} r="3" fill="white" opacity="0.85" />

          {/* Smile — a proper upward-curving arc */}
          <path
            d="M 82 140 Q 100 156 118 140"
            fill="none"
            stroke="#160f30"
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Rosy cheeks */}
          <ellipse cx="52" cy="126" rx="8" ry="5.5" fill="#ff9fd6" opacity="0.28" />
          <ellipse cx="148" cy="126" rx="8" ry="5.5" fill="#ff9fd6" opacity="0.28" />
        </svg>
      </div>

      <style>{`
        @keyframes ghostOrbit {
          0%   { transform: translate(0px, 0px) rotate(0deg); }
          25%  { transform: translate(9px, -12px) rotate(1deg); }
          50%  { transform: translate(0px, -20px) rotate(0deg); }
          75%  { transform: translate(-9px, -12px) rotate(-1deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes ghostWobble {
          0%   { transform: scale(1, 1); }
          30%  { transform: scale(1.015, 0.99); }
          60%  { transform: scale(0.99, 1.012); }
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
