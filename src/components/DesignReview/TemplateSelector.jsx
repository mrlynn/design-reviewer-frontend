// components/DesignReview/TemplateSelector.jsx
import React, { useState } from 'react';
import YAMLViewerModal from './YAMLViewerModal';
import { FileJson } from 'lucide-react';

const TemplateSelector = ({ templates, onSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showYAML, setShowYAML] = useState(false);

  const getTemplateInfo = (template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    version: template.version || '1.0',
    author: template.metadata?.author || 'MongoDB',
    tags: template.metadata?.tags || [],
    icon: template.icon || '📄',
    source: template.source || 'unknown'
  });

  const handleViewYAML = (e, template) => {
    e.stopPropagation(); // Prevent template selection
    setSelectedTemplate(template);
    setShowYAML(true);
  };

  const handleCloseYAML = () => {
    setShowYAML(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-mongodb-slate mb-6">
        Select a Design Review Template
      </h2>
      
      <div className="mb-4">
        <p className="text-sm text-mongodb-slate">
          Available templates: {templates.length} (
          {templates.filter(t => t.source === 'yaml').length} YAML, 
          {templates.filter(t => t.source === 'javascript').length} JavaScript)
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {templates.map(template => {
          const templateInfo = getTemplateInfo(template);
          
          return (
            <div 
              key={templateInfo.id}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => onSelect(templateInfo.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{templateInfo.icon}</span>
                  <h3 className="text-xl font-bold text-mongodb-slate">
                    {templateInfo.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {templateInfo.source === 'yaml' && (
                    <button
                      onClick={(e) => handleViewYAML(e, template)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-mongodb-mist text-mongodb-slate rounded-lg hover:bg-mongodb-spring transition-colors"
                      title="View Template YAML"
                    >
                      <FileJson size={16} />
                      <span>View YAML</span>
                    </button>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    templateInfo.source === 'yaml' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {templateInfo.source}
                  </span>
                </div>
              </div>
              
              <p className="text-mongodb-slate mb-4">
                {templateInfo.description}
              </p>
              
              <div className="text-sm text-mongodb-forest">
                <p>Version: {templateInfo.version}</p>
                <p>Author: {templateInfo.author}</p>
                
                {templateInfo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {templateInfo.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-mongodb-lavender rounded-full text-mongodb-slate text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <YAMLViewerModal 
        isOpen={showYAML}
        onClose={handleCloseYAML}
        template={selectedTemplate}
      />
    </div>
  );
};

export default TemplateSelector;