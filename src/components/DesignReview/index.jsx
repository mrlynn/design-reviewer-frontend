// frontend/design-review-app/src/components/DesignReview/index.jsx
import { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import ReviewSection from './ReviewSection';
import ReviewSummary from './ReviewSummary';
import { reviewTemplates } from '../../data/reviewTemplates';

export const DesignReview = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [isReviewComplete, setIsReviewComplete] = useState(false);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(reviewTemplates[templateId]);
    setCurrentSection(0);
    setResponses({});
    setIsReviewComplete(false);
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSectionComplete = () => {
    if (currentSection < selectedTemplate.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setIsReviewComplete(true);
    }
  };

  const handleSectionBack = () => {
    setCurrentSection(Math.max(0, currentSection - 1));
  };

  const handleReviewComplete = async () => {
    // Generate final review document
    const document = {
      template: selectedTemplate.name,
      responses: responses,
      timestamp: new Date().toISOString()
    };
    
    console.log('Review completed:', document);
    // Here you would typically save the document or trigger further processing
  };

  if (!selectedTemplate) {
    return <TemplateSelector onSelect={handleTemplateSelect} />;
  }

  if (isReviewComplete) {
    return (
      <ReviewSummary
        template={selectedTemplate}
        responses={responses}
        onComplete={handleReviewComplete}
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