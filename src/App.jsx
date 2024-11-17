import React, { useState } from 'react';
import Navigation from './components/Navigation';
import DesignReview from './components/DesignReview';
import RAGManager from './components/RAGManager';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [mode, setMode] = useState('review');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleModeChange = (newMode) => {
    // If coming from templates mode, handle appropriately
    if (mode === 'templates') {
      setMode('review');
      return;
    }
    setMode(newMode);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMode('review'); // Switch back to review mode after selecting a template
  };

  const renderContent = () => {
    switch (mode) {
      case 'review':
        return (
          <DesignReview 
            template={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
        );
      case 'rag':
        return <RAGManager />;
      default:
        return (
          <DesignReview 
            template={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        activeMode={mode}
        onModeChange={handleModeChange}
      />      
      <main className="py-8">
        <ErrorBoundary>
          {renderContent()}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;