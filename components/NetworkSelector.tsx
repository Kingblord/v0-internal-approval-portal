'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { NETWORKS, type Network } from '@/lib/networks';

export default function NetworkSelector() {
  const router = useRouter();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);

  const handleContinue = () => {
    if (selectedNetwork) {
      sessionStorage.setItem('selectedNetwork', selectedNetwork);
      router.push('/checker/connect');
    }
  };

  // Only Ethereum is shown for now (BSC temporarily hidden)
  const ethereum = NETWORKS.erc;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-12">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="font-black">TRUST</span>
          <span className="font-light">WALLET</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 tracking-wider">AML SERVICE</p>
      </div>

      {/* Progress Line */}
      <div className="mb-8 sm:mb-10">
        <div className="h-1 bg-emerald-500 rounded-full"></div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-10 sm:mb-16 max-w-2xl mx-auto w-full px-2">
        {/* Step 1 */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">1</div>
          <p className="text-emerald-400 text-xs sm:text-sm mt-2 sm:mt-3 text-center leading-tight font-semibold">Select Network</p>
        </div>
        {/* Line 1 */}
        <div className="flex-1 h-1 bg-gray-700 mx-2 sm:mx-3"></div>
        {/* Step 2 */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">2</div>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 sm:mt-3 text-center leading-tight font-semibold">Connect Wallet</p>
        </div>
        {/* Line 2 */}
        <div className="flex-1 h-1 bg-gray-700 mx-2 sm:mx-3"></div>
        {/* Step 3 */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">3</div>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 sm:mt-3 text-center leading-tight font-semibold">AML Report</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Select Network</h2>
        <p className="text-gray-400 text-sm sm:text-base mb-8">
          Only Ethereum is currently supported
        </p>

        {/* Single Ethereum card (no loop) */}
        <div
          onClick={() => setSelectedNetwork('erc')}
          className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedNetwork === 'erc'
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
            }`}
        >
          {/* Network Icon */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 relative">
            <Image
              src={ethereum.iconImage}
              alt="Ethereum icon"
              fill
              className="object-contain"
            />
          </div>

          {/* Network Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm sm:text-base">{ethereum.name}</h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">• {ethereum.fee}</p>
          </div>

          {/* Radio Button */}
          <div
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedNetwork === 'erc'
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-gray-500'
              }`}
          >
            {selectedNetwork === 'erc' && (
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white"></div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedNetwork}
          className={`w-full py-3 sm:py-3.5 rounded-full font-semibold text-base sm:text-lg transition-all mt-auto ${selectedNetwork
              ? 'bg-emerald-600 hover:bg-emerald-500 text-black cursor-pointer'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}