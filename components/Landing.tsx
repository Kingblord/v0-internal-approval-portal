'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Landing() {
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <main className="h-screen overflow-hidden bg-[#1a1a1a] text-white flex flex-col items-center justify-between px-4">
      {/* Header */}
      <div className="text-center pt-6 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="font-black">TRUST</span>
          <span className="font-light">WALLET</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 tracking-wider">AML SERVICE</p>
      </div>

      {/* Shield Graphic - Responsive and Centered */}
      <div className="flex-1 flex items-center justify-center w-full py-8 sm:py-12">
        <div className="w-48 h-48 sm:w-64 sm:h-64 relative">
          <Image
            src="/shield.png"
            alt="Trust Shield"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Footer - Terms and Continue */}
      <div className="w-full max-w-sm px-4 pb-8 sm:pb-12 space-y-4 sm:space-y-6">
        {/* Terms Checkbox */}
        <div className="flex items-start gap-2 sm:gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-6 h-6 sm:w-7 sm:h-7 mt-0.5 flex-shrink-0 appearance-none border-2 border-emerald-500 rounded-full cursor-pointer bg-transparent checked:bg-emerald-500 transition-all relative"
            aria-label="Accept terms and conditions"
          />
          {termsAccepted && (
            <div className="absolute ml-1 mt-1 pointer-events-none">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <label htmlFor="terms" className="text-xs sm:text-sm text-gray-300 cursor-pointer leading-relaxed">
            I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              terms and conditions
            </a>
            {' '}of use of the AML service by{' '}
            <span className="font-semibold">Trust Wallet</span>.
          </label>
        </div>

        {/* Continue Button */}
        <Link href="/checker" className="block">
          <button
            disabled={!termsAccepted}
            className={`w-full py-2.5 sm:py-3 rounded-full font-semibold text-base sm:text-lg transition-all ${
              termsAccepted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-black cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            Continue
          </button>
        </Link>
      </div>
    </main>
  );
}
