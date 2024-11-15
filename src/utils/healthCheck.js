// frontend/design-review-app/src/utils/healthCheck.js
import { config } from '../config';

export const checkServiceHealth = async () => {
  try {
    // Check main backend health
    const backendHealth = await fetch(`${config.API_URL}/api/health`)
      .then(res => res.json())
      .catch(() => ({ status: 'error', service: 'backend' }));

    // Check RAG service health
    const ragHealth = await fetch(`${config.RAG_API_URL}/health`)
      .then(res => res.json())
      .catch(() => ({ status: 'error', service: 'rag' }));

    return {
      backend: backendHealth.status === 'ok',
      rag: ragHealth.status === 'ok',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Health check error:', error);
    return {
      backend: false,
      rag: false,
      timestamp: new Date().toISOString()
    };
  }
};