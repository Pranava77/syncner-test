import React from 'react';
import { ResumeData } from '../utils/pdfGenerator';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ResumePreviewProps {
  resumeData: ResumeData;
  template: string;
  sections?: string[];
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, template, sections }) => {
  const getTemplateStyles = () => {
    switch (template) {
      case 'creative':
        return {
          container: 'bg-gradient-to-br from-purple-50 to-pink-50',
          header: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
          section: 'border-l-4 border-purple-500 pl-4',
          accent: 'text-purple-600'
        };
      case 'minimal':
        return {
          container: 'bg-white',
          header: 'bg-gray-900 text-white',
          section: 'border-b border-gray-200 pb-4',
          accent: 'text-gray-700'
        };
      default: // professional
        return {
          container: 'bg-white',
          header: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
          section: 'border-l-4 border-blue-500 pl-4',
          accent: 'text-blue-600'
        };
    }
  };

  const styles = getTemplateStyles();

  // Helper to render a section by name
  const renderSection = (section: string) => {
    switch (section.toLowerCase()) {
      case 'education':
        return (
          <div className={styles.section} key="education">
            <h2 className={`text-2xl font-bold ${styles.accent} mb-3`}>Education</h2>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{resumeData.education.degree}</h3>
              <p className="text-gray-700">{resumeData.education.school} • {resumeData.education.year}</p>
              <p className="text-gray-600">GPA: {resumeData.education.gpa}</p>
            </div>
          </div>
        );
      case 'projects':
      case 'completed projects':
        return (
          <div className={styles.section} key="projects">
            <h2 className={`text-2xl font-bold ${styles.accent} mb-3`}>Completed Projects</h2>
            <div className="space-y-3">
              {resumeData.completedProjects.map((project, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  <p className="text-gray-600">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
      case 'technical skills':
        return (
          <div className={styles.section} key="skills">
            <h2 className={`text-2xl font-bold ${styles.accent} mb-3`}>Technical Skills</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(resumeData.skills).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-900 mb-2">{category}</h3>
                  <p className="text-gray-700">{skills.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'certifications':
        if (!resumeData.certifications.length) return null;
        return (
          <div className={styles.section} key="certifications">
            <h2 className={`text-2xl font-bold ${styles.accent} mb-3`}>Certifications</h2>
            <div className="space-y-3">
              {resumeData.certifications.map((cert, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-gray-600">{cert.issuer} • {cert.date}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cert.skills.map((skill) => (
                      <span key={skill} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'experience':
        // You can add experience rendering here if needed
        return null;
      case 'portfolio':
        // You can add portfolio rendering here if needed
        return null;
      case 'summary':
      case 'professional summary':
        return (
          <div className={styles.section} key="summary">
            <h2 className={`text-2xl font-bold ${styles.accent} mb-3`}>Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="resume-preview" className={`${styles.container} max-w-4xl mx-auto shadow-lg`}>
      {/* Header */}
      <div className={`${styles.header} p-8`}>
        <h1 className="text-4xl font-bold mb-2">{resumeData.personalInfo.name}</h1>
        <div className="flex flex-wrap items-center gap-6 text-sm opacity-90">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            {resumeData.personalInfo.email}
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            {resumeData.personalInfo.phone}
          </div>
          <div className="flex items-center">
            <PinIcon className="h-4 w-4 mr-2" />
            {resumeData.personalInfo.location}
          </div>
        </div>
        <div className="mt-3">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
            {resumeData.personalInfo.careerTrack}
          </span>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {sections
          ? sections.map(section => renderSection(section)).filter(Boolean)
          : <>
              {/* Default rendering if no sections provided */}
              {renderSection('Professional Summary')}
              {renderSection('Technical Skills')}
              {renderSection('Completed Projects')}
              {renderSection('Certifications')}
              {renderSection('Education')}
            </>
        }
      </div>
    </div>
  );
};

export default ResumePreview;