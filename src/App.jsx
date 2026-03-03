import React, { Suspense, useRef, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Overlay from './Overlay';
import ScrollGraph from './ScrollGraph';
import SplineRobot from './SplineRobot';
import Experience from './Experience';
import ProjectsPage from './ProjectsPage';
import ChatBot from './ChatBot';
import './styles.css';

// Total scroll height: 1vh hero + 1vh projects + 5vh graph
const TOTAL_VH = 700;

export default function App() {
  const scrollProgress = useRef(0);         // 0-1 full page scroll
  const projectsProgress = useRef(0);       // 0-1 projects section only
  const graphProgress = useRef(0);           // 0-1 graph section only
  const [appLoaded, setAppLoaded] = useState(false);
  const [page, setPage] = useState(
    window.location.hash === '#/projects' ? 'projects' : 'home'
  );

  // Listen for hash changes
  useEffect(() => {
    const onHash = () => {
      setPage(window.location.hash === '#/projects' ? 'projects' : 'home');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!appLoaded) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [appLoaded]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const raw = window.scrollY / max;
      scrollProgress.current = raw;

      // Section boundaries (normalized to total scroll)
      const heroEnd = 100 / TOTAL_VH;       // ~0.143
      const projectsEnd = 200 / TOTAL_VH;   // ~0.286

      // Projects: 0-1 during the projects section
      projectsProgress.current = Math.max(0, Math.min(1,
        (raw - heroEnd) / (projectsEnd - heroEnd)
      ));

      // Graph: 0-1 during the graph section (starts AFTER projects end)
      graphProgress.current = Math.max(0,
        (raw - projectsEnd) / (1 - projectsEnd)
      );
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigate to projects page
  const goToProjects = () => {
    window.location.hash = '#/projects';
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    window.location.hash = '';
    window.scrollTo(0, 0);
  };

  // ── Projects page ──
  if (page === 'projects') {
    return (
      <>
        <ProjectsPage onBack={goHome} />
        <ChatBot />
      </>
    );
  }

  // ── Main scroll page ──
  return (
    <>
      {/* Scroll spacer — creates the scrollable height */}
      <div className="scroll-spacer" style={{ height: `${TOTAL_VH}vh` }} />

      {/* Fixed black background layer */}
      <div className="bg-layer" />

      {/* Spline Robot — fixed hero, fades during projects */}
      <Suspense fallback={null}>
        <SplineRobot
          scrollProgress={projectsProgress}
          onLoad={() => setAppLoaded(true)}
        />
      </Suspense>

      {/* Experience — neural branch section */}
      <Experience scrollProgress={projectsProgress} />

      {/* 2D Graph Canvas — renders AFTER projects section */}
      <ScrollGraph scrollProgress={graphProgress} />

      {/* Glassmorphic navigation */}
      <Navbar
        scrollProgress={projectsProgress}
        graphProgress={graphProgress}
        onProjectsClick={goToProjects}
      />

      {/* HTML Overlays — hero, scroll hint, footer */}
      <Overlay scrollProgress={projectsProgress} graphProgress={graphProgress} appLoaded={appLoaded} />

      {/* Global Preloader Overlay */}
      <div className={`global-preloader ${appLoaded ? 'fade-out' : ''}`}>
        <div className="loader-container">
          <div className="system-spinner"></div>
          <p className="loader-text">INITIALIZING SYSTEM</p>
        </div>
      </div>

      <ChatBot />
    </>
  );
}
