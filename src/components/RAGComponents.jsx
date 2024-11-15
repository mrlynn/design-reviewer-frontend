import { useState } from 'react';
import { ragService } from '../services/ragService';

export const RAGSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ragService.search(query);
      setResults(response.results);
    } catch (err) {
      setError('Failed to search documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search design patterns and documentation..."
            className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            Search
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-4">Loading...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg text-gray-900">
                  {result.metadata.title || 'Untitled'}
                </h3>
                <p className="text-sm text-gray-500">
                  Source: {result.metadata.fileName}
                </p>
              </div>
              <span className="text-sm text-gray-500">
                Score: {result.score.toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{result.content}</p>
            {result.metadata.tags && (
              <div className="mt-2 flex flex-wrap gap-2">
                {result.metadata.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const FileUpload = () => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    setStatus(null);

    try {
      for (const file of files) {
        const metadata = {
          tags: ['design-pattern'],
          category: 'documentation'
        };

        await ragService.ingestFile(file, metadata);
      }
      
      setStatus({
        type: 'success',
        message: `Successfully processed ${files.length} file(s)`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to process files. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="mt-4 text-sm text-gray-600">
          Drag and drop files here, or{' '}
          <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
            browse
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileSelect}
              accept=".md,.html,.pdf"
            />
          </label>
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Supported formats: PDF, HTML, Markdown
        </p>
      </div>

      {uploading && (
        <div className="mt-4 text-center">
          <p className="mt-2 text-sm text-gray-600">Processing files...</p>
        </div>
      )}

      {status && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
};