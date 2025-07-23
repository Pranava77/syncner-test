import mongoose from 'mongoose';
import Curriculum from './models/Curriculum.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing curriculum data
    await Curriculum.deleteMany({});
    console.log('Cleared existing curriculum data');

    // Find or create an admin user for metadata
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({ role: 'student' });
      if (!adminUser) {
        console.log('No users found. Please create a user first.');
        return;
      }
    }

    const dummyCurriculumData = [
      // Full Stack Development Track
      {
        title: 'Introduction to Web Development',
        description: 'Learn the basics of web development and understand the fundamentals',
        type: 'syllabus',
        content: 'HTML, CSS, JavaScript basics, DOM manipulation, responsive design principles',
        order: 1,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 30,
        tags: ['web', 'basics', 'html', 'css'],
        prerequisites: [],
        learningObjectives: ['Understand HTML structure', 'Learn CSS styling', 'Basic JavaScript concepts'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Web Development - HTML Fundamentals',
        description: 'Learn the basics of HTML markup and structure',
        type: 'learn',
        content: 'HTML is the standard markup language for creating web pages. Learn about HTML elements, tags, attributes, semantic elements, and forms. HTML provides the structure of the page while CSS provides the styling.',
        order: 1,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 45,
        tags: ['html', 'markup', 'structure'],
        prerequisites: ['Introduction to Web Development'],
        learningObjectives: ['Understand HTML tags', 'Learn semantic elements', 'Create forms'],
        resources: [
          {
            title: 'HTML Documentation',
            url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
            type: 'document',
            description: 'Official HTML documentation'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Web Development - HTML Elements Deep Dive',
        description: 'Master HTML elements and their proper usage',
        type: 'learn',
        content: 'Dive deeper into HTML elements including headings, paragraphs, lists, links, images, tables, and forms. Learn about semantic HTML5 elements like header, nav, main, section, article, aside, and footer.',
        order: 1,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 60,
        tags: ['html', 'elements', 'semantic', 'html5'],
        prerequisites: ['Introduction to Web Development'],
        learningObjectives: ['Master HTML elements', 'Understand semantic HTML', 'Create accessible markup'],
        resources: [
          {
            title: 'HTML5 Semantic Elements',
            url: 'https://www.w3schools.com/html/html5_semantic_elements.asp',
            type: 'document',
            description: 'Guide to semantic HTML5 elements'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Web Development - HTML Quiz',
        description: 'Test your knowledge of HTML fundamentals',
        type: 'test',
        content: 'What does HTML stand for?\nA) Hyper Text Markup Language\nB) High Tech Modern Language\nC) Home Tool Markup Language\nD) Hyperlink and Text Markup Language\nAnswer: A',
        order: 1,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 15,
        tags: ['html', 'quiz', 'assessment'],
        prerequisites: ['Introduction to Web Development'],
        learningObjectives: ['Test HTML knowledge', 'Validate understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Web Development - HTML Elements Quiz',
        description: 'Test your knowledge of HTML elements and semantic markup',
        type: 'test',
        content: 'Which HTML element is used to define a navigation section?\nA) <nav>\nB) <header>\nC) <section>\nD) <div>\nAnswer: A',
        order: 1,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 15,
        tags: ['html', 'quiz', 'semantic'],
        prerequisites: ['Introduction to Web Development'],
        learningObjectives: ['Test semantic HTML knowledge', 'Validate element understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Web Development - HTML Forms Quiz',
        description: 'Test your knowledge of HTML forms and input elements',
        type: 'test',
        content: 'Which input type is used for email addresses?\nA) type="text"\nB) type="email"\nC) type="mail"\nD) type="address"\nAnswer: B',
        order: 1,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 15,
        tags: ['html', 'quiz', 'forms'],
        prerequisites: ['Introduction to Web Development'],
        learningObjectives: ['Test form knowledge', 'Validate input understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Web Development - Create Your First HTML Page',
        description: 'Practice creating a simple HTML page with various elements',
        type: 'exercise',
        content: 'Create a personal introduction page using HTML. Include a heading, paragraph, list, and a simple form. Use semantic HTML elements where appropriate.',
        order: 1,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 60,
        tags: ['html', 'practice', 'project'],
        prerequisites: ['Introduction to Web Development'],
        learningObjectives: ['Apply HTML knowledge', 'Create structured content'],
        resources: [
          {
            title: 'HTML Cheat Sheet',
            url: 'https://www.wpkube.com/html5-cheat-sheet/',
            type: 'document',
            description: 'Quick reference for HTML tags'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Web Development - Build a Portfolio Page',
        description: 'Create a comprehensive portfolio page showcasing your skills',
        type: 'exercise',
        content: 'Build a professional portfolio page with multiple sections: header with navigation, about section, skills section, projects section, and contact form. Use semantic HTML and ensure accessibility.',
        order: 1,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 90,
        tags: ['html', 'portfolio', 'semantic', 'accessibility'],
        prerequisites: ['Introduction to Web Development'],
        learningObjectives: ['Create complex layouts', 'Implement semantic HTML', 'Ensure accessibility'],
        resources: [
          {
            title: 'HTML Accessibility Guide',
            url: 'https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML',
            type: 'document',
            description: 'Guide to accessible HTML'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'CSS Styling and Layout',
        description: 'Learn how to style HTML elements with CSS',
        type: 'syllabus',
        content: 'CSS styling, layout techniques, responsive design, flexbox, grid',
        order: 2,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 60,
        tags: ['css', 'styling', 'layout', 'responsive'],
        prerequisites: ['Introduction to Web Development'],
        learningObjectives: ['Master CSS styling', 'Learn layout techniques', 'Create responsive designs'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'CSS Styling and Layout - CSS Styling Basics',
        description: 'Learn how to style HTML elements with CSS',
        type: 'learn',
        content: 'CSS (Cascading Style Sheets) is used to style and layout web pages. Learn about selectors, properties, the box model, flexbox, and responsive design principles.',
        order: 2,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 60,
        tags: ['css', 'styling', 'design'],
        prerequisites: ['CSS Styling and Layout'],
        learningObjectives: ['Understand CSS selectors', 'Learn the box model', 'Master flexbox'],
        resources: [
          {
            title: 'CSS Documentation',
            url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
            type: 'document',
            description: 'Official CSS documentation'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'CSS Styling and Layout - Advanced CSS Techniques',
        description: 'Master advanced CSS concepts and modern layout techniques',
        type: 'learn',
        content: 'Explore advanced CSS concepts including CSS Grid, custom properties (CSS variables), animations, transitions, and modern layout techniques. Learn about CSS architecture and best practices.',
        order: 2,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 75,
        tags: ['css', 'grid', 'animations', 'variables'],
        prerequisites: ['CSS Styling and Layout'],
        learningObjectives: ['Master CSS Grid', 'Use CSS variables', 'Create animations'],
        resources: [
          {
            title: 'CSS Grid Guide',
            url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
            type: 'document',
            description: 'Complete CSS Grid guide'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'CSS Styling and Layout - CSS Quiz',
        description: 'Test your CSS knowledge',
        type: 'test',
        content: 'Which CSS property is used to change the text color?\nA) text-color\nB) color\nC) font-color\nD) text-style\nAnswer: B',
        order: 2,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 15,
        tags: ['css', 'quiz', 'assessment'],
        prerequisites: ['CSS Styling and Layout'],
        learningObjectives: ['Test CSS knowledge', 'Validate understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'CSS Styling and Layout - CSS Layout Quiz',
        description: 'Test your knowledge of CSS layout techniques',
        type: 'test',
        content: 'Which CSS property is used to create a flexbox layout?\nA) display: flex\nB) display: grid\nC) display: block\nD) display: inline\nAnswer: A',
        order: 2,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 15,
        tags: ['css', 'quiz', 'layout'],
        prerequisites: ['CSS Styling and Layout'],
        learningObjectives: ['Test layout knowledge', 'Validate flexbox understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'CSS Styling and Layout - CSS Selectors Quiz',
        description: 'Test your knowledge of CSS selectors and specificity',
        type: 'test',
        content: 'Which CSS selector has the highest specificity?\nA) .class\nB) #id\nC) element\nD) *\nAnswer: B',
        order: 2,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 15,
        tags: ['css', 'quiz', 'selectors'],
        prerequisites: ['CSS Styling and Layout'],
        learningObjectives: ['Test selector knowledge', 'Validate specificity understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'CSS Styling and Layout - Style Your HTML Page',
        description: 'Apply CSS styling to your HTML page',
        type: 'exercise',
        content: 'Take your HTML page from the previous exercise and style it with CSS. Add colors, fonts, layout, and make it responsive. Use flexbox for layout.',
        order: 2,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 90,
        tags: ['css', 'practice', 'project'],
        prerequisites: ['CSS Styling and Layout'],
        learningObjectives: ['Apply CSS styling', 'Create responsive design'],
        resources: [
          {
            title: 'CSS Flexbox Guide',
            url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
            type: 'document',
            description: 'Complete flexbox guide'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'CSS Styling and Layout - Create a Responsive Dashboard',
        description: 'Build a responsive dashboard using CSS Grid and Flexbox',
        type: 'exercise',
        content: 'Create a responsive dashboard layout with header, sidebar, main content area, and footer. Use CSS Grid for the overall layout and Flexbox for component layouts. Make it mobile-friendly with media queries.',
        order: 2,
        careerTrack: 'full-stack',
        difficulty: 'beginner',
        estimatedDuration: 120,
        tags: ['css', 'dashboard', 'responsive', 'grid'],
        prerequisites: ['CSS Styling and Layout'],
        learningObjectives: ['Create complex layouts', 'Implement responsive design', 'Use CSS Grid and Flexbox'],
        resources: [
          {
            title: 'CSS Grid Layout',
            url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout',
            type: 'document',
            description: 'CSS Grid layout guide'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },

      // AI/ML Track
      {
        title: 'Introduction to Machine Learning',
        description: 'Learn the fundamentals of machine learning and AI',
        type: 'syllabus',
        content: 'Machine learning basics, supervised vs unsupervised learning, data preprocessing, model evaluation',
        order: 1,
        careerTrack: 'ai-ml',
        difficulty: 'beginner',
        estimatedDuration: 45,
        tags: ['ai', 'ml', 'basics', 'python'],
        prerequisites: [],
        learningObjectives: ['Understand ML concepts', 'Learn data preprocessing', 'Model evaluation'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Machine Learning - Python for Data Science',
        description: 'Learn Python programming for data science and machine learning',
        type: 'learn',
        content: 'Python is the most popular language for data science. Learn about NumPy, Pandas, Matplotlib, and Scikit-learn. Understand data manipulation, visualization, and basic statistical concepts.',
        order: 1,
        careerTrack: 'ai-ml',
        difficulty: 'beginner',
        estimatedDuration: 90,
        tags: ['python', 'data-science', 'numpy', 'pandas'],
        prerequisites: ['Introduction to Machine Learning'],
        learningObjectives: ['Master Python basics', 'Learn data manipulation', 'Create visualizations'],
        resources: [
          {
            title: 'Python Documentation',
            url: 'https://docs.python.org/3/',
            type: 'document',
            description: 'Official Python documentation'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Machine Learning - Data Preprocessing Techniques',
        description: 'Learn essential data preprocessing techniques for machine learning',
        type: 'learn',
        content: 'Data preprocessing is crucial for successful machine learning. Learn about data cleaning, handling missing values, feature scaling, encoding categorical variables, and data splitting techniques.',
        order: 1,
        careerTrack: 'ai-ml',
        difficulty: 'beginner',
        estimatedDuration: 75,
        tags: ['data-preprocessing', 'cleaning', 'scaling', 'encoding'],
        prerequisites: ['Introduction to Machine Learning'],
        learningObjectives: ['Clean and preprocess data', 'Handle missing values', 'Scale features'],
        resources: [
          {
            title: 'Data Preprocessing Guide',
            url: 'https://scikit-learn.org/stable/modules/preprocessing.html',
            type: 'document',
            description: 'Scikit-learn preprocessing guide'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Machine Learning - Python Data Science Quiz',
        description: 'Test your Python and data science knowledge',
        type: 'test',
        content: 'Which Python library is commonly used for data manipulation?\nA) NumPy\nB) Pandas\nC) Matplotlib\nD) Scikit-learn\nAnswer: B',
        order: 1,
        careerTrack: 'ai-ml',
        difficulty: 'beginner',
        estimatedDuration: 20,
        tags: ['python', 'quiz', 'data-science'],
        prerequisites: ['Introduction to Machine Learning'],
        learningObjectives: ['Test Python knowledge', 'Validate data science concepts'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Machine Learning - Data Preprocessing Quiz',
        description: 'Test your knowledge of data preprocessing techniques',
        type: 'test',
        content: 'Which technique is used to handle missing values in a dataset?\nA) Data imputation\nB) Data deletion\nC) Data scaling\nD) Data encoding\nAnswer: A',
        order: 1,
        careerTrack: 'ai-ml',
        difficulty: 'beginner',
        estimatedDuration: 20,
        tags: ['data-preprocessing', 'quiz', 'missing-values'],
        prerequisites: ['Introduction to Machine Learning'],
        learningObjectives: ['Test preprocessing knowledge', 'Validate understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Machine Learning - ML Concepts Quiz',
        description: 'Test your understanding of machine learning concepts',
        type: 'test',
        content: 'What is the difference between supervised and unsupervised learning?\nA) Supervised uses labeled data, unsupervised uses unlabeled data\nB) Supervised uses unlabeled data, unsupervised uses labeled data\nC) Both use labeled data\nD) Both use unlabeled data\nAnswer: A',
        order: 1,
        careerTrack: 'ai-ml',
        difficulty: 'beginner',
        estimatedDuration: 20,
        tags: ['ml-concepts', 'quiz', 'supervised-unsupervised'],
        prerequisites: ['Introduction to Machine Learning'],
        learningObjectives: ['Test ML concepts', 'Validate understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Machine Learning - Data Analysis Project',
        description: 'Analyze a dataset using Python and create visualizations',
        type: 'exercise',
        content: 'Download a dataset (e.g., iris dataset) and perform exploratory data analysis. Create visualizations, calculate statistics, and write a report of your findings.',
        order: 1,
        careerTrack: 'ai-ml',
        difficulty: 'beginner',
        estimatedDuration: 120,
        tags: ['python', 'data-analysis', 'project'],
        prerequisites: ['Introduction to Machine Learning'],
        learningObjectives: ['Perform EDA', 'Create visualizations', 'Write analysis reports'],
        resources: [
          {
            title: 'Iris Dataset',
            url: 'https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_iris.html',
            type: 'document',
            description: 'Sample dataset for practice'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Machine Learning - Build Your First ML Model',
        description: 'Create and train your first machine learning model',
        type: 'exercise',
        content: 'Using the preprocessed data from previous exercises, build a simple classification model using scikit-learn. Train the model, evaluate its performance, and create a prediction system.',
        order: 1,
        careerTrack: 'ai-ml',
        difficulty: 'beginner',
        estimatedDuration: 150,
        tags: ['ml-model', 'classification', 'scikit-learn', 'project'],
        prerequisites: ['Introduction to Machine Learning'],
        learningObjectives: ['Build ML models', 'Train and evaluate', 'Make predictions'],
        resources: [
          {
            title: 'Scikit-learn Tutorial',
            url: 'https://scikit-learn.org/stable/tutorial/',
            type: 'document',
            description: 'Official scikit-learn tutorial'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },

      // UI/UX Track
      {
        title: 'Introduction to User Experience Design',
        description: 'Learn the fundamentals of UX design and user-centered design',
        type: 'syllabus',
        content: 'UX principles, user research, wireframing, prototyping, usability testing',
        order: 1,
        careerTrack: 'ui-ux',
        difficulty: 'beginner',
        estimatedDuration: 60,
        tags: ['ux', 'design', 'user-research', 'wireframing'],
        prerequisites: [],
        learningObjectives: ['Understand UX principles', 'Learn user research', 'Create wireframes'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to User Experience Design - User Research Methods',
        description: 'Learn various methods for understanding user needs and behaviors',
        type: 'learn',
        content: 'User research is the foundation of good UX design. Learn about interviews, surveys, usability testing, analytics, and how to synthesize research findings into actionable insights.',
        order: 1,
        careerTrack: 'ui-ux',
        difficulty: 'beginner',
        estimatedDuration: 75,
        tags: ['user-research', 'interviews', 'surveys', 'usability'],
        prerequisites: ['Introduction to User Experience Design'],
        learningObjectives: ['Conduct user interviews', 'Design surveys', 'Analyze research data'],
        resources: [
          {
            title: 'UX Research Guide',
            url: 'https://www.nngroup.com/articles/user-research/',
            type: 'document',
            description: 'Comprehensive UX research guide'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to User Experience Design - UX Research Quiz',
        description: 'Test your knowledge of user research methods',
        type: 'test',
        content: 'Which research method is best for understanding user behavior in their natural environment?\nA) Surveys\nB) User interviews\nC) Contextual inquiry\nD) A/B testing\nAnswer: C',
        order: 1,
        careerTrack: 'ui-ux',
        difficulty: 'beginner',
        estimatedDuration: 15,
        tags: ['ux', 'quiz', 'research'],
        prerequisites: ['Introduction to User Experience Design'],
        learningObjectives: ['Test research knowledge', 'Validate understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to User Experience Design - Conduct User Research',
        description: 'Practice conducting user research for a real or hypothetical product',
        type: 'exercise',
        content: 'Choose a product or app and conduct user research. Create a research plan, conduct interviews or surveys, analyze the data, and create a research report with recommendations.',
        order: 1,
        careerTrack: 'ui-ux',
        difficulty: 'beginner',
        estimatedDuration: 180,
        tags: ['ux', 'research', 'project'],
        prerequisites: ['Introduction to User Experience Design'],
        learningObjectives: ['Plan research', 'Conduct interviews', 'Analyze findings'],
        resources: [
          {
            title: 'Research Plan Template',
            url: 'https://www.uxpin.com/studio/blog/user-research-plan-template/',
            type: 'document',
            description: 'Template for research planning'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },

      // Data Science Track
      {
        title: 'Introduction to Data Science',
        description: 'Learn the fundamentals of data science and analytics',
        type: 'syllabus',
        content: 'Data science lifecycle, statistical analysis, data visualization, machine learning basics',
        order: 1,
        careerTrack: 'data-science',
        difficulty: 'beginner',
        estimatedDuration: 60,
        tags: ['data-science', 'statistics', 'analytics', 'python'],
        prerequisites: [],
        learningObjectives: ['Understand data science process', 'Learn statistical concepts', 'Data visualization'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Data Science - Statistical Analysis Fundamentals',
        description: 'Learn essential statistical concepts for data analysis',
        type: 'learn',
        content: 'Statistics is the foundation of data science. Learn about descriptive statistics, probability, hypothesis testing, correlation, regression, and how to interpret statistical results.',
        order: 1,
        careerTrack: 'data-science',
        difficulty: 'beginner',
        estimatedDuration: 90,
        tags: ['statistics', 'analysis', 'probability', 'hypothesis-testing'],
        prerequisites: ['Introduction to Data Science'],
        learningObjectives: ['Calculate descriptive statistics', 'Perform hypothesis tests', 'Interpret results'],
        resources: [
          {
            title: 'Statistics Guide',
            url: 'https://www.khanacademy.org/math/statistics-probability',
            type: 'document',
            description: 'Comprehensive statistics guide'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Data Science - Statistics Quiz',
        description: 'Test your knowledge of statistical concepts',
        type: 'test',
        content: 'What is the measure of central tendency that is most affected by outliers?\nA) Mean\nB) Median\nC) Mode\nD) Range\nAnswer: A',
        order: 1,
        careerTrack: 'data-science',
        difficulty: 'beginner',
        estimatedDuration: 20,
        tags: ['statistics', 'quiz', 'assessment'],
        prerequisites: ['Introduction to Data Science'],
        learningObjectives: ['Test statistical knowledge', 'Validate understanding'],
        resources: [],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      },
      {
        title: 'Introduction to Data Science - Statistical Analysis Project',
        description: 'Perform statistical analysis on a real dataset',
        type: 'exercise',
        content: 'Choose a dataset and perform comprehensive statistical analysis. Calculate descriptive statistics, create visualizations, perform hypothesis tests, and write a detailed analysis report.',
        order: 1,
        careerTrack: 'data-science',
        difficulty: 'beginner',
        estimatedDuration: 150,
        tags: ['statistics', 'analysis', 'project'],
        prerequisites: ['Introduction to Data Science'],
        learningObjectives: ['Apply statistical methods', 'Create visualizations', 'Write analysis reports'],
        resources: [
          {
            title: 'Sample Datasets',
            url: 'https://www.kaggle.com/datasets',
            type: 'document',
            description: 'Collection of datasets for practice'
          }
        ],
        metadata: {
          createdBy: adminUser._id,
          version: 1
        }
      }
    ];

    // Insert the curriculum data
    const curriculumItems = await Curriculum.insertMany(dummyCurriculumData);
    console.log(`Successfully seeded ${curriculumItems.length} curriculum items`);

    // Log the created items for verification
    console.log('\nCreated curriculum items:');
    curriculumItems.forEach(item => {
      console.log(`- ${item.title} (${item.type}) - ${item.careerTrack}`);
    });

    console.log('\nSeed data insertion completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 