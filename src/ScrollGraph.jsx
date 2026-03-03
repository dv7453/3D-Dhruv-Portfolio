import React, { useEffect, useRef } from 'react';

/* ─────────────────────────────────────
   DAG‑style graph that builds on scroll
   ───────────────────────────────────── */

// ── Layout constants ──
const DOT_GAP = 40;
const DOT_SIZE = 1;
const DOT_COL = 'rgba(148,163,184,0.06)';

// ── Node definitions (positions in 0-1 normalized canvas coords) ──
const NODES = [
  // core hub
  { id: 'core', label: 'Stack', x: 0.50, y: 0.48, r: 42, color: '#7c3aed', revealAt: 0.02, group: 'hub' },

  // AI / ML Category
  { id: 'aiml', label: 'AI / ML', x: 0.35, y: 0.35, r: 34, color: '#9333ea', revealAt: 0.10, group: 'product' },
  { id: 'pytorch', label: 'PyTorch / TF', x: 0.22, y: 0.28, r: 24, color: '#a855f7', revealAt: 0.14, group: 'skill' },
  { id: 'sklearn', label: 'scikit-learn', x: 0.38, y: 0.22, r: 22, color: '#a855f7', revealAt: 0.16, group: 'skill' },
  { id: 'nlp', label: 'NLP / RAG', x: 0.20, y: 0.42, r: 26, color: '#a855f7', revealAt: 0.18, group: 'skill' },
  { id: 'cv', label: 'Computer Vision', x: 0.45, y: 0.25, r: 26, color: '#a855f7', revealAt: 0.20, group: 'skill' },
  { id: 'timeseries', label: 'Time-series', x: 0.25, y: 0.52, r: 22, color: '#a855f7', revealAt: 0.22, group: 'skill' },

  // Agent Systems
  { id: 'agents', label: 'Agent Systems', x: 0.65, y: 0.28, r: 34, color: '#06b6d4', revealAt: 0.24, group: 'product' },
  { id: 'langgraph', label: 'LangGraph', x: 0.55, y: 0.16, r: 22, color: '#0891b2', revealAt: 0.28, group: 'skill' },
  { id: 'langchain', label: 'LangChain', x: 0.75, y: 0.16, r: 22, color: '#0891b2', revealAt: 0.30, group: 'skill' },
  { id: 'llmapi', label: 'LLMs', x: 0.60, y: 0.38, r: 24, color: '#0891b2', revealAt: 0.32, group: 'skill' },
  { id: 'multiagent', label: 'Multi-agent', x: 0.80, y: 0.34, r: 24, color: '#0891b2', revealAt: 0.34, group: 'skill' },

  // Backend
  { id: 'backend', label: 'Backend', x: 0.82, y: 0.52, r: 32, color: '#10b981', revealAt: 0.38, group: 'product' },
  { id: 'pybackend', label: 'Python (FastAPI)', x: 0.94, y: 0.42, r: 24, color: '#059669', revealAt: 0.42, group: 'skill' },
  { id: 'node', label: 'Node.js', x: 0.92, y: 0.58, r: 22, color: '#059669', revealAt: 0.44, group: 'skill' },
  { id: 'websockets', label: 'WebSockets', x: 0.86, y: 0.66, r: 22, color: '#059669', revealAt: 0.46, group: 'skill' },
  { id: 'auth', label: 'JWT Auth', x: 0.76, y: 0.62, r: 20, color: '#059669', revealAt: 0.48, group: 'skill' },


  // Data Systems (Moved to bottom right)
  { id: 'data', label: 'Data Systems', x: 0.72, y: 0.76, r: 30, color: '#f59e0b', revealAt: 0.64, group: 'product' },
  { id: 'playwright', label: 'Playwright', x: 0.84, y: 0.82, r: 22, color: '#d97706', revealAt: 0.68, group: 'skill' },
  { id: 'pandas', label: 'pandas / NumPy', x: 0.70, y: 0.88, r: 24, color: '#d97706', revealAt: 0.70, group: 'skill' },
  { id: 'etl', label: 'ETL Pipelines', x: 0.55, y: 0.80, r: 24, color: '#d97706', revealAt: 0.72, group: 'skill' },
  { id: 'viz', label: 'matplotlib/seaborn', x: 0.62, y: 0.66, r: 22, color: '#d97706', revealAt: 0.74, group: 'skill' },

  // Databases & Infra
  { id: 'db', label: 'Databases', x: 0.32, y: 0.76, r: 30, color: '#eab308', revealAt: 0.76, group: 'product' },
  { id: 'sql', label: 'PostgreSQL/SQL', x: 0.22, y: 0.86, r: 24, color: '#ca8a04', revealAt: 0.80, group: 'skill' },
  { id: 'mongo', label: 'MongoDB', x: 0.34, y: 0.88, r: 22, color: '#ca8a04', revealAt: 0.82, group: 'skill' },
  { id: 'redis', label: 'Redis', x: 0.42, y: 0.78, r: 20, color: '#ca8a04', revealAt: 0.84, group: 'skill' },
  { id: 'supabase', label: 'Supabase', x: 0.20, y: 0.74, r: 22, color: '#ca8a04', revealAt: 0.86, group: 'skill' },

  // DevOps & Cloud
  { id: 'devops', label: 'DevOps / Cloud', x: 0.16, y: 0.58, r: 30, color: '#ef4444', revealAt: 0.88, group: 'product' },
  { id: 'docker', label: 'Docker / k8s', x: 0.06, y: 0.65, r: 24, color: '#dc2626', revealAt: 0.90, group: 'skill' },
  { id: 'aws', label: 'AWS', x: 0.08, y: 0.50, r: 24, color: '#dc2626', revealAt: 0.90, group: 'skill' },
  { id: 'cicd', label: 'CI/CD', x: 0.22, y: 0.66, r: 20, color: '#dc2626', revealAt: 0.92, group: 'skill' },

  // Systems
  { id: 'systems', label: 'Systems', x: 0.14, y: 0.38, r: 28, color: '#ec4899', revealAt: 0.90, group: 'product' },
  { id: 'rust', label: 'Rust', x: 0.06, y: 0.42, r: 22, color: '#db2777', revealAt: 0.92, group: 'skill' },
  { id: 'cpp', label: 'C++', x: 0.08, y: 0.28, r: 20, color: '#db2777', revealAt: 0.92, group: 'skill' },
];

