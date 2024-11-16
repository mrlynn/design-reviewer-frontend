import { useState, useEffect } from 'react';
import { config } from '../../config';
import TemplateSelector from './TemplateSelector';
import ReviewSection from './ReviewSection';
import ReviewSummary from './ReviewSummary';
import TemplateEditor from '../templateEditor';
import { Settings } from 'lucide-react';

export const DesignReview = () => {
  // Template Management State
  const [templates, setTemplates] = useState([]);
  const [isManageMode, setIsManageMode] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Review Process State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Template Management Handlers
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`${config.API_URL}/api/templates/${templateId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Failed to delete template:', error);
      setError('Failed to delete template: ' + error.message);
    }
  };

  const handleSaveTemplate = async (updatedTemplate) => {
    try {
      const response = await fetch(`${config.API_URL}/api/templates/${updatedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTemplate),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      // Refresh templates list
      const updatedTemplates = templates.map(t => 
        t.id === updatedTemplate.id ? updatedTemplate : t
      );
      setTemplates(updatedTemplates);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to save template:', error);
      setError('Failed to save template: ' + error.message);
    }
  };

  // Load Templates
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

  // Review Process Handlers
  const handleTemplateSelect = async (templateId) => {
    if (isManageMode) return; // Prevent selection in manage mode
    
    try {
      setIsLoading(true);
      setError(null);
  
      const response = await fetch(`${config.API_URL}/api/templates/${templateId}`);
      if (!response.ok) {
        throw new Error('Failed to load template');
      }
  
      const template = await response.json();
  
      // Normalize sections to ensure it's always an array
      const sections = template?.currentContent?.sections || [];
  
      // Log for debugging
      console.log('Loaded template sections:', sections);
  
      setSelectedTemplate({
        ...template,
        currentContent: {
          ...template.currentContent,
          sections, // Ensure sections is always an array
        },
      });
  
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
    const sections = selectedTemplate?.currentContent?.sections || [];
    
    if (selectedTemplate && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setIsReviewComplete(true);
    }
  };

  const handleSectionBack = () => {
    setCurrentSection(Math.max(0, currentSection - 1));
  };

  // Loading State
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

  // Error State
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

  // Template Editor
  if (editingTemplate) {
    console.log('editingTemplate', editingTemplate);
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => setEditingTemplate(null)}
      />
    );
  }

  // Template Selection
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
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          isManageMode={isManageMode}
        />
      </div>
    );
  }

  // Review Complete
  if (isReviewComplete) {
    return (
      <ReviewSummary
        template={selectedTemplate}
        responses={responses}
        onEdit={() => setIsReviewComplete(false)}
      />
    );
  }

  // Review Process
  if (selectedTemplate) {
    const sections = selectedTemplate.currentContent?.sections || []; // Ensure sections is always an array
  
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-mongodb-slate">
              {selectedTemplate.name}
            </h2>
            <span className="text-mongodb-forest">
              Section {currentSection + 1} of {sections.length}
            </span>
          </div>
          <div className="bg-mongodb-lavender h-2 rounded-full">
            <div
              className="bg-mongodb-forest h-2 rounded-full transition-all"
              style={{
                width: `${((currentSection + 1) / sections.length) * 100}%`
              }}
            />
          </div>
        </div>
  
        {/* Current Section */}
        {sections.length > 0 ? (
          <ReviewSection
            section={sections[currentSection]}
            responses={responses}
            onChange={handleResponseChange}
            onNext={handleSectionComplete}
            onBack={handleSectionBack}
            isFirstSection={currentSection === 0}
            isLastSection={currentSection === sections.length - 1}
          />
        ) : (
          <p className="text-center text-gray-500">No sections available in this template.</p>
        )}
      </div>
    );
  }
}

export default DesignReview;