// components/SectionEditor.jsx
import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SectionEditor = ({ sections = [], onChange }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onChange(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-mongodb-slate">Sections</h3>
        <button
          type="button" // Add type="button" to prevent form submission
          onClick={() => {
            const newSection = {
              id: `section-${Date.now()}`,
              title: 'New Section',
              description: '',
              questions: []
            };
            onChange([...sections, newSection]);
          }}
          className="px-3 py-1 bg-mongodb-spring text-mongodb-green rounded-lg hover:bg-mongodb-spring-dark flex items-center gap-2"
        >
          <Plus size={16} />
          Add Section
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable-sections" type="SECTION">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sections.map((section, index) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id}
                  index={index}
                  type="SECTION"
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-4 border rounded-lg"
                    >
                      <div className="p-4 bg-gray-50 flex items-center gap-3">
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="text-gray-400" />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedSections(prev => ({
                              ...prev,
                              [section.id]: !prev[section.id]
                            }));
                          }}
                          className="flex items-center"
                        >
                          {expandedSections[section.id] ? 
                            <ChevronDown size={18} /> : 
                            <ChevronRight size={18} />}
                        </button>

                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => {
                            const newSections = sections.map(s =>
                              s.id === section.id
                                ? { ...s, title: e.target.value }
                                : s
                            );
                            onChange(newSections);
                          }}
                          className="flex-grow p-2 bg-transparent border-none focus:ring-0"
                          placeholder="Section Title"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const newQuestion = {
                              id: `question-${Date.now()}`,
                              type: 'text',
                              label: 'New Question',
                              required: false,
                              placeholder: '',
                              promptContext: ''
                            };
                            const newSections = sections.map(s =>
                              s.id === section.id
                                ? { ...s, questions: [...(s.questions || []), newQuestion] }
                                : s
                            );
                            onChange(newSections);
                          }}
                          className="p-1 text-mongodb-green hover:text-mongodb-green-dark"
                        >
                          <Plus size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newSections = sections.filter(s => s.id !== section.id);
                            onChange(newSections);
                          }}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {expandedSections[section.id] && (
                        <div className="p-4">
                          <textarea
                            value={section.description || ''}
                            onChange={(e) => {
                              const newSections = sections.map(s =>
                                s.id === section.id
                                  ? { ...s, description: e.target.value }
                                  : s
                              );
                              onChange(newSections);
                            }}
                            className="w-full p-2 border rounded-lg mb-4"
                            placeholder="Section description..."
                            rows={2}
                          />

                          {/* Questions list */}
                          <div className="space-y-4">
                            {(section.questions || []).map((question, qIndex) => (
                              <QuestionEditor
                                key={question.id}
                                question={question}
                                onUpdate={(updatedQuestion) => {
                                  const newSections = sections.map(s =>
                                    s.id === section.id
                                      ? {
                                          ...s,
                                          questions: s.questions.map(q =>
                                            q.id === question.id ? updatedQuestion : q
                                          )
                                        }
                                      : s
                                  );
                                  onChange(newSections);
                                }}
                                onDelete={() => {
                                  const newSections = sections.map(s =>
                                    s.id === section.id
                                      ? {
                                          ...s,
                                          questions: s.questions.filter(q => q.id !== question.id)
                                        }
                                      : s
                                  );
                                  onChange(newSections);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
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
  );
};

const QuestionEditor = ({ question, onUpdate, onDelete }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          value={question.label || ''}
          onChange={(e) => onUpdate({ ...question, label: e.target.value })}
          className="p-2 border rounded-lg"
          placeholder="Question label"
        />
        
        <select
          value={question.type || 'text'}
          onChange={(e) => onUpdate({ ...question, type: e.target.value })}
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

      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={question.required || false}
            onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
            className="rounded text-mongodb-green"
          />
          <span className="text-sm text-mongodb-slate">Required</span>
        </label>
      </div>

      <input
        type="text"
        value={question.placeholder || ''}
        onChange={(e) => onUpdate({ ...question, placeholder: e.target.value })}
        className="w-full p-2 border rounded-lg mb-4"
        placeholder="Placeholder text..."
      />

      <textarea
        value={question.promptContext || ''}
        onChange={(e) => onUpdate({ ...question, promptContext: e.target.value })}
        className="w-full p-2 border rounded-lg mb-4"
        rows={3}
        placeholder="Prompt context for AI analysis..."
      />

      <button
        type="button"
        onClick={onDelete}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default SectionEditor;