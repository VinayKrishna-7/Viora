import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle } from 'lucide-react';
import { createReportApi } from '../../services/reportService';
import Button from '../ui/Button';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or harmful symbols' },
  { value: 'violence', label: 'Violent or dangerous acts' },
  { value: 'copyright', label: 'Copyright infringement' },
  { value: 'misinformation', label: 'Misinformation or harmful claims' },
  { value: 'other', label: 'Other platform violation' },
];

export const ReportModal = ({
  isOpen,
  onClose,
  targetType = 'video',
  targetId,
  targetTitle = '',
}) => {
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await createReportApi({
        targetType,
        targetId,
        reason,
        description,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDescription('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-viora-surface border border-viora-border rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-viora-border">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-base">
            <Flag className="w-5 h-5 text-rose-400" />
            <span>Report {targetType === 'video' ? 'Release' : 'Comment'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="font-bold text-slate-100">Report Submitted</h3>
            <p className="text-xs text-slate-400">
              Thank you for helping keep our community safe. Our moderation team will review this.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {targetTitle && (
              <p className="text-xs text-slate-400 line-clamp-1 italic">
                Reporting: "{targetTitle}"
              </p>
            )}

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-2xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select a reason
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                      reason === r.value
                        ? 'border-indigo-500/60 bg-indigo-500/10 text-white font-medium'
                        : 'border-viora-border text-slate-400 hover:bg-white/[0.04]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="accent-indigo-500"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional details (optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                placeholder="Provide timestamps or specific context..."
                className="w-full px-3.5 py-2.5 bg-viora-card border border-viora-border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                size="sm"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
