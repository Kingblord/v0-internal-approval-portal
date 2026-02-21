'use client';

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { num: 1, label: 'Connect' },
    { num: 2, label: 'Approve' },
    { num: 3, label: 'Sign' },
  ];

  return (
    <div className="mb-6 sm:mb-8 md:mb-10">
      {/* Progress line container */}
      <div className="flex justify-between items-center relative px-4 sm:px-8">
        {/* Background line */}
        <div className="absolute top-1/2 left-8 right-8 sm:left-12 sm:right-12 h-1 -translate-y-1/2 bg-emerald-500/10 rounded-full z-0" />
        
        {/* Active progress line */}
        <div 
          className="absolute top-1/2 left-8 sm:left-12 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full z-0 transition-all duration-500 ease-out"
          style={{ width: `calc(${((currentStep - 1) / 2) * 100}% - 1.5rem)` }}
        />
        
        {/* Steps */}
        {steps.map((step) => (
          <div key={step.num} className="flex flex-col items-center gap-2 relative z-10">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base font-bold transition-all duration-500 ${
                currentStep >= step.num
                  ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/50 scale-110 animate-pulse-glow'
                  : 'bg-slate-800/50 border-2 border-emerald-500/20 text-gray-500'
              }`}
            >
              {currentStep > step.num ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.num
              )}
            </div>
            <span className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 ${
              currentStep >= step.num ? 'text-emerald-400' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
