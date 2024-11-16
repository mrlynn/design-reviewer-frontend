import { useState } from 'react';
import { config } from '../../config';
import { Download, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownContent = ({ content }) => (
    <ReactMarkdown
        className="markdown-content"
        remarkPlugins={[remarkGfm, remarkFrontmatter]}
        components={{
            code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                    <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md !my-4"
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                ) : (
                    <code className={`${className} bg-gray-100 px-1 py-0.5 rounded text-mongodb-forest`} {...props}>
                        {children}
                    </code>
                );
            },
            h1: ({ node, ...props }) => (
                <h1 className="text-3xl font-bold text-mongodb-slate mt-8 mb-4 pb-2 border-b border-mongodb-mist" {...props} />
            ),
            h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-bold text-mongodb-slate mt-6 mb-3" {...props} />
            ),
            h3: ({ node, ...props }) => (
                <h3 className="text-xl font-bold text-mongodb-slate mt-4 mb-2" {...props} />
            ),
            a: ({ node, ...props }) => (
                <a
                    className="text-mongodb-green hover:text-mongodb-forest hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                />
            ),
            p: ({ node, ...props }) => (
                <p className="my-4 text-mongodb-slate leading-relaxed" {...props} />
            ),
            ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 my-4 space-y-2 text-mongodb-slate" {...props} />
            ),
            ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 my-4 space-y-2 text-mongodb-slate" {...props} />
            ),
            li: ({ node, children, ...props }) => (
                <li className="leading-relaxed" {...props}>{children}</li>
            ),
            blockquote: ({ node, ...props }) => (
                <blockquote
                    className="border-l-4 border-mongodb-green bg-mongodb-lavender pl-4 py-2 my-4 text-mongodb-slate"
                    {...props}
                />
            ),
            table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-mongodb-mist" {...props} />
                </div>
            ),
            thead: ({ node, ...props }) => (
                <thead className="bg-mongodb-lavender" {...props} />
            ),
            th: ({ node, ...props }) => (
                <th className="px-4 py-2 text-left text-mongodb-slate font-semibold" {...props} />
            ),
            td: ({ node, ...props }) => (
                <td className="px-4 py-2 border-t border-mongodb-mist" {...props} />
            ),
            hr: ({ node, ...props }) => (
                <hr className="my-8 border-t-2 border-mongodb-mist" {...props} />
            ),
        }}
    >
        {content}
    </ReactMarkdown>
);


const formatValue = (value) => {
    if (value instanceof File) {
        return value.name;
    }

    if (Array.isArray(value) && value[0] instanceof File) {
        return value.map(file => file.name).join(', ');
    }

    if (typeof value === 'object' && value !== null) {
        if ('operation_type' in value || 'current_latency' in value || 'target_latency' in value) {
            return (
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(value).map(([key, val]) => (
                        <div key={key}>
                            <span className="font-medium">{key.replace(/_/g, ' ')}: </span>
                            <span>{val}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return JSON.stringify(value, null, 2);
    }

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    return String(value);
};

const ReviewSummary = ({ template, responses, onEdit }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDocument, setGeneratedDocument] = useState(null);
    const [error, setError] = useState(null);
    const [showDocument, setShowDocument] = useState(false);

    // Normalize the template data
    const normalizedTemplate = {
        ...template,
        id: template.id || template._id,
        currentContent: template.currentContent || { sections: [] },
    };
    const sections = normalizedTemplate.currentContent.sections || [];
  
    const handleGenerateDocument = async () => {
        if (!normalizedTemplate || !normalizedTemplate.id) {
            setError('Template is invalid or missing required fields.');
            return;
        }
    
    
        try {
            setIsGenerating(true);
            setError(null);
    
            console.log('Generating document with:', {
                templateId: normalizedTemplate.id,
                responses: responses,
            });
            const response = await fetch(`${config.API_URL}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    templateId: normalizedTemplate.id,
                    responses: responses,
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                console.error('Generation failed:', data);
                throw new Error(data.details || data.error || 'Failed to generate document');
            }
    
            console.log('Generated document:', data);
            setGeneratedDocument(data);
            setShowDocument(true);
        } catch (err) {
            console.error('Document generation error:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsGenerating(false);
        }
    };
    
  
    const downloadDocument = () => {
      if (!generatedDocument) return;
  
      const element = document.createElement('a');
      const file = new Blob([generatedDocument.content], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    };
  
    return (
      <div className="max-w-4xl mx-auto p-6">
        {!showDocument ? (
          <div className="bg-mongodb-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-mongodb-slate mb-2">
                Review Summary
              </h2>
              <p className="text-mongodb-forest">
                Please review your responses before generating the final document.
              </p>
            </div>
  
            {sections.length > 0 ? (
              sections.map(section => (
                <div key={section.id || section.title} className="mb-8">
                  <h3 className="text-xl font-semibold text-mongodb-slate mb-4">
                    {section.title}
                  </h3>
                  <div className="space-y-4">
                    {section.questions?.map(question => {
                      const response = responses[question.id];
                      if (!response) return null;
  
                      return (
                        <div key={question.id} className="border-b pb-4">
                          <h4 className="font-medium text-mongodb-slate mb-2">
                            {question.label}
                          </h4>
                          <div className="text-mongodb-forest">
                            {formatValue(response)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No sections available in this template.</p>
            )}
  
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">
                {error}
              </div>
            )}
  
            <div className="flex justify-between mt-8">
              <button
                onClick={onEdit}
                className="px-6 py-2 bg-mongodb-mist text-mongodb-slate rounded-lg hover:bg-mongodb-lavender transition-colors"
              >
                Edit Responses
              </button>
              <button
                onClick={handleGenerateDocument}
                disabled={isGenerating}
                className="px-6 py-2 bg-mongodb-forest text-white rounded-lg hover:bg-mongodb-evergreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Review Document'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-mongodb-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-mongodb-slate">Generated Document</h2>
              <div className="space-x-4">
                <button
                  onClick={() => setShowDocument(false)}
                  className="px-4 py-2 bg-mongodb-mist text-mongodb-slate rounded-lg hover:bg-mongodb-lavender transition-colors"
                >
                  Back to Summary
                </button>
                <button
                  onClick={downloadDocument}
                  className="px-4 py-2 bg-mongodb-forest text-white rounded-lg hover:bg-mongodb-evergreen transition-colors"
                >
                  Download Document
                </button>
              </div>
            </div>
  
            <div className="prose prose-slate max-w-none">
              <MarkdownContent content={generatedDocument?.content || 'No content generated.'} />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default ReviewSummary;
  

