// frontend/src/services/ragService.js
import axios from 'axios';

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001/api';

class RAGService {
  async search(query, limit = 5) {
    try {
      const response = await axios.post(`${RAG_API_URL}/search`, {
        query,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  async ingestFile(file, metadata) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await axios.post(`${RAG_API_URL}/ingest/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error ingesting file:', error);
      throw error;
    }
  }
}

export const ragService = new RAGService();