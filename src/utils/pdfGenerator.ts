import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    careerTrack: string;
  };
  summary: string;
  completedProjects: Array<{
    title: string;
    description: string;
    technologies: string[];
    status: string;
    score: number;
    date: string;
    category?: string;
    difficulty?: string;
    points?: number;
  }>;
  skills: Record<string, string[]>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    skills: string[];
  }>;
  education: {
    degree: string;
    school: string;
    year: string;
    gpa: string;
  };
}

export const generateResumePDF = async (resumeData: ResumeData, template: string = 'professional'): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, fontStyle: string = 'normal'): number => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35);
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, y: number): number => {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(41, 98, 255); // Blue color
    pdf.text(title, margin, y);
    
    // Add underline
    pdf.setDrawColor(41, 98, 255);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y + 2, pageWidth - margin, y + 2);
    
    pdf.setTextColor(0, 0, 0); // Reset to black
    return y + 10;
  };

  // Header - Name and Contact Info
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(33, 37, 41);
  pdf.text(resumeData.personalInfo.name, margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(108, 117, 125);
  const contactInfo = `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}`;
  pdf.text(contactInfo, margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setTextColor(41, 98, 255);
  pdf.text(resumeData.personalInfo.careerTrack, margin, yPosition);
  yPosition += 15;

  // Professional Summary
  yPosition = addSectionHeader('PROFESSIONAL SUMMARY', yPosition);
  yPosition = addText(resumeData.summary, margin, yPosition, pageWidth - 2 * margin, 10) + 10;

  // Technical Skills
  yPosition = addSectionHeader('TECHNICAL SKILLS', yPosition);
  Object.entries(resumeData.skills).forEach(([category, skills]) => {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${category}:`, margin, yPosition);
    
    pdf.setFont('helvetica', 'normal');
    const skillsText = skills.join(', ');
    yPosition = addText(skillsText, margin + 25, yPosition, pageWidth - 2 * margin - 25, 10);
    yPosition += 3;
  });
  yPosition += 5;

  // Projects
  yPosition = addSectionHeader('COMPLETED PROJECTS', yPosition);
  resumeData.completedProjects.forEach((project, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(project.title, margin, yPosition);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(108, 117, 125);
    
    // Enhanced project metadata
    const metadata = [];
    if (project.score) metadata.push(`Score: ${project.score}%`);
    if (project.difficulty) metadata.push(project.difficulty);
    if (project.category) metadata.push(project.category);
    if (project.points) metadata.push(`${project.points} pts`);
    metadata.push(project.date);
    
    const metadataText = metadata.join(' | ');
    pdf.text(metadataText, pageWidth - margin - 60, yPosition);
    pdf.setTextColor(0, 0, 0);
    yPosition += 5;

    yPosition = addText(project.description, margin, yPosition, pageWidth - 2 * margin, 10);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    const techText = `Technologies: ${project.technologies.join(', ')}`;
    yPosition = addText(techText, margin, yPosition + 2, pageWidth - 2 * margin, 9) + 8;
  });

  // Certifications
  if (resumeData.certifications.length > 0) {
    yPosition = addSectionHeader('CERTIFICATIONS', yPosition);
    resumeData.certifications.forEach((cert) => {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(cert.name, margin, yPosition);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${cert.issuer} | ${cert.date}`, margin, yPosition + 4);
      yPosition += 12;
    });
  }

  // Education
  yPosition = addSectionHeader('EDUCATION', yPosition);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(resumeData.education.degree, margin, yPosition);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${resumeData.education.school} | ${resumeData.education.year}`, margin, yPosition + 4);
  pdf.text(`GPA: ${resumeData.education.gpa}`, margin, yPosition + 8);

  // Save the PDF
  const fileName = `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
  pdf.save(fileName);
};

export const generateResumeFromHTML = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Resume element not found');
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};