// components/DesignReview/YAMLViewerModal.jsx
import React from 'react';
import YAML from 'yaml';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from 'lucide-react';

const YAMLViewerModal = ({ isOpen, onClose, template }) => {
  if (!isOpen || !template) return null;

  const handleCopyYAML = () => {
    const yamlString = YAML.stringify(template);
    navigator.clipboard.writeText(yamlString);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="yaml-viewer" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-mongodb-slate">
              Template YAML Structure
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyYAML}
                className="p-2 text-mongodb-slate hover:text-mongodb-green rounded-lg hover:bg-gray-100 transition-colors"
                title="Copy YAML"
              >
                <Copy size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-mongodb-slate hover:text-mongodb-green rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            <div className="rounded-lg overflow-hidden shadow-inner">
              <SyntaxHighlighter
                language="yaml"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  maxHeight: 'none'
                }}
                showLineNumbers={true}
              >
                {YAML.stringify(template, null, 2)}
              </SyntaxHighlighter>
            </div>

            <div className="mt-6 bg-mongodb-lavender rounded-lg p-4 text-sm text-mongodb-slate">
              <h4 className="font-semibold mb-2">Template Structure Guide</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Templates must include required fields: id, name, description, and sections</li>
                <li>Each section must have an id, title, and questions array</li>
                <li>Questions require id, type, and label fields</li>
                <li>Custom prompt contexts can be added to guide the LLM analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YAMLViewerModal;