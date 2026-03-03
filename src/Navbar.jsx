import React, { useState, useEffect } from 'react';

const NAV_LINKS = [
    { label: 'Home', scrollVh: 0 },
    { label: 'Experience', scrollVh: 150 },
    { label: 'Stack', scrollVh: 550 },
];

const EXTRA_LINKS = [
    { label: 'Projects', scrollVh: 680 },
];

// Inline SVG icons for GitHub and LinkedIn
const GitHubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
);

const LinkedInIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

export default function Navbar({ scrollProgress, graphProgress, onProjectsClick }) {
    const scrollToSection = (vh) => {
        const px = (vh / 100) * window.innerHeight;
        window.scrollTo({ top: px, behavior: 'smooth' });
    };

    return (
        <nav className="glass-nav">
            <div className="glass-nav-inner">
                {/* Nav links */}
                <ul className="glass-nav-links">
                    {NAV_LINKS.map(link => (
                        <li key={link.label}>
                            <button
                                className="glass-nav-link"
                                onClick={() => scrollToSection(link.scrollVh)}
                            >
                                {link.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Divider */}
                <span className="glass-nav-divider" />

                {/* Projects link */}
                <ul className="glass-nav-links">
                    {EXTRA_LINKS.map(link => (
                        <li key={link.label}>
                            <button
                                className="glass-nav-link"
                                onClick={onProjectsClick}
                            >
                                {link.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Divider */}
                <span className="glass-nav-divider" />

                {/* Social icons */}
                <div className="glass-nav-socials">
                    <a
                        href="https://github.com/dv7453"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-nav-icon"
                        aria-label="GitHub"
                    >
                        <GitHubIcon />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/dhruv-vadhiya/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-nav-icon"
                        aria-label="LinkedIn"
                    >
                        <LinkedInIcon />
                    </a>
                </div>
            </div>
        </nav>
    );
}
