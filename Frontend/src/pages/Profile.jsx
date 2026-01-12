import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { codeAPI } from '../utils/api';
import { formatProfessionalDate } from '../utils/formatDate';

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await codeAPI.getStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching user stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Helper to generate the last 365 days of activity for the heatmap
    const generateActivityGrid = () => {
        if (!stats?.activity) return null;

        const activityMap = stats.activity.reduce((acc, curr) => {
            const dateStr = new Date(curr.date).toISOString().split('T')[0];
            acc[dateStr] = curr.count;
            return acc;
        }, {});

        const today = new Date();
        const days = [];
        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                count: activityMap[dateStr] || 0
            });
        }
        return days;
    };

    const activityDays = generateActivityGrid();

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
                                gap: '6px'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dashboard</span>
                            Dashboard
                        </button>

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

            <main style={{ maxWidth: '1024px', margin: '0 auto', padding: '40px 24px' }}>
                {/* Profile Header */}
                <div style={{
                    background: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '12px',
                    padding: '40px',
                    marginBottom: '32px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #137fec, #6366f1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'white' }}>
                                person
                            </span>
                        </div>

                        {/* User Info */}
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
                                {user?.full_name}
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '16px' }}>
                                {user?.email}
                            </p>

                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                <div style={{
                                    background: '#137fec1a',
                                    border: '1px solid #137fec33',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#137fec',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {user?.role || 'USER'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
                                    Joined {user?.created_at ? formatProfessionalDate(user.created_at) : 'Recently'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Account Info */}
                    <div style={{
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '12px',
                        padding: '32px'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ color: '#137fec' }}>person</span>
                            Account Information
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Full Name
                                </div>
                                <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                                    {user?.full_name}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Email Address
                                </div>
                                <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                                    {user?.email}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Role
                                </div>
                                <div style={{ color: '#e2e8f0', fontSize: '14px' }}>
                                    {user?.role}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Stats */}
                    <div style={{
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: '12px',
                        padding: '32px'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ color: '#10b981' }}>bar_chart</span>
                            Activity Stats
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { label: 'Total Submissions', value: stats?.totalSubmissions || 0, color: '#137fec' },
                                { label: 'Accepted', value: stats?.acceptedSubmissions || 0, color: '#10b981' },
                                { label: 'Failed', value: stats?.failedSubmissions || 0, color: '#ef4444' },
                                { label: 'Success Rate', value: `${stats?.acceptanceRate || 0}%`, color: '#14b8a6' },
                            ].map((stat, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>{stat.label}</span>
                                    <span style={{ color: stat.color, fontSize: '18px', fontWeight: 700 }}>{stat.value || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div style={{
                    background: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '12px',
                    padding: '32px',
                    marginBottom: '32px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>history</span>
                            Submissions in the last year
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '10px', height: '10px', background: '#1e1e1e', borderRadius: '2px' }}></div>
                                No activity
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '10px', height: '10px', background: '#137fec', borderRadius: '2px' }}></div>
                                Active
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(53, 1fr)',
                        gap: '4px',
                        overflowX: 'auto',
                        padding: '4px'
                    }}>
                        {activityDays?.map((day, i) => (
                            <div
                                key={i}
                                title={`${day.count} submissions on ${day.date}`}
                                style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    background: day.count > 0 ? `rgba(19, 127, 236, ${Math.min(0.2 + (day.count * 0.2), 1)})` : '#1e1e1e',
                                    borderRadius: '2px',
                                    border: day.count > 4 ? '1px solid #137fec' : 'none',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.2)';
                                    e.currentTarget.style.zIndex = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.zIndex = '0';
                                }}
                            ></div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#64748b', fontSize: '11px' }}>
                        <span>Year Ago</span>
                        <span>Today</span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{
                    background: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '12px',
                    padding: '32px'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '24px' }}>
                        Quick Actions
                    </h2>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/code')}
                            style={{
                                background: '#137fec',
                                border: 'none',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>code</span>
                            Go to Code Editor
                        </button>

                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'transparent',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
