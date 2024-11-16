import React, { useState, useEffect } from 'react';
import { config } from '../config';
import TemplateManager from './TemplateManager';

export function DesignReviewAnalysis() {
  const [formData, setFormData] = useState({
    customerName: '',
    reviewDate: new Date().toISOString().split('T')[0],
    primaryContact: '',
    additionalConsiderations: '',
    transcript: ''
  });
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [showReport, setShowReport] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Add this to prevent form submission
    console.log('Submitting analysis request...');
    
    if (!formData.customerName.trim() || !formData.transcript.trim()) {
      setError('Customer name and transcript are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Analysis failed');
      }

      setReport(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
      
      console.log('Analysis successful:', data);
      setReport(data);
      setShowReport(true);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze transcript');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const element = document.createElement('a');
    const file = new Blob([report.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `design-review-analysis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {serverStatus?.status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Server Connection Error</p>
          <p>{serverStatus.error}</p>
        </div>
      )}

      {!showReport ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-mongodb-slate mb-4">
            Design Review Analysis
          </h2>
          <p className="text-mongodb-forest mb-4">
            Paste your customer discussion transcript below for analysis.
          </p>
          <textarea
            className="w-full min-h-[200px] p-4 border rounded-lg mb-4 focus:ring-2 focus:ring-mongodb-spring focus:border-transparent"
            placeholder="Paste your customer discussion transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <div className="flex justify-end space-x-4">
            <button
              className={`px-6 py-2 rounded-lg text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-mongodb-green hover:bg-mongodb-forest'
              }`}
              onClick={handleAnalyze}
              disabled={loading || !transcript.trim()}
            >
              {loading ? 'Analyzing...' : 'Generate Analysis'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-mongodb-slate">Analysis Report</h2>
            <div className="space-x-4">
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-mongodb-mist text-mongodb-slate rounded-lg hover:bg-mongodb-lavender"
              >
                Back to Input
              </button>
              <button
                onClick={downloadReport}
                className="px-4 py-2 bg-mongodb-green text-white rounded-lg hover:bg-mongodb-forest"
              >
                Download Report
              </button>
            </div>
          </div>

          <div className="prose max-w-none">
            {typeof report?.content === 'string' ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                className="markdown-content"
              >
                {report.content}
              </ReactMarkdown>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-2">What We Heard</h3>
                <p>{report?.whatWeHeard}</p>

                <h3 className="text-xl font-semibold mt-6 mb-2">Issues and Antipatterns</h3>
                <ul className="list-disc pl-6">
                  {report?.issues?.map((issue, index) => (
                    <li key={index} className="mb-2">{issue}</li>
                  ))}
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-2">Recommendations</h3>
                <ul className="list-disc pl-6">
                  {report?.recommendations?.map((rec, index) => (
                    <li key={index} className="mb-2">{rec}</li>
                  ))}
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-2">Reference Links</h3>
                <ul className="list-disc pl-6">
                  {report?.references?.map((ref, index) => (
                    <li key={index} className="mb-2">
                      <a
                        href={ref.url}
                        className="text-mongodb-green hover:text-mongodb-forest hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ref.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}