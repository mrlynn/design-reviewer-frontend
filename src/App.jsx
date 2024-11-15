// frontend/src/App.jsx
import { DesignReviewAnalysis } from './components/DesignReviewAnalysis'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Design Review Analysis</h1>
        <DesignReviewAnalysis />
      </div>
    </div>
  )
}

export default App