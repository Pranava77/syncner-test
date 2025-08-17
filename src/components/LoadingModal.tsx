import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingModalProps {
  open: boolean;
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ open, message }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 text-center"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="mx-auto mb-4 h-12 w-12 rounded-full" style={{ backgroundColor: 'var(--color-tertiary-bg)' }}>
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
                   style={{ borderColor: 'var(--color-accent-primary)', borderTopColor: 'transparent' }} />
            </div>
            <div className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              {message || 'Please wait...'}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This will only take a moment.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingModal;


