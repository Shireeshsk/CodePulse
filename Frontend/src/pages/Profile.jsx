import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { codeAPI, feedbackAPI } from '../utils/api';
import { formatProfessionalDate } from '../utils/formatDate';

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Feedback State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null); // { type: 'success' | 'error', message: string }

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

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setSubmissionStatus({ type: 'error', message: 'Please select a star rating' });
            return;
        }

        setSubmitting(true);
        setSubmissionStatus(null);

        try {
            const data = await feedbackAPI.submitFeedback({
                rating,
                feedback: feedbackText
            });
            setSubmissionStatus({ type: 'success', message: data.message });
            setRating(0);
            setFeedbackText('');
        } catch (error) {
            console.error('Feedback submission error:', error);
            setSubmissionStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to submit feedback. Please try again later.'
            });
        } finally {
            setSubmitting(false);
            // Clear status after 5 seconds
            setTimeout(() => setSubmissionStatus(null), 5000);
        }
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

                {/* Rating & Feedback Section */}
                <div style={{
                    background: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '12px',
                    padding: '32px',
                    marginBottom: '32px'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="material-symbols-outlined" style={{ color: '#ffc107' }}>grade</span>
                        Rate Your Experience
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                        We'd love to hear your thoughts! Rate CodePulse and let us know how we can improve.
                    </p>

                    <form onSubmit={handleSubmitFeedback}>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            transform: (hoverRating || rating) >= star ? 'scale(1.2)' : 'scale(1)',
                                        }}
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            style={{
                                                fontSize: '36px',
                                                fontVariationSettings: (hoverRating || rating) >= star ? "'FILL' 1" : "'FILL' 0",
                                                color: (hoverRating || rating) >= star ? '#ffc107' : '#30363d'
                                            }}
                                        >
                                            star
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <span style={{
                                fontSize: '13px',
                                color: rating > 0 ? '#137fec' : '#64748b',
                                fontWeight: 600
                            }}>
                                {rating === 5 ? 'Excellent!' :
                                    rating === 4 ? 'Great!' :
                                        rating === 3 ? 'Good' :
                                            rating === 2 ? 'Fair' :
                                                rating === 1 ? 'Poor' : 'Select a rating'}
                            </span>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                                Suggestions or Complaints
                            </label>
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Tell us what you like or what we can improve..."
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    background: '#0d1117',
                                    border: '1px solid #30363d',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    color: 'white',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    outline: 'none',
                                    resize: 'vertical',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#137fec'}
                                onBlur={(e) => e.target.style.borderColor = '#30363d'}
                            />
                        </div>

                        {submissionStatus && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: submissionStatus.type === 'success' ? '#065f4626' : '#991b1b26',
                                border: `1px solid ${submissionStatus.type === 'success' ? '#0596694d' : '#dc26264d'}`,
                                color: submissionStatus.type === 'success' ? '#34d399' : '#f87171',
                                fontSize: '14px'
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                    {submissionStatus.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {submissionStatus.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
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
                                gap: '8px',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.7 : 1,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {submitting ? (
                                <>
                                    <span className="material-symbols-outlined rotating" style={{ fontSize: '18px' }}>sync</span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
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
