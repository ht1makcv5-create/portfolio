import { Component, Suspense, lazy, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';

const SculptureCanvas = lazy(() => import('./sculpture/SculptureCanvas'));
export type SculptureMotion = { x: number; y: number; hover: boolean };
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function Hero3DObject({ compact = false }: { compact?: boolean }) {
  const gradientId = useId();
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<SculptureMotion>({ x: 0, y: 0, hover: false });
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);
  const [awake, setAwake] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [capable, setCapable] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const touch = matchMedia('(pointer: coarse), (max-width: 767px)');
    const update = () => { setReduced(motion.matches); setMobile(touch.matches); };
    update(); motion.addEventListener('change', update); touch.addEventListener('change', update);
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    let supported = false;
    if (!nav.connection?.saveData && !(touch.matches && (nav.deviceMemory ?? 4) <= 2)) {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2', { powerPreference: 'low-power' });
        supported = !!gl;
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
      } catch { supported = false; }
    }
    setCapable(supported);
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setSeen(true);
    }, { threshold: 0.05 });
    if (host.current) observer.observe(host.current);
    const visibility = () => setAwake(!document.hidden);
    visibility(); document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect(); motion.removeEventListener('change', update); touch.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    const region = host.current?.closest<HTMLElement>('[data-sculpture-region]') ?? host.current;
    const reset = () => { pointer.current = { x: 0, y: 0, hover: false }; };
    if (!region || !visible || !awake || mobile || reduced || failed || !capable) { reset(); return; }
    const move = (event: PointerEvent) => {
      const rect = region.getBoundingClientRect();
      const object = host.current!.getBoundingClientRect();
      pointer.current = {
        x: Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)),
        y: Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)),
        hover: event.clientX > object.left + object.width * .18 && event.clientX < object.right - object.width * .18 && event.clientY > object.top + object.height * .12 && event.clientY < object.bottom - object.height * .16,
      };
    };
    region.addEventListener('pointermove', move, { passive: true }); region.addEventListener('pointerleave', reset);
    return () => { region.removeEventListener('pointermove', move); region.removeEventListener('pointerleave', reset); reset(); };
  }, [visible, awake, mobile, reduced, failed, capable]);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  const live = capable && seen && !failed;
  return <div ref={host} aria-hidden="true" className={`sculpture ${compact ? 'sculpture--compact' : ''}`} data-mode={live && ready ? reduced ? 'static-3d' : visible && awake ? 'animated' : 'paused' : 'fallback'}>
    <div className="sculpture__orbit" />
    <svg className="sculpture__fallback" viewBox="0 0 300 360" focusable="false" style={{ opacity: live && ready ? 0 : 1 }}>
      <defs>
        <radialGradient id={gradientId} cx="28%" cy="20%" r="88%">
          <stop offset="0" stopColor="#f2e0b7" /><stop offset=".27" stopColor="#c0a372" />
          <stop offset=".6" stopColor="#8f734e" /><stop offset="1" stopColor="#39372e" />
        </radialGradient>
      </defs>
      <path d="M146 28C198 14 240 38 240 90C242 128 204 143 185 164C166 184 173 200 195 222C214 241 231 272 211 296C191 320 133 330 102 309C80 294 86 261 105 238C127 209 137 188 124 168C109 146 77 140 65 113C42 62 93 37 146 28Z" fill={`url(#${gradientId})`} />
      <path d="M91 59C65 83 75 114 103 129M116 280C108 300 139 311 165 308" fill="none" stroke="#f5e2b8" strokeWidth="1.2" opacity=".35" strokeLinecap="round" />
    </svg>
    <div className="sculpture__shadow" />
    {live && <SceneBoundary onFailure={onFailure}><Suspense fallback={null}><SculptureCanvas pointer={pointer} active={visible && awake} reduced={reduced} mobile={mobile} compact={compact} onReady={onReady} onFailure={onFailure} /></Suspense></SceneBoundary>}
  </div>;
}
