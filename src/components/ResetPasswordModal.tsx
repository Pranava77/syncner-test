import React, { useState } from 'react';
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: { name: string; email: string } | null;
  onReset: (password: string) => Promise<void>;
}

const generatePassword = () => {
  // Simple strong password generator
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ open, onClose, user, onReset }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open || !user) return null;

  const handleGenerate = () => {
    setPassword(generatePassword());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onReset(password);
      setSuccess(true);
      setShowPassword(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div 
        className="rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md border relative flex flex-col items-center"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <button
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-paperwhite hover:text-trueturquoise text-xl font-bold"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 
          className="text-xl font-bold mb-2 text-center w-full"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Reset Password
        </h2>
        <p 
          className="mb-4 text-sm text-center w-full"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          User: <span 
            className="font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {user.name}
          </span> ({user.email})
        </p>
        {success ? (
          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="text-paperwhite text-center">
              <p className="mb-2">Password has been reset. Copy and share this password with the user. It will not be shown again.</p>
              <div className="bg-paperwhite/10 rounded-lg px-4 py-3 text-lg font-mono text-trueturquoise select-all break-all text-center">{password}</div>
            </div>
            <button
              onClick={handleCopy}
              className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold"
            >Copy Password</button>
            <button
              onClick={handleClose}
              className="w-full bg-paperwhite/10 text-paperwhite py-2 rounded-lg hover:bg-paperwhite/20 transition-colors font-semibold mt-2"
            >Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 w-full flex flex-col items-center">
            <label className="block text-paperwhite mb-1 font-label w-full">New Password</label>
            <div className="flex gap-2 w-full min-w-0 items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 border border-paperwhite/20 rounded-lg bg-offblack text-paperwhite focus:ring-2 focus:ring-trueturquoise"
                placeholder="Enter or generate password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={handleGenerate}
                className="flex-shrink-0 w-24 bg-trueturquoise text-offblack px-3 py-2 rounded-lg hover:bg-teallight transition-colors font-semibold"
              >Generate</button>
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="flex-shrink-0 w-12 bg-paperwhite/10 text-paperwhite px-0 py-2 rounded-lg hover:bg-paperwhite/20 transition-colors font-semibold flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeClosedIcon className="w-5 h-5" /> : <EyeOpenIcon className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-xs text-teallight w-full">Password must be at least 6 characters.</div>
            {error && <div className="text-rust text-sm font-medium w-full">{error}</div>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-trueturquoise text-offblack py-2 rounded-lg hover:bg-trueturquoise/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal; 