import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/* Ghost mesh — procedural shape via LatheGeometry                    */
/* ------------------------------------------------------------------ */
function GhostMesh({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const eyeLRef = useRef<THREE.Mesh>(null);
  const eyeRRef = useRef<THREE.Mesh>(null);
  const pupilLRef = useRef<THREE.Mesh>(null);
  const pupilRRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const clock = useRef(0);
  const targetRotY = useRef(0);
  const targetRotX = useRef(0);

  const bodyPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = (i / 12) * Math.PI;
      const x = Math.sin(t) * 1.0;
      const y = Math.cos(t) * 1.1 + 0.4;
      pts.push(new THREE.Vector2(x, y));
    }
    const tailCount = 5;
    for (let i = 0; i <= tailCount * 8; i++) {
      const t = i / (tailCount * 8);
      const wave = Math.sin(t * tailCount * Math.PI * 2) * 0.18;
      const x = (1.0 - t * 0.55) + wave;
      const y = -1.1 - t * 0.55;
      pts.push(new THREE.Vector2(Math.max(0.01, x), y));
    }
    return pts;
  }, []);

  const bodyGeo = useMemo(() => new THREE.LatheGeometry(bodyPoints, 64), [bodyPoints]);
  const glowGeo = useMemo(() => new THREE.SphereGeometry(1.45, 32, 32), []);

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#5b4aff'),
    emissive: new THREE.Color('#3a2fd0'),
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.82,
    roughness: 0.25,
    metalness: 0.05,
    side: THREE.FrontSide,
  }), []);

  const glowMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#7b6cff'),
    emissive: new THREE.Color('#4a3de8'),
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.12,
    roughness: 1,
    metalness: 0,
    side: THREE.BackSide,
  }), []);

  const eyeWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.3,
    metalness: 0.0,
    emissive: new THREE.Color('#ccccee'),
    emissiveIntensity: 0.2,
  }), []);

  const pupilMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1a1230'),
    roughness: 0.6,
    metalness: 0,
    emissive: new THREE.Color('#2a1a5e'),
    emissiveIntensity: 0.1,
  }), []);

  useFrame((_, delta) => {
    clock.current += delta;
    const t = clock.current;
    if (!groupRef.current) return;

    targetRotY.current += (mouseX * 0.28 - targetRotY.current) * 0.04;
    targetRotX.current += (-mouseY * 0.18 - targetRotX.current) * 0.04;
    groupRef.current.rotation.y = targetRotY.current;
    groupRef.current.rotation.x = targetRotX.current;
    groupRef.current.position.y = Math.sin(t * 0.7) * 0.18 + Math.sin(t * 1.3 + 1) * 0.07;

    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 0.9) * 0.022;
    }

    const eyeShiftX = mouseX * 0.06;
    const eyeShiftY = -mouseY * 0.04;

    if (pupilLRef.current) {
      pupilLRef.current.position.x = -0.32 + eyeShiftX;
      pupilLRef.current.position.y = 0.58 + eyeShiftY;
      pupilLRef.current.position.z = 0.95;
    }
    if (pupilRRef.current) {
      pupilRRef.current.position.x = 0.32 + eyeShiftX;
      pupilRRef.current.position.y = 0.58 + eyeShiftY;
      pupilRRef.current.position.z = 0.95;
    }

    if (glowRef.current) {
      const scale = 1 + Math.sin(t * 1.1) * 0.04;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={glowRef} geometry={glowGeo} material={glowMat} />
      <mesh ref={bodyRef} geometry={bodyGeo} material={bodyMat} />

      <mesh ref={eyeLRef} position={[-0.32, 0.58, 0.9]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <primitive object={eyeWhiteMat} attach="material" />
      </mesh>
      <mesh ref={eyeRRef} position={[0.32, 0.58, 0.9]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <primitive object={eyeWhiteMat} attach="material" />
      </mesh>

      <mesh ref={pupilLRef} position={[-0.32, 0.58, 0.95]}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <primitive object={pupilMat} attach="material" />
      </mesh>
      <mesh ref={pupilRRef} position={[0.32, 0.58, 0.95]}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <primitive object={pupilMat} attach="material" />
      </mesh>

      <pointLight color="#6b5dff" intensity={2.5} distance={4} position={[0, 0.2, 0]} />
      <pointLight color="#a090ff" intensity={1.2} distance={3.5} position={[0, 2, 1]} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene wrapper                                                       */
/* ------------------------------------------------------------------ */
function SceneContent({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  return (
    <>
      <ambientLight color="#1a0f3a" intensity={0.6} />
      <directionalLight color="#8878ff" intensity={1.4} position={[3, 4, 3]} />
      <directionalLight color="#3020a0" intensity={0.6} position={[-3, 1, 2]} />
      <GhostMesh mouseX={mouseX} mouseY={mouseY} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Exported canvas component                                          */
/* ------------------------------------------------------------------ */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function GhostScene() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [webgl] = useState(() => hasWebGL());

  useEffect(() => {
    if (!webgl) return;
    const handle = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => window.removeEventListener('mousemove', handle);
  }, [webgl]);

  if (!webgl) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <SceneContent mouseX={mouse.x} mouseY={mouse.y} />
    </Canvas>
  );
}
