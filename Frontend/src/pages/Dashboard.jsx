import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { codeAPI } from '../utils/api';
import { formatProfessionalDateTime } from '../utils/formatDate';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [statsData, setStatsData] = useState({ solvedCount: 0, acceptanceRate: 0, currentStreak: 0, totalSubmissions: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // Fetch Submissions
        try {
            const submissionsData = await codeAPI.getSubmissions();
            setSubmissions(submissionsData);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }

        // Fetch Stats
        try {
            const userStats = await codeAPI.getStats();
            setStatsData(userStats);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }

        setLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const totalSubmissions = submissions.length > 0 ? submissions[0].total : 0;

    const stats = [
        { label: 'Problems Solved', value: statsData.solvedCount, icon: 'check_circle', color: '#10b981' },
        { label: 'Total Submissions', value: statsData.totalSubmissions, icon: 'code', color: '#137fec' },
        { label: 'Acceptance Rate', value: `${statsData.acceptanceRate}%`, icon: 'trending_up', color: '#14b8a6' },
        { label: 'Current Streak', value: statsData.currentStreak, icon: 'local_fire_department', color: '#f59e0b' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
            {/* Navigation */}
            <header style={{
                background: '#161b22',
                borderBottom: '1px solid #30363d',
                position: 'sticky',
                top: 0,
                zIndex: 50
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <span className="material-symbols-outlined" style={{ color: '#137fec', fontSize: '28px' }}>
                            terminal
                        </span>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>CodePulse</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => navigate('/code')}
                            style={{
                                background: '#137fec',
                                border: 'none',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>code</span>
                            Code Editor
                        </button>

                        <button
                            onClick={() => navigate('/profile')}
                            style={{
                                background: 'transparent',
                                border: '1px solid #30363d',
                                color: '#cbd5e1',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                            Profile
                        </button>

                        {user?.role === 'ADMIN' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => navigate('/admin/problems')}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        border: 'none',
                                        color: 'white',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_box</span>
                                    Create Problem
                                </button>
                                <button
                                    onClick={() => navigate('/admin/users')}
                                    style={{
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        border: 'none',
                                        color: 'white',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                                    Users
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'transparent',
                                border: '1px solid #30363d',
                                color: '#cbd5e1',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
                {/* Welcome Section */}
                <div style={{ marginBottom: '48px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
                        Welcome back, {user?.full_name}! 👋
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                        Ready to solve some problems? Track your progress and improve your coding skills.
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '24px',
                    marginBottom: '48px'
                }}>
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            style={{
                                background: '#161b22',
                                border: '1px solid #30363d',
                                borderRadius: '12px',
                                padding: '24px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = stat.color;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#30363d';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    background: `${stat.color}1a`,
                                    padding: '10px',
                                    borderRadius: '8px'
                                }}>
                                    <span className="material-symbols-outlined" style={{ color: stat.color, fontSize: '24px' }}>
                                        {stat.icon}
                                    </span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '28px', fontWeight: 900, color: 'white' }}>{stat.value}</div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '24px' }}>
                        Quick Actions
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
                        <div
                            onClick={() => navigate('/code')}
                            style={{
                                background: 'linear-gradient(135deg, #137fec, #6366f1)',
                                borderRadius: '12px',
                                padding: '32px',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'white', marginBottom: '16px' }}>
                                code
                            </span>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                                Start Coding
                            </h3>
                            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                Open the code editor and start solving problems in Python, C++, Java, or JavaScript.
                            </p>
                        </div>

                        <div
                            onClick={() => navigate('/problems')}
                            style={{
                                background: '#161b22',
                                border: '1px solid #30363d',
                                borderRadius: '12px',
                                padding: '32px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#10b981';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#30363d';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#10b981', marginBottom: '16px' }}>
                                lightbulb
                            </span>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                                Browse Problems
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                Explore curated problem sets ranging from easy to hard difficulty levels.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '24px' }}>
                        Recent Submissions
                    </h2>
                    <div style={{
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}>
                        {loading ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto', marginBottom: '16px' }}></div>
                                <p style={{ color: '#94a3b8' }}>Loading submissions...</p>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#30363d', marginBottom: '16px' }}>
                                    history
                                </span>
                                <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                                    No submissions yet. Start coding to see your submission history here!
                                </p>
                                <button
                                    onClick={() => navigate('/code')}
                                    style={{
                                        marginTop: '24px',
                                        background: '#137fec',
                                        border: 'none',
                                        color: 'white',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 700
                                    }}
                                >
                                    Submit Your First Code
                                </button>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                                    <thead>
                                        <tr style={{ background: '#1c2128' }}>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#8b949e', fontSize: '13px', fontWeight: 600 }}>Problem</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#8b949e', fontSize: '13px', fontWeight: 600 }}>Status</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#8b949e', fontSize: '13px', fontWeight: 600 }}>Language</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#8b949e', fontSize: '13px', fontWeight: 600 }}>Time</th>
                                            <th style={{ padding: '16px 24px', textAlign: 'right', color: '#8b949e', fontSize: '13px', fontWeight: 600 }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map((submission, index) => (
                                            <tr key={index} style={{
                                                borderBottom: '1px solid #30363d',
                                                transition: 'background 0.2s ease',
                                                ':hover': { background: '#21262d' }
                                            }}
                                                className="submission-row">
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ fontWeight: 700, color: 'white', marginBottom: '4px' }}>{submission.title}</div>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        color: submission.difficulty === 'EASY' ? '#00b8a3' : submission.difficulty === 'MEDIUM' ? '#ffb800' : '#ff375f',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <span style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            borderRadius: '50%',
                                                            background: 'currentColor'
                                                        }}></span>
                                                        {submission.difficulty}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{
                                                        color: submission.status === 'ACCEPTED' ? '#10b981' : '#ef4444',
                                                        fontSize: '14px',
                                                        fontWeight: 700,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                                            {submission.status === 'ACCEPTED' ? 'check_circle' : 'error'}
                                                        </span>
                                                        {submission.status}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <span style={{
                                                        background: '#161b22',
                                                        border: '1px solid #30363d',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        color: '#c9d1d9',
                                                        fontWeight: 500
                                                    }}>
                                                        {submission.language}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 24px', color: '#8b949e', fontSize: '13px' }}>
                                                    {formatProfessionalDateTime(submission.submitted_at)}
                                                </td>
                                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => setSelectedCode(submission.code)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid #30363d',
                                                            color: '#c9d1d9',
                                                            padding: '6px 14px',
                                                            borderRadius: '6px',
                                                            fontSize: '13px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#30363d';
                                                            e.currentTarget.style.color = 'white';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.color = '#c9d1d9';
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                                                        View Code
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Code Modal */}
                {selectedCode && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '24px'
                        }}
                        onClick={() => setSelectedCode(null)}
                    >
                        <div
                            style={{
                                background: '#161b22',
                                border: '1px solid #30363d',
                                borderRadius: '12px',
                                maxWidth: '800px',
                                width: '100%',
                                maxHeight: '80vh',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid #30363d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: 0 }}>Submitted Code</h3>
                                <button
                                    onClick={() => setSelectedCode(null)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
                                </button>
                            </div>
                            <div style={{
                                padding: '24px',
                                overflowY: 'auto',
                                flex: 1
                            }}>
                                <pre style={{
                                    background: '#0d1117',
                                    border: '1px solid #30363d',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    color: '#e2e8f0',
                                    fontSize: '13px',
                                    fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                                    lineHeight: '1.6',
                                    margin: 0,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {selectedCode}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
