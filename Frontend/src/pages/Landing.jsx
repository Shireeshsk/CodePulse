import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
            {/* NAVBAR */}
            <header style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 50,
                background: 'rgba(10, 10, 10, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 24px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-outlined" style={{ color: '#137fec', fontSize: '28px' }}>
                            terminal
                        </span>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>CodePulse</h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {user ? (
                            <>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#cbd5e1',
                                        fontSize: '14px',
                                        fontWeight: 500
                                    }}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate('/code')}
                                    style={{
                                        background: '#137fec',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        padding: '8px 20px',
                                        borderRadius: '8px'
                                    }}
                                >
                                    Code Editor
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#cbd5e1',
                                        fontSize: '14px',
                                        fontWeight: 500
                                    }}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    style={{
                                        background: '#137fec',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        padding: '8px 20px',
                                        borderRadius: '8px'
                                    }}
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main style={{ paddingTop: '64px' }}>
                {/* HERO */}
                <section style={{
                    position: 'relative',
                    minHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: 'radial-gradient(circle at 50% 50%, rgba(19, 127, 236, 0.15) 0%, rgba(10, 10, 10, 0) 70%)'
                }}>
                    <div style={{
                        maxWidth: '896px',
                        width: '100%',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '32px'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            background: 'rgba(19, 127, 236, 0.1)',
                            border: '1px solid rgba(19, 127, 236, 0.2)',
                            color: '#137fec',
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
                                <span style={{
                                    position: 'absolute',
                                    display: 'inline-flex',
                                    height: '100%',
                                    width: '100%',
                                    borderRadius: '50%',
                                    background: '#137fec',
                                    opacity: 0.75,
                                    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                                }} />
                                <span style={{
                                    position: 'relative',
                                    display: 'inline-flex',
                                    borderRadius: '50%',
                                    height: '8px',
                                    width: '8px',
                                    background: '#137fec'
                                }} />
                            </span>
                            Real-time Code Execution
                        </div>

                        <h1 style={{
                            fontSize: window.innerWidth < 768 ? '48px' : '72px',
                            fontWeight: 900,
                            color: 'white',
                            lineHeight: '1.1',
                            letterSpacing: '-0.02em'
                        }}>
                            Master the Art of{' '}
                            <span style={{
                                background: 'linear-gradient(to right, #137fec, #14b8a6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Coding
                            </span>
                        </h1>

                        <p style={{
                            fontSize: window.innerWidth < 768 ? '18px' : '20px',
                            color: '#94a3b8',
                            maxWidth: '672px',
                            fontWeight: 300
                        }}>
                            The ultimate platform for real-time code execution, competitive challenges, and performance tracking. Built for the modern engineer.
                        </p>

                        <div style={{
                            display: 'flex',
                            flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                            gap: '16px'
                        }}>
                            <button
                                onClick={handleGetStarted}
                                style={{
                                    background: '#137fec',
                                    color: 'white',
                                    fontWeight: 700,
                                    padding: '16px 32px',
                                    borderRadius: '12px',
                                    fontSize: '18px',
                                    border: 'none',
                                    boxShadow: '0 10px 25px rgba(19, 127, 236, 0.2)'
                                }}
                            >
                                Get Started for Free
                            </button>
                            <button
                                onClick={() => navigate('/code')}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    fontWeight: 700,
                                    padding: '16px 32px',
                                    borderRadius: '12px',
                                    fontSize: '18px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(4px)'
                                }}
                            >
                                Try Code Editor
                            </button>
                        </div>
                    </div>

                    {/* TERMINAL MOCK */}
                    <div style={{ marginTop: '64px', width: '100%', maxWidth: '1024px', padding: '0 16px' }}>
                        <div style={{
                            position: 'relative',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: '#0d1117',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: '#161b22',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.8)' }} />
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.8)' }} />
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.8)' }} />
                                </div>
                                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', fontWeight: 700 }}>
                                    main.py — CodePulse IDE
                                </div>
                                <div style={{ width: '32px' }} />
                            </div>

                            <div style={{ padding: '24px', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.7' }}>
                                {[
                                    ['1', 'import', 'codepulse'],
                                    ['2', ''],
                                    ['3', 'def', 'optimize_algorithm(data):'],
                                    ['4', '    # Process streaming execution'],
                                    ['5', '    result = codepulse.run(data, language=\'python\')'],
                                    ['6', '    return result.metrics'],
                                ].map(([line, ...code], i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                        <span style={{ color: '#64748b', userSelect: 'none' }}>{line}</span>
                                        <span style={{ color: 'white' }}>{code.join(' ')}</span>
                                    </div>
                                ))}

                                <div style={{
                                    marginTop: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    background: 'rgba(19, 127, 236, 0.05)',
                                    border: '1px solid rgba(19, 127, 236, 0.2)',
                                    borderRadius: '8px'
                                }}>
                                    <span className="material-symbols-outlined" style={{ color: '#137fec', fontSize: '14px' }}>
                                        check_circle
                                    </span>
                                    <span style={{ color: '#137fec', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Execution Successful: 12ms | 24MB
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section style={{ padding: '96px 24px', maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                            Engineered for Excellence
                        </h2>
                        <p style={{ color: '#94a3b8', maxWidth: '672px' }}>
                            Experience the most fluid coding environment ever built with professional grade tools and real-time metrics.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                        gap: '24px'
                    }}>
                        {[
                            {
                                icon: 'bolt',
                                title: 'Real-time Execution',
                                description: 'Execute code in 4+ languages instantly with our low-latency engine. No local setup required.',
                                color: '#137fec'
                            },
                            {
                                icon: 'trophy',
                                title: 'Track Progress',
                                description: 'Monitor your coding journey with detailed analytics and submission history.',
                                color: '#14b8a6'
                            },
                            {
                                icon: 'code',
                                title: 'Monaco Editor',
                                description: 'Professional VS Code-powered editor with syntax highlighting and IntelliSense.',
                                color: '#6366f1'
                            },
                            {
                                icon: 'security',
                                title: 'Secure & Isolated',
                                description: 'Code runs in completely isolated Docker containers with resource limits.',
                                color: '#ec4899'
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                style={{
                                    background: '#161b22',
                                    padding: '32px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(59, 71, 84, 0.5)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = feature.color;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(59, 71, 84, 0.5)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    background: `${feature.color}1a`,
                                    color: feature.color,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    width: 'fit-content',
                                    marginBottom: '24px'
                                }}>
                                    <span className="material-symbols-outlined">{feature.icon}</span>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: '#94a3b8' }}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section style={{ padding: '96px 24px' }}>
                    <div style={{
                        maxWidth: '1024px',
                        margin: '0 auto',
                        background: 'linear-gradient(to bottom right, #137fec, #6366f1)',
                        borderRadius: '24px',
                        padding: '48px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <h2 style={{
                                fontSize: window.innerWidth < 768 ? '32px' : '48px',
                                fontWeight: 900,
                                color: 'white',
                                marginBottom: '16px'
                            }}>
                                Ready to elevate your skills?
                            </h2>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '18px', maxWidth: '672px', margin: '0 auto 32px' }}>
                                Join thousands of developers and start solving complex challenges today. Build your profile and get noticed by top companies.
                            </p>
                            <button
                                onClick={handleGetStarted}
                                style={{
                                    background: 'white',
                                    color: '#137fec',
                                    fontWeight: 700,
                                    padding: '16px 32px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                                    fontSize: '16px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Create Free Account
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer style={{
                background: '#161b22',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '64px 24px 48px'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(4, 1fr)',
                        gap: '48px',
                        marginBottom: '48px'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#137fec', fontSize: '24px' }}>
                                    terminal
                                </span>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>CodePulse</h2>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                                Building the future of competitive programming. Real-time, distributed, and accessible to everyone.
                            </p>
                        </div>

                        {[
                            { title: 'Platform', links: ['Problems', 'Contests', 'Learning', 'Docs'] },
                            { title: 'Community', links: ['Leaderboard', 'Discussions', 'Events', 'Blog'] },
                            { title: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
                        ].map((section, i) => (
                            <div key={i}>
                                <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '24px' }}>{section.title}</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {section.links.map((link, j) => (
                                        <li key={j} style={{ marginBottom: '16px' }}>
                                            <a href="#" style={{ color: '#94a3b8', fontSize: '14px', textDecoration: 'none' }}>
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        paddingTop: '32px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '12px',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 700
                    }}>
                        <div>© 2026 CODEPULSE TECHNOLOGIES INC.</div>
                        <div>BUILT BY DEVELOPERS FOR DEVELOPERS</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
