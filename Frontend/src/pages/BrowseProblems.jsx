import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function BrowseProblems() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, easy, medium, hard

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const response = await api.get('/problem/get-problems');
            setProblems(response.data || []);
        } catch (error) {
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return '#10b981';
            case 'medium':
                return '#f59e0b';
            case 'hard':
                return '#ef4444';
            default:
                return '#94a3b8';
        }
    };

    const filteredProblems = problems.filter(problem => {
        if (filter === 'all') return true;
        return problem.difficulty?.toLowerCase() === filter;
    });

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
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'transparent',
                                border: '1px solid #30363d',
                                color: '#cbd5e1',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dashboard</span>
                            Dashboard
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
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                            Profile
                        </button>

                        {user?.role === 'ADMIN' && (
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
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shield</span>
                                Admin Panel
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'transparent',
                                border: '1px solid #30363d',
                                color: '#cbd5e1',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
                        Browse Problems
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                        Choose a problem and start coding. Practice makes perfect! 🚀
                    </p>
                </div>

                {/* Filter Buttons */}
                <div style={{ marginBottom: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['all', 'easy', 'medium', 'hard'].map((level) => (
                        <button
                            key={level}
                            onClick={() => setFilter(level)}
                            style={{
                                background: filter === level ? '#137fec' : '#161b22',
                                border: filter === level ? 'none' : '1px solid #30363d',
                                color: filter === level ? 'white' : '#94a3b8',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (filter !== level) {
                                    e.currentTarget.style.borderColor = '#137fec';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (filter !== level) {
                                    e.currentTarget.style.borderColor = '#30363d';
                                }
                            }}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                {/* Problems List */}
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto', marginBottom: '16px' }}></div>
                        <p style={{ color: '#94a3b8' }}>Loading problems...</p>
                    </div>
                ) : filteredProblems.length === 0 ? (
                    <div style={{
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '12px',
                        padding: '60px',
                        textAlign: 'center'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#30363d', marginBottom: '16px' }}>
                            search_off
                        </span>
                        <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                            No problems found for this difficulty level.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #30363d', background: '#0d1117' }}>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Title
                                        </th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Difficulty
                                        </th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Languages
                                        </th>
                                        <th style={{ padding: '16px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProblems.map((problem, index) => (
                                        <tr
                                            key={problem.id || index}
                                            style={{
                                                borderBottom: index < filteredProblems.length - 1 ? '1px solid #30363d' : 'none',
                                                transition: 'background 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#0d1117'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span className="material-symbols-outlined" style={{ color: '#137fec', fontSize: '20px' }}>
                                                        code
                                                    </span>
                                                    <span style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 600 }}>
                                                        {problem.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{
                                                    color: getDifficultyColor(problem.difficulty),
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    background: `${getDifficultyColor(problem.difficulty)}1a`,
                                                    padding: '4px 12px',
                                                    borderRadius: '6px'
                                                }}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {problem.languages?.map((lang, i) => (
                                                        <span
                                                            key={i}
                                                            style={{
                                                                background: '#30363d',
                                                                color: '#cbd5e1',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                                padding: '4px 8px',
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            {lang}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => navigate(`/problem/${problem.id}`)}
                                                        style={{
                                                            background: '#10b981',
                                                            border: 'none',
                                                            color: 'white',
                                                            padding: '10px 16px',
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#059669';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = '#10b981';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                                                        Attempt
                                                    </button>

                                                    {user?.role === 'ADMIN' && (
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => navigate(`/admin/edit-problem/${problem.id}`)}
                                                                style={{
                                                                    background: '#30363d',
                                                                    border: '1px solid #444c56',
                                                                    color: 'white',
                                                                    padding: '10px 16px',
                                                                    borderRadius: '8px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = '#444c56';
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = '#30363d';
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                }}
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/admin/edit-template/${problem.id}`)}
                                                                style={{
                                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                                                    color: '#6366f1',
                                                                    padding: '10px 16px',
                                                                    borderRadius: '8px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                }}
                                                            >
                                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>terminal</span>
                                                                Templates
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
