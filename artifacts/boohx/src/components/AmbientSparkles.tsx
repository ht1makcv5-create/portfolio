const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 41 + 7) % 100,
  top: (i * 67 + 13) % 100,
  size: 3 + (i % 3),
  duration: 6 + (i % 5),
  delay: i * 0.6,
}));

export default function AmbientSparkles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: '#a89bff',
            filter: 'blur(0.5px)',
            opacity: 0.22,
            animation: `ambientSparkle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ambientSparkle {
          0%, 100% { transform: translateY(0px); opacity: 0.12; }
          50%      { transform: translateY(-18px); opacity: 0.38; }
        }
        @media (prefers-reduced-motion: reduce) {
          span { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
