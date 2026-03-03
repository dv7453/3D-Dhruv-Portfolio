import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Config ──────────────────────────────────────────────
const TEXT = 'DHRUV';
const FONT_SIZE = 220;
const CANVAS_W = 1400;
const CANVAS_H = 300;
const SAMPLE_STEP = 3;          // pixel sampling density
const CUBE_SIZE = 0.04;         // size of each instanced cube
const SPREAD = 12;              // initial scatter radius
const SPRING = 0.025;           // spring stiffness toward target
const DAMPING = 0.88;           // velocity damping
const MOUSE_RADIUS = 0.8;       // repulsion radius in world units
const MOUSE_STRENGTH = 0.06;    // repulsion force multiplier
const ENTRANCE_DURATION = 2.5;  // seconds for full entrance
const STAGGER_RANGE = 0.6;      // stagger spread (0–1, center first)

// ─── Sample text into target positions ───────────────────
function sampleTextPositions() {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const cx = canvas.getContext('2d');

  cx.fillStyle = '#000';
  cx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  cx.fillStyle = '#fff';
  cx.font = `900 ${FONT_SIZE}px Inter, sans-serif`;
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText(TEXT, CANVAS_W / 2, CANVAS_H / 2);

  const imageData = cx.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
  const positions = [];

  for (let y = 0; y < CANVAS_H; y += SAMPLE_STEP) {
    for (let x = 0; x < CANVAS_W; x += SAMPLE_STEP) {
      const i = (y * CANVAS_W + x) * 4;
      if (imageData[i] > 128) {
        // Map pixel position to world coordinates centered at origin
        const wx = (x / CANVAS_W - 0.5) * 6;     // x range ~[-3, 3]
        const wy = -(y / CANVAS_H - 0.5) * 1.3;  // y range ~[-0.65, 0.65]
        positions.push(wx, wy, 0);
      }
    }
  }

  return new Float32Array(positions);
}

// ─── Color palette for cubes ─────────────────────────────
function generateColors(count) {
  const colors = new Float32Array(count * 3);
  const white = new THREE.Color('#e8e8e8');
  const purple = new THREE.Color('#7c3aed');
  const blue = new THREE.Color('#3b82f6');

  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let color;
    if (r < 0.82) {
      // Mostly white/silver with slight variation
      const shade = 0.75 + Math.random() * 0.25;
      color = new THREE.Color(shade, shade, shade);
    } else if (r < 0.91) {
      color = purple.clone().lerp(white, 0.3 + Math.random() * 0.4);
    } else {
      color = blue.clone().lerp(white, 0.3 + Math.random() * 0.4);
    }
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  return colors;
}

