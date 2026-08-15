export default function MeshArt({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 800"
      className={className}
      aria-hidden
      style={{ filter: 'blur(2px)' }}
    >
      <defs>
        <radialGradient id="mesh1" cx="30%" cy="25%" r="55%">
          <stop offset="0%" stopColor="hsl(270 80% 62%)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(270 80% 62%)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mesh2" cx="75%" cy="65%" r="50%">
          <stop offset="0%" stopColor="hsl(36 70% 55%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(36 70% 55%)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mesh3" cx="55%" cy="85%" r="40%">
          <stop offset="0%" stopColor="hsl(255 75% 50%)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(255 75% 50%)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="800" fill="url(#mesh1)" />
      <rect width="800" height="800" fill="url(#mesh2)" />
      <rect width="800" height="800" fill="url(#mesh3)" />
    </svg>
  );
}
