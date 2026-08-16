export default function BlobArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden style={{ filter: 'blur(1px)' }}>
      <defs>
        <linearGradient id="blob1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(270 80% 60%)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="hsl(255 70% 45%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="blob2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(36 70% 55%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(36 70% 55%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M120,60 C220,10 380,30 460,120 C540,210 520,340 430,410 C340,480 180,470 100,390 C20,310 20,110 120,60 Z"
        fill="url(#blob1)"
      />
      <path
        d="M480,300 C540,350 530,460 450,500 C370,540 260,510 230,440 C200,370 260,300 340,280 C400,265 440,270 480,300 Z"
        fill="url(#blob2)"
      />
    </svg>
  );
}
