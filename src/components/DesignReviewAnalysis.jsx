import React, { useState, useEffect } from 'react';
import { config } from '../config';

export function DesignReviewAnalysis() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  // Check server health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/health`);
        const data = await response.json();
        setServerStatus(data);
        console.log('Server status:', data);
      } catch (err) {
        console.error('Health check failed:', err);
        setServerStatus({ status: 'error', error: err.message });
      }
    };

    checkHealth();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending analysis request...');
      
      const response = await fetch(`${config.API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Analysis failed');
      }
      
      console.log('Analysis successful');
      setReport(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze transcript');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {serverStatus?.status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Server Connection Error</p>
          <p>{serverStatus.error}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error during analysis:</p>
          <p>{error}</p>
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6">
        <textarea
          className="w-full min-h-[200px] p-4 border rounded-lg mb-4"
          placeholder="Paste your customer discussion transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <button
          className={`w-full py-2 px-4 rounded-lg text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={handleAnalyze}
          disabled={loading || !transcript.trim()}
        >
          {loading ? 'Analyzing...' : 'Analyze Transcript'}
        </button>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {report && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">What We Heard</h3>
            <p>{report.whatWeHeard}</p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2">Issues and Antipatterns</h3>
            <ul className="list-disc pl-6">
              {report.issues.map((issue, index) => (
                <li key={index} className="mb-2">{issue}</li>
              ))}
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
            <ul className="list-disc pl-6">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="mb-2">{rec}</li>
              ))}
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2">Reference Links</h3>
            <ul className="list-disc pl-6">
              {report.references.map((ref, index) => (
                <li key={index} className="mb-2">
                  <a 
                    href={ref.url}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ref.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}