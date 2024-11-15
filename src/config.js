export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3003',
  RAG_API_URL: import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001/api',
};