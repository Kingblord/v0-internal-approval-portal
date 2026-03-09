'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Landing() {
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <main className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-between px-4 py-8 sm:py-12">
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
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-B2JgGEZoh1zWjAXwAQe0szSkq2oHkd.png"
            alt="Trust Shield"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Footer - Terms and Continue */}
      <div className="w-full max-w-sm px-4 sm:px-6 pb-8 sm:pb-12 space-y-4 sm:space-y-6">
        {/* Terms Checkbox */}
        <div className="flex items-start gap-2 sm:gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-1 border-2 border-emerald-500 rounded-full cursor-pointer accent-emerald-500 bg-black flex-shrink-0"
            aria-label="Accept terms and conditions"
          />
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
            className={`w-full py-2.5 sm:py-3 rounded-full font-semibold text-base sm:text-lg transition-all ${termsAccepted
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
