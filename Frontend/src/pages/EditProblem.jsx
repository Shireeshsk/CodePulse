import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { problemAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { toast } from 'react-toastify';
import './AdminProblems.css';

// Custom Confirmation Component for deletions
const DeleteConfirmToast = ({ onConfirm, onCancel, title }) => (
    <div className="toast-confirm-container">
        <p className="toast-confirm-title">
            Delete "{title}"?
        </p>
        <p className="toast-confirm-subtitle">
            This will permanently purge all submissions and test cases.
        </p>
        <div className="toast-btn-group">
            <button className="btn-toast-danger" onClick={onConfirm}>
                Yes, Purge
            </button>
            <button className="btn-toast-cancel" onClick={onCancel}>
                Cancel
            </button>
        </div>
    </div>
);

const LANGUAGES = [
    { value: 'PYTHON', label: 'Python', icon: '🐍', extension: python },
    { value: 'JAVA', label: 'Java', icon: '☕', extension: java },
    { value: 'CPP', label: 'C++', icon: '⚡', extension: cpp },
    { value: 'JS', label: 'JavaScript', icon: '🟨', extension: javascript }
];

const DIFFICULTY_LEVELS = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' }
];

const EditProblem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');

    const [problemData, setProblemData] = useState({ title: '', description: '', difficulty: 'EASY' });
    const [testCases, setTestCases] = useState([]);
    const [boilerplates, setBoilerplates] = useState([]);

    // Logic for adding new boilerplate
    const [isAddingBoilerplate, setIsAddingBoilerplate] = useState(false);
    const [newBoilerplate, setNewBoilerplate] = useState({ language: 'PYTHON', code: '', template: '' });

    useEffect(() => {
        if (!id) return;
        fetchProblem();
    }, [id]);

    const fetchProblem = async () => {
        try {
            const data = await problemAPI.getProblemForEdit(id);
            setProblemData({
                title: data.problem.title,
                description: data.problem.description,
                difficulty: data.problem.difficulty
            });
            setTestCases(data.problem.testCases || []);
            setBoilerplates(data.problem.boilerplates || []);
        } catch (err) {
            toast.error('Failed to load problem');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBasic = async (e) => {
        e.preventDefault();
        try {
            await problemAPI.updateProblem(id, problemData);
            toast.success('Basic info updated successfully!');
        } catch (err) {
            toast.error('Failed to update problem details');
        }
    };

    const handleUpdateTestCase = async (tcId, updates) => {
        try {
            await problemAPI.updateTestCase(tcId, updates);
            setTestCases(testCases.map(tc => tc.id === tcId ? { ...tc, ...updates } : tc));
            toast.success('Test case entry updated');
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleDeleteTestCase = async (tcId) => {
        if (!window.confirm('Irreversibly delete this test case?')) return;
        try {
            await problemAPI.deleteTestCase(tcId);
            setTestCases(testCases.filter(tc => tc.id !== tcId));
            toast.success('Test case removed');
        } catch (err) {
            toast.error('Deletion failed');
        }
    };

    const handleAddNewTC = async () => {
        try {
            const res = await problemAPI.createTestCase({ problem_id: id, input: '', output: '', visibility: 'HIDDEN' });
            setTestCases([...testCases, res]);
            toast.success('Empty test case added');
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleUpdateBoilerplate = async (bpId, updates) => {
        try {
            await problemAPI.updateBoilerplate(bpId, updates);
            setBoilerplates(boilerplates.map(bp => bp.id === bpId ? { ...bp, ...updates } : bp));
            // toast.success('Template updated successfully'); // Kept internal state for logic if needed, but UI is gone
        } catch (err) {
            toast.error('Failed to update template');
        }
    };


    const availableLanguages = LANGUAGES.filter(lang =>
        !boilerplates.some(bp => bp.language === lang.value)
    );

    if (user?.role !== 'ADMIN') return <div className="admin-problems-container">Access Denied</div>;
    if (loading) return <div className="admin-problems-container" style={{ textAlign: 'center', paddingTop: '100px' }}><div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} /></div>;

    const performDelete = async () => {
        try {
            await problemAPI.deleteProblem(id);
            toast.success('Problem successfully purged');
            setTimeout(() => navigate('/browse-problems'), 1500);
        } catch (err) {
            toast.error('Purge failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteProblem = () => {
        toast(({ closeToast }) => (
            <DeleteConfirmToast
                title={problemData.title}
                onConfirm={() => {
                    performDelete();
                    closeToast();
                }}
                onCancel={closeToast}
            />
        ), {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            theme: "dark"
        });
    };

    return (
        <div className="admin-problems-container">

            <header className="admin-header">
                <div className="header-content">
                    <button onClick={() => navigate('/browse-problems')} className="btn-outline" style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        ← Back to Problems
                    </button>
                    <h1>{problemData.title}</h1>
                    <p>Modify and manage the configuration for this challenge.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={handleDeleteProblem}
                        className="btn-outline"
                        style={{ color: 'var(--accent-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                        🗑 Delete Problem
                    </button>
                    <div className="admin-badge">
                        <span>👑</span> System Admin
                    </div>
                </div>
            </header>

            <div className="admin-layout">
                {/* Sidebar Navigation */}
                <aside className="admin-sidebar">
                    <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                        <span className="tab-icon">📄</span> Basic Info
                    </button>
                    <button className={`tab-btn ${activeTab === 'testcases' ? 'active' : ''}`} onClick={() => setActiveTab('testcases')}>
                        <span className="tab-icon">🧪</span> Test Cases
                    </button>
                    <button className="tab-btn" onClick={() => navigate(`/admin/edit-template/${id}`)} style={{ marginTop: 'auto', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        <span className="tab-icon">⚙️</span> Code Templates
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="admin-content-card">
                    {activeTab === 'general' && (
                        <form onSubmit={handleUpdateBasic} className="form-grid">
                            <div className="form-section-header">
                                <h2>General Settings</h2>
                                <p>Problem title and visibility across the platform.</p>
                            </div>
                            <div className="field-group">
                                <label>Title</label>
                                <input className="input-styled" value={problemData.title} onChange={e => setProblemData({ ...problemData, title: e.target.value })} />
                            </div>
                            <div className="field-group">
                                <label>Difficulty Selection</label>
                                <div className="difficulty-options">
                                    {DIFFICULTY_LEVELS.map(l => (
                                        <div
                                            key={l.value}
                                            className={`diff-card ${problemData.difficulty === l.value ? 'active' : ''}`}
                                            data-level={l.value}
                                            onClick={() => setProblemData({ ...problemData, difficulty: l.value })}
                                        >
                                            {l.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="field-group">
                                <label>Description Content</label>
                                <textarea className="input-styled" value={problemData.description} onChange={e => setProblemData({ ...problemData, description: e.target.value })} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Update Problem Details</button>
                        </form>
                    )}

                    {activeTab === 'testcases' && (
                        <div className="form-grid">
                            <div className="form-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2>Verification Suite</h2>
                                    <p>Manage inputs and expected outputs for this challenge.</p>
                                </div>
                                <button onClick={handleAddNewTC} className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>+ New Case</button>
                            </div>

                            <div className="tc-list">
                                {testCases.map((tc, idx) => (
                                    <div key={tc.id} className="tc-card">
                                        <div className="tc-card-header">
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dim)', marginRight: '0.5rem' }}>#{idx + 1}</span>
                                                <select
                                                    className="input-styled"
                                                    style={{ padding: '0.3rem', fontSize: '0.8rem', width: 'auto' }}
                                                    value={tc.visibility}
                                                    onChange={e => handleUpdateTestCase(tc.id, { visibility: e.target.value })}
                                                >
                                                    <option value="SAMPLE">Sample (Visible)</option>
                                                    <option value="HIDDEN">Hidden (Private)</option>
                                                </select>
                                            </div>
                                            <button className="remove-tc" onClick={() => handleDeleteTestCase(tc.id)}>DELETE</button>
                                        </div>
                                        <div className="tc-io-grid">
                                            <div className="field-group">
                                                <label>Input</label>
                                                <textarea className="input-styled" style={{ minHeight: '80px', fontSize: '0.85rem' }} value={tc.input} onBlur={e => handleUpdateTestCase(tc.id, { input: e.target.value })} onChange={e => {
                                                    const s = [...testCases]; s[idx].input = e.target.value; setTestCases(s);
                                                }} />
                                            </div>
                                            <div className="field-group">
                                                <label>Output</label>
                                                <textarea className="input-styled" style={{ minHeight: '80px', fontSize: '0.85rem' }} value={tc.output} onBlur={e => handleUpdateTestCase(tc.id, { output: e.target.value })} onChange={e => {
                                                    const s = [...testCases]; s[idx].output = e.target.value; setTestCases(s);
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};


export default EditProblem;
