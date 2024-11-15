import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ragService } from '@/services/ragService';

const RAGSearch = () => {
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
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
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
            <div className="mt-2 flex flex-wrap gap-2">
              {result.metadata.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RAGSearch;