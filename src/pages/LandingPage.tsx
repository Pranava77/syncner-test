import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/syncner-logo.png';

const features = [
  {
    icon: (
      <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#00B8D9" /><path d="M12 18h12M18 12v12" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" /></svg>
    ),
    title: 'Personalized AI Learning',
    desc: 'Adaptive paths for every student, powered by AI.'
  },
  {
    icon: (
      <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect x="6" y="6" width="24" height="24" rx="8" fill="#A0D8EF" /><path d="M13 25l5-5 5 5" stroke="#121212" strokeWidth="2" strokeLinecap="round" /></svg>
    ),
    title: 'Real-World Projects',
    desc: 'Work on industry tasks and build your portfolio.'
  },
  {
    icon: (
      <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#B7410E" /><path d="M18 12v8M18 26h.01" stroke="#FAFAFA" strokeWidth="2" strokeLinecap="round" /></svg>
    ),
    title: 'Career-Ready Skills',
    desc: 'Graduate with confidence and real experience.'
  }
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-paperwhite flex flex-col justify-between relative overflow-x-hidden">
      {/* Gradient Accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="w-[60vw] h-[60vw] bg-gradient-to-br from-teal-light/30 via-true-turquoise/10 to-paperwhite rounded-full blur-3xl opacity-80 absolute -top-40 -left-40" />
        <div className="w-[40vw] h-[40vw] bg-gradient-to-tr from-rust/20 to-paperwhite rounded-full blur-2xl opacity-70 absolute -bottom-32 -right-32" />
      </div>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12 z-10">
        <div className="flex flex-col items-center space-y-7 max-w-xl w-full">
          <img src={logo} alt="Syncner Logo" className="h-20 w-20 mb-2 drop-shadow-lg" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-offblack text-center leading-tight">
            <span className="block">Syncner</span>
            <span className="block bg-gradient-to-r from-true-turquoise via-teal-light to-rust bg-clip-text text-transparent">Career Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-offblack/80 text-center max-w-md mt-2 font-medium">
            AI-powered platform for students to learn, build, and launch their careers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
            <Link
              to="/login"
              className="flex-1 bg-true-turquoise text-paperwhite px-7 py-3 rounded-lg font-semibold text-lg text-center shadow-md hover:bg-teal-light hover:text-offblack transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex-1 border-2 border-offblack text-offblack px-7 py-3 rounded-lg font-semibold text-lg text-center hover:bg-offblack hover:text-paperwhite transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="w-full py-14 bg-paperwhite z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="flex flex-col items-center bg-paperwhite border border-offblack/10 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow min-h-[220px]"
            >
              <div className="mb-5">{f.icon}</div>
              <h3 className="text-xl font-bold text-offblack mb-2 text-center">{f.title}</h3>
              <p className="text-offblack/70 text-center text-base font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-paperwhite border-t border-offblack/10 z-10">
        <div className="flex flex-col items-center space-y-2">
          <img src={logo} alt="Syncner Logo" className="h-8 w-8" />
          <span className="text-offblack/60 text-sm">© 2024 Syncner. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;