// ── Edges (from → to) ──
const EDGES = [
  // core to main categories
  { from: 'core', to: 'aiml', revealAt: 0.12 },
  { from: 'core', to: 'agents', revealAt: 0.26 },
  { from: 'core', to: 'backend', revealAt: 0.40 },
  { from: 'core', to: 'data', revealAt: 0.66 },
  { from: 'core', to: 'db', revealAt: 0.78 },
  { from: 'core', to: 'devops', revealAt: 0.86 },
  { from: 'core', to: 'systems', revealAt: 0.88 },

  // AI/ML branches
  { from: 'aiml', to: 'pytorch', revealAt: 0.15 },
  { from: 'aiml', to: 'sklearn', revealAt: 0.17 },
  { from: 'aiml', to: 'nlp', revealAt: 0.19 },
  { from: 'aiml', to: 'cv', revealAt: 0.21 },
  { from: 'aiml', to: 'timeseries', revealAt: 0.23 },

  // Agent Systems branches
  { from: 'agents', to: 'langgraph', revealAt: 0.29 },
  { from: 'agents', to: 'langchain', revealAt: 0.31 },
  { from: 'agents', to: 'llmapi', revealAt: 0.33 },
  { from: 'agents', to: 'multiagent', revealAt: 0.35 },

  // Backend branches
  { from: 'backend', to: 'pybackend', revealAt: 0.43 },
  { from: 'backend', to: 'node', revealAt: 0.45 },
  { from: 'backend', to: 'websockets', revealAt: 0.47 },
  { from: 'backend', to: 'auth', revealAt: 0.49 },


  // Data Systems branches
  { from: 'data', to: 'playwright', revealAt: 0.69 },
  { from: 'data', to: 'pandas', revealAt: 0.71 },
  { from: 'data', to: 'etl', revealAt: 0.73 },
  { from: 'data', to: 'viz', revealAt: 0.75 },

  // Databases branches
  { from: 'db', to: 'sql', revealAt: 0.81 },
  { from: 'db', to: 'mongo', revealAt: 0.83 },
  { from: 'db', to: 'redis', revealAt: 0.85 },
  { from: 'db', to: 'supabase', revealAt: 0.87 },

  // DevOps branches
  { from: 'devops', to: 'docker', revealAt: 0.89 },
  { from: 'devops', to: 'aws', revealAt: 0.89 },
  { from: 'devops', to: 'cicd', revealAt: 0.91 },

  // Systems branches
  { from: 'systems', to: 'rust', revealAt: 0.91 },
  { from: 'systems', to: 'cpp', revealAt: 0.91 },

  // Cross-links for a more "networked" feel
  { from: 'aiml', to: 'agents', revealAt: 0.36 }, // AI feeds Agents
  { from: 'agents', to: 'pybackend', revealAt: 0.45 }, // Agents hit Backend
  { from: 'pybackend', to: 'sql', revealAt: 0.78 }, // Backend hits DB
  { from: 'data', to: 'sklearn', revealAt: 0.68 }, // Data feeds ML
  { from: 'data', to: 'sql', revealAt: 0.78 }, // Data uses DB
  { from: 'devops', to: 'pybackend', revealAt: 0.89 }, // DevOps deploys backend
  { from: 'systems', to: 'docker', revealAt: 0.91 },  // Systems run in Docker
];

// ── Data‑flow particles state ──
const MAX_PARTICLES = 40;

function initParticles() {
  return Array.from({ length: MAX_PARTICLES }, () => ({
    edgeIdx: -1,
    t: 0,
    speed: 0,
    alive: false,
    size: 0,
    opacity: 0,
  }));
}

