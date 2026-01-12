import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatProfessionalDateTime } from '../utils/formatDate';

// Language mapping for Monaco editor
const LANGUAGE_MAP = {
    'PYTHON': { monaco: 'python', display: 'Python' },
    'CPP': { monaco: 'cpp', display: 'C++' },
    'JAVA': { monaco: 'java', display: 'Java' },
    'JS': { monaco: 'javascript', display: 'JavaScript' }
};

export default function ProblemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const editorRef = useRef(null);

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [code, setCode] = useState('');
    const [activeTab, setActiveTab] = useState('description'); // description, submissions
    const [customInputs, setCustomInputs] = useState(['']); // Array of custom inputs
    const [activeCustomInput, setActiveCustomInput] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        fetchProblem();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'submissions') {
            fetchSubmissions();
        }
    }, [activeTab]);

    const fetchProblem = async () => {
        try {
            const response = await api.get(`/problem/${id}`);
            setProblem(response.data);

            if (response.data.boilerplates && response.data.boilerplates.length > 0) {
                const firstLang = response.data.boilerplates[0].language;
                setSelectedLanguage(firstLang);
                setCode(response.data.boilerplates[0].boilerplate_code);
            }
        } catch (error) {
            console.error('Error fetching problem:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        setLoadingSubmissions(true);
        try {
            const response = await api.get(`/execute/problem/${id}/submissions`);
            setSubmissions(response.data.submissions || []);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        const boilerplate = problem.boilerplates.find(b => b.language === language);
        if (boilerplate) {
            setCode(boilerplate.boilerplate_code);
        }
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toUpperCase()) {
            case 'EASY':
                return '#10b981';
            case 'MEDIUM':
                return '#f59e0b';
            case 'HARD':
                return '#ef4444';
            default:
                return '#94a3b8';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACCEPTED':
            case 'PASSED':
                return '#10b981';
            case 'REJECTED':
            case 'WRONG_ANSWER':
                return '#ef4444';
            case 'ERROR':
            case 'RUNTIME_ERROR':
                return '#f97316';
            case 'TIME_LIMIT_EXCEEDED':
            case 'TIMEOUT':
                return '#eab308';
            default:
                return '#94a3b8';
        }
    };

    const handleRun = async () => {
        setSelecting('run');
        setShowResults(false);

        try {
            // Filter out empty custom inputs
            const nonEmptyInputs = customInputs.filter(input => input.trim());

            const response = await api.post('/execute/run', {
                problem_id: id,
                language: selectedLanguage,
                code,
                customInputs: nonEmptyInputs
            });

            setResults(response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Run error:', error);
            setResults({
                success: false,
                error: error.response?.data?.message || 'Execution failed'
            });
            setShowResults(true);
        } finally {
            setSelecting(null);
        }
    };

    const handleSubmit = async () => {
        setSelecting('submit');
        setShowResults(false);

        try {
            const response = await api.post('/execute/submit-problem', {
                problem_id: id,
                language: selectedLanguage,
                code
            });

            setResults(response.data);
            setShowResults(true);

            // Refresh submissions list
            if (activeTab === 'submissions') {
                fetchSubmissions();
            }
        } catch (error) {
            console.error('Submit error:', error);
            setResults({
                success: false,
                error: error.response?.data?.message || 'Submission failed'
            });
            setShowResults(true);
        } finally {
            setSelecting(null);
        }
    };

    const addCustomInput = () => {
        setCustomInputs([...customInputs, '']);
        setActiveCustomInput(customInputs.length);
    };

    const updateCustomInput = (index, value) => {
        const newInputs = [...customInputs];
        newInputs[index] = value;
        setCustomInputs(newInputs);
    };

    const removeCustomInput = (index) => {
        if (customInputs.length > 1) {
            const newInputs = customInputs.filter((_, i) => i !== index);
            setCustomInputs(newInputs);
            if (activeCustomInput >= newInputs.length) {
                setActiveCustomInput(newInputs.length - 1);
            }
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0a0a0a'
            }}>
                <div>
                    <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto', marginBottom: '16px' }}></div>
                    <p style={{ color: '#94a3b8' }}>Loading problem...</p>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0a0a0a',
                flexDirection: 'column'
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#30363d', marginBottom: '16px' }}>
                    error
                </span>
                <p style={{ color: '#94a3b8', fontSize: '18px' }}>Problem not found</p>
                <button
                    onClick={() => navigate('/problems')}
                    style={{
                        marginTop: '24px',
                        background: '#137fec',
                        border: 'none',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    Back to Problems
                </button>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
            {/* Top Navigation Bar */}
            <header style={{
                height: '50px',
                background: '#282828',
                borderBottom: '1px solid #3d3d3d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        onClick={() => navigate('/problems')}
                    >
                        <span className="material-symbols-outlined" style={{ color: '#ffa116', fontSize: '18px' }}>
                            arrow_back
                        </span>
                        <span style={{ color: '#eff1f6bf', fontSize: '14px', fontWeight: 500 }}>Problem List</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #3d3d3d',
                            color: '#eff1f6bf',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#3d3d3d'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dashboard</span>
                        Dashboard
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'transparent',
                            border: '1px solid #3d3d3d',
                            color: '#eff1f6bf',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#3d3d3d'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                    </button>
                </div>
            </header>

            {/* Main Split Layout */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Panel - Problem Description & Submissions */}
                <div style={{
                    width: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#1a1a1a',
                    borderRight: '1px solid #3d3d3d',
                    overflow: 'hidden'
                }}>
                    {/* Title and Tabs */}
                    <div style={{
                        padding: '20px 24px 0',
                        borderBottom: '1px solid #3d3d3d'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                            flexWrap: 'wrap'
                        }}>
                            <h1 style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#eff1f6',
                                margin: 0
                            }}>
                                {problem.title}
                            </h1>
                            <span style={{
                                color: getDifficultyColor(problem.difficulty),
                                fontSize: '13px',
                                fontWeight: 600,
                                background: `${getDifficultyColor(problem.difficulty)}1a`,
                                padding: '4px 12px',
                                borderRadius: '14px',
                                textTransform: 'capitalize'
                            }}>
                                {problem.difficulty?.toLowerCase()}
                            </span>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <button
                                onClick={() => setActiveTab('description')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: activeTab === 'description' ? '#eff1f6' : '#eff1f6bf',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    padding: '0 0 12px 0',
                                    borderBottom: activeTab === 'description' ? '2px solid #ffa116' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setActiveTab('submissions')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: activeTab === 'submissions' ? '#eff1f6' : '#eff1f6bf',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    padding: '0 0 12px 0',
                                    borderBottom: activeTab === 'submissions' ? '2px solid #ffa116' : '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Submissions
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px 24px'
                    }}>
                        {activeTab === 'description' ? (
                            <>
                                {/* Description */}
                                <div style={{
                                    color: '#eff1f6bf',
                                    fontSize: '14px',
                                    lineHeight: '1.8',
                                    marginBottom: '32px',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {problem.description}
                                </div>

                                {/* Test Cases Section */}
                                {problem.testcases && problem.testcases.length > 0 && (
                                    <div style={{ marginTop: '32px' }}>
                                        <h3 style={{
                                            color: '#eff1f6',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            marginBottom: '16px'
                                        }}>
                                            Examples
                                        </h3>

                                        {problem.testcases.map((testcase, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    background: '#262626',
                                                    border: '1px solid #3d3d3d',
                                                    borderRadius: '8px',
                                                    padding: '16px',
                                                    marginBottom: '16px'
                                                }}
                                            >
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#eff1f6',
                                                    marginBottom: '12px'
                                                }}>
                                                    Example {index + 1}:
                                                </div>

                                                <div style={{ marginBottom: '12px' }}>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#eff1f6bf',
                                                        marginBottom: '6px',
                                                        fontWeight: 600
                                                    }}>
                                                        Input:
                                                    </div>
                                                    <pre style={{
                                                        background: '#1a1a1a',
                                                        border: '1px solid #3d3d3d',
                                                        borderRadius: '6px',
                                                        padding: '10px 12px',
                                                        color: '#ffa116',
                                                        fontSize: '13px',
                                                        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                                                        margin: 0,
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        lineHeight: '1.5'
                                                    }}>
                                                        {testcase.input}
                                                    </pre>
                                                </div>

                                                <div>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#eff1f6bf',
                                                        marginBottom: '6px',
                                                        fontWeight: 600
                                                    }}>
                                                        Output:
                                                    </div>
                                                    <pre style={{
                                                        background: '#1a1a1a',
                                                        border: '1px solid #3d3d3d',
                                                        borderRadius: '6px',
                                                        padding: '10px 12px',
                                                        color: '#ffa116',
                                                        fontSize: '13px',
                                                        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                                                        margin: 0,
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        lineHeight: '1.5'
                                                    }}>
                                                        {testcase.expected_output}
                                                    </pre>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Submissions Tab */
                            <div>
                                <h3 style={{
                                    color: '#eff1f6',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    marginBottom: '16px'
                                }}>
                                    Your Submissions
                                </h3>

                                {loadingSubmissions ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="spinner" style={{ width: '30px', height: '30px', margin: '0 auto' }}></div>
                                    </div>
                                ) : submissions.length === 0 ? (
                                    <div style={{
                                        background: '#262626',
                                        border: '1px solid #3d3d3d',
                                        borderRadius: '8px',
                                        padding: '40px',
                                        textAlign: 'center'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#3d3d3d', marginBottom: '12px' }}>
                                            code_off
                                        </span>
                                        <p style={{ color: '#eff1f6bf', fontSize: '14px' }}>
                                            No submissions yet. Submit your code to see your history!
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {submissions.map((submission, index) => (
                                            <div
                                                key={submission.id}
                                                style={{
                                                    background: '#262626',
                                                    border: '1px solid #3d3d3d',
                                                    borderRadius: '8px',
                                                    padding: '16px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                        <span style={{
                                                            color: getStatusColor(submission.status),
                                                            fontSize: '13px',
                                                            fontWeight: 600,
                                                            background: `${getStatusColor(submission.status)}1a`,
                                                            padding: '4px 10px',
                                                            borderRadius: '6px'
                                                        }}>
                                                            {submission.status.replace('_', ' ')}
                                                        </span>
                                                        <span style={{
                                                            color: '#eff1f6bf',
                                                            fontSize: '13px',
                                                            background: '#3d3d3d',
                                                            padding: '4px 10px',
                                                            borderRadius: '6px'
                                                        }}>
                                                            {LANGUAGE_MAP[submission.language]?.display || submission.language}
                                                        </span>
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                                                        {formatProfessionalDateTime(submission.submitted_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Code Editor & Results */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#1e1e1e',
                    overflow: 'hidden'
                }}>
                    {/* Language Selector Bar */}
                    <div style={{
                        height: '48px',
                        background: '#1e1e1e',
                        borderBottom: '1px solid #3d3d3d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {problem.boilerplates && problem.boilerplates.map((boilerplate, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleLanguageChange(boilerplate.language)}
                                    style={{
                                        background: selectedLanguage === boilerplate.language ? '#3d3d3d' : 'transparent',
                                        border: 'none',
                                        color: selectedLanguage === boilerplate.language ? '#eff1f6' : '#eff1f6bf',
                                        padding: '6px 14px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedLanguage !== boilerplate.language) {
                                            e.currentTarget.style.background = '#2d2d2d';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedLanguage !== boilerplate.language) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {LANGUAGE_MAP[boilerplate.language]?.display || boilerplate.language}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div style={{ height: '50%', minHeight: 0 }}>
                        <Editor
                            height="100%"
                            language={LANGUAGE_MAP[selectedLanguage]?.monaco || 'python'}
                            value={code}
                            onChange={(value) => setCode(value)}
                            onMount={handleEditorDidMount}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                padding: { top: 16, bottom: 16 },
                                lineNumbers: 'on',
                                renderLineHighlight: 'all',
                                automaticLayout: true,
                                tabSize: 4,
                                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                                fontLigatures: true,
                                cursorBlinking: 'smooth',
                                smoothScrolling: true,
                                contextmenu: true,
                                formatOnPaste: true,
                                formatOnType: true,
                                suggestOnTriggerCharacters: true,
                                quickSuggestions: true,
                                wordBasedSuggestions: true,
                                acceptSuggestionOnCommitCharacter: true,
                                acceptSuggestionOnEnter: 'on'
                            }}
                        />
                    </div>

                    {/* Custom Input / Results Section */}
                    <div style={{
                        height: '50%',
                        borderTop: '1px solid #3d3d3d',
                        background: '#1e1e1e',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Section Header */}
                        <div style={{
                            height: '36px',
                            background: '#1e1e1e',
                            borderBottom: '1px solid #3d3d3d',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            justifyContent: 'space-between',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button
                                    onClick={() => setShowResults(false)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: !showResults ? '#eff1f6' : '#eff1f6bf',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        padding: 0,
                                        borderBottom: !showResults ? '2px solid #ffa116' : 'none'
                                    }}
                                >
                                    Testcase
                                </button>
                                <button
                                    onClick={() => showResults && setShowResults(true)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: showResults ? '#eff1f6' : '#eff1f6bf',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        padding: 0,
                                        borderBottom: showResults ? '2px solid #ffa116' : 'none'
                                    }}
                                >
                                    Test Result
                                </button>
                            </div>
                            {!showResults && (
                                <button
                                    onClick={addCustomInput}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #3d3d3d',
                                        color: '#eff1f6bf',
                                        fontSize: '12px',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                                    Add Testcase
                                </button>
                            )}
                        </div>

                        {/* Content Area */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
                            {!showResults ? (
                                /* Custom Input Section */
                                <div>
                                    {/* Input Tabs */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                        {customInputs.map((_, index) => (
                                            <div key={index} style={{ position: 'relative' }}>
                                                <button
                                                    onClick={() => setActiveCustomInput(index)}
                                                    style={{
                                                        background: activeCustomInput === index ? '#3d3d3d' : '#262626',
                                                        border: '1px solid #3d3d3d',
                                                        color: '#eff1f6',
                                                        fontSize: '12px',
                                                        padding: '6px 24px 6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Case {index + 1}
                                                </button>
                                                {customInputs.length > 1 && (
                                                    <button
                                                        onClick={() => removeCustomInput(index)}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '4px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#94a3b8',
                                                            fontSize: '14px',
                                                            cursor: 'pointer',
                                                            padding: '2px'
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Input Textarea */}
                                    <textarea
                                        value={customInputs[activeCustomInput] || ''}
                                        onChange={(e) => updateCustomInput(activeCustomInput, e.target.value)}
                                        placeholder="Enter your custom input here..."
                                        style={{
                                            width: '100%',
                                            height: '120px',
                                            background: '#0d1117',
                                            border: '1px solid #3d3d3d',
                                            borderRadius: '6px',
                                            color: '#e2e8f0',
                                            padding: '12px',
                                            fontSize: '13px',
                                            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                                            lineHeight: '1.6',
                                            resize: 'vertical',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            ) : (
                                /* Results Display */
                                <div>
                                    {results?.success ? (
                                        <div>
                                            {/* Overall Status */}
                                            <div style={{
                                                background: results.status === 'ACCEPTED' ? '#10b98115' : '#ef444415',
                                                border: `1px solid ${results.status === 'ACCEPTED' ? '#10b981' : '#ef4444'}`,
                                                borderRadius: '8px',
                                                padding: '16px',
                                                marginBottom: '16px'
                                            }}>
                                                <div style={{
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    color: results.status === 'ACCEPTED' ? '#10b981' : '#ef4444',
                                                    marginBottom: '8px'
                                                }}>
                                                    {results.status === 'ACCEPTED' ? '✓ Accepted' :
                                                        results.status === 'REJECTED' || results.status === 'WRONG_ANSWER' ? '✗ Wrong Answer' :
                                                            results.status === 'TIME_LIMIT_EXCEEDED' ? '⏱️ Time Limit Exceeded' :
                                                                results.status === 'RUNTIME_ERROR' || results.status === 'ERROR' ? '❌ Runtime Error' :
                                                                    `⚠️ ${results.status}`}
                                                </div>
                                                {results.testResults && (
                                                    <div style={{ color: '#eff1f6bf', fontSize: '14px' }}>
                                                        Passed: {results.testResults.passed}/{results.testResults.total} test cases
                                                    </div>
                                                )}
                                            </div>

                                            {/* Individual Test Results */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {results.results?.map((result, index) => (
                                                    <div key={index} style={{
                                                        background: '#262626',
                                                        border: '1px solid #3d3d3d',
                                                        borderRadius: '8px',
                                                        padding: '12px'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            marginBottom: '8px'
                                                        }}>
                                                            <span style={{
                                                                color: '#eff1f6',
                                                                fontSize: '13px',
                                                                fontWeight: 600
                                                            }}>
                                                                Test Case {result.testCase}
                                                            </span>
                                                            <span style={{
                                                                color: getStatusColor(result.status),
                                                                fontSize: '12px',
                                                                fontWeight: 600
                                                            }}>
                                                                {result.passed ? '✓ Passed' : result.status}
                                                            </span>
                                                        </div>

                                                        {result.input !== null && (
                                                            <div style={{ marginBottom: '8px' }}>
                                                                <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>Input:</div>
                                                                <pre style={{
                                                                    background: '#1a1a1a',
                                                                    padding: '8px',
                                                                    borderRadius: '4px',
                                                                    color: '#ffa116',
                                                                    fontSize: '12px',
                                                                    margin: 0,
                                                                    whiteSpace: 'pre-wrap'
                                                                }}>
                                                                    {result.input}
                                                                </pre>
                                                            </div>
                                                        )}

                                                        {result.actualOutput && (
                                                            <div>
                                                                <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>Output:</div>
                                                                <pre style={{
                                                                    background: '#1a1a1a',
                                                                    padding: '8px',
                                                                    borderRadius: '4px',
                                                                    color: result.passed ? '#10b981' : '#ef4444',
                                                                    fontSize: '12px',
                                                                    margin: 0,
                                                                    whiteSpace: 'pre-wrap'
                                                                }}>
                                                                    {result.actualOutput}
                                                                </pre>
                                                            </div>
                                                        )}

                                                        {result.expectedOutput && !result.passed && (
                                                            <div style={{ marginTop: '8px' }}>
                                                                <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>Expected:</div>
                                                                <pre style={{
                                                                    background: '#1a1a1a',
                                                                    padding: '8px',
                                                                    borderRadius: '4px',
                                                                    color: '#10b981',
                                                                    fontSize: '12px',
                                                                    margin: 0,
                                                                    whiteSpace: 'pre-wrap'
                                                                }}>
                                                                    {result.expectedOutput}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            background: '#ef444415',
                                            border: '1px solid #ef4444',
                                            borderRadius: '8px',
                                            padding: '16px'
                                        }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444' }}>
                                                Error
                                            </div>
                                            <div style={{ color: '#eff1f6bf', fontSize: '13px', marginTop: '8px' }}>
                                                {results?.error || 'An error occurred'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Bar with Run and Submit Buttons */}
                    <div style={{
                        height: '56px',
                        background: '#1e1e1e',
                        borderTop: '1px solid #3d3d3d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '0 16px',
                        gap: '10px',
                        flexShrink: 0
                    }}>
                        {/* Run Button */}
                        <button
                            onClick={handleRun}
                            disabled={selecting !== null}
                            style={{
                                background: 'transparent',
                                border: '1px solid #3d3d3d',
                                color: '#eff1f6',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: selecting !== null ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                opacity: selecting !== null ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (selecting === null) {
                                    e.currentTarget.style.background = '#3d3d3d';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selecting === null) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {selecting === 'run' ? (
                                <>
                                    <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                                    Running...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                                    Run
                                </>
                            )}
                        </button>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={selecting !== null}
                            style={{
                                background: selecting === null ? 'linear-gradient(to right, #10b981, #059669)' : '#3d3d3d',
                                border: 'none',
                                color: 'white',
                                padding: '8px 20px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: selecting !== null ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                boxShadow: selecting === null ? '0 2px 4px rgba(16, 185, 129, 0.2)' : 'none',
                                opacity: selecting !== null ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (selecting === null) {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selecting === null) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                                }
                            }}
                        >
                            {selecting === 'submit' ? (
                                <>
                                    <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                                    Submit
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
