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
                    <div key={index} className="border rounded-lg p-4 space-y-4 bg-mongodb-lavender bg-opacity-10">
                        {question.fields?.map((field) => (
                            <div key={field.name}>
                                <label className="block text-sm font-medium mb-1">
                                    {field.label}
                                </label>
                                <QuestionField
                                    question={{
                                        id: `${question.id}.${index}.${field.name}`,
                                        type: field.type,
                                        label: field.label,
                                        options: field.options || [], // Ensure options are passed through
                                        placeholder: field.placeholder,
                                        min: field.min,
                                        max: field.max,
                                        step: field.step
                                    }}
                                    value={item[field.name]}
                                    onChange={(newValue) => {
                                        const newItems = [...items];
                                        newItems[index] = { ...newItems[index], [field.name]: newValue };
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
                            className="inline-flex items-center text-red-500 hover:text-red-700 text-sm"
                        >
                            <X size={16} className="mr-1" />
                            <span>Remove Entry</span>
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => {
                        const newItem = Object.fromEntries(
                            (question.fields || []).map(field => [field.name, field.type === 'number' ? 0 : ''])
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
        if (!question) {
            console.error('Question object is undefined');
            return null;
        }
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
            case 'email':  // Handle email type
                return (
                    <input
                        type={question.type}  // This will be "text" or "email"
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
                        {Array.isArray(question.options) && question.options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

                case 'multi-select':
                    if (!Array.isArray(question.options)) {
                        return (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                                Missing options for multi-select
                            </div>
                        );
                    }
                    return (
                        <div className="space-y-4">
                            {question.options.map(optionGroup => (
                                <div key={optionGroup.name} className="border rounded-lg p-4 bg-mongodb-lavender bg-opacity-10">
                                    <h4 className="font-medium mb-2">{optionGroup.label}</h4>
                                    <select
                                        value={value?.[optionGroup.name] || ''}
                                        onChange={e => {
                                            const newValue = { 
                                                ...(value || {}), 
                                                [optionGroup.name]: e.target.value 
                                            };
                                            onChange(newValue);
                                        }}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
                                    >
                                        <option value="">Select {optionGroup.label}</option>
                                        {Array.isArray(optionGroup.options) && optionGroup.options.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                            {/* Preview of selected values */}
                            {value && Object.keys(value).length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {question.options.map(optionGroup => 
                                        value[optionGroup.name] && (
                                            <div key={optionGroup.name} className="text-sm text-mongodb-slate">
                                                <span className="font-medium">{optionGroup.label}:</span>{' '}
                                                <span>{value[optionGroup.name]}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    );

            case 'checkbox-group':
                if (!Array.isArray(question.options)) {
                    return (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                            Missing options for checkbox group
                        </div>
                    );
                }
                return (
                    <div className="space-y-2">
                        {question.options.map(option => (
                            <label key={option} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(value) && value.includes(option)}
                                    onChange={e => {
                                        const newValue = Array.isArray(value) ? [...value] : [];
                                        if (e.target.checked) {
                                            newValue.push(option);
                                        } else {
                                            const index = newValue.indexOf(option);
                                            if (index > -1) {
                                                newValue.splice(index, 1);
                                            }
                                        }
                                        onChange(newValue);
                                    }}
                                    className="rounded border-mongodb-forest text-mongodb-forest focus:ring-mongodb-spring"
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={value || ''}
                        onChange={e => onChange(e.target.value)}
                        placeholder={question.placeholder}
                        min={question.min}
                        max={question.max}
                        step={question.step || 1}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
                    />
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
            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={e => onChange(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mongodb-spring focus:border-mongodb-spring"
                    />
                );

            case 'dynamic-list':
                return renderDynamicList();

            default:
                return <p>Unsupported question type: {question.type}</p>;
        }
    };

    if (!question) {
        return null;
    }

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