import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            padding: '24px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: '#161b22',
                borderRadius: '16px',
                border: '1px solid rgba(59, 71, 84, 0.5)',
                padding: '40px',
            }} className="fade-in">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                        <span className="material-symbols-outlined" style={{ color: '#137fec', fontSize: '32px' }}>
                            terminal
                        </span>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: 0 }}>CodePulse</h1>
                    </Link>
                    <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>Create your account to start coding.</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '24px',
                        color: '#ef4444',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength="6"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#137fec',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid rgba(59, 71, 84, 0.3)',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px'
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#137fec', textDecoration: 'none', fontWeight: 600 }}>
                        Login
                    </Link>
                </div>

                <Link
                    to="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        marginTop: '16px',
                        color: '#64748b',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                    Back to home
                </Link>
            </div>
        </div>
    );
}
