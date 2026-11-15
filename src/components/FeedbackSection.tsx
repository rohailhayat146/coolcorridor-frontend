
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FeedbackCategory,
  submitUserFeedback,
} from '../services/supabase';
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

// Database values are lowercase slugs.
// Labels are displayed separately in the interface.
const CATEGORIES: {
  value: FeedbackCategory;
  label: string;
}[] = [
  { value: 'general', label: 'General feedback' },
  { value: 'routing', label: 'Routing feedback' },
  { value: 'map', label: 'Map feedback' },
  { value: 'accuracy', label: 'Accuracy feedback' },
  { value: 'suggestion', label: 'Suggestions' },
  { value: 'bug_report', label: 'Bug reports' },
];

export const FeedbackSection: React.FC = () => {
  const { user, isGuest, openAuthModal, loginAsGuest } = useAuth();

  const [category, setCategory] =
    useState<FeedbackCategory>('general');

  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setErrorMsg(
        'Please write your feedback message before submitting.'
      );
      return;
    }

    if (trimmedMessage.length < 3 || trimmedMessage.length > 2000) {
      setErrorMsg(
        'Your message must be between 3 and 2000 characters.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Establish a genuine Supabase guest session if necessary.
      if (!user?.id) {
        const guestResult = await loginAsGuest();

        if (guestResult.error) {
          setErrorMsg(
            guestResult.error ||
              'Unable to establish a guest session. Please try again.'
          );
          return;
        }
      }

      // The service verifies the actual Supabase session
      // and obtains the authenticated user's UUID itself.
      const result = await submitUserFeedback({
        category,
        rating,
        message: trimmedMessage,
      });

      if (!result.success) {
        setErrorMsg(
          result.error || 'Failed to submit feedback. Please try again.'
        );
        return;
      }

      setSubmitted(true);
      setMessage('');
      setRating(null);
      setHoverRating(null);
      setCategory('general');
    } catch (err: any) {
      console.error('[FeedbackSection] Submission error:', err);

      setErrorMsg(
        err?.message || 'An unexpected submission error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="feedback"
      className="py-12 md:py-16 bg-[#F7F7F3] border-t border-[#E5E5DC]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[#385E48] mb-1 font-semibold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>COMMUNITY & RESEARCH FEEDBACK</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#202522]">
            Help improve CoolCorridor
          </h2>

          <p className="text-xs sm:text-sm text-[#5A6860] mt-1.5 leading-relaxed">
            Share field observations, sidewalk condition reports, or
            suggestions to calibrate our heat-aware routing model and
            pedestrian network data.
          </p>
        </div>

        {/* Feedback Card */}
        <div className="bg-white border border-[#E5E5DC] rounded-2xl p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-[#EBF1ED] text-[#385E48] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h3 className="font-display text-lg font-bold text-[#202522]">
                Feedback Received
              </h3>

              <p className="text-xs text-[#5A6860] max-w-md mx-auto leading-relaxed">
                Thank you for contributing your observations to the
                Phoenix Urban Heat Lab. Your submission has been saved
                to our research database.
              </p>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#385E48] hover:text-[#274333] hover:underline cursor-pointer"
                >
                  Submit another response
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Active User Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-[#F7F7F3] rounded-lg border border-[#E5E5DC] text-xs">
                <div className="flex items-center gap-2 text-[#5A6860]">
                  <Shield className="w-4 h-4 text-[#385E48]" />

                  <span>
                    Submitting as:{' '}
                    <strong className="text-[#202522]">
                      {user
                        ? isGuest
                          ? 'Guest User'
                          : user.email || 'Registered User'
                        : 'Guest (Instant)'}
                    </strong>
                  </span>
                </div>

                {!user && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="text-[#385E48] hover:underline text-[11px] font-semibold text-left sm:text-right cursor-pointer"
                  >
                    Sign in with registered account
                  </button>
                )}
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5A6860] mb-2 font-semibold">
                  Feedback Category
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.value;

                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        aria-pressed={isSelected}
                        className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#EBF1ED] border-[#385E48] text-[#274333] font-semibold'
                            : 'bg-[#F7F7F3] border-[#E5E5DC] text-[#5A6860] hover:bg-[#F1F1EB]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional 1 to 5 Rating */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#5A6860] font-semibold">
                    Experience Rating (Optional)
                  </label>

                  {rating !== null && (
                    <button
                      type="button"
                      onClick={() => setRating(null)}
                      className="text-[11px] text-[#5A6860] hover:text-[#202522] cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled =
                      (hoverRating ?? rating ?? 0) >= star;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-zinc-300 hover:text-amber-500 transition-colors cursor-pointer"
                        aria-label={`Rate ${star} of 5 stars`}
                        aria-pressed={rating === star}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            isFilled
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-zinc-300'
                          }`}
                        />
                      </button>
                    );
                  })}

                  <span className="text-xs text-[#5A6860] ml-2">
                    {rating !== null
                      ? `${rating} of 5 stars`
                      : 'No rating selected'}
                  </span>
                </div>
              </div>

              {/* Written Message */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5A6860] mb-1.5 font-semibold">
                  Your Message or Observation
                </label>

                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe sidewalk shading, thermal conditions along a route, inaccuracies, or general feedback..."
                  required
                  minLength={3}
                  maxLength={2000}
                  className="w-full p-3 text-xs bg-white border border-[#E5E5DC] rounded-lg text-[#202522] placeholder:text-[#5A6860]/60 focus:outline-none focus:border-[#385E48] focus:ring-1 focus:ring-[#385E48]"
                />

                <p className="text-[10px] text-[#5A6860] text-right mt-1">
                  {message.length}/2000 characters
                </p>
              </div>

              {/* Error Callout */}
              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#385E48] hover:bg-[#274333] disabled:bg-[#B8C7BE] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Feedback</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
