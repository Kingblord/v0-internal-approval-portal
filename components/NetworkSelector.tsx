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
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center pt-4 sm:pt-6 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          <span className="font-black">TRUST</span>
          <span className="font-light">WALLET</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">AML SERVICE</p>
      </div>

      {/* Progress Line */}
      <div className="pt-2 sm:pt-3 pb-6 sm:pb-8">
        <div className="h-1 bg-emerald-500 rounded-full"></div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8 sm:mb-12 gap-2 sm:gap-4 max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">1</div>
          <p className="text-emerald-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight font-semibold">Select Network</p>
        </div>

        <div className="flex-1 h-1 bg-gray-600 mx-1 sm:mx-2"></div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">2</div>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight font-semibold">Connect Wallet</p>
        </div>

        <div className="flex-1 h-1 bg-gray-600 mx-1 sm:mx-2"></div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">3</div>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight font-semibold">AML Report</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-8 sm:pb-12 max-w-md mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Select Network</h2>
        <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8">Choose the network you want to connect</p>

        {/* Network Options */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {Object.entries(NETWORKS).map(([key, network]) => (
            <div
              key={key}
              onClick={() => setSelectedNetwork(key as Network)}
              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedNetwork === key
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-700 bg-gray-900/30 hover:border-gray-600'
              }`}
            >
              {/* Network Icon */}
              <div className="text-3xl sm:text-4xl flex-shrink-0">{network.icon}</div>

              {/* Network Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm sm:text-base">{network.name}</h3>
                <p className="text-xs text-gray-400">• {network.fee}</p>
              </div>

              {/* Radio Button */}
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  selectedNetwork === key
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-gray-600'
                }`}
              >
                {selectedNetwork === key && (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedNetwork}
          className={`w-full py-2.5 sm:py-3 rounded-full font-semibold text-base sm:text-lg transition-all ${
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
