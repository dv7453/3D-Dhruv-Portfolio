import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const mapRange = (v, a, b, c, d) => c + clamp((v - a) / (b - a), 0, 1) * (d - c);

// ── Stat counter data ──
const STATS = [
  { value: 1,  suffix: '',  label: 'Revenue-Generating Company' },
  { value: 7,  suffix: '+', label: 'Clients' },
  { value: 25, suffix: '+', label: 'Systems Built' },
];

export default function Overlay({ scrollProgress }) {
  const containerRef = useRef();
  const scrollHintRef = useRef();
  const ctaRef = useRef();
  const statsRef = useRef();
  const statsAnimated = useRef(false);

  // ── GSAP entrance animation for hero text ──
  useEffect(() => {
    const els = containerRef.current;
    if (!els) return;

    const tl = gsap.timeline({ delay: 3.2 });

    tl.fromTo(
      els.querySelector('.overlay-name'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }
    )
    .fromTo(
      els.querySelector('.overlay-tagline'),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(
      els.querySelectorAll('.overlay-btn'),
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12 },
      '-=0.3'
    )
    .fromTo(
      els.querySelector('.hero-stats'),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        onStart: () => animateCounters() },
      '-=0.2'
    )
    .to(
      scrollHintRef.current,
      { opacity: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.1'
    );

    return () => tl.kill();
  }, []);

  // ── Count-up animation (runs once) ──
  const animateCounters = useCallback(() => {
    if (statsAnimated.current) return;
    statsAnimated.current = true;

    const counters = statsRef.current?.querySelectorAll('.stat-number');
    if (!counters) return;

    counters.forEach((el, i) => {
      const target = STATS[i].value;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.6 + i * 0.25,
        delay: i * 0.18,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val) + STATS[i].suffix;
        },
      });
    });
  }, []);

  // ── Scroll-driven overlay updates ──
  useEffect(() => {
    let raf;
    const loop = () => {
      const p = scrollProgress.current;

      // Hero fades out on scroll
      if (containerRef.current) {
        const heroOp = mapRange(p, 0, 0.08, 1, 0);
        containerRef.current.style.opacity = heroOp;
      }

      // Scroll hint fades out
      if (scrollHintRef.current) {
        const hintOp = mapRange(p, 0.01, 0.04, 1, 0);
        scrollHintRef.current.style.opacity = Math.min(
          hintOp,
          parseFloat(scrollHintRef.current.style.opacity) || 0
        ) || hintOp;
      }

      // CTA
      if (ctaRef.current) {
        const ctaOp = mapRange(p, 0.88, 0.96, 0, 1);
        ctaRef.current.style.opacity = ctaOp;
        ctaRef.current.style.transform = `translate(-50%, -50%) translateY(${(1 - ctaOp) * 20}px)`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Hero */}
      <div ref={containerRef} className="overlay-container">
        <h1 className="overlay-name">Dhruv Vadhiya</h1>
        <p className="overlay-tagline">an extrovert who can code</p>

        {/* Animated stats */}
        <div ref={statsRef} className="hero-stats">
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <span className="stat-divider" />}
              <div className="stat-item">
                <span className="stat-number">0{stat.suffix}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="overlay-buttons">
          <a className="overlay-btn" href="https://github.com/dv7453" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a className="overlay-btn" href="#" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a className="overlay-btn" href="mailto:dhruv@example.com">
            Contact
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div ref={scrollHintRef} className="scroll-hint" style={{ opacity: 0 }}>
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span className="scroll-label">scroll to explore</span>
      </div>

      {/* Final CTA */}
      <div ref={ctaRef} className="cta-overlay" style={{ opacity: 0 }}>
        <h2 className="cta-heading">Let&apos;s build something</h2>
        <div className="cta-links">
          <a href="https://github.com/dv7453" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:dhruv@example.com">Email</a>
        </div>
      </div>
    </>
  );
}
