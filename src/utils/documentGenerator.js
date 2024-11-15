// frontend/design-review-app/src/utils/documentGenerator.js
export const generateReviewDocument = async (template, responses) => {
    // Initial basic implementation
    const document = {
      title: template.name,
      timestamp: new Date().toISOString(),
      sections: template.sections.map(section => ({
        title: section.title,
        responses: section.questions.map(question => ({
          question: question.label,
          answer: responses[question.id] || 'No response provided'
        }))
      }))
    };
  
    return document;
  };