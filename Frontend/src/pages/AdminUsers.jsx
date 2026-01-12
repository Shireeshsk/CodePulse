import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, adminAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { formatProfessionalDate } from '../utils/formatDate';
import './AdminProblems.css';

const AdminUsers = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateAdmin, setShowCreateAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ full_name: '', email: '', password: '' });

    useEffect(() => {
        fetchUsers();
    }, []);



    const fetchUsers = async () => {
        try {
            const data = await adminAPI.getAllUsers();
            setUsers(data.users || []);
        } catch (err) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.updateUserRole(userId, newRole);
            toast.success(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update user role');
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createAdmin(newAdmin);
            toast.success('Admin user created successfully!');
            setShowCreateAdmin(false);
            setNewAdmin({ full_name: '', email: '', password: '' });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create admin');
        }
    };

    if (currentUser?.role !== 'ADMIN') return <div className="admin-problems-container">Access Denied</div>;

    return (
        <div className="admin-problems-container">

            <header className="admin-header">
                <div className="header-content">
                    <button onClick={() => navigate('/dashboard')} className="btn-outline" style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        ← Back to Dashboard
                    </button>
                    <h1>User Management</h1>
                    <p>Administrate roles and platform access for all registered users.</p>
                </div>
                <button
                    onClick={() => setShowCreateAdmin(true)}
                    className="btn-primary"
                >
                    + Create New Admin
                </button>
            </header>

            <div className="admin-layout" style={{ display: 'block' }}>
                <div className="admin-content-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-dim)' }}>
                                        <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Full Name</th>
                                        <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Address</th>
                                        <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Role</th>
                                        <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Joined Date</th>
                                        <th style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'center' }}>Modify Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-dim)' }}>
                                            <td style={{ padding: '1.25rem', fontSize: '0.95rem', fontWeight: 600 }}>{u.full_name}</td>
                                            <td style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{u.email}</td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span style={{
                                                    background: u.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(161, 161, 170, 0.1)',
                                                    color: u.role === 'ADMIN' ? 'var(--accent-primary)' : 'var(--text-dim)',
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800
                                                }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>{formatProfessionalDate(u.created_at)}</td>
                                            <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                {u.id !== currentUser.id ? (
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                        className="input-styled"
                                                        style={{ padding: '0.4rem', fontSize: '0.8rem', background: 'transparent' }}
                                                    >
                                                        <option value="USER">Standard User</option>
                                                        <option value="ADMIN">Platform Admin</option>
                                                    </select>
                                                ) : (
                                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>Active Session</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Admin Modal */}
            {showCreateAdmin && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div className="admin-content-card" style={{ width: '100%', maxWidth: '450px' }}>
                        <div className="form-section-header">
                            <h2>Elevate New Admin</h2>
                            <p>Manually create an administrative account.</p>
                        </div>
                        <form onSubmit={handleCreateAdmin} className="form-grid">
                            <div className="field-group">
                                <label>Full Name</label>
                                <input className="input-styled" required value={newAdmin.full_name} onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })} />
                            </div>
                            <div className="field-group">
                                <label>Email Address</label>
                                <input type="email" className="input-styled" required value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                            </div>
                            <div className="field-group">
                                <label>Secure Password</label>
                                <input type="password" className="input-styled" required value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                            </div>
                            <div className="form-actions" style={{ marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowCreateAdmin(false)} className="btn-outline">Cancel</button>
                                <button type="submit" className="btn-primary">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
