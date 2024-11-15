import { useState } from 'react';

const DesignReviewTemplate = () => {
  const [reviewType, setReviewType] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});

  const reviewTypes = [
    {
      id: 'new-development',
      name: 'New Development',
      description: 'Starting a new application with MongoDB',
      icon: '🆕'
    },
    {
      id: 'modernization',
      name: 'Application Modernization',
      description: 'Modernizing an existing application with MongoDB',
      icon: '🔄'
    },
    {
      id: 'migration',
      name: 'Database Migration',
      description: 'Migrating from another database to MongoDB',
      icon: '🔄'
    },
    {
      id: 'performance',
      name: 'Performance Review',
      description: 'Optimizing an existing MongoDB implementation',
      icon: '⚡'
    }
  ];

  const reviewSteps = {
    'new-development': [
      {
        title: 'Project Overview',
        questions: [
          {
            id: 'project-description',
            type: 'text',
            label: 'Project Description',
            placeholder: 'Brief description of the project'
          },
          {
            id: 'business-requirements',
            type: 'textarea',
            label: 'Business Requirements',
            placeholder: 'Key business requirements'
          },
          {
            id: 'scale-requirements',
            type: 'select',
            label: 'Scale Requirements',
            options: [
              'Small (GB range, < 1000 ops/sec)',
              'Medium (TB range, < 10000 ops/sec)',
              'Large (TB range, > 10000 ops/sec)',
              'Extra Large (PB range, custom requirements)'
            ]
          }
        ]
      },
      {
        title: 'Data Model Review',
        questions: [
          {
            id: 'data-model-description',
            type: 'file',
            label: 'Data Model Documentation',
            accept: '.json,.yaml,.md'
          },
          {
            id: 'access-patterns',
            type: 'textarea',
            label: 'Access Patterns',
            placeholder: 'Describe your main data access patterns'
          },
          {
            id: 'relationships',
            type: 'checkbox-group',
            label: 'Relationship Types',
            options: [
              'One-to-One',
              'One-to-Many',
              'Many-to-Many',
              'Hierarchical',
              'Graph-like'
            ]
          }
        ]
      }
      // Add more steps as needed
    ]
    // Add other review types
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // Process responses and generate recommendations
    const reviewData = {
      type: reviewType,
      responses,
      timestamp: new Date().toISOString(),
      // Add more metadata
    };

    // Save review data
    // Generate report
    // Provide recommendations
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!reviewType ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviewTypes.map(type => (
            <button
              key={type.id}
              className="p-6 bg-mongodb-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-mongodb-mist text-left"
              onClick={() => setReviewType(type.id)}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <h3 className="text-lg font-semibold text-mongodb-slate mb-2">
                {type.name}
              </h3>
              <p className="text-mongodb-forest text-sm">
                {type.description}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-mongodb-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-mongodb-slate mb-2">
              {reviewTypes.find(t => t.id === reviewType).name}
            </h2>
            <div className="flex space-x-2">
              {reviewSteps[reviewType].map((step, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded ${
                    currentStep === index
                      ? 'bg-mongodb-forest text-white'
                      : 'bg-mongodb-lavender text-mongodb-slate'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  {step.title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {reviewSteps[reviewType][currentStep].questions.map(question => (
              <div key={question.id} className="space-y-2">
                <label className="block text-mongodb-slate font-medium">
                  {question.label}
                </label>
                {question.type === 'text' && (
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
                    placeholder={question.placeholder}
                    value={responses[question.id] || ''}
                    onChange={e => handleResponseChange(question.id, e.target.value)}
                  />
                )}
                {question.type === 'textarea' && (
                  <textarea
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
                    placeholder={question.placeholder}
                    value={responses[question.id] || ''}
                    onChange={e => handleResponseChange(question.id, e.target.value)}
                    rows={4}
                  />
                )}
                {/* Add other question types */}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              className="px-6 py-2 bg-mongodb-mist text-mongodb-slate rounded-lg hover:bg-mongodb-spring transition-colors"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </button>
            {currentStep === reviewSteps[reviewType].length - 1 ? (
              <button
                className="px-6 py-2 bg-mongodb-forest text-white rounded-lg hover:bg-mongodb-evergreen transition-colors"
                onClick={handleSubmit}
              >
                Complete Review
              </button>
            ) : (
              <button
                className="px-6 py-2 bg-mongodb-forest text-white rounded-lg hover:bg-mongodb-evergreen transition-colors"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};