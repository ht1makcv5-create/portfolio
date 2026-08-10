import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Eyes — two small dark spheres that gently track the pointer         */
/* ------------------------------------------------------------------ */
function Eyes() {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const px = state.pointer.x * 0.14;
    const py = state.pointer.y * 0.1;
    if (leftRef.current) {
      leftRef.current.position.x = THREE.MathUtils.lerp(leftRef.current.position.x, -0.34 + px, 0.08);
      leftRef.current.position.y = THREE.MathUtils.lerp(leftRef.current.position.y, 0.12 + py, 0.08);
    }
    if (rightRef.current) {
      rightRef.current.position.x = THREE.MathUtils.lerp(rightRef.current.position.x, 0.34 + px, 0.08);
      rightRef.current.position.y = THREE.MathUtils.lerp(rightRef.current.position.y, 0.12 + py, 0.08);
    }
  });

  return (
    <>
      <mesh ref={leftRef} position={[-0.34, 0.12, 1.25]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#150f2e" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh ref={rightRef} position={[0.34, 0.12, 1.25]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#150f2e" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[-0.29, 0.18, 1.33]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.39, 0.18, 1.33]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The round, jelly-ish ghost body                                     */
/* ------------------------------------------------------------------ */
function GhostBody() {
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (bodyRef.current) {
      bodyRef.current.scale.x = 1 + Math.sin(t * 1.4) * 0.02;
      bodyRef.current.scale.y = 1 + Math.sin(t * 1.4 + Math.PI / 2) * 0.025;
    }
  });

  return (
    <group>
      <mesh ref={bodyRef}>
        <sphereGeometry args={[1.35, 48, 48]} />
        <MeshDistortMaterial
          color="#6a55ff"
          emissive="#3a29c9"
          emissiveIntensity={0.55}
          distort={0.2}
          speed={1.6}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>
      <mesh scale={0.7}>
        <sphereGeometry args={[1.35, 20, 20]} />
        <meshBasicMaterial color="#b7a8ff" transparent opacity={0.14} />
      </mesh>
      <Eyes />
      <mesh position={[0, -0.42, 1.32]} rotation={[0.15, 0, Math.PI]}>
        <torusGeometry args={[0.14, 0.032, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#150f2e" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]} intensity={22} color="#8b7fff" distance={12} decay={2} />
      <pointLight position={[-2, -1, 2]} intensity={10} color="#5b4aff" distance={10} decay={2} />
      <pointLight position={[0, -2, -2]} intensity={8} color="#2c1fa8" distance={10} decay={2} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */
export default function GhostScene() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const dpr = useMemo<[number, number]>(
    () => [1, Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio : 1)],
    []
  );

  return (
    <div className="relative h-full w-full" aria-hidden>
      <div
        className="absolute bottom-[6%] left-1/2 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          width: '70%',
          height: '16%',
          background: 'radial-gradient(ellipse, rgba(90,72,255,0.3) 0%, transparent 70%)',
          animation: 'ghostGlow 4s ease-in-out infinite',
        }}
      />
      {ready && (
        <Canvas
          dpr={dpr}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 5], fov: 42 }}
          style={{ background: 'transparent' }}
        >
          <Lights />
          <Float speed={1.6} rotationIntensity={0.28} floatIntensity={1.1} floatingRange={[-0.22, 0.22]}>
            <GhostBody />
          </Float>
          <Sparkles count={14} scale={[3.2, 3.4, 2]} size={2.2} speed={0.35} color="#a89bff" opacity={0.5} />
        </Canvas>
      )}

      <style>{`
        @keyframes ghostGlow {
          0%   { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
          50%  { opacity: 1;   transform: translateX(-50%) scaleX(0.82); }
          100% { opacity: 0.6; transform: translateX(-50%) scaleX(1); }
        }
      `}</style>
    </div>
  );
}
