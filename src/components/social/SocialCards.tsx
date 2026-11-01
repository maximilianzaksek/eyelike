"use client";

import * as THREE from "three";
import { Suspense, useEffect, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image, useTexture } from "@react-three/drei";
import { easing } from "maath";
import "./cards-util";

/*
 * Bending-Cards-Karussell — Technik 1:1 aus pmndrs/examples
 * „cards-with-border-radius" (MIT, https://github.com/pmndrs/examples,
 * Demo https://cydstumpel.nl/). Angepasst für EYELIKE:
 *  - Rotation an den Seiten-Scroll gehängt (statt drei ScrollControls), damit
 *    es die Lenis-Seite nicht einfängt.
 *  - dunkle/transparente Bühne statt rosa Dawn-Environment (Marke).
 *  - Platzhalter-Karten (public/social) — durch echte Reels ersetzbar.
 */

type ImgRef = THREE.Mesh & { material: THREE.Material & { radius: number; zoom: number } };

function Rig({ progressRef, children }: { progressRef: MutableRefObject<number>; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (ref.current) {
      // Scroll-Fortschritt dreht das Karussell (≈1,2 Umdrehungen) + leichte Eigenrotation
      ref.current.rotation.y = -progressRef.current * Math.PI * 2 * 1.2 + state.clock.elapsedTime * 0.04;
    }
    state.events.update?.();
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y + 1.5, 10],
      0.3,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });
  return (
    <group ref={ref} rotation={[0, 0, 0.15]}>
      {children}
    </group>
  );
}

function Carousel({ radius = 1.4, count = 8 }: { radius?: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Card
          key={i}
          url={`/social/card${(i % 8) + 1}.jpg`}
          position={[
            Math.sin((i / count) * Math.PI * 2) * radius,
            0,
            Math.cos((i / count) * Math.PI * 2) * radius,
          ]}
          rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
        />
      ))}
    </>
  );
}

function Card({ url, ...props }: { url: string; position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<ImgRef>(null);
  const [hovered, hover] = useState(false);
  const over = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    hover(true);
  };
  const out = () => hover(false);
  useFrame((_, delta) => {
    if (!ref.current) return;
    easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta);
    easing.damp(ref.current.material, "radius", hovered ? 0.25 : 0.1, 0.2, delta);
    easing.damp(ref.current.material, "zoom", hovered ? 1 : 1.5, 0.2, delta);
  });
  return (
    <Image
      ref={ref as unknown as React.Ref<THREE.Mesh>}
      url={url}
      transparent
      side={THREE.DoubleSide}
      onPointerOver={over}
      onPointerOut={out}
      {...props}
    >
      <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
    </Image>
  );
}

function Banner(props: { position?: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useTexture("/social/banner.png");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  useFrame((state, delta) => {
    const mat = ref.current?.material as (THREE.Material & { time: { value: number }; map: THREE.Texture | null }) | undefined;
    if (!mat) return;
    mat.time.value += delta;
    if (mat.map) mat.map.offset.x += delta / 4;
  });
  return (
    <mesh ref={ref} {...props}>
      <cylinderGeometry args={[1.6, 1.6, 0.14, 128, 16, true]} />
      <meshSineMaterial map={texture} map-anisotropy={16} map-repeat={[6, 1]} side={THREE.DoubleSide} toneMapped={false} color="#cfcfd4" />
    </mesh>
  );
}

function Scene({ progressRef }: { progressRef: MutableRefObject<number> }) {
  return (
    <>
      <fog attach="fog" args={["#050506", 12, 22]} />
      <ambientLight intensity={1} />
      <Rig progressRef={progressRef}>
        <Carousel />
        <Banner position={[0, -0.15, 0]} />
      </Rig>
    </>
  );
}

export function SocialCards() {
  const wrap = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Karussell-Rotation an den Scroll-Fortschritt der Sektion (nur im Viewport)
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      const el = wrap.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const range = r.height + window.innerHeight;
        progressRef.current = Math.min(1, Math.max(0, (window.innerHeight - r.top) / range));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div ref={wrap} className="relative h-[80svh] w-full overflow-hidden rounded-2xl border border-line">
      <Canvas
        frameloop={reduced ? "demand" : active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 10], fov: 15 }}
      >
        <Suspense fallback={null}>
          <Scene progressRef={progressRef} />
        </Suspense>
      </Canvas>
      <span className="label pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-ink-faint">
        Scrollen dreht · Hover zoomt
      </span>
    </div>
  );
}
