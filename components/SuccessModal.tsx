'use client';

interface SuccessModalProps {
  isOpen: boolean;
}

export default function SuccessModal({ isOpen }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`bg-[rgba(10,20,30,0.98)] backdrop-blur-2xl p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl text-center max-w-xs sm:max-w-sm border border-emerald-500/40 shadow-2xl shadow-emerald-900/30 transition-all duration-300 ${
          isOpen ? 'scale-100 animate-slide-up' : 'scale-90'
        }`}
      >
        {/* Success icon with animation */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 sm:mb-6">
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full animate-pulse opacity-30 blur-xl" />
          
          {/* Main icon */}
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Rotating ring */}
          <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          USDT Verified Successfully!
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed mb-4 sm:mb-6">
          Your USDT has been verified and meets all regulatory compliance standards. Your verification is complete.
        </p>

        {/* Success badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] sm:text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Compliant
          </div>
          <div className="px-3 py-1.5 bg-teal-500/10 border border-teal-500/30 rounded-full text-[10px] sm:text-xs text-teal-400 font-medium flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        </div>

        {/* Auto-close message */}
        <p className="text-[10px] sm:text-xs text-gray-500">
          This window will close automatically...
        </p>
      </div>
    </div>
  );
}
