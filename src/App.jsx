import React, { useState } from 'react';
import Navigation from './components/Navigation';
import { DesignReview } from './components/DesignReview';
import TemplateManager from './components/TemplateManager';
import RAGManager from './components/RAGManager';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [mode, setMode] = useState('review');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMode('review'); // Switch back to review mode after selecting a template
  };
  const renderContent = () => {
    switch (mode) {
      case 'review':
        return <DesignReview template={selectedTemplate} />;
      case 'templates':
        return (
          <TemplateManager 
            onClose={() => setMode('review')}
            onTemplateSelect={handleTemplateSelect}
            currentTemplateId={selectedTemplate?.id}
          />
        );
      case 'rag':
        return <RAGManager />;
      default:
        return <DesignReview template={selectedTemplate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeMode={mode} onModeChange={setMode} />
      <main className="py-8">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;