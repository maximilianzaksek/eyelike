"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

/*
 * RED-Gemini-Kamera (stilisiert, wiedererkennbar) als scroll-getriebene Montage.
 * KONZEPT §4: Bauteile fliegen ein → montieren sich → Kamera dreht Seite→Front →
 * Zoom ins Objektiv. Gesteuert über progressRef (0..1) aus dem Hero.
 *
 * Es ist eine gestaltete Darstellung aus Primitiven, kein Photoscan — bewusst so,
 * damit sie auf der schwarzen Bühne präzise & technisch liest.
 */

const RED = "#e50914";
const CARBON = "#15151a";
const STEEL = "#2a2a30";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const sub = (a: number, b: number, c: number) => clamp01((a - b) / (c - b));

type PartCfg = {
  ref: MutableRefObject<THREE.Group | null>;
  from: [number, number, number]; // Startversatz (fliegt aus dieser Richtung)
  rot: [number, number, number]; // Start-Rotation
  t0: number; // Beginn der Montage (0..1 innerhalb Phase A)
  t1: number; // Ende
};

export function CameraModel({
  progressRef,
  reduced = false,
}: {
  progressRef: MutableRefObject<number>;
  reduced?: boolean;
}) {
  const rig = useRef<THREE.Group>(null);

  const body = useRef<THREE.Group>(null);
  const lens = useRef<THREE.Group>(null);
  const handle = useRef<THREE.Group>(null);
  const evf = useRef<THREE.Group>(null);
  const rods = useRef<THREE.Group>(null);
  const base = useRef<THREE.Group>(null);

  const parts = useMemo<PartCfg[]>(
    () => [
      { ref: body, from: [0, -4, -3], rot: [0.4, 0.6, 0], t0: 0.0, t1: 0.55 },
      { ref: base, from: [0, -5, 0], rot: [0.2, 0, 0.3], t0: 0.05, t1: 0.6 },
      { ref: lens, from: [6, 0.5, 4], rot: [0, -1.4, 1.2], t0: 0.18, t1: 0.8 },
      { ref: handle, from: [0, 6, 0], rot: [-0.8, 0, 0], t0: 0.3, t1: 0.85 },
      { ref: evf, from: [-6, 1, 1], rot: [0, 1.2, -0.6], t0: 0.4, t1: 0.9 },
      { ref: rods, from: [0, -2, 7], rot: [0.6, 0, 0], t0: 0.5, t1: 1.0 },
    ],
    [],
  );

  useFrame((state) => {
    const p = progressRef.current;
    const a = sub(p, 0.0, 0.5); // Montage
    const b = sub(p, 0.46, 0.74); // Seite → Front + Travel
    const c = sub(p, 0.72, 1.0); // Zoom ins Objektiv

    // Bauteile einfliegen & einrasten (gestaffelt)
    for (const part of parts) {
      const g = part.ref.current;
      if (!g) continue;
      const local = sub(a, part.t0, part.t1);
      const e = easeOutCubic(local);
      const inv = 1 - e;
      g.position.set(part.from[0] * inv, part.from[1] * inv, part.from[2] * inv);
      g.rotation.set(part.rot[0] * inv, part.rot[1] * inv, part.rot[2] * inv);
    }

    if (rig.current) {
      const t = reduced ? 0 : state.clock.elapsedTime;
      const tw = 1 - easeOutCubic(b); // 1 während Montage, 0 in der Front
      // Start im Dreiviertel-/Seitenwinkel, dreht in die Front (b).
      // Während der Montage dezent rotieren (KONZEPT §4), settelt zur Front.
      const sideAngle = -1.15;
      const drift = reduced ? 0 : Math.sin(t * 0.35) * 0.16 * tw + Math.sin(t * 0.5) * 0.03;
      rig.current.rotation.y = THREE.MathUtils.lerp(sideAngle, 0, easeOutCubic(b)) + drift;
      rig.current.rotation.x = THREE.MathUtils.lerp(0.12, 0.02, easeOutCubic(b));
      // sanftes Schweben während der Montage
      rig.current.position.y = (1 - easeOutCubic(a)) * -0.3 + (reduced ? 0 : Math.sin(t * 0.6) * 0.03 * (1 - c));
    }

    // Kamera-Dolly ins Objektiv (c)
    const cam = state.camera as THREE.PerspectiveCamera;
    const z = THREE.MathUtils.lerp(6.4, 2.05, easeOutCubic(c));
    cam.position.set(0, 0, z);
    const fov = THREE.MathUtils.lerp(38, 17, easeOutCubic(c));
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    cam.lookAt(0, 0, 1.4);
  });

  return (
    <group ref={rig} dispose={null}>
      {/* KÖRPER (Brain) */}
      <group ref={body}>
        <RoundedBox args={[1.55, 1.42, 1.15]} radius={0.06} smoothness={4} position={[0, 0, -0.25]}>
          <meshStandardMaterial color={CARBON} metalness={0.55} roughness={0.42} />
        </RoundedBox>
        {/* seitliche Riffelung / Media-Bay */}
        <RoundedBox args={[0.06, 1.0, 0.8]} radius={0.02} smoothness={2} position={[0.8, 0, -0.25]}>
          <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.35} />
        </RoundedBox>
        {/* REC-Punkt (Marken-Signal) */}
        <mesh position={[0.84, 0.4, -0.25]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.07, 32]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        {/* Objektiv-Mount-Ring (rotes Akzent) am Frontblech */}
        <mesh position={[0, 0, 0.33]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.05, 16, 48]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={0.5} metalness={0.4} roughness={0.4} />
        </mesh>
      </group>

      {/* BASEPLATE */}
      <group ref={base}>
        <RoundedBox args={[1.7, 0.12, 1.3]} radius={0.03} smoothness={2} position={[0, -0.78, -0.2]}>
          <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.35} />
        </RoundedBox>
      </group>

      {/* OBJEKTIV (Ziel des Zooms) */}
      <group ref={lens}>
        {/* Barrel */}
        <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.44, 0.46, 1.35, 48]} />
          <meshStandardMaterial color="#0c0c0f" metalness={0.85} roughness={0.28} />
        </mesh>
        {/* Fokus-/Blendenring */}
        <mesh position={[0, 0, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.22, 64]} />
          <meshStandardMaterial color="#1c1c20" metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 1.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.49, 0.49, 0.16, 64]} />
          <meshStandardMaterial color="#1c1c20" metalness={0.6} roughness={0.5} />
        </mesh>
        {/* Front-Fassung */}
        <mesh position={[0, 0, 1.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.47, 0.44, 0.16, 48]} />
          <meshStandardMaterial color="#2a2a30" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Glas-Frontelement (dunkel, leicht reflektierend) */}
        <mesh position={[0, 0, 1.79]}>
          <circleGeometry args={[0.43, 64]} />
          <meshStandardMaterial color="#04060a" metalness={1} roughness={0.05} />
        </mesh>
        {/* innerer Blendenring (rotes Glühen tief im Glas) */}
        <mesh position={[0, 0, 1.81]}>
          <ringGeometry args={[0.12, 0.17, 48]} />
          <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={1.2} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        {/* Reflexpunkt in der Mitte */}
        <mesh position={[0, 0, 1.82]}>
          <circleGeometry args={[0.05, 32]} />
          <meshStandardMaterial color="#9bbcff" emissive="#6f9bff" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      </group>

      {/* TOP-HANDLE */}
      <group ref={handle}>
        <RoundedBox args={[1.0, 0.12, 0.5]} radius={0.05} smoothness={3} position={[-0.1, 0.92, -0.2]}>
          <meshStandardMaterial color={STEEL} metalness={0.65} roughness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.12, 0.22, 0.12]} radius={0.03} smoothness={2} position={[-0.55, 0.79, -0.2]}>
          <meshStandardMaterial color={STEEL} metalness={0.65} roughness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.12, 0.22, 0.12]} radius={0.03} smoothness={2} position={[0.35, 0.79, -0.2]}>
          <meshStandardMaterial color={STEEL} metalness={0.65} roughness={0.4} />
        </RoundedBox>
      </group>

      {/* EVF / MONITOR */}
      <group ref={evf}>
        <RoundedBox args={[0.55, 0.42, 0.1]} radius={0.03} smoothness={3} position={[-0.95, 0.35, 0.1]} rotation={[0, 0.35, 0]}>
          <meshStandardMaterial color="#0a0a0d" metalness={0.5} roughness={0.45} />
        </RoundedBox>
        {/* Display-Fläche */}
        <mesh position={[-0.9, 0.35, 0.16]} rotation={[0, 0.35, 0]}>
          <planeGeometry args={[0.4, 0.28]} />
          <meshStandardMaterial color="#0d1622" emissive="#16314e" emissiveIntensity={0.4} toneMapped={false} />
        </mesh>
      </group>

      {/* 15mm-RODS unter dem Objektiv */}
      <group ref={rods}>
        <mesh position={[-0.28, -0.5, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.5, 24]} />
          <meshStandardMaterial color="#3a3a42" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.28, -0.5, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.5, 24]} />
          <meshStandardMaterial color="#3a3a42" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-5, 6, 5]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[6, -2, -4]} intensity={0.95} color={RED} />
      <pointLight position={[0, 0, 4]} intensity={5} distance={9} color="#9bb8ff" />
      {/* Env aus Lightformern (kein Netzwerk) — gibt dem Metall etwas zum Spiegeln */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.8} color="#ffffff" position={[-4, 4, 4]} scale={[7, 7, 1]} />
        <Lightformer intensity={2.2} color="#ff3a42" position={[5, -1, -3]} scale={[5.5, 5.5, 1]} />
        <Lightformer intensity={1.3} color="#7fa8ff" position={[3, 3, 4]} scale={[5, 5, 1]} />
        <Lightformer intensity={1.8} color="#ffffff" position={[0, -4, 2]} scale={[6, 3, 1]} />
      </Environment>
    </>
  );
}

export function CameraRig({
  progressRef,
  active = true,
  reduced = false,
  dpr = [1, 1.75],
}: {
  progressRef: MutableRefObject<number>;
  active?: boolean;
  reduced?: boolean;
  dpr?: number | [number, number];
}) {
  // reduced: ein statischer Frame (demand). Sonst nur rendern, solange im Viewport.
  const frameloop = reduced ? "demand" : active ? "always" : "never";
  return (
    <Canvas
      frameloop={frameloop}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={dpr}
      camera={{ position: [0, 0, 6.4], fov: 38 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Lighting />
      <CameraModel progressRef={progressRef} reduced={reduced} />
    </Canvas>
  );
}

export default CameraRig;
