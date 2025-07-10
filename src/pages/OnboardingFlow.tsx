import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { updateUserProfile, fetchCurrentUser } from '../redux/slices/authSlice';
import { 
  Brain, 
  Code, 
  Palette, 
  BarChart3, 
  ArrowRight, 
  CheckCircle 
} from 'lucide-react';
import logo from '../assets/syncner-logo.png';
import LoadingSpinner from '../components/LoadingSpinner';

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

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] py-12 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Syncner Logo" className="h-14 w-14 object-contain" />
        </div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--brand-text)]">Step {step} of 3</span>
            <span className="text-sm text-[var(--brand-primary)]">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-[var(--brand-bg-alt)] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[var(--brand-text)] mb-4">
              Welcome to Syncner, {user?.name}!
            </h1>
            <p className="text-xl text-[var(--brand-primary)] mb-8 max-w-2xl mx-auto">
              Let's set up your personalized learning path to help you achieve your career goals.
            </p>
            <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-lg p-8 max-w-2xl mx-auto transition-colors">
              <h2 className="text-2xl font-semibold text-[var(--brand-text)] mb-6">
                What makes Syncner special?
              </h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-[var(--brand-primary)] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-[var(--brand-text)]">AI-Personalized Learning</h3>
                    <p className="text-[var(--brand-primary)]">Adaptive curriculum that adjusts to your pace and learning style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-[var(--brand-primary)] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-[var(--brand-text)]">Real-World Projects</h3>
                    <p className="text-[var(--brand-primary)]">Industry-standard tasks that build your portfolio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-[var(--brand-primary)] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-[var(--brand-text)]">Career Guidance</h3>
                    <p className="text-[var(--brand-primary)]">AI-powered mentoring and career advice</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full mt-8 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white py-3 rounded-lg hover:from-[var(--brand-accent)] hover:to-[var(--brand-primary)] transition-all font-medium flex items-center justify-center"
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
              <h1 className="text-4xl font-bold text-[var(--brand-text)] mb-4">
                Choose Your Career Track
              </h1>
              <p className="text-xl text-[var(--brand-primary)]">
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
                    className={`bg-[var(--brand-bg-alt)] rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
                      selectedTrack === track.id 
                        ? 'ring-2 ring-[var(--brand-primary)] bg-[var(--brand-primary-light)]' 
                        : 'hover:bg-[var(--brand-bg-light)] dark:hover:bg-[var(--brand-bg-dark)]'
                    }`}
                  >
                    <div className={`bg-gradient-to-r ${track.color} p-3 rounded-lg w-fit mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--brand-text)] mb-2">
                      {track.title}
                    </h3>
                    <p className="text-[var(--brand-primary)] mb-4">{track.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {track.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-[var(--brand-bg-light)] dark:bg-[var(--brand-bg-dark)] text-[var(--brand-primary)] dark:text-[var(--brand-primary-light)] px-3 py-1 rounded-full text-sm"
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
                className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white px-8 py-3 rounded-lg hover:from-[var(--brand-accent)] hover:to-[var(--brand-primary)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
              <h1 className="text-4xl font-bold text-[var(--brand-text)] mb-4">
                What are your goals?
              </h1>
              <p className="text-xl text-[var(--brand-primary)]">
                Select all that apply to personalize your experience
              </p>
            </div>

            <div className="bg-[var(--brand-bg-alt)] rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="grid gap-4">
                {goalOptions.map((goal) => (
                  <label
                    key={goal}
                    className="flex items-center p-4 border border-[var(--brand-bg-light)] dark:border-[var(--brand-bg-dark)] rounded-lg cursor-pointer hover:bg-[var(--brand-bg-light)] dark:hover:bg-[var(--brand-bg-dark)] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={goals.includes(goal)}
                      onChange={() => handleGoalToggle(goal)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                      goals.includes(goal)
                        ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]'
                        : 'border-[var(--brand-bg-light)] dark:border-[var(--brand-bg-dark)]'
                    }`}>
                      {goals.includes(goal) && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-[var(--brand-text)] font-medium">{goal}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleComplete}
                disabled={goals.length === 0 || isLoading}
                className="w-full mt-8 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white py-3 rounded-lg hover:from-[var(--brand-accent)] hover:to-[var(--brand-primary)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="sm" color="white" />
                    <span>Setting up your profile...</span>
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;