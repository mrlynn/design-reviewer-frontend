import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, Database, FileText, Settings, Trash2, Plus, Search, X } from 'lucide-react';
import { config } from '../../config';
import ReactMarkdown from 'react-markdown';


const QuestionAnswerSection = ({
    question,
    setQuestion,
    handleAskQuestion,
    response,
    isAsking,
    error
}) => {
    return (
        <div className="bg-mongodb-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-mongodb-slate mb-4">Ask the Knowledge Base</h2>

            {/* Question Input Area */}
            <div className="space-y-4">
                <div className="relative">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask about MongoDB design patterns, schema design, indexing strategies, or best practices..."
                        className="w-full min-h-[120px] p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-transparent resize-none"
                        disabled={isAsking}
                    />
                    <Search className="absolute right-4 top-4 text-gray-400 w-5 h-5" />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleAskQuestion}
                        disabled={isAsking || !question.trim()}
                        className={`
                            flex items-center gap-2 px-6 py-2 rounded-lg transition-colors
                            ${isAsking || !question.trim()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-mongodb-spring text-mongodb-evergreen hover:bg-mongodb-mist'
                            }
                        `}
                    >
                        {isAsking ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Ask Question'
                        )}
                    </button>
                </div>
            </div>

            {/* Response Display with Markdown Rendering */}
            {response && (
                <div className="mt-6">
                    <div className="bg-mongodb-lavender rounded-lg p-6">
                        <h3 className="text-lg font-bold text-mongodb-slate mb-4">Response</h3>
                        <div className="prose prose-sm max-w-none text-mongodb-slate">
                            <ReactMarkdown
                                components={{
                                    // Customize how different markdown elements are rendered
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                    code: ({node, inline, ...props}) => (
                                        inline 
                                            ? <code className="bg-gray-100 text-mongodb-forest px-1 py-0.5 rounded" {...props} />
                                            : <code className="block bg-gray-100 p-4 rounded-lg overflow-x-auto" {...props} />
                                    ),
                                    pre: ({node, ...props}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                                    blockquote: ({node, ...props}) => (
                                        <blockquote className="border-l-4 border-mongodb-green pl-4 italic my-4" {...props} />
                                    ),
                                }}
                            >
                                {response}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

const RAGManager = () => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [error, setError] = useState(null);
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState(null);
    const [isAsking, setIsAsking] = useState(false);
    const [stats, setStats] = useState({
        totalDocuments: 0,
        totalEmbeddings: 0,
        lastUpdated: null
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            await Promise.all([
                loadDocuments(),
                loadStats()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Failed to load initial data');
        } finally {
            setIsLoading(false);
        }
    };

    const loadDocuments = async () => {
        try {
            console.log('Fetching documents...');
            const response = await fetch(`${config.API_URL}/api/rag/documents`);

            if (!response.ok) {
                throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Documents loaded:', data);

            // Set the documents in state
            setDocuments(data);

            return data;
        } catch (error) {
            console.error('Error loading documents:', error);
            setError('Failed to load documents');
            throw error;
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/rag/stats`);
            if (!response.ok) throw new Error('Failed to load stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
            setError('Failed to load system stats');
        }
    };

    const handleFileUpload = async (files) => {
        try {
            setIsLoading(true);
            setError(null);

            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('documents', file);
            });

            const response = await fetch(`${config.API_URL}/api/rag/ingest`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload documents');
            }

            // Reload documents and stats after successful upload
            await loadInitialData();

        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
            setShowUpload(false);
        }
    };

    const handleReprocess = async (documentId) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${config.API_URL}/api/rag/reprocess/${documentId}`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reprocess document');
            }

            await loadInitialData();

        } catch (error) {
            console.error('Reprocess error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (!confirm('Are you sure you want to delete this document and its embeddings?')) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${config.API_URL}/api/rag/documents/${documentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete document');
            }

            await loadInitialData();

        } catch (error) {
            console.error('Delete error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!question.trim()) {
            setError('Please enter a question.');
            return;
        }

        try {
            setIsAsking(true);
            setResponse(null); // Clear any previous response
            setError(null);

            const res = await fetch(`${config.API_URL}/api/rag/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch the response.');
            }

            setResponse(data.answer);
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsAsking(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-mongodb-slate">RAG System Management</h1>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-mongodb-mist text-mongodb-evergreen rounded-lg hover:bg-mongodb-spring hover:text-mongodb-white"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Documents
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-mongodb-slate mb-4">Ask the Knowledge Base</h2>
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter your question..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <button
                            onClick={handleAskQuestion}
                            disabled={isAsking}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                isAsking ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                       : 'bg-mongodb-spring text-mongodb-evergreen hover:bg-mongodb-mist'
                            }`}
                        >
                            {isAsking ? 'Asking...' : 'Ask'}
                        </button>
                    </div>

                    {response && (
                        <div className="mt-6 p-4 bg-mongodb-lavender rounded-lg">
                            <h3 className="text-lg font-bold">Response:</h3>
                            <div className="prose prose-sm max-w-none text-mongodb-slate">
                            <ReactMarkdown
                                components={{
                                    // Customize how different markdown elements are rendered
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                    code: ({node, inline, ...props}) => (
                                        inline 
                                            ? <code className="bg-gray-100 text-mongodb-forest px-1 py-0.5 rounded" {...props} />
                                            : <code className="block bg-gray-100 p-4 rounded-lg overflow-x-auto" {...props} />
                                    ),
                                    pre: ({node, ...props}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                                    blockquote: ({node, ...props}) => (
                                        <blockquote className="border-l-4 border-mongodb-green pl-4 italic my-4" {...props} />
                                    ),
                                }}
                            >
                                {response}
                            </ReactMarkdown>
                        </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-800 rounded-lg">
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-2 text-mongodb-forest mb-2">
                            <FileText className="w-5 h-5" />
                            <h3 className="font-semibold">Total Documents</h3>
                        </div>
                        <p className="text-2xl font-bold text-mongodb-slate">{stats.totalDocuments}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-2 text-mongodb-forest mb-2">
                            <Database className="w-5 h-5" />
                            <h3 className="font-semibold">Total Embeddings</h3>
                        </div>
                        <p className="text-2xl font-bold text-mongodb-slate">{stats.totalEmbeddings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-2 text-mongodb-forest mb-2">
                            <Settings className="w-5 h-5" />
                            <h3 className="font-semibold">Last Updated</h3>
                        </div>
                        <p className="text-mongodb-slate">
                            {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}
                        </p>
                    </div>
                </div>

                {/* Document List */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-mongodb-slate mb-4">Documents</h2>
                        <div className="overflow-x-auto">
                            {documents.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No documents found. Upload some documents to get started.
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4">Name</th>
                                            <th className="text-left py-3 px-4">Type</th>
                                            <th className="text-left py-3 px-4">Status</th>
                                            <th className="text-left py-3 px-4">Embeddings</th>
                                            <th className="text-left py-3 px-4">Last Updated</th>
                                            <th className="text-right py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map(doc => (
                                            <tr key={doc._id || doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-mongodb-forest" />
                                                        {doc.metadata?.sourceFile || doc.name || 'Unnamed Document'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{doc.metadata?.type || doc.type || 'unknown'}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        doc.status === 'processed' ? 'bg-green-100 text-green-800' :
                                                        doc.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {doc.status || 'processed'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{doc.embeddingCount || 1}</td>
                                                <td className="py-3 px-4">
                                                    {new Date(doc.metadata?.timestamp || doc.updatedAt).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleReprocess(doc._id || doc.id)}
                                                            className="p-1 text-gray-500 hover:text-mongodb-spring"
                                                            title="Reprocess Document"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(doc._id || doc.id)}
                                                            className="p-1 text-gray-500 hover:text-red-600"
                                                            title="Delete Document"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-xl w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-mongodb-slate">Upload Documents</h3>
                                <button
                                    onClick={() => setShowUpload(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    handleFileUpload(e.dataTransfer.files);
                                }}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                    <Upload className="w-12 h-12 text-mongodb-forest" />
                                    <p className="text-mongodb-slate">
                                        Drag and drop files here, or click to select files
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supports .md, .txt, .pdf, and .html files
                                    </p>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4">
                        <RefreshCw className="w-8 h-8 text-mongodb-spring animate-spin" />
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-2 right-2 text-red-700 hover:text-red-900"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RAGManager;