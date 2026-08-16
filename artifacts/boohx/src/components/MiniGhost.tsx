import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

function GhostMesh({ paused }: { paused: boolean }) {
  const ref = useRef<import('three').Mesh>(null);
  useFrame((state) => {
    if (paused || !ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = Math.sin(t * 0.9) * 0.15;
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.3;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 24, 24]} />
      <MeshDistortMaterial
        color="hsl(270, 70%, 65%)"
        distort={0.25}
        speed={1.2}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function MiniGhost() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const dpr = useMemo(() => Math.min(window.devicePixelRatio, 1.5), []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="h-16 w-16" aria-hidden>
      <Canvas
        dpr={dpr}
        gl={{ alpha: true, antialias: false }}
        camera={{ position: [0, 0, 3], fov: 40 }}
        frameloop={visible ? 'always' : 'never'}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 2, 2]} intensity={1.2} color="hsl(270, 70%, 70%)" />
        <GhostMesh paused={!visible} />
      </Canvas>
    </div>
  );
}
