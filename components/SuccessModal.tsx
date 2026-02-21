'use client';

interface SuccessModalProps {
  isOpen: boolean;
}

export default function SuccessModal({ isOpen }: SuccessModalProps) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
      style={{
        background: isOpen ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: isOpen ? 'blur(10px)' : 'none',
      }}
    >
      <div
        className={`bg-[rgba(10,20,30,0.98)] backdrop-blur-2xl p-10 rounded-2xl text-center max-w-sm border border-emerald-500/40 shadow-2xl shadow-emerald-900/30 transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-90'
        }`}
      >
        {/* Success icon with bounce animation */}
        <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          USDT Verified Successfully!
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed">
          Your USDT has been verified and meets all regulatory compliance standards. Your verification is complete.
        </p>
      </div>
    </div>
  );
}
