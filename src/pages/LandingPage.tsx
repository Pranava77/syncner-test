import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/syncner-logo.png';

const features = [
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#00B8D9" /><path d="M10 16h12M16 10v12" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" /></svg>
    ),
    title: 'Personalized AI Learning',
    desc: 'Adaptive paths for every student, powered by AI.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="8" fill="#A0D8EF" /><path d="M10 22l6-6 6 6" stroke="#121212" strokeWidth="2" strokeLinecap="round" /></svg>
    ),
    title: 'Real-World Projects',
    desc: 'Work on industry tasks and build your portfolio.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#B7410E" /><path d="M16 10v8M16 22h.01" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" /></svg>
    ),
    title: 'Career-Ready Skills',
    desc: 'Graduate with confidence and real experience.'
  }
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-paperwhite flex flex-col justify-between">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="flex flex-col items-center space-y-6 max-w-xl w-full">
          <div className="flex flex-col items-center space-y-2">
            <img src={logo} alt="Syncner Logo" className="h-16 w-16 mb-2 animate-fade-in" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-offblack text-center leading-tight">
              <span className="block">Syncner</span>
              <span className="block text-true-turquoise">Career Platform</span>
            </h1>
            <p className="text-lg md:text-xl text-offblack/70 text-center max-w-md mt-2">
              AI-powered platform for students to learn, build, and launch their careers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
            <Link
              to="/login"
              className="flex-1 bg-true-turquoise text-paperwhite px-6 py-3 rounded-lg font-semibold text-lg text-center shadow-md hover:bg-teal-light transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex-1 border-2 border-offblack/10 text-offblack px-6 py-3 rounded-lg font-semibold text-lg text-center hover:bg-offblack/5 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="w-full py-12 bg-paperwhite">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="flex flex-col items-center bg-paperwhite border border-offblack/5 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow min-h-[220px]"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-offblack mb-2 text-center">{f.title}</h3>
              <p className="text-offblack/70 text-center text-base">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-paperwhite border-t border-offblack/10">
        <div className="flex flex-col items-center space-y-2">
          <img src={logo} alt="Syncner Logo" className="h-8 w-8" />
          <span className="text-offblack/60 text-sm">© 2024 Syncner. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;