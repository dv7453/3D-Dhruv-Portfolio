import React, { useRef, useEffect, useCallback, useState } from 'react';
import Spline from '@splinetool/react-spline';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function SplineRobot({ scrollProgress, onLoad }) {
  const containerRef = useRef();
  const lastOpacity = useRef(1);
  const [visible, setVisible] = useState(true); // Completely unmount when not needed

  const update = useCallback(() => {
    const p = scrollProgress.current;
    const opacity = clamp(1 - p * 5, 0, 1);

    // Once scrolled past 20%, completely unmount the 3D scene to free GPU
    if (opacity <= 0 && visible) setVisible(false);
    if (opacity > 0 && !visible) setVisible(true);

    if (!containerRef.current) return;
    if (Math.abs(opacity - lastOpacity.current) < 0.005) return;
    lastOpacity.current = opacity;

    const el = containerRef.current;
    const scale = 1 - p * 0.15;
    el.style.opacity = opacity;
    el.style.transform = `scale(${clamp(scale, 0.7, 1)})`;
    el.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
  }, [scrollProgress, visible]);

  useEffect(() => {
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [update]);

  // When unmounted, the entire Spline WebGL context is destroyed — huge GPU savings
  if (!visible) return null;

  return (
    <div ref={containerRef} className="spline-robot-wrapper">
      <Spline
        scene="https://prod.spline.design/HJmrQsSCJAjvyIDG/scene.splinecode"
        onLoad={onLoad}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
