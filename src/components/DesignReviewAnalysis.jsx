import React, { useState, useEffect } from 'react';
import { config } from '../config';

export function DesignReviewAnalysis() {
  const [formData, setFormData] = useState({
    customerName: '',
    reviewDate: new Date().toISOString().split('T')[0],
    primaryContact: '',
    additionalConsiderations: '',
    transcript: ''
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/health`);
        if (!response.ok) throw new Error('Health check failed');
        const data = await response.json();
        setServerStatus(data);
        console.log('Health check response:', data);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {serverStatus?.status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Server Connection Error</p>
          <p>{serverStatus.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-mongodb-slate mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              name="customerName"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-mongodb-green focus:border-transparent"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mongodb-slate mb-1">
              Date of Design Review
            </label>
            <input
              type="date"
              name="reviewDate"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-mongodb-green focus:border-transparent"
              value={formData.reviewDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mongodb-slate mb-1">
              Primary Contact
            </label>
            <input
              type="text"
              name="primaryContact"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-mongodb-green focus:border-transparent"
              value={formData.primaryContact}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mongodb-slate mb-1">
              Additional Considerations
            </label>
            <input
              type="text"
              name="additionalConsiderations"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-mongodb-green focus:border-transparent"
              value={formData.additionalConsiderations}
              onChange={handleChange}
              placeholder="Special requirements or constraints..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-mongodb-slate mb-1">
            Discussion Transcript *
          </label>
          <textarea
            name="transcript"
            className="w-full min-h-[200px] p-4 border rounded-lg focus:ring-2 focus:ring-mongodb-green focus:border-transparent"
            placeholder="Paste your customer discussion transcript here..."
            value={formData.transcript}
            onChange={handleChange}
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg text-white transition-colors ${
            loading 
              ? 'bg-mongodb-slate cursor-not-allowed' 
              : 'bg-mongodb-green hover:bg-mongodb-forest'
          }`}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Transcript'}
        </button>
      </form>

      {report && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="border-b border-mongodb-mist pb-4">
            <h2 className="text-2xl font-bold text-mongodb-slate">Design Review Report</h2>
            <div className="text-sm text-mongodb-slate mt-2">
              <p>Customer: {formData.customerName}</p>
              <p>Date: {new Date(formData.reviewDate).toLocaleDateString()}</p>
              <p>Contact: {formData.primaryContact}</p>
            </div>
          </div>

          <section>
            <h3 className="text-xl font-semibold text-mongodb-slate mb-2">What We Heard</h3>
            <p className="text-mongodb-slate">{report.whatWeHeard}</p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold text-mongodb-slate mb-2">Issues and Antipatterns</h3>
            <ul className="list-disc pl-6 text-mongodb-slate">
              {report.issues.map((issue, index) => (
                <li key={index} className="mb-2">{issue}</li>
              ))}
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold text-mongodb-slate mb-2">Recommendations</h3>
            <ul className="list-disc pl-6 text-mongodb-slate">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="mb-2">{rec}</li>
              ))}
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold text-mongodb-slate mb-2">Reference Links</h3>
            <ul className="list-disc pl-6">
              {report.references.map((ref, index) => (
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
          </section>
        </div>
      )}
    </div>
  );
}