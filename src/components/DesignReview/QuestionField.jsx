// frontend/design-review-app/src/components/DesignReview/QuestionField.jsx
import { useState } from 'react';
import { Upload, X, Plus } from 'lucide-react';

export const QuestionField = ({ question, value, onChange, nestingLevel = 0 }) => {
  const [files, setFiles] = useState([]);

  // Prevent infinite recursion by limiting nesting depth
  if (nestingLevel > 2) {
    console.warn('Maximum nesting level reached for question field');
    return null;
  }

  const renderDynamicList = () => {
    const items = Array.isArray(value) ? value : [];

    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            {Object.entries(question.itemTemplate).map(([field, fieldConfig]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')}
                </label>
                <QuestionField
                  question={{ ...fieldConfig, id: `${question.id}.${index}.${field}` }}
                  value={item[field]}
                  onChange={(newValue) => {
                    const newItems = [...items];
                    newItems[index] = { ...newItems[index], [field]: newValue };
                    onChange(newItems);
                  }}
                  nestingLevel={nestingLevel + 1}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newItems = items.filter((_, i) => i !== index);
                onChange(newItems);
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const newItem = Object.fromEntries(
              Object.keys(question.itemTemplate).map(field => [field, ''])
            );
            onChange([...items, newItem]);
          }}
          className="flex items-center space-x-2 text-mongodb-forest hover:text-mongodb-evergreen"
        >
          <Plus size={16} />
          <span>Add {question.label}</span>
        </button>
      </div>
    );
  };

  const renderField = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
          >
            <option value="">Select an option</option>
            {question.options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multi-select':
        return (
          <div className="space-y-2">
            {question.options.map(optionGroup => (
              <div key={optionGroup.value} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{optionGroup.label}</h4>
                <select
                  value={value?.[optionGroup.value] || ''}
                  onChange={e => {
                    const newValue = { ...(value || {}), [optionGroup.value]: e.target.value };
                    onChange(newValue);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
                >
                  <option value="">Select an option</option>
                  {optionGroup.subOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );

      case 'checkbox-group':
        return (
          <div className="space-y-2">
            {question.options.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value?.includes(option) || false}
                  onChange={e => {
                    const newValue = e.target.checked
                      ? [...(value || []), option]
                      : (value || []).filter(v => v !== option);
                    onChange(newValue);
                  }}
                  className="rounded border-mongodb-forest text-mongodb-forest focus:ring-mongodb-spring"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'file-upload':
        return (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-mongodb-mist rounded-lg p-8 text-center hover:border-mongodb-forest transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const newFiles = Array.from(e.dataTransfer.files);
                setFiles([...files, ...newFiles]);
                onChange([...files, ...newFiles]);
              }}
            >
              <Upload className="mx-auto h-12 w-12 text-mongodb-forest mb-4" />
              <p className="text-mongodb-slate">
                Drag files here or{' '}
                <label className="text-mongodb-forest hover:text-mongodb-evergreen cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept={question.accept}
                    multiple={question.multiple}
                    onChange={e => {
                      const newFiles = Array.from(e.target.files || []);
                      setFiles([...files, ...newFiles]);
                      onChange([...files, ...newFiles]);
                    }}
                  />
                </label>
              </p>
              {question.helperText && (
                <p className="text-sm text-mongodb-forest mt-2">
                  {question.helperText}
                </p>
              )}
            </div>
            {files.length > 0 && (
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-mongodb-lavender rounded-lg p-2"
                  >
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = files.filter((_, i) => i !== index);
                        setFiles(newFiles);
                        onChange(newFiles);
                      }}
                      className="text-mongodb-forest hover:text-mongodb-evergreen"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case 'dynamic-list':
        return renderDynamicList();

      default:
        return <p>Unsupported question type: {question.type}</p>;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium text-mongodb-slate">
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {question.helperText && !['file-upload'].includes(question.type) && (
        <p className="text-sm text-mongodb-forest">{question.helperText}</p>
      )}
    </div>
  );
};

export default QuestionField;