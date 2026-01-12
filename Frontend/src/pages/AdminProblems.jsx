import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const DIFFICULTY_LEVELS = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' }
];

const AdminProblems = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [createdProblemId, setCreatedProblemId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Step 1: Problem Details
    const [problemData, setProblemData] = useState({
        title: '',
        description: '',
        difficulty: 'EASY'
    });

    // Step 2: Language Boilerplates
    const [boilerplates, setBoilerplates] = useState([]);
    const [currentBoilerplate, setCurrentBoilerplate] = useState({
        language: 'PYTHON',
        code: '',
        template: ''
    });

    // Step 3: Test Cases
    const [testCases, setTestCases] = useState([]);
    const [currentTestCase, setCurrentTestCase] = useState({
        input: '',
        output: '',
        visibility: 'SAMPLE'
    });



    const availableLanguages = useMemo(() => {
        const addedLanguages = boilerplates.map(bp => bp.language);
        return LANGUAGES.filter(lang => !addedLanguages.includes(lang.value));
    }, [boilerplates]);

    const getCurrentLanguageExtension = () => {
        const lang = LANGUAGES.find(l => l.value === currentBoilerplate.language);
        return lang ? lang.extension() : python();
    };

    if (user?.role !== 'ADMIN') return <div className="admin-problems-container">Access Denied</div>;

    const handleCreateProblem = async (e) => {
        e.preventDefault();
        if (!problemData.title || !problemData.description) return toast.error('Please fill all required fields');

        setLoading(true);
        try {
            const response = await problemAPI.createProblem(problemData);
            setCreatedProblemId(response.data.id);
            toast.success('Problem basic info saved!');
            setCurrentStep(2);
        } catch (err) {
            toast.error('Failed to create problem');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBoilerplate = () => {
        if (!currentBoilerplate.code) return toast.error('Code is required');
        setBoilerplates([...boilerplates, { ...currentBoilerplate }]);
        const rest = LANGUAGES.filter(l => !boilerplates.some(b => b.language === l.value) && l.value !== currentBoilerplate.language);
        setCurrentBoilerplate({ language: rest[0]?.value || 'PYTHON', code: '', template: '' });
    };

    const handleSubmitBoilerplates = async () => {
        if (boilerplates.length === 0) return notify('error', 'Add at least one language');
        setLoading(true);
        try {
            for (const bp of boilerplates) {
                await problemAPI.createBoilerplate({
                    problem_id: createdProblemId,
                    language: bp.language,
                    boilerplate_code: bp.code,
                    test_runner_template: bp.template || null
                });
            }
            toast.success('Boilerplates saved!');
            setCurrentStep(3);
        } catch (err) {
            toast.error('Failed to save boilerplates');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTestCase = () => {
        if (!currentTestCase.input || !currentTestCase.output) return toast.error('Input and Output are required');
        setTestCases([...testCases, { ...currentTestCase }]);
        setCurrentTestCase({ input: '', output: '', visibility: 'SAMPLE' });
    };

    const handleSubmitTestCases = async () => {
        if (testCases.length === 0) return notify('error', 'Add at least one test case');
        setLoading(true);
        try {
            for (const tc of testCases) {
                await problemAPI.createTestCase({ problem_id: createdProblemId, ...tc });
            }
            toast.success('Problem created successfully!');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            toast.error('Failed to save test cases');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-problems-container">

            <header className="admin-header">
                <div className="header-content">
                    <button onClick={() => navigate('/dashboard')} className="btn-outline" style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        ← Back
                    </button>
                    <h1>Design Problem</h1>
                    <p>Create a new coding challenge for the community</p>
                </div>
                <div className="admin-badge">
                    <span>👑</span> Administrator
                </div>
            </header>

            <div className="admin-layout" style={{ display: 'block', maxWidth: '800px' }}>
                <div className="admin-content-card">
                    <div className="creation-stepper">
                        <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>
                            <div className="step-circle">1</div> Details
                        </div>
                        <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>
                            <div className="step-circle">2</div> Boilerplate
                        </div>
                        <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>
                            <div className="step-circle">3</div> Verification
                        </div>
                    </div>

                    {currentStep === 1 && (
                        <form onSubmit={handleCreateProblem} className="form-grid">
                            <div className="form-section-header">
                                <h2>General Information</h2>
                                <p>Set the title and descriptive content of your problem.</p>
                            </div>
                            <div className="field-group">
                                <label>Problem Title</label>
                                <input
                                    className="input-styled"
                                    placeholder="e.g. Find First and Last Position of Element"
                                    value={problemData.title}
                                    onChange={e => setProblemData({ ...problemData, title: e.target.value })}
                                />
                            </div>
                            <div className="field-group">
                                <label>Difficulty Level</label>
                                <div className="difficulty-options">
                                    {DIFFICULTY_LEVELS.map(level => (
                                        <div
                                            key={level.value}
                                            className={`diff-card ${problemData.difficulty === level.value ? 'active' : ''}`}
                                            data-level={level.value}
                                            onClick={() => setProblemData({ ...problemData, difficulty: level.value })}
                                        >
                                            {level.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="field-group">
                                <label>Description (Supports Markdown)</label>
                                <textarea
                                    className="input-styled"
                                    placeholder="Detailed description of the problem..."
                                    value={problemData.description}
                                    onChange={e => setProblemData({ ...problemData, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Next Step: Languages →'}
                            </button>
                        </form>
                    )}

                    {currentStep === 2 && (
                        <div className="form-grid">
                            <div className="form-section-header">
                                <h2>Language Support</h2>
                                <p>Configure boilerplates and runner templates.</p>
                            </div>

                            {boilerplates.map((bp, i) => (
                                <div key={i} className="tc-card" style={{ padding: '0.8rem' }}>
                                    <div className="tc-card-header" style={{ margin: 0 }}>
                                        <span className="tc-badge sample">{bp.language} Added</span>
                                        <button className="remove-tc" onClick={() => setBoilerplates(boilerplates.filter((_, idx) => idx !== i))}>Remove</button>
                                    </div>
                                </div>
                            ))}

                            {availableLanguages.length > 0 && (
                                <div className="add-item-form">
                                    <div className="field-group" style={{ marginBottom: '1rem' }}>
                                        <label>Select Language</label>
                                        <select className="input-styled" value={currentBoilerplate.language} onChange={e => setCurrentBoilerplate({ ...currentBoilerplate, language: e.target.value })}>
                                            {availableLanguages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="field-group" style={{ marginBottom: '1rem' }}>
                                        <label>Initial Boilerplate Code</label>
                                        <div className="code-editor-wrapper">
                                            <CodeMirror value={currentBoilerplate.code} height="150px" theme={oneDark} extensions={[getCurrentLanguageExtension()]} onChange={v => setCurrentBoilerplate({ ...currentBoilerplate, code: v })} />
                                        </div>
                                    </div>
                                    <div className="field-group">
                                        <label>Test Runner Template</label>
                                        <div className="code-editor-wrapper">
                                            <CodeMirror value={currentBoilerplate.template} height="150px" theme={oneDark} extensions={[getCurrentLanguageExtension()]} onChange={v => setCurrentBoilerplate({ ...currentBoilerplate, template: v })} />
                                        </div>
                                    </div>
                                    <button onClick={handleAddBoilerplate} className="btn-outline" style={{ marginTop: '1rem', width: '100%' }}>+ Add to List</button>
                                </div>
                            )}

                            <div className="form-actions">
                                <button onClick={() => setCurrentStep(1)} className="btn-outline">← Back</button>
                                <button onClick={handleSubmitBoilerplates} className="btn-primary" disabled={loading}>Save & Continue →</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="form-grid">
                            <div className="form-section-header">
                                <h2>TestCase Verification</h2>
                                <p>Add sample and hidden cases for automated testing.</p>
                            </div>

                            <div className="tc-list">
                                {testCases.map((tc, id) => (
                                    <div key={id} className="tc-card">
                                        <div className="tc-card-header">
                                            <span className={`tc-badge ${tc.visibility.toLowerCase()}`}>{tc.visibility}</span>
                                            <button className="remove-tc" onClick={() => setTestCases(testCases.filter((_, idx) => idx !== id))}>Remove</button>
                                        </div>
                                        <div className="tc-io-grid">
                                            <div className="tc-io-block"><h4>Input</h4><pre>{tc.input}</pre></div>
                                            <div className="tc-io-block"><h4>Output</h4><pre>{tc.output}</pre></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="add-item-form">
                                <div className="field-group" style={{ marginBottom: '1rem' }}>
                                    <label>Visibility</label>
                                    <select className="input-styled" value={currentTestCase.visibility} onChange={e => setCurrentTestCase({ ...currentTestCase, visibility: e.target.value })}>
                                        <option value="SAMPLE">Sample Case (Public)</option>
                                        <option value="HIDDEN">Verification Case (Hidden)</option>
                                    </select>
                                </div>
                                <div className="tc-io-grid">
                                    <div className="field-group"><label>Input Data</label><textarea className="input-styled" value={currentTestCase.input} onChange={e => setCurrentTestCase({ ...currentTestCase, input: e.target.value })} /></div>
                                    <div className="field-group"><label>Expected Output</label><textarea className="input-styled" value={currentTestCase.output} onChange={e => setCurrentTestCase({ ...currentTestCase, output: e.target.value })} /></div>
                                </div>
                                <button onClick={handleAddTestCase} className="btn-outline" style={{ marginTop: '1rem', width: '100%' }}>+ Add Case</button>
                            </div>

                            <div className="form-actions">
                                <button onClick={() => setCurrentStep(2)} className="btn-outline">← Back</button>
                                <button onClick={handleSubmitTestCases} className="btn-primary" disabled={loading}>Finish & Create Problem ✓</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProblems;
