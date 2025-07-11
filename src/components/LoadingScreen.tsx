import React, { useState, useEffect } from 'react';
import logo from '../assets/syncner-logo.png';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progressDuration?: number; // in milliseconds
}

const motivationalQuotes = [
  "Great things take time...",
  "Syncing your success...",
  "Almost there, stay tuned!",
  "Empowering your journey...",
  "Innovation in progress...",
  "Your experience is loading...",
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  showProgress = true,
  progressDuration = 2000 
}) => {
  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState(motivationalQuotes[0]);

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Stop at 90% until loading is complete
          }
          return prev + 10;
        });
      }, progressDuration / 10);

      return () => clearInterval(interval);
    }
  }, [showProgress, progressDuration]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-30 animate-float${i % 3 + 1}`}
            style={{
              width: `${16 + (i % 4) * 8}px`,
              height: `${16 + (i % 4) * 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(135deg, #6366f1 40%, #a78bfa 100%)`,
              filter: 'blur(2px)'
            }}
          />
        ))}
      </div>
      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/30 rounded-3xl shadow-2xl border border-blue-200/20 dark:border-blue-900/30 px-8 py-10 text-center mx-auto animate-fadein">
          {/* Animated Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl inline-block mb-4 animate-pulse-slow shadow-lg">
              <img src={logo} alt="Syncner Logo" className="h-16 w-16 object-contain animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide drop-shadow-lg">Syncner</h1>
            <p className="text-blue-200 text-base font-medium">Loading your experience...</p>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="w-72 mx-auto mb-2">
              <div className="flex justify-between text-xs text-blue-200 mb-2">
                <span>Loading</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out relative animate-glow-bar"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0_10px,transparent_10px_20px)] rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Loading Message */}
          <p className="text-blue-100 text-base mt-4 font-semibold animate-fadein-slow">{message}</p>
          {/* Motivational Quote */}
          <p className="text-purple-200 text-sm mt-2 italic animate-fadein-slow">{quote}</p>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes float1 { 0%{transform:translateY(0);} 50%{transform:translateY(-20px);} 100%{transform:translateY(0);} }
        @keyframes float2 { 0%{transform:translateY(0);} 50%{transform:translateY(20px);} 100%{transform:translateY(0);} }
        @keyframes float3 { 0%{transform:translateY(0);} 50%{transform:translateY(-10px);} 100%{transform:translateY(0);} }
        .animate-float1 { animation: float1 6s ease-in-out infinite; }
        .animate-float2 { animation: float2 8s ease-in-out infinite; }
        .animate-float3 { animation: float3 7s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 3.5s linear infinite; }
        .animate-pulse-slow { animation: pulse 2.5s cubic-bezier(.4,0,.6,1) infinite; }
        .animate-fadein { animation: fadein 1s ease; }
        .animate-fadein-slow { animation: fadein 2s ease; }
        .animate-glow-bar { box-shadow: 0 0 16px 2px #a78bfa88, 0 0 8px 1px #6366f188; }
        @keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;} }
      `}</style>
    </div>
  );
};

export default LoadingScreen; 