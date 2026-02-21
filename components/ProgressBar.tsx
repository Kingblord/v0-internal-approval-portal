'use client';

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="flex justify-between mb-10 relative">
      {/* Background line */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-purple-500/20 z-0" />
      
      {/* Steps */}
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold relative z-10 transition-all duration-300 ${
            currentStep >= step
              ? 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/40'
              : 'bg-purple-500/20 border-purple-500/50 text-gray-400'
          } border-2`}
        >
          {step}
        </div>
      ))}
    </div>
  );
}
