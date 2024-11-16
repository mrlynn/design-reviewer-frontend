import React, { useState } from 'react';
import YAMLViewerModal from './YAMLViewerModal';
import {
    Eye, Database, FileJson, Code2, Book, Tags, User, Info,
    Edit2, Trash2, History, Archive
} from 'lucide-react';
import TemplateManager from '../TemplateManager';

const TemplateSelector = ({ templates, onSelect, onEdit, onDelete, isManageMode = false }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showYAML, setShowYAML] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Modified handleEdit to properly call onEdit prop
    const handleEdit = (e, template) => {
        e.stopPropagation(); // Prevent card click event
        if (onEdit) {
            onEdit(template);
        }
    };

    const getTemplateInfo = (template) => ({
        id: template.templateId || template.id, // Handle both id formats
        name: template.name,
        description: template.description,
        version: template.currentVersion,
        author: template.metadata?.author || 'MongoDB',
        tags: template.metadata?.tags || [],
        source: template.source || 'mongodb',
        status: template.status || 'published',
        updatedAt: template.updatedAt
    });

    // Template card with fixed edit functionality
    const TemplateCard = ({ template }) => {
        const templateInfo = getTemplateInfo(template);
        const TemplateIcon = getTemplateIcon(templateInfo.name);

        return (
            <div
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                onClick={() => !isManageMode && onSelect(templateInfo.id)}
            >
                <div className="p-6">
                    {/* Header with status indicator */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${templateInfo.status === 'draft' ? 'bg-yellow-50' :
                                    templateInfo.status === 'archived' ? 'bg-gray-50' :
                                        'bg-mongodb-mist'
                                }`}>
                                <div className="icon">{TemplateIcon}</div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-mongodb-slate group-hover:text-mongodb-green transition-colors">
                                    {templateInfo.name}
                                </h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${templateInfo.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                        templateInfo.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {templateInfo.status}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons with fixed edit handler */}
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => handleViewHistory(e, templateInfo.id)}
                                className="p-2 text-mongodb-slate hover:text-mongodb-green hover:bg-mongodb-mist rounded-lg transition-colors"
                                title="View Version History"
                            >
                                <History size={18} />
                            </button>
                            {isManageMode && (
                                <>
                                    <button
                                        onClick={(e) => handleEdit(e, template)}
                                        className="p-2 text-mongodb-slate hover:text-mongodb-green hover:bg-mongodb-mist rounded-lg transition-colors"
                                        title="Edit Template -"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => handleStatusChange(e, templateInfo.id, 'archived')}
                                        className="p-2 text-mongodb-slate hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                        title="Archive Template"
                                    >
                                        <Archive size={18} />
                                    </button>
                                    {templateInfo.status === 'archived' && (
                                        <button
                                            onClick={(e) => handleDelete(e, templateInfo.id)}
                                            className="p-2 text-mongodb-slate hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Template"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Template content */}
                    <p className="text-sm text-mongodb-slate mb-4 line-clamp-2">
                        {templateInfo.description}
                    </p>

                    {/* Metadata */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-mongodb-forest">
                            <User size={14} />
                            <span>{templateInfo.author}</span>
                        </div>

                        {templateInfo.tags.length > 0 && (
                            <div className="flex items-start gap-2">
                                <Tags size={14} className="mt-1 text-mongodb-forest" />
                                <div className="flex flex-wrap gap-2">
                                    {templateInfo.tags.map(tag => (
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

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-mongodb-slate">
                        <span className="flex items-center gap-1">
                            <span>v{templateInfo.version}</span>
                        </span>
                        <span>
                            Updated: {templateInfo.updatedAt 
                                ? new Date(templateInfo.updatedAt).toLocaleDateString() 
                                : 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const getTemplateIcon = (templateType) => {
        const icons = {
            database: '📦',
            web: '🌐',
            default: '📄',
        };
        return icons[templateType] || icons.default;
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template, index) => (
                    <TemplateCard key={index} template={template} />
                ))}
            </div>

            {/* Modals */}
            <YAMLViewerModal
                isOpen={showYAML}
                onClose={() => setShowYAML(false)}
                template={selectedTemplate}
            />

            {showHistory && selectedTemplate?.history && (
                <VersionHistoryModal
                    isOpen={showHistory}
                    onClose={() => setShowHistory(false)}
                    template={selectedTemplate}
                    history={selectedTemplate.history}
                />
            )}
        </div>
    );
};

export default TemplateSelector;