// frontend/design-review-app/src/services/documentGenerator.js
import { config } from '../config';

export const generateReviewDocument = async (template, responses) => {
  try {
    const response = await fetch(`${config.RAG_API_URL}/generate-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template: template,
        responses: responses,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate review document');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating review document:', error);
    throw error;
  }
};