// ── Helpers ──
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function nodeById(id) {
  return NODES.find(n => n.id === id);
}

export default function ScrollGraph({ scrollProgress }) {
  const canvasRef = useRef(null);
  const smoothRef = useRef(0);         // lerped progress for buttery scroll
  const particlesRef = useRef(initParticles());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Pre-render the dot grid onto the offscreen canvas to save 5000+ draw commands per frame
      bgCanvas.width = canvas.width;
      bgCanvas.height = canvas.height;
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgCtx.fillStyle = DOT_COL;
      const gap = DOT_GAP * dpr;
      const size = DOT_SIZE * dpr;
      for (let x = gap / 2; x < bgCanvas.width; x += gap) {
        for (let y = gap / 2; y < bgCanvas.height; y += gap) {
          bgCtx.fillRect(x, y, size, size);
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // ── Animation loop ──
    const draw = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const target = scrollProgress.current;
      smoothRef.current = lerp(smoothRef.current, target, 0.08);
      const p = smoothRef.current;

      // Overall graph opacity — fade in when entering graph section
      const graphAlpha = clamp((p - 0.0) / 0.06, 0, 1);

      ctx.clearRect(0, 0, W, H);

      if (graphAlpha < 0.005) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.save();
      ctx.globalAlpha = graphAlpha;

      // ── Draw pre-rendered dot grid ──
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(bgCanvas, 0, 0);
      ctx.restore();

      // ── Draw edges ──
      const nodeMap = {};
      NODES.forEach(n => {
        nodeMap[n.id] = { x: n.x * W, y: n.y * H };
      });

      EDGES.forEach((edge, ei) => {
        const edgeP = clamp((p - edge.revealAt) / 0.06, 0, 1);
        if (edgeP <= 0) return;

        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return;

        // Animated draw‑on: line reveals from `from` to `to`
        const ex = lerp(from.x, to.x, edgeP);
        const ey = lerp(from.y, to.y, edgeP);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(100,116,139,${0.15 * edgeP})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Maybe spawn a particle
        if (edgeP >= 1 && Math.random() < 0.008) {
          const dead = particlesRef.current.find(pp => !pp.alive);
          if (dead) {
            dead.edgeIdx = ei;
            dead.t = 0;
            dead.speed = 0.004 + Math.random() * 0.006;
            dead.alive = true;
            dead.size = 1.5 + Math.random() * 1.5;
            dead.opacity = 0.4 + Math.random() * 0.4;
          }
        }
      });

      // ── Draw particles ──
      particlesRef.current.forEach(pp => {
        if (!pp.alive) return;
        pp.t += pp.speed;
        if (pp.t > 1) { pp.alive = false; return; }

        const edge = EDGES[pp.edgeIdx];
        if (!edge) { pp.alive = false; return; }
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) { pp.alive = false; return; }

        const px = lerp(from.x, to.x, pp.t);
        const py = lerp(from.y, to.y, pp.t);

        // Fade in/out at ends
        const fadeIn = clamp(pp.t / 0.15, 0, 1);
        const fadeOut = clamp((1 - pp.t) / 0.15, 0, 1);
        const alpha = pp.opacity * fadeIn * fadeOut;

        ctx.beginPath();
        ctx.arc(px, py, pp.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${alpha})`;
        ctx.fill();
      });

      // ── Draw nodes ──
      NODES.forEach(node => {
        const nodeP = clamp((p - node.revealAt) / 0.05, 0, 1);
        if (nodeP <= 0) return;

        const nx = node.x * W;
        const ny = node.y * H;
        const mobileScale = W < 600 ? 0.7 : 1;
        const r = node.r * nodeP * mobileScale;

        // Glow — simple circle with transparency instead of expensive createRadialGradient
        ctx.beginPath();
        ctx.arc(nx, ny, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(node.color, 0.06 * nodeP);
        ctx.fill();

        // Circle bg
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(15,23,42,${0.85 * nodeP})`;
        ctx.fill();

        // Circle border
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(node.color, 0.45 * nodeP);
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Pulse ring on core node
        if (node.id === 'core' && nodeP >= 1) {
          const pulse = (Date.now() % 3000) / 3000;
          const pulseR = r + pulse * 20;
          ctx.beginPath();
          ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(node.color, 0.2 * (1 - pulse));
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Label — scale fonts for mobile
        const isMobile = W < 600;
        ctx.fillStyle = `rgba(226,232,240,${0.9 * nodeP})`;
        ctx.font = node.group === 'hub'
          ? `bold ${isMobile ? 10 : 14}px Inter, system-ui, sans-serif`
          : node.group === 'product'
            ? `500 ${isMobile ? 9 : 12}px Inter, system-ui, sans-serif`
            : `400 ${isMobile ? 8 : 11}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, nx, ny);
      });


      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="graphCanvas" />;
}

// ── Colour utility ──
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
