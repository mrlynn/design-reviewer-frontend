// components/TemplateEditorModal.jsx
import React, { useState, useEffect } from 'react';
import { X, History, Save } from 'lucide-react';
import { config } from '../config';
import SectionEditor from './SectionEditor';

const TemplateEditorModal = ({ 
  template, 
  onSave, 
  onClose,
  isManageMode = false // Add this to handle different behaviors
}) => {
  // Initialize with version-aware structure
  const [formData, setFormData] = useState({
    templateId: template?.templateId || '',
    name: template?.name || '',
    description: template?.description || '',
    type: template?.type || 'design-review',
    status: template?.status || 'draft',
    metadata: {
      author: template?.metadata?.author || '',
      tags: template?.metadata?.tags || [],
      lastUpdated: new Date().toISOString()
    },
    content: {
      globalPromptContext: template?.currentContent?.globalPromptContext || '',
      sections: template?.currentContent?.sections || [],
      analysisPromptTemplate: template?.currentContent?.analysisPromptTemplate || '',
    },
    changelog: ''
  });

  const [versionHistory, setVersionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (template?.templateId) {
      loadVersionHistory(template.templateId);
    }
  }, [template?.templateId]);

  const loadVersionHistory = async (templateId) => {
    try {
      const response = await fetch(`${config.API_URL}/api/templates/${templateId}/history`);
      if (!response.ok) throw new Error('Failed to load version history');
      const history = await response.json();
      setVersionHistory(history);
    } catch (error) {
      console.error('Error loading version history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave(formData);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.content.globalPromptContext) newErrors.globalPromptContext = 'Global prompt context is required';
    if (!formData.content.sections.length) newErrors.sections = 'At least one section is required';
    
    // Validate each section
    formData.content.sections.forEach((section, index) => {
      if (!section.title) {
        newErrors[`section_${index}_title`] = `Section ${index + 1} title is required`;
      }
      if (!section.questions || section.questions.length === 0) {
        newErrors[`section_${index}_questions`] = `Section ${index + 1} must have at least one question`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-mongodb-slate">
              {template ? 'Edit Template' : 'Create New Template'}
            </h2>
            <div className="flex items-center gap-3">
              {template?.templateId && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-mongodb-green hover:text-mongodb-green-dark"
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-mongodb-slate mb-1">
                Template Name
                {errors.name && (
                  <span className="text-red-500 text-xs ml-2">{errors.name}</span>
                )}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mongodb-slate mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  type: e.target.value
                }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="design-review">Design Review</option>
                <option value="data-model">Data Model</option>
                <option value="performance">Performance</option>
                <option value="migration">Migration</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-mongodb-slate mb-1">
              Description
              {errors.description && (
                <span className="text-red-500 text-xs ml-2">{errors.description}</span>
              )}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              className="w-full p-2 border rounded-lg"
              rows={2}
              placeholder="Enter template description"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-mongodb-slate mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.metadata.tags.join(', ')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }
              }))}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter tags separated by commas"
            />
          </div>

          {/* Global Prompt Context */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-mongodb-slate mb-1">
              Global Prompt Context
              {errors.globalPromptContext && (
                <span className="text-red-500 text-xs ml-2">{errors.globalPromptContext}</span>
              )}
            </label>
            <textarea
              value={formData.content.globalPromptContext}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content: {
                  ...prev.content,
                  globalPromptContext: e.target.value
                }
              }))}
              className="w-full p-2 border rounded-lg font-mono text-sm"
              rows={6}
              placeholder="Enter the global context for AI analysis..."
            />
          </div>

          {/* Sections Editor */}
          <div className="mb-6">
            {errors.sections && (
              <div className="mb-2 text-red-500 text-sm">{errors.sections}</div>
            )}
            <SectionEditor
              sections={formData.content.sections}
              onChange={(newSections) => setFormData(prev => ({
                ...prev,
                content: {
                  ...prev.content,
                  sections: newSections
                }
              }))}
            />
          </div>

          {/* Analysis Template */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-mongodb-slate mb-1">
              Analysis Template
              {errors.analysisPromptTemplate && (
                <span className="text-red-500 text-xs ml-2">{errors.analysisPromptTemplate}</span>
              )}
            </label>
            <textarea
              value={formData.content.analysisPromptTemplate}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content: {
                  ...prev.content,
                  analysisPromptTemplate: e.target.value
                }
              }))}
              className="w-full p-2 border rounded-lg font-mono text-sm"
              rows={6}
              placeholder="Template for generating the final analysis..."
            />
          </div>

          {/* Version History Panel */}
          {showHistory && (
            <div className="mb-6 border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Version History</h3>
              <div className="space-y-2">
                {versionHistory.map((version) => (
                  <div key={version.version} className="flex justify-between text-sm">
                    <span>v{version.version}</span>
                    <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                    <span>{version.changelog}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changelog for new version */}
          {template?.templateId && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-mongodb-slate mb-1">
                Changelog
              </label>
              <textarea
                value={formData.changelog}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  changelog: e.target.value
                }))}
                className="w-full p-2 border rounded-lg"
                rows={2}
                placeholder="Describe your changes..."
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-mongodb-green text-white rounded-lg hover:bg-mongodb-green-dark flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {template ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateEditorModal;