// frontend/design-review-app/src/components/DesignReview/ReviewSection.jsx
import { QuestionField } from './QuestionField';

const ReviewSection = ({
  section,
  responses,
  onChange,
  onNext,
  onBack,
  isFirstSection,
  isLastSection
}) => {
  const validateSection = () => {
    const requiredQuestions = section.questions.filter(q => q.required);
    return requiredQuestions.every(q => responses[q.id]);
  };

  return (
    <div className="bg-mongodb-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-mongodb-slate mb-2">
          {section.title}
        </h3>
        {section.description && (
          <p className="text-mongodb-forest text-sm">
            {section.description}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {section.questions.map(question => (
          <QuestionField
            key={question.id}
            question={question}
            value={responses[question.id]}
            onChange={value => onChange(question.id, value)}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        {!isFirstSection && (
          <button
            onClick={onBack}
            className="px-6 py-2 bg-mongodb-mist text-mongodb-slate rounded-lg hover:bg-mongodb-lavender transition-colors"
          >
            Previous Section
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!validateSection()}
          className={`px-6 py-2 rounded-lg ml-auto ${
            validateSection()
              ? 'bg-mongodb-forest text-white hover:bg-mongodb-evergreen'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } transition-colors`}
        >
          {isLastSection ? 'Complete Review' : 'Next Section'}
        </button>
      </div>
    </div>
  );
};

export default ReviewSection;