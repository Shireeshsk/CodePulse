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

const LANGUAGES = [
    { value: 'PYTHON', label: 'Python', icon: '🐍', extension: python },
    { value: 'JAVA', label: 'Java', icon: '☕', extension: java },
    { value: 'CPP', label: 'C++', icon: '⚡', extension: cpp },
    { value: 'JS', label: 'JavaScript', icon: '🟨', extension: javascript }
];

const EditCodeTemplate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [problem, setProblem] = useState(null);
    const [boilerplates, setBoilerplates] = useState([]);
    const [activeTemplate, setActiveTemplate] = useState(0);

    // Add Language Logic
    const [isAdding, setIsAdding] = useState(false);
    const [newBP, setNewBP] = useState({ language: '', code: '', template: '' });

    useEffect(() => {
        if (!id) return;
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const data = await problemAPI.getProblemForEdit(id);
            setProblem(data.problem);
            setBoilerplates(data.problem.boilerplates || []);

            const available = LANGUAGES.filter(l =>
                !(data.problem.boilerplates || []).some(bp => bp.language === l.value)
            );
            if (available.length > 0) {
                setNewBP(prev => ({ ...prev, language: available[0].value }));
            }
        } catch (err) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (bpId, idx) => {
        const bp = boilerplates[idx];
        try {
            await problemAPI.updateBoilerplate(bpId, {
                boilerplate_code: bp.boilerplate_code,
                test_runner_template: bp.test_runner_template
            });
            toast.success(`${bp.language} updated successfully!`);
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handleAddBoilerplate = async () => {
        if (!newBP.code) return toast.error('Starter code is required');
        try {
            await problemAPI.createBoilerplate({
                problem_id: id,
                language: newBP.language,
                boilerplate_code: newBP.code,
                test_runner_template: newBP.template || null
            });
            toast.success(`${newBP.language} added successfully!`);
            setIsAdding(false);
            setNewBP({ language: '', code: '', template: '' });
            fetchData();
        } catch (err) {
            toast.error('Failed to add language');
        }
    };

    const availableLanguages = LANGUAGES.filter(lang =>
        !boilerplates.some(bp => bp.language === lang.value)
    );

    if (user?.role !== 'ADMIN') return <div className="admin-problems-container">Access Denied</div>;
    if (loading) return <div className="admin-problems-container"><div className="spinner" style={{ margin: '100px auto' }} /></div>;

    return (
        <div className="admin-problems-container">
            <header className="admin-header">
                <div className="header-content">
                    <button onClick={() => navigate(`/admin/edit-problem/${id}`)} className="btn-outline" style={{ marginBottom: '1rem' }}>
                        ← Back to Problem Settings
                    </button>
                    <h1>Edit Code Templates</h1>
                    <p>Configure how code is presented to users and executed in the runner for <strong>{problem?.title}</strong>.</p>
                </div>
                <div className="admin-badge"><span>🛠️</span> Template Architect</div>
            </header>

            <div className="admin-layout">
                <aside className="admin-sidebar" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-dim)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', margin: 0 }}>Languages</h3>
                        {availableLanguages.length > 0 && !isAdding && (
                            <button
                                onClick={() => setIsAdding(true)}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
                                title="Add Language"
                            >+</button>
                        )}
                    </div>

                    {boilerplates.map((bp, idx) => (
                        <button
                            key={bp.id}
                            className={`tab-btn ${!isAdding && activeTemplate === idx ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTemplate(idx);
                                setIsAdding(false);
                            }}
                        >
                            <span className="tab-icon">{LANGUAGES.find(l => l.value === bp.language)?.icon || '📄'}</span>
                            {bp.language}
                        </button>
                    ))}

                    {availableLanguages.length > 0 && isAdding && (
                        <button className="tab-btn active" style={{ border: '1px dashed var(--accent-primary)' }}>
                            <span className="tab-icon">✨</span> New Language
                        </button>
                    )}

                    {boilerplates.length === 0 && !isAdding && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>No languages configured.</p>
                    )}
                </aside>

                <main className="admin-content-card">
                    {isAdding ? (
                        <div className="form-grid">
                            <div className="form-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2>Add New Language Support</h2>
                                    <p>Initialize a new language for this problem.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button className="remove-tc" onClick={() => setIsAdding(false)}>Cancel</button>
                                    <button className="btn-primary" onClick={handleAddBoilerplate}>Save New Language</button>
                                </div>
                            </div>

                            <div className="field-group">
                                <label>Target Language</label>
                                <select
                                    className="input-styled"
                                    style={{ width: '100%', maxWidth: '300px' }}
                                    value={newBP.language}
                                    onChange={e => setNewBP({ ...newBP, language: e.target.value })}
                                >
                                    {availableLanguages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                </select>
                            </div>

                            <div className="field-group">
                                <label>Initial Boilerplate (Starter Code)</label>
                                <div className="code-editor-wrapper" style={{ border: '1px solid var(--border-dim)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <CodeMirror
                                        value={newBP.code}
                                        height="200px"
                                        theme={oneDark}
                                        extensions={[LANGUAGES.find(l => l.value === newBP.language)?.extension() || python()]}
                                        onChange={v => setNewBP({ ...newBP, code: v })}
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label>Test Runner Template (Optional)</label>
                                <div className="code-editor-wrapper" style={{ border: '1px solid var(--border-dim)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <CodeMirror
                                        value={newBP.template}
                                        height="300px"
                                        theme={oneDark}
                                        extensions={[LANGUAGES.find(l => l.value === newBP.language)?.extension() || python()]}
                                        onChange={v => setNewBP({ ...newBP, template: v })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : boilerplates.length > 0 ? (
                        <div className="form-grid">
                            <div className="form-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {boilerplates[activeTemplate].language} Configuration
                                    </h2>
                                    <p>Adjust the boilerplate and execution wrapper for this language.</p>
                                </div>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleUpdate(boilerplates[activeTemplate].id, activeTemplate)}
                                >
                                    Save Changes
                                </button>
                            </div>

                            <div className="field-group">
                                <label>Starter Code (User View)</label>
                                <div className="code-editor-wrapper" style={{ border: '1px solid var(--border-dim)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <CodeMirror
                                        value={boilerplates[activeTemplate].boilerplate_code || ''}
                                        height="250px"
                                        theme={oneDark}
                                        extensions={[LANGUAGES.find(l => l.value === boilerplates[activeTemplate].language)?.extension() || python()]}
                                        onChange={v => {
                                            const s = [...boilerplates]; s[activeTemplate].boilerplate_code = v; setBoilerplates(s);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="field-group" style={{ marginTop: '1rem' }}>
                                <label>Test Runner Template (Internal Wrapper)</label>
                                <div className="code-editor-wrapper" style={{ border: '1px solid var(--border-dim)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <CodeMirror
                                        value={boilerplates[activeTemplate].test_runner_template || ''}
                                        height="400px"
                                        theme={oneDark}
                                        extensions={[LANGUAGES.find(l => l.value === boilerplates[activeTemplate].language)?.extension() || python()]}
                                        onChange={v => {
                                            const s = [...boilerplates]; s[activeTemplate].test_runner_template = v; setBoilerplates(s);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--border-dim)', marginBottom: '1.5rem' }}>code_off</span>
                            <h3>No Languages Configured</h3>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>This problem doesn't have any code templates yet.</p>
                            {availableLanguages.length > 0 && (
                                <button className="btn-primary" onClick={() => setIsAdding(true)}>Initialize First Language</button>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default EditCodeTemplate;
