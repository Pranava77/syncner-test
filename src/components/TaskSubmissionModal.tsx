import React, { useState } from 'react';
import { 
  FileTextIcon, 
  ReaderIcon, 
  Link1Icon, 
  ClipboardIcon, 
  CheckCircledIcon,
  Cross1Icon 
} from '@radix-ui/react-icons';
import apiService from '../services/api';

interface TaskSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: {
    id?: string;
    title: string;
    description: string;
    resources: string[];
    difficulty?: string;
    creditPoints?: number;
    order?: number;
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

  const handleSubmit = async () => {
    try {
      // Submit exercise to progress tracking
      await apiService.submitExercise(exercise.id || '', exercise.title);
      
      // Mark exercise section as completed
      if (exercise.id && exercise.order) {
        await apiService.markLevelCompleted(exercise.id, exercise.order, 'exercise');
      }
      
      console.log('Exercise submitted successfully:', formData);
      onClose();
    } catch (error) {
      console.error('Error submitting exercise:', error);
      // You could add error handling UI here
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-offblack rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-paperwhite/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-paperwhite/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-trueturquoise/20 rounded-lg flex items-center justify-center">
              <FileTextIcon className="w-4 h-4 text-trueturquoise" />
            </div>
            <div>
              <div className="font-semibold text-paperwhite">{exercise.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition">
              <option>Not Completed</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Brief Section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-paperwhite mb-2">
              <ClipboardIcon className="w-4 h-4 text-trueturquoise" />
              Brief - What you should do:
            </label>
            <textarea
              value={formData.brief}
              onChange={(e) => handleInputChange('brief', e.target.value)}
              className="w-full h-32 p-3 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg resize-none focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight"
              placeholder="Enter your brief here..."
            />
          </div>

          {/* Instruction Section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-paperwhite mb-2">
              <ReaderIcon className="w-4 h-4 text-trueturquoise" />
              Instruction/Helper Guide:
            </label>
            <textarea
              value={formData.instruction}
              onChange={(e) => handleInputChange('instruction', e.target.value)}
              className="w-full h-32 p-3 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg resize-none focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight"
              placeholder="Enter instructions here..."
            />
          </div>

          {/* Reference Materials Section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-paperwhite mb-2">
              <FileTextIcon className="w-4 h-4 text-trueturquoise" />
              Reference Materials:
            </label>
            <div className="space-y-3">
              {formData.referenceMaterials.map((material, index) => (
                <input
                  key={index}
                  type="text"
                  value={material}
                  onChange={(e) => handleReferenceMaterialChange(index, e.target.value)}
                  className="w-full p-3 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight"
                  placeholder={`Reference material ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Expected Output Section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-paperwhite mb-2">
              <CheckCircledIcon className="w-4 h-4 text-trueturquoise" />
              Expected output:
            </label>
            <textarea
              value={formData.expectedOutput}
              onChange={(e) => handleInputChange('expectedOutput', e.target.value)}
              className="w-full h-32 p-3 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg resize-none focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight"
              placeholder="Describe expected output..."
            />
          </div>

          {/* Submission Link Section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-paperwhite mb-2">
              <Link1Icon className="w-4 h-4 text-trueturquoise" />
              Submission Link:
            </label>
            <input
              type="text"
              value={formData.submissionLink}
              onChange={(e) => handleInputChange('submissionLink', e.target.value)}
              className="w-full p-3 border border-paperwhite/20 bg-offblack text-paperwhite rounded-lg focus:ring-2 focus:ring-trueturquoise/40 focus:border-trueturquoise transition placeholder:text-teallight"
              placeholder="Paste your link here"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-paperwhite/20">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-paperwhite border border-paperwhite/20 rounded-lg hover:bg-paperwhite/10 transition-colors"
          >
            <Cross1Icon className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-trueturquoise text-offblack rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold"
          >
            <CheckCircledIcon className="w-4 h-4" />
            Submit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskSubmissionModal; 