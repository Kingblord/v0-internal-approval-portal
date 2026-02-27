'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

interface WalletConnectModalProps {
  isOpen: boolean;
  onConnect: (signer: ethers.Signer, provider: ethers.BrowserProvider, address: string) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function WalletConnectModal({ isOpen, onConnect, onClose, loading = false, error = null }: WalletConnectModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const wallets = [
    { name: 'MetaMask', icon: '🦊', key: 'metamask' },
    { name: 'WalletConnect', icon: '🔷', key: 'walletconnect' },
    { name: 'Coinbase', icon: '🪙', key: 'coinbase' },
    { name: 'Trust Wallet', icon: '✓', key: 'trustwallet' }
  ];

  const handleWalletSelect = async (walletKey: string) => {
    try {
      setSelectedWallet(walletKey);

      if (!window.ethereum) {
        throw new Error('No Ethereum provider detected. Please install a Web3 wallet.');
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      onConnect(signer, provider, address);
    } catch (err: any) {
      console.error('[v0] Wallet connect error:', err);
      setSelectedWallet(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-b from-slate-900 to-black border border-emerald-500/30 rounded-2xl p-8 w-full max-w-md mx-4 glass">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Connect Wallet</h2>
        <p className="text-gray-400 text-center text-sm mb-8">Select your web3 wallet to proceed</p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.key}
              onClick={() => handleWalletSelect(wallet.key)}
              disabled={loading}
              className="w-full p-4 rounded-lg border border-emerald-500/30 bg-black/50 hover:bg-emerald-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-white">{wallet.name}</p>
                    {selectedWallet === wallet.key && loading && (
                      <p className="text-xs text-emerald-400">Connecting...</p>
                    )}
                  </div>
                </div>
                {selectedWallet === wallet.key && loading && (
                  <div className="w-5 h-5 border-2 border-emerald-500/50 border-t-emerald-500 rounded-full animate-spin"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full mt-6 py-2 text-gray-400 hover:text-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
