// components/DesignReview/index.jsx
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { config } from '../../config';
import TemplateSelector from './TemplateSelector';
import ReviewSection from './ReviewSection';
import ReviewSummary from './ReviewSummary';

export const DesignReview = () => {
  // Template Management State
  const [templates, setTemplates] = useState([]);
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Review Process State
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.API_URL}/api/templates`);
      if (!response.ok) throw new Error('Failed to load templates');
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = async (updatedTemplate) => {
    // Update the templates list with the new version
    setTemplates(prev => prev.map(t => 
      t.templateId === updatedTemplate.templateId ? updatedTemplate : t
    ));
  };

  const handleTemplateSelect = async (template) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load the full template with all sections
      const response = await fetch(`${config.API_URL}/api/templates/${template.templateId}`);
      if (!response.ok) throw new Error('Failed to load template');
      
      const fullTemplate = await response.json();
      
      // Get the current version's content
      const currentVersion = fullTemplate.versions.find(v => v.version === fullTemplate.currentVersion);
      if (!currentVersion) throw new Error('No current version found');

      setSelectedTemplate({
        ...fullTemplate,
        currentContent: currentVersion.content // This includes sections, globalPromptContext, etc.
      });

      // Reset review state
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

  // Handle responses for the current section
  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSectionComplete = () => {
    if (selectedTemplate && currentSection < selectedTemplate.currentContent.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setIsReviewComplete(true);
    }
  };

  const handleSectionBack = () => {
    setCurrentSection(Math.max(0, currentSection - 1));
  };

  // Loading state
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

  // Error state
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

  // Template Selection View
  if (!selectedTemplate) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-mongodb-slate">
            Design Review Templates
          </h1>
          <button
            onClick={() => setIsManageMode(!isManageMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isManageMode 
                ? 'bg-mongodb-mist text-mongodb-slate' 
                : 'bg-mongodb-mist text-mongodb-green'
            }`}
          >
            <Settings size={18} />
            {isManageMode ? 'Exit Management Mode' : 'Manage Templates'}
          </button>
        </div>
        
        <TemplateSelector
          templates={templates}
          onSelect={handleTemplateSelect}
          onTemplateChange={handleTemplateChange}
          isManageMode={isManageMode}
        />
      </div>
    );
  }

  // Review Complete View
  if (isReviewComplete) {
    return (
      <ReviewSummary
        template={selectedTemplate}
        responses={responses}
        onRestart={() => {
          setSelectedTemplate(null);
          setResponses({});
          setCurrentSection(0);
          setIsReviewComplete(false);
        }}
      />
    );
  }

  // Review Process View
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-mongodb-slate">
            {selectedTemplate.name}
          </h2>
          <span className="text-mongodb-forest">
            Section {currentSection + 1} of {selectedTemplate.currentContent.sections.length}
          </span>
        </div>
        <div className="bg-mongodb-lavender h-2 rounded-full">
          <div
            className="bg-mongodb-forest h-2 rounded-full transition-all"
            style={{
              width: `${((currentSection + 1) / selectedTemplate.currentContent.sections.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Current Section */}
      <ReviewSection
        section={selectedTemplate.currentContent.sections[currentSection]}
        responses={responses}
        onChange={handleResponseChange}
        onNext={handleSectionComplete}
        onBack={handleSectionBack}
        isFirstSection={currentSection === 0}
        isLastSection={currentSection === selectedTemplate.currentContent.sections.length - 1}
      />
    </div>
  );
};

export default DesignReview;