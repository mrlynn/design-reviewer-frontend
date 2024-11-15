// frontend/design-review-app/src/App.jsx
import { useState } from 'react'
import { DesignReviewAnalysis } from './components/DesignReviewAnalysis'
import { DesignReview } from './components/DesignReview/index.jsx'
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [activeTab, setActiveTab] = useState('analysis')

  return (
    <div className="min-h-screen bg-mongodb-lavender">
      <nav className="bg-mongodb-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-mongodb-white text-2xl font-bold">
            MongoDB Design Assistant
          </h1>
        </div>
      </nav>

      <main className="container mx-auto py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 mx-2 rounded-lg transition-colors ${
              activeTab === 'analysis' 
                ? 'bg-mongodb-forest text-white' 
                : 'bg-mongodb-mist text-mongodb-slate hover:bg-mongodb-spring'
            }`}
            onClick={() => setActiveTab('analysis')}
          >
            Design Review Analysis
          </button>
          <button
            className={`px-6 py-2 mx-2 rounded-lg transition-colors ${
              activeTab === 'template' 
                ? 'bg-mongodb-forest text-white' 
                : 'bg-mongodb-mist text-mongodb-slate hover:bg-mongodb-spring'
            }`}
            onClick={() => setActiveTab('template')}
          >
            Design Review Template
          </button>
        </div>

        {/* Content */}
        <ErrorBoundary>
          {activeTab === 'analysis' ? (
            <DesignReviewAnalysis />
          ) : (
            <DesignReview />
          )}
        </ErrorBoundary>
        </main>
    </div>
  )
}

export default App