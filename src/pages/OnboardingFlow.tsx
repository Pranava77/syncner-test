import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { updateUserProfile, fetchCurrentUser } from '../redux/slices/authSlice';
import ThemeSwitcher from '../components/ThemeSwitcher';
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
import { AnimatePresence, motion } from 'framer-motion';

const careerTracks = [
  {
    id: 'ai-ml',
    title: 'AI/ML Engineering',
    description: 'Machine Learning, Deep Learning, Data Science',
    icon: LightningBoltIcon,
    color: 'var(--color-accent-secondary)',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Analysis']
  },
  {
    id: 'full-stack',
    title: 'Full Stack Development',
    description: 'Frontend & Backend Development, APIs, Databases',
    icon: CodeIcon,
    color: 'var(--color-accent-primary)',
    skills: ['React', 'Node.js', 'Databases', 'API Design']
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description: 'User Interface Design, User Experience, Prototyping',
    icon: ColorWheelIcon,
    color: 'var(--color-success)',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research']
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'Data Analysis, Visualization, Business Intelligence',
    icon: BarChartIcon,
    color: 'var(--color-warning)',
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
    <div 
      className="min-h-screen py-12 px-4 font-sans relative"
              style={{ backgroundColor: 'var(--color-secondary-bg)' }}
    >
      {/* Theme Switcher */}
      <div className="absolute top-4 right-4">
        <ThemeSwitcher variant="button" size="sm" />
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Syncner Logo" className="h-14 w-14 object-contain" />
        </div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
                    <span 
          className="text-base font-label"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Step {step} of 3
        </span>
        <span 
          className="text-base font-label"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {Math.round((step / 3) * 100)}% Complete
        </span>
          </div>
          <div 
            className="w-full rounded-full h-2"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: 'var(--color-accent-primary)',
                width: `${(step / 3) * 100}%` 
              }}
            ></div>
          </div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
        {/* Step 1: Welcome */}
        {step === 1 && (
              <div className="text-center" role="region" aria-label="Welcome Step">
                <h1 
                  className="text-4xl font-heading mb-4 leading-tight"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Welcome to Syncner, {user?.name}!
                </h1>
                <p 
                  className="text-xl font-label mb-8 max-w-2xl mx-auto leading-relaxed"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Let's set up your personalized learning path to help you achieve your career goals.
                </p>
                <div 
                  className="rounded-xl shadow-lg p-8 max-w-2xl mx-auto"
                  style={{
                    backgroundColor: 'var(--color-tertiary-bg)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <h2 
                    className="text-2xl font-heading mb-6 leading-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    What makes Syncner special?
                  </h2>
                  <ul className="space-y-4 text-left">
                    <li className="flex items-start space-x-3">
                      <CheckCircledIcon 
                        className="h-6 w-6 mt-1 flex-shrink-0" 
                        aria-hidden="true"
                        style={{ color: 'var(--color-accent-primary)' }}
                      />
                  <div>
                        <h3 
                          className="font-heading"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          AI-Personalized Learning
                        </h3>
                        <p 
                          className="font-label"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          Adaptive curriculum that adjusts to your pace and learning style
                        </p>
                  </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircledIcon 
                        className="h-6 w-6 mt-1 flex-shrink-0" 
                        aria-hidden="true"
                        style={{ color: 'var(--color-accent-primary)' }}
                      />
                  <div>
                        <h3 
                          className="font-heading"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Real-World Projects
                        </h3>
                        <p 
                          className="font-label"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          Industry-standard tasks that build your portfolio
                        </p>
                  </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircledIcon 
                        className="h-6 w-6 mt-1 flex-shrink-0" 
                        aria-hidden="true"
                        style={{ color: 'var(--color-accent-primary)' }}
                      />
                  <div>
                        <h3 
                          className="font-heading"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Career Guidance
                        </h3>
                        <p 
                          className="font-label"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          AI-powered mentoring and career advice
                        </p>
                  </div>
                    </li>
                  </ul>
              <button
                onClick={() => setStep(2)}
                    className="w-full mt-8 py-3 rounded-lg focus:ring-2 focus:outline-none transition-all font-medium flex items-center justify-center text-lg shadow-sm"
                    style={{
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)'
                    }}
                    aria-label="Start onboarding"
              >
                Let's Get Started
                    <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        {/* Step 2: Career Track Selection */}
        {step === 2 && (
              <div role="region" aria-label="Career Track Selection">
            <div className="text-center mb-8">
                  <h1 
                    className="text-4xl font-heading mb-4 leading-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Choose Your Career Track
                  </h1>
                  <p 
                    className="text-xl font-label leading-relaxed"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
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
                        className={`rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl focus-within:ring-2 outline-none ${
                      selectedTrack === track.id 
                            ? 'ring-2' 
                            : ''
                    }`}
                        style={{
                          backgroundColor: selectedTrack === track.id 
                            ? 'var(--color-accent-tertiary)' 
                            : 'var(--color-tertiary-bg)',
                          borderColor: selectedTrack === track.id 
                            ? 'var(--color-accent-primary)' 
                            : 'var(--color-border)'
                        }}
                        tabIndex={0}
                        role="button"
                        aria-pressed={selectedTrack === track.id}
                        aria-label={track.title}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleTrackSelect(track.id)}
                  >
                        <div 
                          className="p-3 rounded-lg w-fit mb-4"
                          style={{ backgroundColor: 'var(--color-accent-tertiary)' }}
                        >
                          <Icon 
                            className="h-8 w-8" 
                            aria-hidden="true"
                            style={{ color: 'var(--color-accent-primary)' }}
                          />
                    </div>
                        <h3 
                          className="text-xl font-heading mb-2 leading-tight"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {track.title}
                        </h3>
                        <p 
                          className="font-label mb-4 leading-relaxed"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {track.description}
                        </p>
                    <div className="flex flex-wrap gap-2">
                      {track.skills.map((skill) => (
                        <span
                          key={skill}
                              className="px-3 py-1 rounded-full text-sm font-label"
                              style={{
                                backgroundColor: 'var(--color-text-muted)',
                                color: 'var(--color-text-inverse)'
                              }}
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
                    className="px-8 py-3 rounded-lg focus:ring-2 focus:outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg shadow-sm"
                    style={{
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)'
                    }}
                    aria-label="Continue to goals"
              >
                Continue
                    <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        {/* Step 3: Goals Selection */}
        {step === 3 && (
              <div role="region" aria-label="Goals Selection">
            <div className="text-center mb-8">
                  <h1 
                    className="text-4xl font-heading mb-4 leading-tight"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    What are your goals?
                  </h1>
                  <p 
                    className="text-xl font-label leading-relaxed"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    Select all that apply to personalize your experience
                  </p>
                </div>
                <div 
                  className="rounded-xl shadow-lg p-8 max-w-2xl mx-auto"
                  style={{
                    backgroundColor: 'var(--color-tertiary-bg)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
              <div className="grid gap-4">
                {goalOptions.map((goal) => (
                  <label
                    key={goal}
                        className="flex items-center p-4 border rounded-lg cursor-pointer focus-within:ring-2 outline-none transition-colors"
                        style={{
                          borderColor: 'var(--color-border)',
                          backgroundColor: goals.includes(goal) ? 'var(--color-accent-tertiary)' : 'transparent'
                        }}
                        tabIndex={0}
                        role="checkbox"
                        aria-checked={goals.includes(goal)}
                        aria-label={goal}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleGoalToggle(goal)}
                  >
                    <input
                      type="checkbox"
                      checked={goals.includes(goal)}
                      onChange={() => handleGoalToggle(goal)}
                      className="sr-only"
                          tabIndex={-1}
                    />
                        <div 
                          className="w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors duration-200"
                          style={{
                            backgroundColor: goals.includes(goal) 
                              ? 'var(--color-accent-primary)'
                              : 'transparent',
                            borderColor: goals.includes(goal) 
                              ? 'var(--color-accent-primary)'
                              : 'var(--color-border)'
                          }}
                        >
                          {goals.includes(goal) && (
                            <CheckCircledIcon 
                              className="h-3 w-3" 
                              aria-hidden="true"
                              style={{ color: 'var(--color-text-inverse)' }}
                            />
                          )}
                        </div>
                        <span 
                          className="font-label text-lg"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {goal}
                        </span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleComplete}
                disabled={goals.length === 0 || isLoading}
                    className="w-full mt-8 py-3 rounded-lg focus:ring-2 focus:outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-sm"
                    style={{
                      backgroundColor: 'var(--color-accent-primary)',
                      color: 'var(--color-text-inverse)'
                    }}
                    aria-label="Complete onboarding"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
