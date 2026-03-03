import React, { useState, useRef, useEffect } from 'react';
import personalityData from '../personality.json';
import projectsData from '../dv7453_portfolio_data.json';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Build context from personality data
const personalInfo = personalityData[0]; // First item is the personal info object
const projectsList = projectsData.map(p => `• ${p.name}: ${p.summary.slice(0, 120)}... [${p.tech_stack.slice(0, 4).join(', ')}]`).join('\n');

const SYSTEM_PROMPT = `You are DhruvBot — a friendly, casual AI assistant on Dhruv Vadhiya's portfolio website. Visitors will ask about Dhruv using short, casual messages. Your job is to interpret ANY keyword or short phrase as a question about Dhruv and answer helpfully.

RULES:
1. Interpret short inputs generously. "hobbies" means "what are Dhruv's hobbies?". "backend" means "what backend projects has Dhruv done?". "skills" means "what are Dhruv's skills?". Always assume the visitor is asking about Dhruv.
2. Keep responses concise (2-4 sentences). Be friendly, casual, and professional.
3. Only deflect questions that are COMPLETELY unrelated to Dhruv — like asking about politics, weather, math problems, coding help for their own projects, etc. For those, say something like: "I only know about Dhruv! Try asking about his projects, skills, or experience 😊"
4. Never make up information. Only use what's provided below.
5. Use "Dhruv" when referring to him (you're his assistant, not him).

DHRUV'S PROFILE:
- Name: ${personalInfo.name}
- Email: ${personalInfo.contact.email}
- LinkedIn: ${personalInfo.contact.linkedin}
- GitHub: ${personalInfo.contact.github}
- Education: ${personalInfo.education.degree} at ${personalInfo.education.institution}
- Summary: ${personalInfo.portfolio_summary}

PERSONALITY & THINKING:
- Dhruv builds multi-agent systems because he enjoys seeing intelligence coordinate — multiple agents planning, reasoning, validating, and executing tasks in real workflows.
- He prefers backend-heavy AI infrastructure. Models alone don't create value — pipelines, orchestration, reliability, retries, logging, structured outputs are where real products are built.
- He cares about AI adoption in India — sees massive potential in making AI practical and usable at scale.
- Problems that excite him: leverage problems where knowledge, automation, or intelligence multiply output. Code and AI systems generating wealth from skill and execution.
- He likes working with people who show up, try hard, and stay consistent. Skill can be learned, but lack of intent slows everything down.
- Outside coding: plays basketball regularly (competitive energy, team coordination), plays guitar for peace. Highly extroverted, enjoys meeting new people, traveling, deep conversations.
- Wants to grow into a tech leader who lifts his team — not someone who climbs alone.
- Work philosophy: Ship fast but not recklessly. Systems should be observable, debuggable, maintainable. Most AI projects fail because of weak system design, not because the model wasn't powerful enough.
- Why work with Dhruv: thinks creatively, looks for innovative angles, cares about cost efficiency, comfortable sitting 10 hours debugging until something works. An extrovert who can code, communicate, and build.

EXPERIENCE:
${personalInfo.experience.map(e => `• ${e.role} at ${e.company} (${e.duration}) — ${e.responsibilities[0]}`).join('\n')}

TECHNICAL SKILLS:
- Programming: ${personalInfo.technical_skills.programming.join(', ')}
- ML/Analytics: ${personalInfo.technical_skills.ml_analytics.join(', ')}
- Web Tools: ${personalInfo.technical_skills.web_tools.join(', ')}

CERTIFICATIONS: ${personalInfo.certifications.join(', ')}
ACHIEVEMENTS: ${personalInfo.achievements.join(', ')}

KEY PROJECTS:
${projectsList}
`;

const SUGGESTED_QUESTIONS = [
    "What does Dhruv specialize in?",
    "Tell me about his projects",
    "What's his work experience?",
    "What tech stack does he use?",
];

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hey! 👋 I'm DhruvBot. Ask me anything about Dhruv's skills, projects, or experience!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async (text) => {
        const userMsg = text || input.trim();
        if (!userMsg || loading) return;

        setInput('');
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...newMessages.map(m => ({ role: m.role, content: m.content })),
                    ],
                    temperature: 0.6,
                    max_tokens: 256,
                }),
            });

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Try again!";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Oops, something went wrong. Please try again!" }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating trigger button */}
            <button
                className={`cb-trigger ${isOpen ? 'cb-trigger--open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Chat with DhruvBot"
            >
                {isOpen ? '✕' : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
                        <circle cx="9.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
                        <circle cx="14.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
                        <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
                        <line x1="12" y1="2" x2="12" y2="0" />
                        <circle cx="12" cy="0" r="1" fill="currentColor" stroke="none" />
                    </svg>
                )}
            </button>

            {/* Chat panel */}
            <div className={`cb-panel ${isOpen ? 'cb-panel--open' : ''}`}>
                {/* Header */}
                <div className="cb-header">
                    <div className="cb-header-dot" />
                    <div>
                        <h3 className="cb-header-title">DhruvBot</h3>
                        <p className="cb-header-sub">Ask about skills, projects & experience</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="cb-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`cb-msg cb-msg--${msg.role}`}>
                            <p>{msg.content}</p>
                        </div>
                    ))}
                    {loading && (
                        <div className="cb-msg cb-msg--assistant">
                            <div className="cb-typing">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested questions (show only at start) */}
                {messages.length <= 1 && (
                    <div className="cb-suggestions">
                        {SUGGESTED_QUESTIONS.map((q, i) => (
                            <button key={i} className="cb-suggestion" onClick={() => sendMessage(q)}>
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="cb-input-row">
                    <input
                        ref={inputRef}
                        className="cb-input"
                        type="text"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />
                    <button
                        className="cb-send"
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                    >
                        ↑
                    </button>
                </div>
            </div>
        </>
    );
}
