import React, { useState } from 'react';

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
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
      <div className="bg-offblack rounded-xl shadow-2xl p-8 w-full max-w-md border border-paperwhite/20 relative">
        <button
          className="absolute top-4 right-4 text-paperwhite hover:text-trueturquoise text-xl font-bold"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-paperwhite mb-2">Reset Password</h2>
        <p className="text-teallight mb-4 text-sm">User: <span className="text-paperwhite font-semibold">{user.name}</span> ({user.email})</p>
        {success ? (
          <div className="space-y-4">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-paperwhite mb-1 font-label">New Password</label>
            <div className="flex gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 px-3 py-2 border border-paperwhite/20 rounded-lg bg-offblack text-paperwhite focus:ring-2 focus:ring-trueturquoise"
                placeholder="Enter or generate password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={handleGenerate}
                className="bg-trueturquoise text-offblack px-3 py-2 rounded-lg hover:bg-teallight transition-colors font-semibold"
              >Generate</button>
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="bg-paperwhite/10 text-paperwhite px-3 py-2 rounded-lg hover:bg-paperwhite/20 transition-colors font-semibold"
              >{showPassword ? '🙈' : '👁️'}</button>
            </div>
            <div className="text-xs text-teallight">Password must be at least 6 characters.</div>
            {error && <div className="text-rust text-sm font-medium">{error}</div>}
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