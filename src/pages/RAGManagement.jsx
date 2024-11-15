import { RAGSearch, FileUpload } from './components/RAGComponents';

export const RAGManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Design Pattern Documentation
        </h1>
        
        <div className="grid grid-cols-1 gap-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Search Documentation
            </h2>
            <RAGSearch />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upload Documents
            </h2>
            <FileUpload />
          </section>
        </div>
      </div>
    </div>
  );
};