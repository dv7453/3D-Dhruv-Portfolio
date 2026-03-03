import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import projectsData from '../dv7453_portfolio_data.json';

const FEATURED = ['OrchestrAI', 'SpeechEval-AI', 'LLM-Data-Pipeline'];

// Build unique category tags from all projects
const ALL_CATEGORIES = [
    { label: 'All', value: 'all' },
    { label: 'AI / ML', value: 'ai', match: ['LLM', 'Groq', 'LangChain', 'Langchain', 'Transformers', 'Large Language Models', 'Whisper', 'BERT', 'Word2Vec', 'FastText', 'CNN', 'Convolutional Neural Network (CNN)'] },
    { label: 'Deep Learning', value: 'dl', match: ['TensorFlow', 'PyTorch', 'Keras', 'CNN', 'Convolutional Neural Network (CNN)', 'SentencePiece'] },
    { label: 'Backend', value: 'backend', match: ['FastAPI', 'Flask', 'Node.js', 'Uvicorn', 'MongoDB', 'PostgreSQL', 'Docker'] },
    { label: 'Frontend', value: 'frontend', match: ['React', 'React.js', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn-ui', 'Radix UI', 'three.js'] },
    { label: 'Data', value: 'data', match: ['pandas', 'Pandas', 'numpy', 'NumPy', 'Jupyter Notebook', 'scikit-learn', 'Scikit-learn', 'Graphviz'] },
    { label: 'Rust', value: 'rust', match: ['Rust', 'Cargo'] },
];

const CATEGORY_COLORS = {
    all: '#94a3b8',
    ai: '#7c3aed',
    dl: '#f59e0b',
    backend: '#06b6d4',
    frontend: '#ec4899',
    data: '#10b981',
    rust: '#f97316',
};

export default function ProjectsPage({ onBack }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [animKey, setAnimKey] = useState(0);
    const gridRef = useRef();

    const filteredProjects = useMemo(() => {
        let results = projectsData;

        if (activeFilter !== 'all') {
            const cat = ALL_CATEGORIES.find(c => c.value === activeFilter);
            if (cat && cat.match) {
                results = results.filter(p =>
                    p.tech_stack.some(t => cat.match.includes(t))
                );
            }
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            results = results.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.tech_stack.some(t => t.toLowerCase().includes(q))
            );
        }

        return results;
    }, [activeFilter, search]);

    // Trigger re-animation on filter change
    const handleFilter = (value) => {
        if (value === activeFilter) return;
        // Fade out existing cards
        if (gridRef.current) {
            gridRef.current.classList.add('pp-grid--exit');
        }
        setTimeout(() => {
            setActiveFilter(value);
            setAnimKey(k => k + 1);
            if (gridRef.current) {
                gridRef.current.classList.remove('pp-grid--exit');
            }
        }, 200);
    };

    return (
        <div className="pp-page">
            <div className="pp-grid-bg" />

            {/* Header */}
            <header className="pp-header">
                <button className="pp-back" onClick={onBack}>
                    <span>←</span> Back
                </button>
                <div className="pp-header-text">
                    <h1 className="pp-title">Projects</h1>
                    <p className="pp-subtitle">
                        {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} built — from AI agents to Rust CLIs
                    </p>
                </div>
            </header>

            {/* Search + Sticky filter pills */}
            <div className="pp-filters-sticky">
                <div className="pp-search-row">
                    <input
                        type="text"
                        className="pp-search"
                        placeholder="Search projects or tech..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="pp-filters">
                    {ALL_CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            className={`pp-pill ${activeFilter === cat.value ? 'pp-pill--active' : ''}`}
                            style={{ '--pill-color': CATEGORY_COLORS[cat.value] }}
                            onClick={() => handleFilter(cat.value)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project cards grid */}
            <div className="pp-grid" ref={gridRef} key={animKey}>
                {filteredProjects.map((project, i) => {
                    const isFeatured = FEATURED.includes(project.name);
                    return (
                        <a
                            key={project.name}
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`pp-card ${isFeatured ? 'pp-card--featured' : ''}`}
                            style={{ animationDelay: `${i * 0.04}s` }}
                        >
                            {isFeatured && <span className="pp-featured-badge">★ Featured</span>}
                            <div className="pp-card-top">
                                <h2 className="pp-card-name">{project.name}</h2>
                                <span className="pp-card-arrow">↗</span>
                            </div>
                            <p className="pp-card-summary">{project.summary}</p>
                            <div className="pp-card-stack">
                                {project.tech_stack.map(t => (
                                    <span key={t} className="pp-stack-tag">{t}</span>
                                ))}
                            </div>
                        </a>
                    );
                })}
            </div>

            {/* Empty state */}
            {filteredProjects.length === 0 && (
                <div className="pp-empty">
                    <p>No projects match this filter.</p>
                    <button className="pp-pill pp-pill--active" onClick={() => handleFilter('all')}>
                        Show All
                    </button>
                </div>
            )}
        </div>
    );
}
