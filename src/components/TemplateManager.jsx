// frontend/src/components/TemplateManager.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, Check, X, Copy, History } from 'lucide-react';
import { config } from '../config';
import { mongoTemplateToEditorFormat, editorTemplateToMongoFormat } from '../utils/templateTransformers';


const TemplateManager = ({
    onTemplateSelect = () => { },
    currentTemplateId,
    onClose = () => { }
}) => {
    const [templates, setTemplates] = useState([]);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.API_URL}/api/templates`);
            if (!response.ok) throw new Error('Failed to load templates');
            const data = await response.json();
            setTemplates(data);
        } catch (err) {
            console.error('Error loading templates:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (template) => {
        try {
          const fullTemplate = await loadTemplateVersion(template.templateId);
          const editorFormat = mongoTemplateToEditorFormat(fullTemplate);
          setEditingTemplate(editorFormat);
          setShowEditor(true);
        } catch (error) {
          console.error('Error loading template for editing:', error);
          setError(error.message);
        }
      };

    const loadTemplateVersion = async (templateId, version = null) => {
        try {
            const url = `${config.API_URL}/api/templates/${templateId}${version ? `?version=${version}` : ''}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load template version');
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Error loading template version:', err);
            throw err;
        }
    };

    const handleSave = async (editorTemplate) => {
        try {
          const method = editingTemplate?.templateId ? 'PUT' : 'POST';
          const mongoFormat = editorTemplateToMongoFormat(
            editorTemplate,
            editingTemplate
          );
      
          const url = `${config.API_URL}/api/templates${
            mongoFormat.templateId ? `/${mongoFormat.templateId}` : ''
          }`;
      
          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mongoFormat)
          });
      
          if (!response.ok) throw new Error('Failed to save template');
      
          await loadTemplates();
          setEditingTemplate(null);
          setShowEditor(false);
        } catch (err) {
          console.error('Error saving template:', err);
          setError(err.message);
        }
      };

    const handleDelete = (templateId) => {
        if (templateId === 'default') {
            alert('Cannot delete the default template');
            return;
        }

        if (confirm('Are you sure you want to delete this template?')) {
            const updatedTemplates = templates.filter(t => t.id !== templateId);
            setTemplates(updatedTemplates);
            localStorage.setItem('analysisTemplates', JSON.stringify(updatedTemplates));
        }
    };

    const handleCopy = (template) => {
        setCopyingTemplate({
            ...template,
            id: undefined,
            name: `${template.name} (Copy)`,
            metadata: {
                ...template.metadata,
                copiedFrom: template.id,
                copiedAt: new Date().toISOString()
            }
        });
        setShowEditor(true);
        setIsCopying(true);
    };

    const handleTemplateClick = (template) => {
        // Only call onTemplateSelect if we're not in editing/copying mode
        if (!isManageMode && onTemplateSelect) {
            onTemplateSelect(template);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Analysis Templates</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setEditingTemplate(null);
                                setCopyingTemplate(null);
                                setShowEditor(true);
                                setIsCopying(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-mongodb-mist text:bg-mongodb-slate rounded-lg hover:bg-mongodb-spring"
                        >
                            <PlusCircle className="w-5 h-5" />
                            New Template
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <div key={template.templateId} className="bg-white rounded-lg shadow-md p-6 mb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold">{template.name}</h3>
                                    <p className="text-gray-600">{template.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        {template.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            loadTemplateVersion(template.templateId)
                                                .then(fullTemplate => {
                                                    setEditingTemplate(fullTemplate);
                                                    setShowEditor(true);
                                                });
                                        }}
                                        className="p-2 text-gray-600 hover:text-blue-600"
                                        title="Edit"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => loadTemplateVersion(template.templateId).then(onTemplateSelect)}
                                        className="p-2 text-gray-600 hover:text-green-600"
                                        title="Use Template"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                                <span>Version {template.currentVersion}</span>
                                <span className="mx-2">•</span>
                                <span>Last updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                                <span className="mx-2">•</span>
                                <span>Status: {template.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showEditor && (
                <TemplateEditorModal
                    template={editingTemplate}
                    onSave={handleSave}
                    onClose={() => {
                        setShowEditor(false);
                        setEditingTemplate(null);
                    }}
                />
            )}
        </div>
    );
};

const TemplateEditorModal = ({ template, onSave, onClose }) => {
    const [name, setName] = useState(template?.name || '');
    const [description, setDescription] = useState(template?.description || '');
    const [content, setContent] = useState(template?.content || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !content.trim()) {
            alert('Name and content are required');
            return;
        }

        onSave({
            id: template?.id,
            name: name.trim(),
            description: description.trim(),
            content: content.trim()
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">
                            {template ? 'Edit Template' : 'Create New Template'}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-mongodb-mist hover:bg-mongodb-spring"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>


                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Template Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Enter template name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Enter template description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                System Prompt
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-96 p-2 border rounded-lg font-mono"
                                placeholder="Enter the system prompt template..."
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {template ? 'Update Template' : 'Create Template'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TemplateManager;