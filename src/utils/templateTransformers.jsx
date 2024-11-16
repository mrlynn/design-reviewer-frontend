// Add this to a new file: src/utils/templateTransformers.js

export const mongoTemplateToEditorFormat = (mongoTemplate) => {
    // Get the current version content
    const currentVersionData = mongoTemplate.versions.find(
      v => v.version === mongoTemplate.currentVersion
    );
  
    return {
      id: mongoTemplate.templateId,
      name: mongoTemplate.name,
      description: mongoTemplate.description,
      version: mongoTemplate.currentVersion,
      type: mongoTemplate.type,
      metadata: {
        author: mongoTemplate.metadata?.author || '',
        lastUpdated: mongoTemplate.updatedAt,
        tags: mongoTemplate.tags || []
      },
      globalPromptContext: currentVersionData?.content?.globalPromptContext || '',
      sections: currentVersionData?.content?.sections || [],
      analysisPromptTemplate: currentVersionData?.content?.analysisPromptTemplate || ''
    };
  };
  
  export const editorTemplateToMongoFormat = (editorTemplate, existingTemplate = null) => {
    const templateContent = {
      globalPromptContext: editorTemplate.globalPromptContext,
      sections: editorTemplate.sections,
      analysisPromptTemplate: editorTemplate.analysisPromptTemplate
    };
  
    // If updating existing template
    if (existingTemplate) {
      return {
        ...existingTemplate,
        name: editorTemplate.name,
        description: editorTemplate.description,
        type: editorTemplate.type,
        tags: editorTemplate.metadata.tags,
        metadata: {
          ...existingTemplate.metadata,
          ...editorTemplate.metadata
        },
        versions: [
          ...existingTemplate.versions,
          {
            content: templateContent,
            version: incrementVersion(existingTemplate.currentVersion),
            createdAt: new Date().toISOString(),
            createdBy: editorTemplate.metadata.author,
            changelog: 'Updated template' // Could make this editable
          }
        ],
        currentVersion: incrementVersion(existingTemplate.currentVersion)
      };
    }
  
    // Creating new template
    return {
      templateId: editorTemplate.id || `template-${Date.now()}`,
      name: editorTemplate.name,
      description: editorTemplate.description,
      type: editorTemplate.type,
      status: 'draft',
      tags: editorTemplate.metadata.tags,
      metadata: editorTemplate.metadata,
      currentVersion: '1.0.0',
      versions: [{
        content: templateContent,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        createdBy: editorTemplate.metadata.author,
        changelog: 'Initial version'
      }]
    };
  };
  
  const incrementVersion = (version) => {
    const parts = version.split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return parts.join('.');
  };