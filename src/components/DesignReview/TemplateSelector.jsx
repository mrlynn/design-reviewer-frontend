// frontend/design-review-app/src/components/DesignReview/TemplateSelector.jsx
import PropTypes from 'prop-types';
import { reviewTemplates } from '../../data/reviewTemplates.js';

const TemplateSelector = ({ onSelect }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-mongodb-slate mb-6">
        Select Review Template
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(reviewTemplates).map(([id, template]) => (
          <button
            key={id}
            className="p-6 bg-mongodb-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-mongodb-mist text-left"
            onClick={() => onSelect(id)}
          >
            <div className="text-3xl mb-2">{template.icon}</div>
            <h3 className="text-lg font-semibold text-mongodb-slate mb-2">
              {template.name}
            </h3>
            <p className="text-mongodb-forest text-sm">
              {template.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

TemplateSelector.propTypes = {
  onSelect: PropTypes.func.isRequired
};

export default TemplateSelector;