// ═════════════════════════════════════════════════════════
//  COMPONENT
// ═════════════════════════════════════════════════════════
export default function ParticleText() {
  const meshRef = useRef();
  const { size, camera, raycaster, pointer } = useThree();
  const [ready, setReady] = useState(false);

  // Sample the text on mount
  const targets = useMemo(() => sampleTextPositions(), []);
  const count = targets.length / 3;

  // Per-particle physics state
  const state = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);    // euler xyz
    const rotVelocities = new Float32Array(count * 3);
    const delays = new Float32Array(count);            // entrance stagger
    const scales = new Float32Array(count);            // entrance scale

    // Scatter initial positions far from target
    for (let i = 0; i < count; i++) {
      const tx = targets[i * 3];
      const ty = targets[i * 3 + 1];

      // Random scattered start
      positions[i * 3] = (Math.random() - 0.5) * SPREAD;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;

      // Random initial rotations
      rotations[i * 3] = Math.random() * Math.PI * 2;
      rotations[i * 3 + 1] = Math.random() * Math.PI * 2;
      rotations[i * 3 + 2] = Math.random() * Math.PI * 2;

      // Stagger: center letters arrive first (distance from 0,0)
      const distFromCenter = Math.sqrt(tx * tx + ty * ty);
      const maxDist = 3.5;
      delays[i] = (distFromCenter / maxDist) * STAGGER_RANGE + Math.random() * 0.15;

      scales[i] = 0;
    }

    return { positions, velocities, rotations, rotVelocities, delays, scales };
  }, [targets, count]);

  // Colors
  const colors = useMemo(() => generateColors(count), [count]);

  // Mouse world position (on z=0 plane)
  const mouseWorld = useRef(new THREE.Vector3(9999, 9999, 0));
  const mousePlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const mouseIntersect = useRef(new THREE.Vector3());

  // Elapsed time
  const elapsedRef = useRef(0);

  // Temp objects for instanced mesh updates
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempEuler = useMemo(() => new THREE.Euler(), []);

  // Mark ready once font is loaded and we have particles
  useEffect(() => {
    if (count > 0) {
      // Small delay so the canvas has time to render the font
      const id = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(id);
    }
  }, [count]);

  // ─── Animation loop ────────────────────────────────────
  useFrame((_, delta) => {
    if (!meshRef.current || !ready) return;

    const dt = Math.min(delta, 0.05); // cap delta
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    // Update mouse world position via raycasting
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(mousePlane, mouseIntersect.current);
    mouseWorld.current.copy(mouseIntersect.current);

    const mx = mouseWorld.current.x;
    const my = mouseWorld.current.y;

    const { positions, velocities, rotations, rotVelocities, delays, scales } = state;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // ── Entrance timing ──
      const entranceProg = Math.min(1, Math.max(0, (t - delays[i]) / ENTRANCE_DURATION));
      const eased = 1 - Math.pow(1 - entranceProg, 3); // ease-out cubic

      // Scale ramp-up
      scales[i] = eased;
      if (entranceProg <= 0) continue; // not started yet

      // ── Spring force toward target ──
      const tx = targets[i3];
      const ty = targets[i3 + 1];
      const tz = targets[i3 + 2];

      const dx = tx - positions[i3];
      const dy = ty - positions[i3 + 1];
      const dz = tz - positions[i3 + 2];

      velocities[i3] += dx * SPRING;
      velocities[i3 + 1] += dy * SPRING;
      velocities[i3 + 2] += dz * SPRING;

      // ── Mouse repulsion ──
      const pmx = positions[i3] - mx;
      const pmy = positions[i3 + 1] - my;
      const pmDist = Math.sqrt(pmx * pmx + pmy * pmy);

      if (pmDist < MOUSE_RADIUS && pmDist > 0.001) {
        const force = (1 - pmDist / MOUSE_RADIUS) * MOUSE_STRENGTH;
        const nx = pmx / pmDist;
        const ny = pmy / pmDist;
        velocities[i3] += nx * force;
        velocities[i3 + 1] += ny * force;
        velocities[i3 + 2] += (Math.random() - 0.5) * force * 0.3; // slight z scatter

        // Spin faster when repelled
        rotVelocities[i3] += (Math.random() - 0.5) * force * 2;
        rotVelocities[i3 + 1] += (Math.random() - 0.5) * force * 2;
      }

      // ── Damping ──
      velocities[i3] *= DAMPING;
      velocities[i3 + 1] *= DAMPING;
      velocities[i3 + 2] *= DAMPING;

      // ── Integrate position ──
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // ── Rotation ──
      // Gentle idle tumble proportional to velocity
      const speed = Math.abs(velocities[i3]) + Math.abs(velocities[i3 + 1]) + Math.abs(velocities[i3 + 2]);
      rotVelocities[i3] += speed * 0.3;
      rotVelocities[i3 + 1] += speed * 0.2;

      rotVelocities[i3] *= 0.95;
      rotVelocities[i3 + 1] *= 0.95;
      rotVelocities[i3 + 2] *= 0.95;

      rotations[i3] += rotVelocities[i3] * 0.02;
      rotations[i3 + 1] += rotVelocities[i3 + 1] * 0.02;
      rotations[i3 + 2] += rotVelocities[i3 + 2] * 0.02;

      // ── Update instance matrix ──
      const s = scales[i] * CUBE_SIZE;
      tempEuler.set(rotations[i3], rotations[i3 + 1], rotations[i3 + 2]);
      tempObj.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      tempObj.rotation.copy(tempEuler);
      tempObj.scale.set(s, s, s);
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </boxGeometry>
      <meshStandardMaterial
        vertexColors
        metalness={0.7}
        roughness={0.25}
        envMapIntensity={0.5}
      />
    </instancedMesh>
  );
}
