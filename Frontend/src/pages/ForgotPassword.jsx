import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.forgotPassword(email);
            setStep(2);
            toast.success('OTP sent to your email!');
            if (res.otp) {
                console.log('DEV OTP:', res.otp);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.verifyOTP(email, otp);
            toast.success('OTP Verified!');
            // Pass the resetToken to the Reset page
            navigate('/reset-password', { state: { resetToken: res.resetToken } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#137fec', marginBottom: '16px' }}>
                        {step === 1 ? 'lock_reset' : 'verified_user'}
                    </span>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
                        {step === 1 ? 'Forgot Password?' : 'Enter OTP'}
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: '14px' }}>
                        {step === 1
                            ? "Enter your email and we'll send a 6-digit OTP."
                            : `We've sent a code to ${email}`}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
                                placeholder="name@company.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ background: '#137fec', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600 }}>6-Digit OTP</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none', textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                                placeholder="000000"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ background: 'transparent', color: '#8b949e', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                        >
                            Change Email
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <Link to="/login" style={{ color: '#137fec', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
