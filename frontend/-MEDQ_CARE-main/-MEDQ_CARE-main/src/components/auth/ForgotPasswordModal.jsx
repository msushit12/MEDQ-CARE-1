import React, { useState } from 'react';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';

const ForgotPasswordModal = ({ isOpen, onClose, roleTheme = 'blue' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus(null);
    try {
      const res = await authService.forgotPassword(email);
      setStatus({ type: 'success', message: res.message || 'Password reset instructions sent to your email.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to submit reset request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Account Password"
      subtitle="Enter your registered email address to receive a secure recovery OTP."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {status && <Alert type={status.type} message={status.message} />}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@medqcare.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Sending...</span>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ForgotPasswordModal;
