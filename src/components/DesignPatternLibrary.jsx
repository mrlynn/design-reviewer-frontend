// frontend/src/components/DesignPatternLibrary.jsx
import { useState } from 'react';
import { ragService } from '../services/ragService';

export const DesignPatternLibrary = () => {
    const [showUpload, setShowUpload] = useState(false);
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

  const handleFileUpload = async (files) => {
    setLoading(true);
    setError(null);

    try {
      for (const file of files) {
        const metadata = {
          tags: ['design-pattern'],
          category: 'documentation'
        };

        await ragService.ingestFile(file, metadata);
      }
      setShowUpload(false);
      // Optionally refresh search results or show success message
    } catch (error) {
      setError('Failed to upload files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-mongodb-slate">Search Design Patterns</h2>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-mongodb-forest text-white rounded-lg hover:bg-mongodb-evergreen transition-colors"
          >
            {showUpload ? 'Hide Upload' : 'Upload Documents'}
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search MongoDB design patterns..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-mongodb-forest text-white rounded-lg hover:bg-mongodb-evergreen transition-colors"
              disabled={loading}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="mb-8">
          <div
            className="border-2 border-dashed border-mongodb-forest rounded-lg p-8 text-center bg-mongodb-lavender"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <p className="text-mongodb-slate">
              Drag and drop files here, or{' '}
              <label className="text-mongodb-forest hover:text-mongodb-evergreen cursor-pointer">
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
            <p className="mt-2 text-sm text-mongodb-slate opacity-75">
              Supported formats: PDF, HTML, Markdown
            </p>
          </div>
        </div>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mongodb-forest mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4 border-l-4 border-red-500">
          {error}
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-mongodb-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-mongodb-mist"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg text-mongodb-slate">
                  {result.metadata.title || 'Untitled'}
                </h3>
                <p className="text-sm text-mongodb-forest">
                  Source: {result.metadata.fileName}
                </p>
              </div>
              <span className="text-sm text-mongodb-forest bg-mongodb-mist px-2 py-1 rounded">
                Score: {result.score.toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-mongodb-slate">{result.content}</p>
            {result.metadata.tags && (
              <div className="mt-2 flex flex-wrap gap-2">
                {result.metadata.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-mongodb-lavender text-mongodb-forest text-xs rounded"
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