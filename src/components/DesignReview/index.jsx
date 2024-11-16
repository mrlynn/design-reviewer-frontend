// components/DesignReview/index.jsx
import { useState, useEffect } from 'react';
import { config } from '../../config';
import TemplateSelector from './TemplateSelector';
import ReviewSection from './ReviewSection';
import ReviewSummary from './ReviewSummary';

export const DesignReview = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.API_URL}/api/templates`);
        if (!response.ok) {
          throw new Error('Failed to load templates');
        }
        const data = await response.json();
        console.log('Loaded templates:', data);
        setTemplates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleTemplateSelect = async (templateId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading template:', templateId);
      const response = await fetch(`${config.API_URL}/api/templates/${templateId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load template');
      }
      
      const template = await response.json();
      console.log('Selected template:', template);
      
      if (!template.sections || !Array.isArray(template.sections)) {
        throw new Error('Invalid template format: missing sections array');
      }
      
      setSelectedTemplate(template);
      setCurrentSection(0);
      setResponses({});
      setIsReviewComplete(false);
    } catch (err) {
      console.error('Error loading template:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSectionComplete = () => {
    if (selectedTemplate && currentSection < selectedTemplate.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setIsReviewComplete(true);
    }
  };

  const handleSectionBack = () => {
    setCurrentSection(Math.max(0, currentSection - 1));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-mongodb-mist rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-mongodb-mist rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!selectedTemplate) {
    return <TemplateSelector templates={templates} onSelect={handleTemplateSelect} />;
  }

  if (isReviewComplete) {
    return (
      <ReviewSummary
        template={selectedTemplate}
        responses={responses}
        onEdit={() => setIsReviewComplete(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-mongodb-slate">
            {selectedTemplate.name}
          </h2>
          <span className="text-mongodb-forest">
            Section {currentSection + 1} of {selectedTemplate.sections.length}
          </span>
        </div>
        <div className="bg-mongodb-lavender h-2 rounded-full">
          <div
            className="bg-mongodb-forest h-2 rounded-full transition-all"
            style={{
              width: `${((currentSection + 1) / selectedTemplate.sections.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Current Section */}
      <ReviewSection
        section={selectedTemplate.sections[currentSection]}
        responses={responses}
        onChange={handleResponseChange}
        onNext={handleSectionComplete}
        onBack={handleSectionBack}
        isFirstSection={currentSection === 0}
        isLastSection={currentSection === selectedTemplate.sections.length - 1}
      />
    </div>
  );
};

export default DesignReview;