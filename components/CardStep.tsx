'use client';

import { Loader2 } from 'lucide-react';

interface CardStepProps {
  icon: string;
  title: string;
  description: string;
  loading: boolean;
  error: string | null;
  buttons: Array<{
    label: string;
    onClick: () => void;
    primary: boolean;
  }>;
}

export default function CardStep({
  icon,
  title,
  description,
  loading,
  error,
  buttons,
}: CardStepProps) {
  return (
    <div className="bg-[rgba(15,23,42,0.9)] backdrop-blur-3xl p-8 rounded-3xl border border-purple-500/30 shadow-2xl shadow-black/50 relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-600">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* Icon with float animation */}
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-2xl flex items-center justify-center text-3xl border-2 border-purple-500/20 animate-float">
        {icon}
      </div>

      {/* Title with gradient text */}
      <h1 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-gray-200 to-purple-200 bg-clip-text text-transparent">
        {title}
      </h1>

      {/* Description */}
      <p className="text-center text-sm text-gray-400 mb-7 leading-relaxed line-clamp-3">
        {description}
      </p>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3">
        {buttons.map((button, idx) => (
          <button
            key={idx}
            onClick={button.onClick}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${
              button.primary
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5'
            }`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />

            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              button.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
