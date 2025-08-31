import React from 'react';
import StudentPortfolio from './StudentPortfolio';

// Sample data for demonstration
const sampleStudentData = {
  name: "Vishnu VS",
  location: "Coimbatore, India",
  profilePicture: undefined, // Will show initials
  completionPercentage: 100,
  status: "Ready to Hire",
  track: "Full Stack Development",
  duration: "6 months",
  lastVerified: "2025-08-12",
  skills: ["SQL", "Python", "EDA", "Data Viz", "Communication"],
  certificateId: "SYNCNER-2025-STU1234-9X5T7K",
  recommendedRoles: [
    "Full Stack Developer",
    "Front-end Dev",
    "Back-end Developer",
    "Software Developer",
    "AI Full stack Developer"
  ],
  introduction: "Full-stack developer in the making, passionate about solving real business problems with code. Skilled in SQL, Python, and data visualization, and ready to contribute to impactful projects.",
  modules: [
    {
      id: "module-01",
      moduleNumber: "01",
      title: "Foundations: Linux & Shell",
      completed: true,
      completedDate: "2025-08-03",
      assessmentScore: 86,
      timeSpent: "6h 20m",
      mcqScore: 86,
      tasksCompleted: 5,
      totalTasks: 5,
      tasks: [
        {
          id: "task-01-01",
          title: "Build a web using HTML/CSS",
          description: "Create a HTML Website",
          completed: true
        },
        {
          id: "task-01-02",
          title: "Linux Command Line Basics",
          description: "Master essential Linux commands",
          completed: true
        },
        {
          id: "task-01-03",
          title: "Shell Scripting Fundamentals",
          description: "Write basic shell scripts",
          completed: true
        },
        {
          id: "task-01-04",
          title: "File System Navigation",
          description: "Navigate Linux file system",
          completed: true
        },
        {
          id: "task-01-05",
          title: "Process Management",
          description: "Manage Linux processes",
          completed: true
        }
      ]
    },
    {
      id: "module-02",
      moduleNumber: "02",
      title: "Networking Basics",
      completed: true,
      completedDate: "2025-08-05",
      assessmentScore: 79,
      timeSpent: "5h 05m",
      mcqScore: 79,
      tasksCompleted: 5,
      totalTasks: 5,
      tasks: [
        {
          id: "task-02-01",
          title: "Network Protocols",
          description: "Understand TCP/IP and HTTP",
          completed: true
        },
        {
          id: "task-02-02",
          title: "Network Security",
          description: "Learn about firewalls and VPNs",
          completed: true
        },
        {
          id: "task-02-03",
          title: "DNS and Routing",
          description: "Master domain name system",
          completed: true
        },
        {
          id: "task-02-04",
          title: "Network Troubleshooting",
          description: "Debug network issues",
          completed: true
        },
        {
          id: "task-02-05",
          title: "Cloud Networking",
          description: "AWS and Azure networking",
          completed: true
        }
      ]
    },
    {
      id: "module-03",
      moduleNumber: "03",
      title: "Web Development Fundamentals",
      completed: true,
      completedDate: "2025-08-07",
      assessmentScore: 92,
      timeSpent: "8h 15m",
      mcqScore: 92,
      tasksCompleted: 5,
      totalTasks: 5,
      tasks: [
        {
          id: "task-03-01",
          title: "HTML5 Structure",
          description: "Create semantic HTML markup",
          completed: true
        },
        {
          id: "task-03-02",
          title: "CSS3 Styling",
          description: "Modern CSS with Flexbox and Grid",
          completed: true
        },
        {
          id: "task-03-03",
          title: "JavaScript Basics",
          description: "ES6+ JavaScript fundamentals",
          completed: true
        },
        {
          id: "task-03-04",
          title: "Responsive Design",
          description: "Mobile-first responsive layouts",
          completed: true
        },
        {
          id: "task-03-05",
          title: "Web Accessibility",
          description: "WCAG compliance and best practices",
          completed: true
        }
      ]
    },
    {
      id: "module-04",
      moduleNumber: "04",
      title: "Backend Development",
      completed: true,
      completedDate: "2025-08-10",
      assessmentScore: 88,
      timeSpent: "10h 30m",
      mcqScore: 88,
      tasksCompleted: 5,
      totalTasks: 5,
      tasks: [
        {
          id: "task-04-01",
          title: "Node.js Fundamentals",
          description: "Server-side JavaScript",
          completed: true
        },
        {
          id: "task-04-02",
          title: "Express.js Framework",
          description: "Build RESTful APIs",
          completed: true
        },
        {
          id: "task-04-03",
          title: "Database Integration",
          description: "MongoDB and SQLite",
          completed: true
        },
        {
          id: "task-04-04",
          title: "Authentication & Authorization",
          description: "JWT and session management",
          completed: true
        },
        {
          id: "task-04-05",
          title: "API Testing",
          description: "Postman and automated testing",
          completed: true
        }
      ]
    },
    {
      id: "module-05",
      moduleNumber: "05",
      title: "Frontend Frameworks",
      completed: true,
      completedDate: "2025-08-12",
      assessmentScore: 85,
      timeSpent: "12h 45m",
      mcqScore: 85,
      tasksCompleted: 5,
      totalTasks: 5,
      tasks: [
        {
          id: "task-05-01",
          title: "React.js Fundamentals",
          description: "Component-based architecture",
          completed: true
        },
        {
          id: "task-05-02",
          title: "State Management",
          description: "Redux and Context API",
          completed: true
        },
        {
          id: "task-05-03",
          title: "React Hooks",
          description: "Modern React patterns",
          completed: true
        },
        {
          id: "task-05-04",
          title: "Routing & Navigation",
          description: "React Router implementation",
          completed: true
        },
        {
          id: "task-05-05",
          title: "Performance Optimization",
          description: "Code splitting and lazy loading",
          completed: true
        }
      ]
    }
  ]
};

const PortfolioDemo: React.FC = () => {
  return (
    <div>
      <StudentPortfolio 
        studentId="demo-student-123"
        studentData={sampleStudentData}
      />
    </div>
  );
};

export default PortfolioDemo;
