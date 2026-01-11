import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { codeAPI } from '../utils/api';

const LANGUAGES = {
    py: { name: 'Python', monaco: 'python', template: '# Write your Python code here\nprint("Hello, World!")' },
    cpp: { name: 'C++', monaco: 'cpp', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
    java: { name: 'Java', monaco: 'java', template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    js: { name: 'JavaScript', monaco: 'javascript', template: '// Write your JavaScript code here\nconsole.log("Hello, World!");' },
};

export default function CodeEditor() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const editorRef = useRef(null);

    const [language, setLanguage] = useState('py');
    const [code, setCode] = useState(LANGUAGES.py.template);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        setCode(LANGUAGES[newLang].template);
        setInput('');
        setOutput('');
        setStatus('');
    };

    const handleRunCode = async () => {
        setLoading(true);
        setOutput('');
        setStatus('RUNNING');

        try {
            const result = await codeAPI.submit({
                language,
                code: editorRef.current.getValue(),
                input: input.trim() || undefined,
            });

            setStatus(result.status);
            setOutput(result.output || '[No output]');
        } catch (error) {
            setStatus('ERROR');
            setOutput(error.response?.data?.message || 'Failed to execute code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getStatusColor = () => {
        if (status === 'EXECUTED') return '#10b981';
        if (status === 'ERROR') return '#ef4444';
        if (status === 'TIMEOUT') return '#f59e0b';
        if (status === 'RUNNING') return '#3b82f6';
        return '#94a3b8';
    };

    const getStatusIcon = () => {
        if (status === 'EXECUTED') return 'check_circle';
        if (status === 'ERROR') return 'error';
        if (status === 'TIMEOUT') return 'schedule';
        if (status === 'RUNNING') return 'hourglass_empty';
        return 'code';
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
            {/* Header */}
            <header style={{
                height: '56px',
                background: '#161b22',
                borderBottom: '1px solid #30363d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <span className="material-symbols-outlined" style={{ color: '#137fec', fontSize: '24px' }}>
                            terminal
                        </span>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>CodePulse</span>
                    </div>

                    <div style={{ height: '24px', width: '1px', background: '#30363d' }} />

                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Code Editor</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #30363d',
                            color: '#cbd5e1',
                            padding: '6px 16px',
                            borderRadius: '6px',
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
                        onClick={() => navigate('/profile')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #30363d',
                            color: '#cbd5e1',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                        {user?.full_name || 'Profile'}
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'transparent',
                            border: '1px solid #30363d',
                            color: '#cbd5e1',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex' }}>
                {/* Editor Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #30363d' }}>
                    {/* Toolbar */}
                    <div style={{
                        height: '48px',
                        background: '#0d1117',
                        borderBottom: '1px solid #30363d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px'
                    }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {Object.entries(LANGUAGES).map(([key, lang]) => (
                                <button
                                    key={key}
                                    onClick={() => handleLanguageChange(key)}
                                    style={{
                                        background: language === key ? '#137fec' : 'transparent',
                                        border: language === key ? 'none' : '1px solid #30363d',
                                        color: language === key ? 'white' : '#94a3b8',
                                        padding: '6px 16px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 600
                                    }}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleRunCode}
                            disabled={loading}
                            style={{
                                background: '#10b981',
                                border: 'none',
                                color: 'white',
                                padding: '8px 24px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                    Running...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
                                    Run Code
                                </>
                            )}
                        </button>
                    </div>

                    {/* Monaco Editor */}
                    <div style={{ flex: 1, height: 'calc(100% - 180px)' }}>
                        <Editor
                            height="100%"
                            language={LANGUAGES[language].monaco}
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
                            }}
                        />
                    </div>

                    {/* Input Section */}
                    <div style={{
                        height: '180px',
                        borderTop: '1px solid #30363d',
                        background: '#0d1117',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            height: '40px',
                            background: '#0d1117',
                            borderBottom: '1px solid #30363d',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#137fec', fontSize: '18px' }}>
                                    input
                                </span>
                                <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Input (stdin)</span>
                            </div>
                            {input && (
                                <button
                                    onClick={() => setInput('')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#64748b',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>clear</span>
                                    Clear
                                </button>
                            )}
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter input for your program (one value per line)..."
                            style={{
                                flex: 1,
                                background: '#0d1117',
                                border: 'none',
                                color: '#e2e8f0',
                                padding: '12px 16px',
                                fontSize: '13px',
                                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                                lineHeight: '1.6',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Output Panel */}
                <div style={{ width: '400px', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
                    {/* Output Header */}
                    <div style={{
                        height: '48px',
                        background: '#0d1117',
                        borderBottom: '1px solid #30363d',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Output</span>
                        {status && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: getStatusColor(),
                                fontSize: '12px',
                                fontWeight: 700
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                    {getStatusIcon()}
                                </span>
                                {status}
                            </div>
                        )}
                    </div>

                    {/* Output Content */}
                    <div style={{
                        flex: 1,
                        padding: '16px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        lineHeight: '1.6'
                    }}>
                        {!output && !loading && (
                            <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '40px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>
                                    code
                                </span>
                                <p style={{ marginTop: '16px' }}>Run your code to see the output here</p>
                            </div>
                        )}

                        {loading && (
                            <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '40px' }}>
                                <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto', marginBottom: '16px' }}></div>
                                <p>Executing your code...</p>
                            </div>
                        )}

                        {output && (
                            <div style={{
                                background: '#161b22',
                                border: `1px solid ${status === 'EXECUTED' ? '#10b98133' : status === 'ERROR' ? '#ef444433' : '#30363d'}`,
                                borderRadius: '6px',
                                padding: '16px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: status === 'EXECUTED' ? '#d1fae5' : status === 'ERROR' ? '#fecaca' : '#e2e8f0'
                            }}>
                                {output}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
