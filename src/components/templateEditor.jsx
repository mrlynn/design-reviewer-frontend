import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { convertYamlToTemplate, validateTemplate, saveTemplate } from '../utils/templateUtils';

export const TemplateEditor = () => {
  const [yamlContent, setYamlContent] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleEditorChange = (value) => {
    setYamlContent(value);
    setError(null);
    setSuccessMessage('');
  };

  const handleValidate = async () => {
    try {
      const template = convertYamlToTemplate(yamlContent);
      setSuccessMessage('Template is valid!');
      setError(null);
      return template;
    } catch (err) {
      setError(err.message);
      setSuccessMessage('');
      return null;
    }
  };

  const handleSave = async () => {
    try {
      const template = await handleValidate();
      if (template) {
        await saveTemplate(template);
        setSuccessMessage('Template saved successfully!');
      }
    } catch (err) {
      setError('Failed to save template: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-mongodb-slate mb-4">
          Design Review Template Editor
        </h2>
        
        <div className="mb-4">
          <p className="text-mongodb-slate mb-2">
            Edit your template in YAML format. Include questions, prompts, and analysis guidance.
          </p>
        </div>

        <div className="h-[600px] border rounded-lg overflow-hidden mb-4">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            value={yamlContent}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              wordWrap: 'on',
              fontSize: 14,
            }}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleValidate}
            className="px-4 py-2 bg-mongodb-mist text-mongodb-slate rounded-lg hover:bg-mongodb-lavender transition-colors"
          >
            Validate Template
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-mongodb-forest text-white rounded-lg hover:bg-mongodb-evergreen transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};