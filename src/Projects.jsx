import React, { useEffect, useRef } from 'react';

const FEATURED = [
    {
        name: 'OrchestrAI',
        url: 'https://github.com/dv7453/OrchestrAI',
        brief: 'Multi-agent browser automation powered by LangGraph and Computer Vision.',
        tags: ['Python', 'Playwright', 'FastAPI', 'LangGraph', 'Groq LLM'],
        accent: '#7c3aed',
    },
    {
        name: 'SpeechEval-AI',
        url: 'https://github.com/dv7453/SpeechEval-AI',
        brief: 'EdTech platform evaluating speech with a hybrid Whisper + LLM architecture.',
        tags: ['Python', 'TypeScript', 'Whisper', 'LLM', 'Docker'],
        accent: '#06b6d4',
    },
    {
        name: 'LLM-Data-Pipeline',
        url: 'https://github.com/dv7453/LLM-Data-Pipeline',
        brief: 'Web data extraction pipeline that outputs clean, LLM-ready structured JSON.',
        tags: ['Python', 'Playwright', 'pandas', 'HTTP'],
        accent: '#f59e0b',
    },
];

export default function Projects({ scrollProgress }) {
    const sectionRef = useRef();
    const cardsRef = useRef([]);

    useEffect(() => {
        const onScroll = () => {
            const p = scrollProgress.current; // 0 = entering projects, 1 = leaving projects
            if (!sectionRef.current) return;

            // Fade in during 0→0.2, fully visible 0.2→0.8, fade out during 0.8→1.0
            let opacity;
            if (p <= 0) opacity = 0;
            else if (p < 0.15) opacity = p / 0.15;
            else if (p < 0.75) opacity = 1;
            else if (p < 1.0) opacity = 1 - (p - 0.75) / 0.25;
            else opacity = 0;

            sectionRef.current.style.opacity = opacity;
            sectionRef.current.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';

            // Stagger each card entrance
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                const cardStart = 0.05 + i * 0.08;
                const cardP = Math.max(0, Math.min(1, (p - cardStart) / 0.12));
                card.style.opacity = cardP;
                card.style.transform = `translateY(${(1 - cardP) * 30}px)`;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [scrollProgress]);

    return (
        <div ref={sectionRef} className="projects-section" style={{ opacity: 0 }}>
            <h2 className="projects-heading">Featured Work</h2>

            <div className="projects-row">
                {FEATURED.map((proj, i) => (
                    <div
                        key={proj.name}
                        className="project-card"
                        ref={el => (cardsRef.current[i] = el)}
                        style={{ '--accent': proj.accent, opacity: 0 }}
                    >
                        <div className="project-card-top-accent" />
                        <h3 className="project-card-name">{proj.name}</h3>
                        <p className="project-card-brief">{proj.brief}</p>

                        <div className="project-card-tags">
                            {proj.tags.map(tag => (
                                <span key={tag} className="project-tag">{tag}</span>
                            ))}
                        </div>

                        <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-github-btn"
                        >
                            View on GitHub <span className="project-btn-arrow">→</span>
                        </a>
                    </div>
                ))}
            </div>

            <a href="/projects" className="projects-view-all">
                Explore All Projects <span className="projects-view-all-arrow">→</span>
            </a>
        </div>
    );
}
