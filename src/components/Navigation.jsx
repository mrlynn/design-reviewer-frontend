import React from 'react';
import { FileText, Database, BookOpen } from 'lucide-react';

const Navigation = ({ activeMode, onModeChange }) => {
  const modes = [
    {
      id: 'review',
      name: 'Design Review',
      icon: FileText,
      description: 'Conduct MongoDB design reviews'
    },
    {
      id: 'templates',
      name: 'Templates',
      icon: Database,
      description: 'Manage review templates'
    },
    {
      id: 'rag',
      name: 'Knowledge Base',
      icon: BookOpen,
      description: 'Manage RAG system documents'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Add the title here */}
          <h1 className="text-lg font-semibold text-gray-900">
            MongoDB Design Review Assistant
          </h1>
          <div className="flex">
            <div className="flex space-x-8">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activeMode === mode.id
                        ? 'border-mongodb-green text-mongodb-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {mode.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
