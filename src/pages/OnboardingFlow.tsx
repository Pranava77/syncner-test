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
import { AnimatePresence, motion } from 'framer-motion';

const careerTracks = [
  {
    id: 'ai-ml',
    title: 'AI/ML Engineering',
    description: 'Machine Learning, Deep Learning, Data Science',
    icon: LightningBoltIcon,
    color: 'from-purple-500 to-pink-500',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Analysis']
  },
  {
    id: 'fullstack',
    title: 'Full Stack Development',
    description: 'Frontend & Backend Development, APIs, Databases',
    icon: CodeIcon,
    color: 'from-blue-500 to-cyan-500',
    skills: ['React', 'Node.js', 'Databases', 'API Design']
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description: 'User Interface Design, User Experience, Prototyping',
    icon: ColorWheelIcon,
    color: 'from-green-500 to-emerald-500',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research']
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'Data Analysis, Visualization, Business Intelligence',
    icon: BarChartIcon,
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
    <div className="min-h-screen bg-offblack py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Syncner Logo" className="h-14 w-14 object-contain" />
        </div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-label text-teallight">Step {step} of 3</span>
            <span className="text-base font-label text-teallight">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-paperwhite/10 rounded-full h-2">
            <div 
              className="bg-trueturquoise h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
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
                <h1 className="text-4xl font-heading text-paperwhite mb-4 leading-tight">
                  Welcome to Syncner, {user?.name}!
                </h1>
                <p className="text-xl font-label text-teallight mb-8 max-w-2xl mx-auto leading-relaxed">
                  Let's set up your personalized learning path to help you achieve your career goals.
                </p>
                <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-heading text-paperwhite mb-6 leading-tight">
                    What makes Syncner special?
                  </h2>
                  <ul className="space-y-4 text-left">
                    <li className="flex items-start space-x-3">
                      <CheckCircledIcon className="h-6 w-6 text-trueturquoise mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h3 className="font-heading text-paperwhite">AI-Personalized Learning</h3>
                        <p className="font-label text-teallight">Adaptive curriculum that adjusts to your pace and learning style</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircledIcon className="h-6 w-6 text-trueturquoise mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h3 className="font-heading text-paperwhite">Real-World Projects</h3>
                        <p className="font-label text-teallight">Industry-standard tasks that build your portfolio</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircledIcon className="h-6 w-6 text-trueturquoise mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h3 className="font-heading text-paperwhite">Career Guidance</h3>
                        <p className="font-label text-teallight">AI-powered mentoring and career advice</p>
                      </div>
                    </li>
                  </ul>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full mt-8 bg-trueturquoise text-offblack py-3 rounded-lg hover:bg-trueturquoise/90 focus:ring-2 focus:ring-trueturquoise focus:outline-none transition-all font-medium flex items-center justify-center text-lg shadow-sm"
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
                  <h1 className="text-4xl font-heading text-paperwhite mb-4 leading-tight">
                    Choose Your Career Track
                  </h1>
                  <p className="text-xl font-label text-teallight leading-relaxed">
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
                        className={`bg-paperwhite/10 rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl focus-within:ring-2 focus-within:ring-trueturquoise outline-none ${
                          selectedTrack === track.id 
                            ? 'ring-2 ring-trueturquoise bg-teallight' 
                            : 'hover:bg-paperwhite/5'
                        }`}
                        tabIndex={0}
                        role="button"
                        aria-pressed={selectedTrack === track.id}
                        aria-label={track.title}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleTrackSelect(track.id)}
                      >
                        <div className="bg-trueturquoise/20 p-3 rounded-lg w-fit mb-4">
                          <Icon className="h-8 w-8 text-trueturquoise" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-heading text-offblack mb-2 leading-tight">
                          {track.title}
                        </h3>
                        <p className="text-offblack font-label mb-4 leading-relaxed">{track.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {track.skills.map((skill) => (
                            <span
                              key={skill}
                              className="bg-soft-gray text-offblack px-3 py-1 rounded-full text-sm font-label"
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
                    className="bg-trueturquoise text-offblack px-8 py-3 rounded-lg hover:bg-trueturquoise/90 focus:ring-2 focus:ring-trueturquoise focus:outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg shadow-sm"
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
                  <h1 className="text-4xl font-heading text-paperwhite mb-4 leading-tight">
                    What are your goals?
                  </h1>
                  <p className="text-xl font-label text-teallight leading-relaxed">
                    Select all that apply to personalize your experience
                  </p>
                </div>
                <div className="bg-paperwhite/10 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
                  <div className="grid gap-4">
                    {goalOptions.map((goal) => (
                      <label
                        key={goal}
                        className="flex items-center p-4 border border-paperwhite/20 rounded-lg cursor-pointer hover:bg-paperwhite/5 focus-within:ring-2 focus-within:ring-trueturquoise outline-none transition-colors"
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
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors duration-200 ${
                          goals.includes(goal)
                            ? 'bg-trueturquoise border-trueturquoise'
                            : 'border-paperwhite/20'
                        }`}>
                          {goals.includes(goal) && (
                            <CheckCircledIcon className="h-3 w-3 text-offblack" aria-hidden="true" />
                          )}
                        </div>
                        <span className="text-offblack font-label text-lg">{goal}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleComplete}
                    disabled={goals.length === 0 || isLoading}
                    className="w-full mt-8 bg-trueturquoise text-offblack py-3 rounded-lg hover:bg-trueturquoise/90 focus:ring-2 focus:ring-trueturquoise focus:outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-sm"
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
