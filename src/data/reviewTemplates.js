// frontend/design-review-app/src/data/reviewTemplates.js
export const reviewTemplates = {
  'new-development': {
    id: 'new-development',
    name: 'New Development Review',
    description: 'For new applications being built on MongoDB',
    icon: '🆕',
    sections: [
      {
        id: 'project-overview',
        title: 'Project Overview',
        description: 'Basic information about the project and its requirements',
        questions: [
          {
            id: 'project-name',
            type: 'text',
            label: 'Project Name',
            required: true,
            placeholder: 'Internal name for the project'
          },
          {
            id: 'project-description',
            type: 'textarea',
            label: 'Project Description',
            required: true,
            placeholder: 'Brief description of the project goals and scope'
          },
          {
            id: 'target-release',
            type: 'date',
            label: 'Target Release Date',
            required: false
          },
          {
            id: 'industry',
            type: 'select',
            label: 'Industry',
            options: [
              'Financial Services',
              'Healthcare',
              'Retail',
              'Technology',
              'Manufacturing',
              'Other'
            ]
          }
        ]
      },
      {
        id: 'requirements',
        title: 'Technical Requirements',
        description: 'Key technical requirements and constraints',
        questions: [
          {
            id: 'scale-requirements',
            type: 'multi-select',
            label: 'Scale Requirements',
            required: true,
            options: [
              {
                value: 'data-size',
                label: 'Expected Data Size',
                subOptions: [
                  'GB range (< 100GB)',
                  'TB range (100GB - 10TB)',
                  'Large TB range (> 10TB)',
                  'PB range'
                ]
              },
              {
                value: 'operations',
                label: 'Operations Per Second',
                subOptions: [
                  '< 1,000 ops/sec',
                  '1,000 - 10,000 ops/sec',
                  '10,000 - 100,000 ops/sec',
                  '> 100,000 ops/sec'
                ]
              }
            ]
          },
          {
            id: 'availability-requirements',
            type: 'checkbox-group',
            label: 'Availability Requirements',
            options: [
              'High Availability Required',
              'Disaster Recovery Required',
              'Multi-Region Distribution',
              'Active-Active Configuration'
            ]
          },
          {
            id: 'compliance-requirements',
            type: 'checkbox-group',
            label: 'Compliance Requirements',
            options: [
              'SOC 2',
              'HIPAA',
              'PCI',
              'GDPR',
              'Other'
            ]
          }
        ]
      },
      {
        id: 'data-modeling',
        title: 'Data Modeling',
        description: 'Data model design and access patterns',
        questions: [
          {
            id: 'data-model-description',
            type: 'file-upload',
            label: 'Data Model Documentation',
            accept: '.json,.yaml,.md',
            multiple: true,
            helperText: 'Upload your data model documentation (JSON schema, diagrams, etc.)'
          },
          {
            id: 'access-patterns',
            type: 'dynamic-list',
            label: 'Access Patterns',
            itemTemplate: {
              operation: {
                type: 'select',
                options: ['Read', 'Write', 'Update', 'Delete']
              },
              description: {
                type: 'textarea',
                placeholder: 'Describe the access pattern'
              },
              frequency: {
                type: 'select',
                options: ['High', 'Medium', 'Low']
              }
            }
          },
          {
            id: 'relationships',
            type: 'relationship-diagram',
            label: 'Data Relationships',
            description: 'Define the relationships between your main entities'
          }
        ]
      }
    ]
  },
  'existing-application': {
    id: 'existing-application',
    name: 'Existing Application Review',
    description: 'For reviewing and optimizing existing MongoDB applications',
    icon: '🔄',
    sections: [
      {
        id: 'application-overview',
        title: 'Application Overview',
        description: 'Current state and context of the application',
        questions: [
          {
            id: 'app-name',
            type: 'text',
            label: 'Application Name',
            required: true,
            placeholder: 'Name of the existing application'
          },
          {
            id: 'current-version',
            type: 'text',
            label: 'Current MongoDB Version',
            required: true,
            placeholder: 'e.g., MongoDB 5.0, Atlas 6.0'
          },
          {
            id: 'deployment-type',
            type: 'select',
            label: 'Deployment Type',
            required: true,
            options: [
              'Atlas (Serverless)',
              'Atlas (Dedicated)',
              'Atlas (Shared)',
              'On-Premises',
              'Self-Managed Cloud',
              'Other'
            ]
          },
          {
            id: 'current-challenges',
            type: 'textarea',
            label: 'Current Challenges',
            required: true,
            placeholder: 'Describe the main challenges or pain points you are experiencing'
          }
        ]
      },
      {
        id: 'performance-metrics',
        title: 'Performance Profile',
        description: 'Current performance metrics and requirements',
        questions: [
          {
            id: 'current-data-size',
            type: 'select',
            label: 'Current Data Size',
            required: true,
            options: [
              '< 100GB',
              '100GB - 1TB',
              '1TB - 10TB',
              '> 10TB'
            ]
          },
          {
            id: 'growth-rate',
            type: 'text',
            label: 'Data Growth Rate',
            placeholder: 'e.g., 100GB per month',
            required: true
          },
          {
            id: 'operation-metrics',
            type: 'dynamic-list',
            label: 'Critical Operations',
            itemTemplate: {
              operation_type: {
                type: 'select',
                options: ['Read', 'Write', 'Update', 'Delete', 'Aggregation']
              },
              current_latency: {
                type: 'text',
                placeholder: 'Current latency (ms)'
              },
              target_latency: {
                type: 'text',
                placeholder: 'Target latency (ms)'
              },
              frequency: {
                type: 'select',
                options: ['High', 'Medium', 'Low']
              }
            }
          },
          {
            id: 'slow-queries',
            type: 'file-upload',
            label: 'Slow Query Logs',
            accept: '.json,.log',
            multiple: true,
            helperText: 'Upload relevant slow query logs or MongoDB Atlas Performance Advisor reports'
          }
        ]
      },
      {
        id: 'schema-analysis',
        title: 'Schema Analysis',
        description: 'Current schema design and access patterns',
        questions: [
          {
            id: 'current-schema',
            type: 'file-upload',
            label: 'Current Schema',
            accept: '.json,.js,.yaml',
            multiple: true,
            helperText: 'Upload current schema definitions or examples'
          },
          {
            id: 'indexing-strategy',
            type: 'textarea',
            label: 'Current Indexing Strategy',
            placeholder: 'Describe your current indexes and their purposes',
            required: true
          },
          {
            id: 'access-patterns',
            type: 'dynamic-list',
            label: 'Key Access Patterns',
            itemTemplate: {
              description: {
                type: 'textarea',
                placeholder: 'Describe the access pattern'
              },
              frequency: {
                type: 'select',
                options: ['High', 'Medium', 'Low']
              },
              performance_grade: {
                type: 'select',
                options: ['Optimal', 'Acceptable', 'Needs Improvement', 'Critical']
              }
            }
          },
          {
            id: 'schema-challenges',
            type: 'checkbox-group',
            label: 'Current Schema Challenges',
            options: [
              'Large Documents',
              'Frequent Schema Changes',
              'Complex Relationships',
              'Inconsistent Data',
              'Growing Array Size',
              'Unbounded Arrays',
              'Frequent Document Updates',
              'Other'
            ]
          }
        ]
      },
      {
        id: 'operational-requirements',
        title: 'Operational Requirements',
        description: 'Current operational setup and requirements',
        questions: [
          {
            id: 'availability-requirements',
            type: 'checkbox-group',
            label: 'Availability Requirements',
            options: [
              'Zero-Downtime Updates',
              'Multi-Region Distribution',
              'Active-Active Configuration',
              'Point-in-Time Recovery',
              'Automated Failover',
              'Custom Backup Schedule'
            ]
          },
          {
            id: 'monitoring-tools',
            type: 'checkbox-group',
            label: 'Current Monitoring Tools',
            options: [
              'MongoDB Atlas Monitoring',
              'Atlas Performance Advisor',
              'Atlas Data Explorer',
              'Custom Monitoring',
              'Third-Party APM',
              'Real-Time Analytics',
              'None'
            ]
          },
          {
            id: 'maintenance-windows',
            type: 'textarea',
            label: 'Maintenance Windows',
            placeholder: 'Describe your maintenance windows and any constraints'
          },
          {
            id: 'compliance-requirements',
            type: 'checkbox-group',
            label: 'Compliance Requirements',
            options: [
              'SOC 2',
              'HIPAA',
              'PCI',
              'GDPR',
              'FedRAMP',
              'ISO 27001',
              'Other'
            ]
          }
        ]
      },
      {
        id: 'modernization-goals',
        title: 'Modernization Goals',
        description: 'Goals and objectives for improving the application',
        questions: [
          {
            id: 'priority-improvements',
            type: 'checkbox-group',
            label: 'Priority Improvements',
            required: true,
            options: [
              'Performance Optimization',
              'Cost Optimization',
              'Scalability Improvements',
              'Security Enhancements',
              'Operational Efficiency',
              'Feature Additions',
              'Architecture Modernization'
            ]
          },
          {
            id: 'timeline',
            type: 'select',
            label: 'Implementation Timeline',
            required: true,
            options: [
              'Immediate (< 1 month)',
              'Short-term (1-3 months)',
              'Medium-term (3-6 months)',
              'Long-term (6+ months)'
            ]
          },
          {
            id: 'constraints',
            type: 'textarea',
            label: 'Implementation Constraints',
            placeholder: 'Describe any constraints or limitations for implementing changes',
            required: true
          }
        ]
      }
    ]
  }
};