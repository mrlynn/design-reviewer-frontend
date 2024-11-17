// components/TemplateSelector.jsx
import React, { useState } from 'react';
import { Edit2, Archive, User, Tags } from 'lucide-react';
import TemplateEditorModal from '../TemplateEditorModal';
import { config } from '../../config';

const TemplateSelector = ({ 
  templates, 
  onSelect, 
  onTemplateChange,  // This will handle updates to templates
  isManageMode = false 
}) => {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [error, setError] = useState(null);

  const handleEdit = async (e, template) => {
    e.stopPropagation(); // Prevent card click
    try {
      // Fetch the full template with all content
      const response = await fetch(`${config.API_URL}/api/templates/${template.templateId}`);
      if (!response.ok) throw new Error('Failed to load template');
      const fullTemplate = await response.json();
      
      setEditingTemplate(fullTemplate);
    } catch (err) {
      console.error('Error loading template:', err);
      setError(err.message);
    }
  };

  const handleSave = async (updatedTemplate) => {
    try {
      const response = await fetch(
        `${config.API_URL}/api/templates/${updatedTemplate.templateId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTemplate)
        }
      );

      if (!response.ok) throw new Error('Failed to save template');
      
      const savedTemplate = await response.json();
      
      // Notify parent of the change
      if (onTemplateChange) {
        onTemplateChange(savedTemplate);
      }

      setEditingTemplate(null);
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message);
    }
  };

  const TemplateCard = ({ template }) => (
    <div
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      onClick={() => !isManageMode && onSelect && onSelect(template)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-mongodb-slate group-hover:text-mongodb-green transition-colors">
              {template.name}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              template.status === 'archived' ? 'bg-gray-100 text-gray-800' :
              'bg-green-100 text-green-800'
            }`}>
              {template.status}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {isManageMode && (
              <>
                <button
                  onClick={(e) => handleEdit(e, template)}
                  className="p-2 text-mongodb-slate hover:text-mongodb-green hover:bg-mongodb-mist rounded-lg transition-colors"
                  title="Edit Template"
                >
                  <Edit2 size={18} />
                </button>
                {template.status !== 'archived' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle archive
                    }}
                    className="p-2 text-mongodb-slate hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Archive Template"
                  >
                    <Archive size={18} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-sm text-mongodb-slate mb-4 line-clamp-2">
          {template.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-mongodb-forest">
            <User size={14} />
            <span>{template.metadata?.author || 'MongoDB'}</span>
          </div>

          {template.metadata?.tags?.length > 0 && (
            <div className="flex items-start gap-2">
              <Tags size={14} className="mt-1 text-mongodb-forest" />
              <div className="flex flex-wrap gap-2">
                {template.metadata.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-mongodb-mist rounded-full text-mongodb-green text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-mongodb-slate">
          <span>v{template.currentVersion}</span>
          <span>
            Updated: {new Date(template.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard 
            key={template.templateId || template.id} 
            template={template} 
          />
        ))}
      </div>

      {/* Add the TemplateEditorModal */}
      {editingTemplate && (
        <TemplateEditorModal
          template={editingTemplate}
          onSave={handleSave}
          onClose={() => {
            setEditingTemplate(null);
            setError(null);
          }}
          isManageMode={isManageMode}
        />
      )}
    </div>
  );
};

export default TemplateSelector;