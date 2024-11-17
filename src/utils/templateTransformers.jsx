// src/utils/templateTransformers.js
import semver from 'semver';

export const mongoTemplateToEditorFormat = (mongoTemplate) => {
  // Get the current version content
  const currentVersionData = mongoTemplate.versions.find(
    v => v.version === mongoTemplate.currentVersion
  );

  return {
    templateId: mongoTemplate.templateId, // Changed from id to templateId for consistency
    name: mongoTemplate.name,
    description: mongoTemplate.description,
    currentVersion: mongoTemplate.currentVersion,
    type: mongoTemplate.type,
    status: mongoTemplate.status || 'draft',
    metadata: {
      author: mongoTemplate.metadata?.author || '',
      lastUpdated: mongoTemplate.updatedAt,
      tags: mongoTemplate.tags || [],
      // Add additional metadata fields
      createdAt: mongoTemplate.createdAt,
      versionCount: mongoTemplate.versions.length,
      originalAuthor: mongoTemplate.metadata?.originalAuthor
    },
    // Version history for UI display
    versionHistory: mongoTemplate.versions.map(v => ({
      version: v.version,
      createdAt: v.createdAt,
      createdBy: v.createdBy,
      changelog: v.changelog
    })).sort((a, b) => semver.compare(b.version, a.version)),
    // Content from current version
    globalPromptContext: currentVersionData?.content?.globalPromptContext || '',
    sections: currentVersionData?.content?.sections || [],
    analysisPromptTemplate: currentVersionData?.content?.analysisPromptTemplate || '',
    // Add empty changelog for new versions
    changelog: ''
  };
};

export const editorTemplateToMongoFormat = (editorTemplate, existingTemplate = null) => {
  const templateContent = {
    globalPromptContext: editorTemplate.globalPromptContext,
    sections: editorTemplate.sections || [],
    analysisPromptTemplate: editorTemplate.analysisPromptTemplate
  };

  // If updating existing template
  if (existingTemplate) {
    const newVersion = incrementVersion(existingTemplate.currentVersion);
    
    return {
      ...existingTemplate,
      templateId: existingTemplate.templateId,
      name: editorTemplate.name,
      description: editorTemplate.description,
      type: editorTemplate.type,
      status: editorTemplate.status || existingTemplate.status,
      tags: editorTemplate.metadata.tags,
      metadata: {
        ...existingTemplate.metadata,
        ...editorTemplate.metadata,
        lastUpdated: new Date().toISOString()
      },
      versions: [
        ...existingTemplate.versions,
        {
          content: templateContent,
          version: newVersion,
          createdAt: new Date().toISOString(),
          createdBy: editorTemplate.metadata.author || 'system',
          changelog: editorTemplate.changelog || `Updated to version ${newVersion}`
        }
      ],
      currentVersion: newVersion,
      updatedAt: new Date().toISOString()
    };
  }

  // Creating new template
  const initialVersion = '1.0.0';
  const timestamp = new Date().toISOString();
  
  return {
    templateId: editorTemplate.templateId || `template-${Date.now()}`,
    name: editorTemplate.name,
    description: editorTemplate.description,
    type: editorTemplate.type,
    status: editorTemplate.status || 'draft',
    tags: editorTemplate.metadata.tags || [],
    metadata: {
      ...editorTemplate.metadata,
      originalAuthor: editorTemplate.metadata.author,
      createdAt: timestamp,
      lastUpdated: timestamp
    },
    currentVersion: initialVersion,
    versions: [{
      content: templateContent,
      version: initialVersion,
      createdAt: timestamp,
      createdBy: editorTemplate.metadata.author || 'system',
      changelog: editorTemplate.changelog || 'Initial version'
    }],
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

// Helper function to increment version using semver
const incrementVersion = (version) => {
  try {
    // Check if version is valid semver
    if (!semver.valid(version)) {
      console.warn(`Invalid version format: ${version}, defaulting to patch increment`);
      return semver.inc('1.0.0', 'patch');
    }
    return semver.inc(version, 'patch');
  } catch (error) {
    console.error('Error incrementing version:', error);
    return semver.inc('1.0.0', 'patch');
  }
};

// Helper function to compare versions
export const compareVersions = (v1, v2) => {
  try {
    return semver.compare(v1, v2);
  } catch (error) {
    console.error('Error comparing versions:', error);
    return 0;
  }
};

// Helper function to validate template format
export const validateTemplate = (template) => {
  const requiredFields = [
    'name',
    'description',
    'type',
    'globalPromptContext',
    'analysisPromptTemplate'
  ];

  const missingFields = requiredFields.filter(field => !template[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      errors: missingFields.map(field => `Missing required field: ${field}`)
    };
  }

  if (!Array.isArray(template.sections)) {
    return {
      isValid: false,
      errors: ['Sections must be an array']
    };
  }

  return {
    isValid: true,
    errors: []
  };
};