import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Get token from either navigation state (after OTP) or URL query (if user bookmarked it)
    const token = location.state?.resetToken || searchParams.get('token');

    const [passwords, setPasswords] = useState({ password: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.password !== passwords.confirm) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            await authAPI.resetPassword(token, passwords.password);
            toast.success('Password updated! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Session Expired</h1>
                    <p style={{ color: '#8b949e', marginTop: '8px' }}>Please restart the forgot password process.</p>
                    <button onClick={() => navigate('/forgot-password')} style={{ marginTop: '24px', background: '#137fec', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>
                        Forgot Password
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }}>password</span>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Set New Password</h1>
                    <p style={{ color: '#8b949e', fontSize: '14px' }}>Please choose a strong password you haven't used before.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600 }}>New Password</label>
                        <input
                            type="password"
                            required
                            autoFocus
                            value={passwords.password}
                            onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                            style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600 }}>Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
