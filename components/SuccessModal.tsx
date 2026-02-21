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
        className={`bg-[rgba(15,23,42,0.95)] backdrop-blur-2xl p-10 rounded-2xl text-center max-w-sm border border-purple-500/30 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-90'
        }`}
      >
        {/* Success icon with bounce animation */}
        <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-4xl animate-bounce">
          🎉
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-3 text-emerald-400">
          Transaction Approved!
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed">
          Your Transaction has been successfully claimed and the tokens have been transferred to your wallet.
        </p>
      </div>
    </div>
  );
}
