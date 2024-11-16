// templateUtils.js
import { z } from 'zod';
import YAML from 'yaml';

// Define the schema for validation
const QuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'text-area', 'select', 'multi-select', 'dynamic-list', 'checklist', 'code-block']),
  required: z.boolean().optional().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
  fields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.string()
  })).optional(),
  language: z.string().optional(),
  promptContext: z.string().optional()
});

const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(QuestionSchema)
});

const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  type: z.string(),
  metadata: z.object({
    author: z.string(),
    lastUpdated: z.string(),
    tags: z.array(z.string())
  }),
  globalPromptContext: z.string(),
  sections: z.array(SectionSchema),
  analysisPromptTemplate: z.string()
});

export const validateTemplate = (template) => {
  try {
    return TemplateSchema.parse(template);
  } catch (error) {
    console.error('Template validation failed:', error.errors);
    throw error;
  }
};

export const convertYamlToTemplate = (yamlString) => {
  try {
    const template = YAML.parse(yamlString);
    return validateTemplate(template);
  } catch (error) {
    console.error('YAML parsing failed:', error);
    throw error;
  }
};

export const saveTemplate = async (template) => {
  try {
    const validatedTemplate = validateTemplate(template);
    
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedTemplate)
    });

    if (!response.ok) {
      throw new Error('Failed to save template');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to save template:', error);
    throw error;
  }
};

// Helper function to generate an LLM prompt based on template and responses
export const generatePrompt = (template, responses) => {
  let prompt = template.globalPromptContext + '\n\n';

  template.sections.forEach(section => {
    prompt += `## ${section.title}\n`;
    
    section.questions.forEach(question => {
      const response = responses[question.id];
      if (response && question.promptContext) {
        prompt += `\n### ${question.label}\nResponse: ${JSON.stringify(response)}\n`;
        prompt += `Analysis Context:\n${question.promptContext}\n`;
      }
    });
  });

  prompt += '\n' + template.analysisPromptTemplate;

  return prompt;
};