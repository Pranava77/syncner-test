import React, { useState } from 'react';

interface TaskSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: {
    title: string;
    description: string;
    resources: string[];
    difficulty?: string;
    creditPoints?: number;
  };
}

const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({ isOpen, onClose, exercise }) => {
  const [formData, setFormData] = useState({
    brief: '',
    instruction: '',
    referenceMaterials: ['', '', ''],
    expectedOutput: '',
    submissionLink: ''
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReferenceMaterialChange = (index: number, value: string) => {
    const newReferenceMaterials = [...formData.referenceMaterials];
    newReferenceMaterials[index] = value;
    setFormData(prev => ({
      ...prev,
      referenceMaterials: newReferenceMaterials
    }));
  };

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Task-ID FSD-032</div>
              <div className="font-semibold text-gray-800">Task Name</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700">
              <option>no completed</option>
              <option>completed</option>
              <option>in progress</option>
            </select>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Brief Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brief - What you should do:
            </label>
            <textarea
              value={formData.brief}
              onChange={(e) => handleInputChange('brief', e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your brief here..."
            />
          </div>

          {/* Instruction Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instruction/Helper Guide:
            </label>
            <textarea
              value={formData.instruction}
              onChange={(e) => handleInputChange('instruction', e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter instructions here..."
            />
          </div>

          {/* Reference Materials Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Materials:
            </label>
            <div className="space-y-3">
              {formData.referenceMaterials.map((material, index) => (
                <input
                  key={index}
                  type="text"
                  value={material}
                  onChange={(e) => handleReferenceMaterialChange(index, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Reference material ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Expected Output Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected output:
            </label>
            <textarea
              value={formData.expectedOutput}
              onChange={(e) => handleInputChange('expectedOutput', e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe expected output..."
            />
          </div>

          {/* Submission Link Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Link:
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
              </div>
              <input
                type="text"
                value={formData.submissionLink}
                onChange={(e) => handleInputChange('submissionLink', e.target.value)}
                className="w-full p-3 pl-12 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your link here"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-300">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskSubmissionModal; 