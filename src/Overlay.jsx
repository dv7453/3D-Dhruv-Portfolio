import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const mapRange = (v, a, b, c, d) => c + clamp((v - a) / (b - a), 0, 1) * (d - c);

// ── Stat counter data ──
const STATS = [
  { value: 1, suffix: '', label: 'Revenue-Generating Company', icon: '◆' },
  { value: 7, suffix: '+', label: 'Clients Served', icon: '◈' },
  { value: 25, suffix: '+', label: 'Systems Built', icon: '▣' },
];

export default function Overlay({ scrollProgress, graphProgress, appLoaded }) {
  const heroRef = useRef();
  const scrollHintRef = useRef();
  const statsRef = useRef();
  const footerRef = useRef();
  const statsAnimated = useRef(false);

  // ── GSAP entrance animation ──
  useEffect(() => {
    if (!appLoaded) return;
    const hero = heroRef.current;
    if (!hero) return;

    // Small delay to let the black preloader fade out slightly before animating in
    const tl = gsap.timeline({ delay: 0.5 });

    // Name lines stagger in
    tl.fromTo(
      hero.querySelectorAll('.hero-name-line'),
      { opacity: 0, y: 40, skewY: 3 },
      { opacity: 1, y: 0, skewY: 0, duration: 1, ease: 'power4.out', stagger: 0.15 }
    )
      // Accent bar slides in
      .fromTo(
        hero.querySelector('.hero-accent'),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: 'power3.inOut' },
        '-=0.5'
      )
      // Tagline fades up
      .fromTo(
        hero.querySelector('.hero-tagline'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      // Personality line
      .fromTo(
        hero.querySelector('.hero-personality'),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.3'
      )
      // CTA buttons
      .fromTo(
        hero.querySelector('.hero-cta-row'),
        { opacity: 0, y: 16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)' },
        '-=0.2'
      )
      // Stat cards stagger in from below
      .fromTo(
        hero.querySelectorAll('.stat-card'),
        { opacity: 0, y: 30, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12,
          onStart: () => animateCounters()
        },
        '-=0.3'
      )
      // Scroll hint
      .to(
        scrollHintRef.current,
        { opacity: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.1'
      );

    return () => tl.kill();
  }, [appLoaded]);

  // ── Count-up animation (runs once) ──
  const animateCounters = useCallback(() => {
    if (statsAnimated.current) return;
    statsAnimated.current = true;

    const counters = statsRef.current?.querySelectorAll('.stat-value');
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
    const onScroll = () => {
      const p = scrollProgress.current; // projectsProgress: 0-1 during projects phase
      const gp = graphProgress.current; // graphProgress: 0-1 during graph phase

      // Hero fades out as projects section comes in
      if (heroRef.current) {
        const heroOp = mapRange(p, 0, 0.3, 1, 0);
        heroRef.current.style.opacity = heroOp;
        heroRef.current.style.transform = `translateY(${(1 - heroOp) * -30}px)`;
      }

      // Scroll hint fades out
      if (scrollHintRef.current) {
        const hintOp = mapRange(p, 0, 0.15, 1, 0);
        scrollHintRef.current.style.opacity = Math.min(
          hintOp,
          parseFloat(scrollHintRef.current.style.opacity) || 0
        ) || hintOp;
      }

      // Minimal footer fades in at the very end of the graph section
      if (footerRef.current) {
        const footerOp = mapRange(gp, 0.92, 1.0, 0, 1);
        footerRef.current.style.opacity = footerOp;
        footerRef.current.style.transform = `translateY(${(1 - footerOp) * 20}px) translateX(-50%)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── Hero Section ── */}
      <div ref={heroRef} className="hero-section">
        {/* Left content */}
        <div className="hero-content">

          <h1 className="hero-name">
            <span className="hero-name-line">DHRUV</span>
            <span className="hero-name-line">VADHIYA</span>
          </h1>
          <div className="hero-accent" />
          <p className="hero-tagline">AI + Backend Engineer</p>
          <p className="hero-personality">The extrovert who can code</p>
          <div className="hero-cta-row">
            <a className="hero-cta" href="mailto:dhruvvadhiya1@gmail.com">
              <span className="cta-text">Get In Touch</span>
              <span className="cta-arrow">→</span>
            </a>
            <button className="hero-cta hero-cta--secondary" onClick={() => {
              fetch('/aidhruvresume.pdf')
                .then(r => r.blob())
                .then(blob => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Dhruv_Vadhiya_Resume.pdf';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                });
            }}>
              <span className="cta-text">Resume</span>
              <span className="cta-arrow">↓</span>
            </button>
          </div>
        </div>

        {/* Stat cards — bottom podium */}
        <div ref={statsRef} className="stat-cards">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`stat-card ${i === 1 ? 'stat-card--featured' : ''}`}
            >
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-value">0{stat.suffix}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div ref={scrollHintRef} className="scroll-hint" style={{ opacity: 0 }}>
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span className="scroll-label">scroll to explore</span>
      </div>

      {/* Minimal Footer */}
      <div ref={footerRef} className="minimal-footer" style={{ opacity: 0 }}>
        <p>© 2025 Dhruv Vadhiya. Crafted with intention.</p>
        <div className="footer-links">
          <a href="mailto:dhruvvadhiya1@gmail.com">Email</a>
          <a href="https://github.com/dv7453" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/dhruv-vadhiya/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </>
  );
}
