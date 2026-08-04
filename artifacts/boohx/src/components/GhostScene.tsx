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

  // pupil offset — subtle follow
  const pupilX = mouse.x * 5;
  const pupilY = mouse.y * 4;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full flex items-end justify-center overflow-visible"
      aria-hidden
    >
      {/* Ambient ground glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          width: '75%',
          height: '18%',
          background: 'radial-gradient(ellipse, rgba(90,72,255,0.28) 0%, transparent 70%)',
          animation: 'ghostGlow 4s ease-in-out infinite',
        }}
      />

      {/* Ghost SVG wrapper — floats up and down */}
      <div
        style={{
          animation: 'ghostFloat 4.2s ease-in-out infinite',
          transformOrigin: 'center bottom',
          width: '82%',
          maxWidth: 520,
        }}
      >
        <svg
          viewBox="0 0 200 260"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible', filter: 'drop-shadow(0 0 32px rgba(90,72,255,0.45))' }}
        >
          <defs>
            {/* Body gradient — purple glow */}
            <radialGradient id="bodyGrad" cx="45%" cy="35%" r="62%">
              <stop offset="0%" stopColor="#8b7fff" />
              <stop offset="55%" stopColor="#5b4aff" />
              <stop offset="100%" stopColor="#2c1fa8" />
            </radialGradient>

            {/* Outer glow layer */}
            <radialGradient id="glowGrad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#7b6cff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#5b4aff" stopOpacity="0" />
            </radialGradient>

            {/* Inner highlight */}
            <radialGradient id="highlightGrad" cx="38%" cy="28%" r="35%">
              <stop offset="0%" stopColor="#ccc8ff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ccc8ff" stopOpacity="0" />
            </radialGradient>

            {/* Eye whites */}
            <radialGradient id="eyeGrad" cx="38%" cy="32%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d8d4ff" />
            </radialGradient>

            <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          {/* Outer glow blob */}
          <ellipse cx="100" cy="108" rx="82" ry="85" fill="url(#glowGrad)" />

          {/* Ghost body — dome + wavy skirt */}
          <path
            d="
              M 100 18
              C 56 18, 22 52, 22 96
              L 22 190
              Q 33 178, 44 190
              Q 55 202, 66 190
              Q 77 178, 88 190
              Q 99 202, 110 190
              Q 121 178, 132 190
              Q 143 202, 154 190
              Q 165 178, 176 190
              L 178 96
              C 178 52, 144 18, 100 18
              Z
            "
            fill="url(#bodyGrad)"
            style={{ animation: 'ghostWobble 3.8s ease-in-out infinite' }}
          />

          {/* Highlight sheen */}
          <path
            d="
              M 100 18
              C 56 18, 22 52, 22 96
              L 22 190
              Q 33 178, 44 190
              Q 55 202, 66 190
              Q 77 178, 88 190
              Q 99 202, 110 190
              Q 121 178, 132 190
              Q 143 202, 154 190
              Q 165 178, 176 190
              L 178 96
              C 178 52, 144 18, 100 18
              Z
            "
            fill="url(#highlightGrad)"
          />

          {/* Left eye white */}
          <ellipse cx="76" cy="102" rx="17" ry="19" fill="url(#eyeGrad)" />
          {/* Right eye white */}
          <ellipse cx="124" cy="102" rx="17" ry="19" fill="url(#eyeGrad)" />

          {/* Left pupil — follows mouse */}
          <ellipse
            cx={76 + pupilX}
            cy={102 + pupilY}
            rx="9"
            ry="10"
            fill="#1a1230"
            style={{ transition: 'cx 0.12s ease-out, cy 0.12s ease-out' }}
          />
          {/* Right pupil */}
          <ellipse
            cx={124 + pupilX}
            cy={102 + pupilY}
            rx="9"
            ry="10"
            fill="#1a1230"
            style={{ transition: 'cx 0.12s ease-out, cy 0.12s ease-out' }}
          />

          {/* Eye glints */}
          <circle cx={72 + pupilX * 0.4} cy={97 + pupilY * 0.4} r="3.2" fill="white" opacity="0.8" />
          <circle cx={120 + pupilX * 0.4} cy={97 + pupilY * 0.4} r="3.2" fill="white" opacity="0.8" />

          {/* Small mouth / expression */}
          <ellipse cx="100" cy="142" rx="6" ry="4" fill="#1a1230" opacity="0.5" />
        </svg>
      </div>

      {/* CSS keyframes injected via style tag */}
      <style>{`
        @keyframes ghostFloat {
          0%   { transform: translateY(0px) rotate(0deg); }
          25%  { transform: translateY(-18px) rotate(0.8deg); }
          50%  { transform: translateY(-28px) rotate(-0.5deg); }
          75%  { transform: translateY(-14px) rotate(0.4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes ghostWobble {
          0%   { transform: scaleX(1) scaleY(1); }
          30%  { transform: scaleX(1.015) scaleY(0.992); }
          60%  { transform: scaleX(0.988) scaleY(1.008); }
          100% { transform: scaleX(1) scaleY(1); }
        }
        @keyframes ghostGlow {
          0%   { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
          50%  { opacity: 1;   transform: translateX(-50%) scaleX(0.82); }
          100% { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
        }
      `}</style>
    </div>
  );
}
