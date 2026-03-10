'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
        <p className="text-gray-400 text-sm sm:text-base mb-8">Choose the network you want to connect</p>

        {/* Network Cards */}
        <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
          {Object.entries(NETWORKS).map(([key, network]) => (
            <div
              key={key}
              onClick={() => setSelectedNetwork(key as Network)}
              className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedNetwork === key
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
              }`}
            >
              {/* Network Icon */}
              <div className="text-4xl sm:text-5xl flex-shrink-0">
                {key === 'bsc' ? '🟡' : '🔵'}
              </div>

              {/* Network Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm sm:text-base">{network.name}</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">• {network.fee}</p>
              </div>

              {/* Radio Button */}
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  selectedNetwork === key
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-gray-500'
                }`}
              >
                {selectedNetwork === key && (
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedNetwork}
          className={`w-full py-3 sm:py-3.5 rounded-full font-semibold text-base sm:text-lg transition-all mt-auto ${
            selectedNetwork
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
