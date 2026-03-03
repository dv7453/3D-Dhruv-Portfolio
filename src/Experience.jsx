import React, { useEffect, useRef } from 'react';

const EXPERIENCES = [
    {
        company: 'Aliste Technologies',
        role: 'Project Intern — IoT Systems',
        desc: 'Developed Bluetooth-enabled IoT systems using NodeMCU ESP32. Built firmware-level code integration and device communication pipelines.',
        time: 'Jun 2023 — Sep 2023',
        location: 'Ahmedabad, India · On-site',
        color: '#ec4899',
    },
    {
        company: 'Teksun Microsys',
        role: 'AI & ML Summer Intern',
        desc: 'Built secure ML inference workflows integrating MQTT-based IoT communication. Focused on audio feature extraction and real-time deployment on constrained hardware.',
        time: 'Jun 2024 — Jul 2024',
        location: 'Ahmedabad, India · On-site',
        color: '#f59e0b',
    },
    {
        company: 'LanguageLoop Technologies',
        role: 'AI Research Intern',
        desc: 'Worked on embedding-based analytics and app-level optimization. Conducted feasibility studies for LLM and RAG integration into legacy architectures.',
        time: 'Jul 2024 — Oct 2024',
        location: 'Mumbai, India · Remote',
        color: '#06b6d4',
    },
    {
        company: 'Quanticore AI',
        role: 'Founder & AI/ML Consultant',
        desc: 'Founded and scaled an AI consultancy delivering 7+ full-stack and analytics systems. Built NLQ systems, automated reporting pipelines, and custom data infrastructures.',
        time: 'Feb 2024 — Present',
        location: 'Remote, India',
        color: '#7c3aed',
    },
];

// Alternating: down, up, down, up
const DIRECTIONS = ['down', 'up', 'down', 'up'];

export default function Experience({ scrollProgress }) {
    const sectionRef = useRef();
    const cardsRef = useRef([]);

    useEffect(() => {
        const onScroll = () => {
            const p = scrollProgress.current;
            if (!sectionRef.current) return;

            let opacity;
            if (p <= 0) opacity = 0;
            else if (p < 0.15) opacity = p / 0.15;
            else if (p < 0.75) opacity = 1;
            else if (p < 1.0) opacity = 1 - (p - 0.75) / 0.25;
            else opacity = 0;

            sectionRef.current.style.opacity = opacity;
            sectionRef.current.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';

            // Stagger card entrances
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                const cardStart = 0.05 + i * 0.06;
                const cardP = Math.max(0, Math.min(1, (p - cardStart) / 0.1));
                card.style.opacity = cardP;
                card.style.transform =
                    DIRECTIONS[i] === 'down'
                        ? `translateX(-50%) translateY(${(1 - cardP) * 20}px)`
                        : `translateX(-50%) translateY(${(1 - cardP) * -20}px)`;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [scrollProgress]);

    return (
        <div ref={sectionRef} className="exp-section" style={{ opacity: 0 }}>

            <div className="exp-timeline">
                {/* Main horizontal line */}
                <div className="exp-line">
                    <div className="exp-pulse" />
                </div>

                {/* Four nodes with branches and always-visible cards */}
                {EXPERIENCES.map((exp, i) => (
                    <div
                        key={i}
                        className={`exp-node-container exp-node-container--${DIRECTIONS[i]}`}
                        style={{ '--accent': exp.color }}
                    >
                        <div className={`exp-branch exp-branch--${DIRECTIONS[i]}`} />

                        <div className="exp-orb">
                            <span className="exp-orb-core" />
                            <span className="exp-orb-ring" />
                        </div>

                        <div
                            className={`exp-card exp-card--${DIRECTIONS[i]}`}
                            ref={el => (cardsRef.current[i] = el)}
                            style={{ opacity: 0 }}
                        >
                            <div className="exp-card-accent" />
                            <h3 className="exp-card-company">{exp.company}</h3>
                            <p className="exp-card-role">{exp.role}</p>
                            <p className="exp-card-desc">{exp.desc}</p>
                            <div className="exp-card-meta">
                                <span className="exp-card-time">{exp.time}</span>
                                <span className="exp-card-location">{exp.location}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
