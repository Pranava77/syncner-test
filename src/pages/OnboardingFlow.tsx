import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { updateUserProfile, fetchCurrentUser } from '../redux/slices/authSlice';
import { 
  LightningBoltIcon, 
  CodeIcon, 
  ColorWheelIcon, 
  BarChartIcon, 
  ArrowRightIcon, 
  CheckCircledIcon 
} from '@radix-ui/react-icons';
import logo from '../assets/syncner-logo.png';
import LoadingScreen from '../components/LoadingScreen';

const careerTracks = [
  {
    id: 'ai-ml',
    title: 'AI/ML Engineering',
    description: 'Machine Learning, Deep Learning, Data Science',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Analysis']
  },
  {
    id: 'fullstack',
    title: 'Full Stack Development',
    description: 'Frontend & Backend Development, APIs, Databases',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    skills: ['React', 'Node.js', 'Databases', 'API Design']
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description: 'User Interface Design, User Experience, Prototyping',
    icon: Palette,
    color: 'from-green-500 to-emerald-500',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research']
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'Data Analysis, Visualization, Business Intelligence',
    icon: BarChart3,
    color: 'from-orange-500 to-red-500',
    skills: ['SQL', 'Python', 'Tableau', 'Statistics']
  }
];

const OnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirect if user has already completed onboarding
  React.useEffect(() => {
    if (user?.profileComplete) {
      navigate('/student/dashboard');
    }
  }, [user, navigate]);

  // Initialize with existing user data if available
  React.useEffect(() => {
    if (user) {
      if (user.careerTrack) {
        setSelectedTrack(user.careerTrack);
      }
      if (user.interests) {
        setGoals(user.interests);
      }
    }
  }, [user]);

  const handleTrackSelect = (trackId: string) => {
    setSelectedTrack(trackId);
  };

  const handleGoalToggle = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    try {
      await dispatch(updateUserProfile({
        careerTrack: selectedTrack,
        interests: goals,
        profileComplete: true
      })).unwrap();

      // Fetch the updated user profile
      await dispatch(fetchCurrentUser()).unwrap();

      // Now navigate to training/current
      navigate('/student/training/current', { replace: true });
    } catch (error) {
      alert('Failed to complete onboarding. Please try again.');
    }
  };

  const goalOptions = [
    'Land an internship',
    'Get a full-time job',
    'Switch careers',
    'Upgrade skills',
    'Build a portfolio',
    'Network with professionals'
  ];

  if (isLoading) {
    return <LoadingScreen message="Setting up your profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Syncner Logo" className="h-14 w-14 object-contain" />
        </div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Step {step} of 3</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Syncner, {user?.name}!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's set up your personalized learning path to help you achieve your career goals.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto transition-colors">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                What makes Syncner special?
              </h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">AI-Personalized Learning</h3>
                    <p className="text-gray-600 dark:text-gray-300">Adaptive curriculum that adjusts to your pace and learning style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Real-World Projects</h3>
                    <p className="text-gray-600 dark:text-gray-300">Industry-standard tasks that build your portfolio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircledIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Career Guidance</h3>
                    <p className="text-gray-600 dark:text-gray-300">AI-powered mentoring and career advice</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center"
              >
                Let's Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Career Track Selection */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Choose Your Career Track
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Select the path that aligns with your career aspirations
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {careerTracks.map((track) => {
                const Icon = track.icon;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrackSelect(track.id)}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
                      selectedTrack === track.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`bg-gradient-to-r ${track.color} p-3 rounded-lg w-fit mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {track.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{track.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {track.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTrack}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals Selection */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What are your goals?
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Select all that apply to personalize your experience
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="grid gap-4">
                {goalOptions.map((goal) => (
                  <label
                    key={goal}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={goals.includes(goal)}
                      onChange={() => handleGoalToggle(goal)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                      goals.includes(goal)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {goals.includes(goal) && (
                        <CheckCircledIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">{goal}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleComplete}
                disabled={goals.length === 0 || isLoading}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
