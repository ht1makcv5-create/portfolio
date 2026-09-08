import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MathUtils, SphereGeometry } from 'three';
import type { DirectionalLight, Mesh } from 'three';
import type { SculptureMotion } from '../Hero3DObject';

type Props = { pointer: RefObject<SculptureMotion>; active: boolean; reduced: boolean; mobile: boolean; compact: boolean; onReady: () => void; onFailure: () => void };
function Sculpture({ pointer, reduced, mobile, compact }: Props) {
  const mesh = useRef<Mesh>(null);
  const elapsed = useRef(0);
  const geometry = useMemo(() => {
    const geo = new SphereGeometry(1, mobile ? 40 : 72, mobile ? 28 : 48);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const radius = 1 + .08 * Math.sin(y * 4.5 + x * 1.6) + .045 * Math.cos(z * 4 - y * 2);
      const waist = 1 - .55 * Math.exp(-((y - .03) ** 2) / .085);
      p.setXYZ(i, x * radius * waist * 1.12 + .2 * Math.sin(y * 3.1), y * radius * 1.5, z * radius * waist * .88);
    }
    geo.computeVertexNormals();
    return geo;
  }, [mobile]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, dt) => {
    if (!mesh.current) return;
    const delta = Math.min(dt, .05);
    const m = mesh.current;
    if (reduced) { m.rotation.set(.12, -.35, -.18); m.position.set(0, 0, 0); m.scale.setScalar(1); return; }
    elapsed.current += delta;
    const t = elapsed.current;
    const aim = pointer.current;
    m.rotation.x = MathUtils.damp(m.rotation.x, .12 + aim.y * .17 + Math.sin(t * .31) * .035, 3.5, delta);
    m.rotation.y = MathUtils.damp(m.rotation.y, -.35 + aim.x * .27 + Math.sin(t * (compact ? .34 : .22)) * .16, 3.5, delta);
    m.rotation.z = -.18 + Math.sin(t * .23) * .025;
    m.position.x = MathUtils.damp(m.position.x, aim.x * .09, 3.5, delta);
    m.position.y = MathUtils.damp(m.position.y, Math.sin(t * .9) * .065 - aim.y * .035, 3.5, delta);
    m.scale.setScalar(MathUtils.damp(m.scale.x, aim.hover ? 1.035 : 1, 4, delta));
  });
  return <mesh ref={mesh} geometry={geometry} rotation={[.12, -.35, -.18]}>
    <meshPhysicalMaterial color="#aa8654" roughness={.38} metalness={.02} clearcoat={.18} clearcoatRoughness={.45} />
  </mesh>;
}
function StudioLights({ pointer, reduced }: Pick<Props, 'pointer' | 'reduced'>) {
  const rim = useRef<DirectionalLight>(null);
  useFrame((_, delta) => { if (rim.current) rim.current.intensity = MathUtils.damp(rim.current.intensity, !reduced && pointer.current.hover ? 3 : 2.5, 4, Math.min(delta, .05)); });
  return <><ambientLight intensity={.5} color="#f5e8d0" /><hemisphereLight args={['#ede5d2', '#121315', 1.8]} /><directionalLight position={[-3, 4, 5]} intensity={3.8} color="#fff0d7" /><directionalLight ref={rim} position={[3, 1, -2]} intensity={2.5} color="#f2c16a" /><directionalLight position={[0, -3, 2]} intensity={.35} color="#587362" /></>;
}
function Lifecycle({ onReady, onFailure, active, reduced }: Props) {
  const { gl, invalidate } = useThree();
  const first = useRef(false);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (e: Event) => { e.preventDefault(); onFailure(); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onFailure]);
  useEffect(() => { if (active) invalidate(); }, [active, reduced, invalidate]);
  useFrame(() => { if (!first.current) { first.current = true; onReady(); } });
  return null;
}
export default function SculptureCanvas(props: Props) {
  return <Canvas className="sculpture__canvas" dpr={props.mobile ? 1 : [1, 1.5]} frameloop={!props.active ? 'never' : props.reduced ? 'demand' : 'always'} gl={{ alpha: true, antialias: !props.mobile, powerPreference: 'low-power' }} camera={{ position: [0, 0, 6], fov: 38 }} fallback={null}>
    <StudioLights {...props} /><Sculpture {...props} /><Lifecycle {...props} />
  </Canvas>;
}
