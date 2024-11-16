import React, { useState, useEffect } from 'react';
import {
    Save, X, Plus, Trash2, ChevronDown, ChevronRight,
    GripVertical, AlertCircle, Check
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TemplateEditor = ({ template, onSave, onCancel }) => {

    console.log('Received template in TemplateEditor:', template);

    // Initialize with default values to prevent undefined
    const initialFormData = {
        id: template?.id,
        name: template?.name,
        description: template?.description,
        version: '1.0',
        type: 'design-review',
        metadata: {
            author: '',
            lastUpdated: new Date().toISOString().split('T')[0],
            tags: []
        },
        globalPromptContext: '',
        sections: [], // Initialize as empty array
        analysisPromptTemplate: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [expandedSections, setExpandedSections] = useState({});

    // Update form data when template changes
    useEffect(() => {
        if (template) {
            // Ensure all necessary fields, including templateId, are carried over
            const templateData = {
                ...template,
                templateId: template.templateId || '', // Explicitly include templateId
                sections: template.sections || [], // Default sections to an empty array
                metadata: {
                    ...(template.metadata || {}),
                    tags: template.metadata?.tags || [] // Ensure tags is always an array
                }
            };
            console.log('Setting formData with sections:', templateData.sections);

            setFormData(templateData);
            console.log('formData', templateData); // Log to confirm templateId is present
    
            // Initialize expanded sections
            const expanded = {};
            templateData.sections.forEach(section => {
                expanded[section.id] = true;
            });
            setExpandedSections(expanded);
        }
    }, [template]);
    

    const validateForm = () => {
        const newErrors = {};
        if (!formData.id) newErrors.id = 'ID is required';
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.globalPromptContext) newErrors.globalPromptContext = 'Global prompt context is required';
        if (!formData.analysisPromptTemplate) newErrors.analysisPromptTemplate = 'Analysis template is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSave({
                ...formData,
                metadata: {
                    ...formData.metadata,
                    lastUpdated: new Date().toISOString().split('T')[0]
                }
            });
        }
    };

    const handleAddSection = () => {
        const newSectionId = `section-${Date.now()}`;
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, {
                id: newSectionId,
                title: 'New Section',
                description: '',
                questions: []
            }]
        }));
        setExpandedSections(prev => ({
            ...prev,
            [newSectionId]: true
        }));
    };

    const handleAddQuestion = (sectionId) => {
        const newQuestion = {
            id: `question-${Date.now()}`,
            type: 'text',
            label: 'New Question',
            required: false,
            placeholder: '',
            promptContext: ''
        };

        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(section =>
                section.id === sectionId
                    ? { ...section, questions: [...section.questions, newQuestion] }
                    : section
            )
        }));
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === 'section') {
            const sections = Array.from(formData.sections);
            const [removed] = sections.splice(source.index, 1);
            sections.splice(destination.index, 0, removed);

            setFormData(prev => ({
                ...prev,
                sections
            }));
        } else if (type === 'question') {
            const sectionId = source.droppableId;
            const questions = Array.from(formData.sections.find(s => s.id === sectionId).questions);
            const [removed] = questions.splice(source.index, 1);
            questions.splice(destination.index, 0, removed);

            setFormData(prev => ({
                ...prev,
                sections: prev.sections.map(section =>
                    section.id === sectionId
                        ? { ...section, questions }
                        : section
                )
            }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg max-w-5xl mx-auto">
            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-mongodb-slate">
                        {template ? 'Edit Template' : 'Create New Template'}
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                        >
                            <X size={18} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-mongodb-green mongodb-slate rounded-lg hover:bg-mongodb-green-dark flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Template
                        </button>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block mb-1 font-medium text-mongodb-slate">
                            Template ID
                            {errors.id && (
                                <span className="text-red-500 text-sm ml-2">{errors.id}</span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={formData.templateId}
                            onChange={e => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                            className="w-full p-2 border rounded-lg"
                            placeholder="unique-template-id"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-mongodb-slate">
                            Name
                            {errors.name && (
                                <span className="text-red-500 text-sm ml-2">{errors.name}</span>
                            )}
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Template Name"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block mb-1 font-medium text-mongodb-slate">
                        Description
                        {errors.description && (
                            <span className="text-red-500 text-sm ml-2">{errors.description}</span>
                        )}
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 border rounded-lg"
                        rows={2}
                        placeholder="Template description..."
                    />
                </div>

                {/* Metadata */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-mongodb-slate">Metadata</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1 font-medium text-mongodb-slate">Author</label>
                            <input
                                type="text"
                                value={formData.metadata.author}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    metadata: { ...prev.metadata, author: e.target.value }
                                }))}
                                className="w-full p-2 border rounded-lg"
                                placeholder="Template author"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-mongodb-slate">Tags</label>
                            <input
                                type="text"
                                value={formData.metadata.tags.join(', ')}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    metadata: {
                                        ...prev.metadata,
                                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                                    }
                                }))}
                                className="w-full p-2 border rounded-lg"
                                placeholder="tag1, tag2, tag3"
                            />
                        </div>
                    </div>
                </div>

                {/* Global Prompt Context */}
                <div className="mb-6">
                    <label className="block mb-1 font-medium text-mongodb-slate">
                        Global Prompt Context
                        {errors.globalPromptContext && (
                            <span className="text-red-500 text-sm ml-2">{errors.globalPromptContext}</span>
                        )}
                    </label>
                    <textarea
                        value={formData.globalPromptContext}
                        onChange={e => setFormData(prev => ({ ...prev, globalPromptContext: e.target.value }))}
                        className="w-full p-2 border rounded-lg font-mono text-sm"
                        rows={6}
                        placeholder="Global context for AI analysis..."
                    />
                </div>

                {/* Sections */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-mongodb-slate">Sections</h3>
                        <button
                            onClick={handleAddSection}
                            className="px-3 py-1 bg-mongodb-spring text-mongodb-green rounded-lg hover:bg-mongodb-spring-dark flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Section
                        </button>
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="sections" type="section">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-4"
                                >
                                    {Array.isArray(formData.sections) && formData.sections.map((section, index) => (
                                        <Draggable
                                            key={section.id}
                                            draggableId={section.id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="mb-4"
                                                >
                                                    <div className="border rounded-lg">
                                                        <div className="p-4 bg-gray-50 flex items-center gap-3">
                                                            <div {...provided.dragHandleProps}>
                                                                <GripVertical className="text-gray-400" />
                                                            </div>
                                                            <button
                                                                onClick={() => setExpandedSections(prev => ({
                                                                    ...prev,
                                                                    [section.id]: !prev[section.id]
                                                                }))}
                                                                className="flex items-center gap-2"
                                                            >
                                                                {expandedSections[section.id] ?
                                                                    <ChevronDown size={18} /> :
                                                                    <ChevronRight size={18} />
                                                                }
                                                            </button>
                                                            <input
                                                                value={section.title}
                                                                onChange={e => setFormData(prev => ({
                                                                    ...prev,
                                                                    sections: prev.sections.map(s =>
                                                                        s.id === section.id
                                                                            ? { ...s, title: e.target.value }
                                                                            : s
                                                                    )
                                                                }))}
                                                                className="flex-grow p-1 bg-transparent font-semibold"
                                                                placeholder="Section Title"
                                                            />
                                                            <button
                                                                onClick={() => handleAddQuestion(section.id)}
                                                                className="p-1 text-mongodb-green hover:text-mongodb-green-dark"
                                                                title="Add Question"
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Delete this section?')) {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            sections: prev.sections.filter(s => s.id !== section.id)
                                                                        }));
                                                                    }
                                                                }}
                                                                className="p-1 text-red-600 hover:text-red-700"
                                                                title="Delete Section"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>

                                                        {expandedSections[section.id] && (
                                                            <div className="p-4">
                                                                <textarea
                                                                    value={section.description}
                                                                    onChange={e => setFormData(prev => ({
                                                                        ...prev,
                                                                        sections: prev.sections.map(s =>
                                                                            s.id === section.id
                                                                                ? { ...s, description: e.target.value }
                                                                                : s
                                                                        )
                                                                    }))}
                                                                    className="w-full p-2 border rounded-lg mb-4"
                                                                    placeholder="Section description..."
                                                                    rows={2}
                                                                />

                                                                <Droppable droppableId={section.id} type="question">
                                                                    {(provided) => (
                                                                        <div
                                                                            {...provided.droppableProps}
                                                                            ref={provided.innerRef}
                                                                            className="space-y-4"
                                                                        >
                                                                            {section.questions.map((question, qIndex) => (
                                                                                <Draggable
                                                                                    key={question.id}
                                                                                    draggableId={question.id}
                                                                                    index={qIndex}
                                                                                >
                                                                                    {(provided) => (
                                                                                        <div
                                                                                            ref={provided.innerRef}
                                                                                            {...provided.draggableProps}
                                                                                            className="border rounded-lg p-4"
                                                                                        >
                                                                                            <div className="flex items-start gap-3">
                                                                                                <div {...provided.dragHandleProps}>
                                                                                                    <GripVertical className="text-gray-400" />
                                                                                                </div>
                                                                                                <div className="flex-grow">
                                                                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                                                                        <input
                                                                                                            value={question.label}
                                                                                                            onChange={e => setFormData(prev => ({
                                                                                                                ...prev,
                                                                                                                sections: prev.sections.map(s =>
                                                                                                                    s.id === section.id
                                                                                                                        ? {
                                                                                                                            ...s,
                                                                                                                            questions: s.questions.map(q =>
                                                                                                                                q.id === question.id
                                                                                                                                    ? { ...q, label: e.target.value }
                                                                                                                                    : q
                                                                                                                            )
                                                                                                                        }
                                                                                                                        : s
                                                                                                                )
                                                                                                            }))}
                                                                                                            className="p-2 border rounded-lg"
                                                                                                            placeholder="Question label"
                                                                                                        />
                                                                                                        <select
                                                                                                            value={question.type}
                                                                                                            onChange={e => setFormData(prev => ({
                                                                                                                ...prev,
                                                                                                                sections: prev.sections.map(s =>
                                                                                                                    s.id === section.id
                                                                                                                        ? {
                                                                                                                            ...s,
                                                                                                                            questions: s.questions.map(q =>
                                                                                                                                q.id === question.id
                                                                                                                                    ? { ...q, type: e.target.value }
                                                                                                                                    : q)
                                                                                                                        }
                                                                                                                        : s
                                                                                                                )
                                                                                                            }))}
                                                                                                            className="p-2 border rounded-lg"
                                                                                                        >
                                                                                                            <option value="text">Text</option>
                                                                                                            <option value="textarea">Text Area</option>
                                                                                                            <option value="select">Select</option>
                                                                                                            <option value="checkbox-group">Checkbox Group</option>
                                                                                                            <option value="dynamic-list">Dynamic List</option>
                                                                                                            <option value="number">Number</option>
                                                                                                        </select>
                                                                                                    </div>

                                                                                                    {/* Question Options (for select and checkbox-group) */}
                                                                                                    {['select', 'checkbox-group'].includes(question.type) && (
                                                                                                        <div className="mb-4">
                                                                                                            <label className="block mb-2 text-sm font-medium text-mongodb-slate">
                                                                                                                Options (one per line)
                                                                                                            </label>
                                                                                                            <textarea
                                                                                                                value={(question.options || []).join('\n')}
                                                                                                                onChange={e => setFormData(prev => ({
                                                                                                                    ...prev,
                                                                                                                    sections: prev.sections.map(s =>
                                                                                                                        s.id === section.id
                                                                                                                            ? {
                                                                                                                                ...s,
                                                                                                                                questions: s.questions.map(q =>
                                                                                                                                    q.id === question.id
                                                                                                                                        ? {
                                                                                                                                            ...q,
                                                                                                                                            options: e.target.value
                                                                                                                                                .split('\n')
                                                                                                                                                .map(opt => opt.trim())
                                                                                                                                                .filter(Boolean)
                                                                                                                                        }
                                                                                                                                        : q
                                                                                                                                )
                                                                                                                            }
                                                                                                                            : s
                                                                                                                    )
                                                                                                                }))}
                                                                                                                className="w-full p-2 border rounded-lg"
                                                                                                                rows={3}
                                                                                                                placeholder="Enter options, one per line"
                                                                                                            />
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Dynamic List Fields */}
                                                                                                    {question.type === 'dynamic-list' && (
                                                                                                        <div className="mb-4">
                                                                                                            <label className="block mb-2 text-sm font-medium text-mongodb-slate">
                                                                                                                Fields
                                                                                                            </label>
                                                                                                            <div className="space-y-2">
                                                                                                                {(question.fields || []).map((field, fIndex) => (
                                                                                                                    <div key={fIndex} className="flex gap-2">
                                                                                                                        <input
                                                                                                                            value={field.name}
                                                                                                                            onChange={e => {
                                                                                                                                const newFields = [...question.fields];
                                                                                                                                newFields[fIndex] = {
                                                                                                                                    ...field,
                                                                                                                                    name: e.target.value
                                                                                                                                };
                                                                                                                                setFormData(prev => ({
                                                                                                                                    ...prev,
                                                                                                                                    sections: prev.sections.map(s =>
                                                                                                                                        s.id === section.id
                                                                                                                                            ? {
                                                                                                                                                ...s,
                                                                                                                                                questions: s.questions.map(q =>
                                                                                                                                                    q.id === question.id
                                                                                                                                                        ? { ...q, fields: newFields }
                                                                                                                                                        : q
                                                                                                                                                )
                                                                                                                                            }
                                                                                                                                            : s
                                                                                                                                    )
                                                                                                                                }));
                                                                                                                            }}
                                                                                                                            className="flex-grow p-2 border rounded-lg"
                                                                                                                            placeholder="Field name"
                                                                                                                        />
                                                                                                                        <select
                                                                                                                            value={field.type}
                                                                                                                            onChange={e => {
                                                                                                                                const newFields = [...question.fields];
                                                                                                                                newFields[fIndex] = {
                                                                                                                                    ...field,
                                                                                                                                    type: e.target.value
                                                                                                                                };
                                                                                                                                setFormData(prev => ({
                                                                                                                                    ...prev,
                                                                                                                                    sections: prev.sections.map(s =>
                                                                                                                                        s.id === section.id
                                                                                                                                            ? {
                                                                                                                                                ...s,
                                                                                                                                                questions: s.questions.map(q =>
                                                                                                                                                    q.id === question.id
                                                                                                                                                        ? { ...q, fields: newFields }
                                                                                                                                                        : q
                                                                                                                                                )
                                                                                                                                            }
                                                                                                                                            : s
                                                                                                                                    )
                                                                                                                                }));
                                                                                                                            }}
                                                                                                                            className="w-32 p-2 border rounded-lg"
                                                                                                                        >
                                                                                                                            <option value="text">Text</option>
                                                                                                                            <option value="select">Select</option>
                                                                                                                            <option value="number">Number</option>
                                                                                                                        </select>
                                                                                                                        <button
                                                                                                                            onClick={() => {
                                                                                                                                const newFields = question.fields.filter((_, i) => i !== fIndex);
                                                                                                                                setFormData(prev => ({
                                                                                                                                    ...prev,
                                                                                                                                    sections: prev.sections.map(s =>
                                                                                                                                        s.id === section.id
                                                                                                                                            ? {
                                                                                                                                                ...s,
                                                                                                                                                questions: s.questions.map(q =>
                                                                                                                                                    q.id === question.id
                                                                                                                                                        ? { ...q, fields: newFields }
                                                                                                                                                        : q
                                                                                                                                                )
                                                                                                                                            }
                                                                                                                                            : s
                                                                                                                                    )
                                                                                                                                }));
                                                                                                                            }}
                                                                                                                            className="p-2 text-red-600 hover:text-red-700"
                                                                                                                        >
                                                                                                                            <Trash2 size={16} />
                                                                                                                        </button>
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                                <button
                                                                                                                    onClick={() => {
                                                                                                                        const newFields = [...(question.fields || []), {
                                                                                                                            name: '',
                                                                                                                            type: 'text',
                                                                                                                            label: ''
                                                                                                                        }];
                                                                                                                        setFormData(prev => ({
                                                                                                                            ...prev,
                                                                                                                            sections: prev.sections.map(s =>
                                                                                                                                s.id === section.id
                                                                                                                                    ? {
                                                                                                                                        ...s,
                                                                                                                                        questions: s.questions.map(q =>
                                                                                                                                            q.id === question.id
                                                                                                                                                ? { ...q, fields: newFields }
                                                                                                                                                : q
                                                                                                                                        )
                                                                                                                                    }
                                                                                                                                    : s
                                                                                                                            )
                                                                                                                        }));
                                                                                                                    }}
                                                                                                                    className="w-full p-2 border border-dashed rounded-lg text-mongodb-green hover:bg-mongodb-spring"
                                                                                                                >
                                                                                                                    Add Field
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    <div className="flex items-center gap-4 mb-4">
                                                                                                        <label className="flex items-center gap-2">
                                                                                                            <input
                                                                                                                type="checkbox"
                                                                                                                checked={question.required}
                                                                                                                onChange={e => setFormData(prev => ({
                                                                                                                    ...prev,
                                                                                                                    sections: prev.sections.map(s =>
                                                                                                                        s.id === section.id
                                                                                                                            ? {
                                                                                                                                ...s,
                                                                                                                                questions: s.questions.map(q =>
                                                                                                                                    q.id === question.id
                                                                                                                                        ? { ...q, required: e.target.checked }
                                                                                                                                        : q
                                                                                                                                )
                                                                                                                            }
                                                                                                                            : s
                                                                                                                    )
                                                                                                                }))}
                                                                                                                className="rounded text-mongodb-green"
                                                                                                            />
                                                                                                            <span className="text-sm text-mongodb-slate">Required</span>
                                                                                                        </label>
                                                                                                    </div>

                                                                                                    <input
                                                                                                        value={question.placeholder || ''}
                                                                                                        onChange={e => setFormData(prev => ({
                                                                                                            ...prev,
                                                                                                            sections: prev.sections.map(s =>
                                                                                                                s.id === section.id
                                                                                                                    ? {
                                                                                                                        ...s,
                                                                                                                        questions: s.questions.map(q =>
                                                                                                                            q.id === question.id
                                                                                                                                ? { ...q, placeholder: e.target.value }
                                                                                                                                : q
                                                                                                                        )
                                                                                                                    }
                                                                                                                    : s
                                                                                                            )
                                                                                                        }))}
                                                                                                        className="w-full p-2 border rounded-lg mb-4"
                                                                                                        placeholder="Placeholder text..."
                                                                                                    />

                                                                                                    <textarea
                                                                                                        value={question.promptContext || ''}
                                                                                                        onChange={e => setFormData(prev => ({
                                                                                                            ...prev,
                                                                                                            sections: prev.sections.map(s =>
                                                                                                                s.id === section.id
                                                                                                                    ? {
                                                                                                                        ...s,
                                                                                                                        questions: s.questions.map(q =>
                                                                                                                            q.id === question.id
                                                                                                                                ? { ...q, promptContext: e.target.value }
                                                                                                                                : q
                                                                                                                        )
                                                                                                                    }
                                                                                                                    : s
                                                                                                            )
                                                                                                        }))}
                                                                                                        className="w-full p-2 border rounded-lg"
                                                                                                        rows={3}
                                                                                                        placeholder="Prompt context for AI analysis..."
                                                                                                    />
                                                                                                </div>

                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        if (confirm('Delete this question?')) {
                                                                                                            setFormData(prev => ({
                                                                                                                ...prev,
                                                                                                                sections: prev.sections.map(s =>
                                                                                                                    s.id === section.id
                                                                                                                        ? {
                                                                                                                            ...s,
                                                                                                                            questions: s.questions.filter(q => q.id !== question.id)
                                                                                                                        }
                                                                                                                        : s
                                                                                                                )
                                                                                                            }));
                                                                                                        }
                                                                                                    }}
                                                                                                    className="p-1 text-red-600 hover:text-red-700"
                                                                                                >
                                                                                                    <Trash2 size={16} />
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </Draggable>
                                                                            ))}
                                                                            {provided.placeholder}
                                                                        </div>
                                                                    )}
                                                                </Droppable>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* Analysis Template */}
                <div className="mb-6">
                    <label className="block mb-1 font-medium text-mongodb-slate">
                        Analysis Template
                        {errors.analysisPromptTemplate && (
                            <span className="text-red-500 text-sm ml-2">{errors.analysisPromptTemplate}</span>
                        )}
                    </label>
                    <textarea
                        value={formData.analysisPromptTemplate}
                        onChange={e => setFormData(prev => ({ ...prev, analysisPromptTemplate: e.target.value }))}
                        className="w-full p-2 border rounded-lg font-mono text-sm"
                        rows={8}
                        placeholder="Template for generating the final analysis..."
                    />
                </div>
            </div>
        </div>
    );
};

export default TemplateEditor;