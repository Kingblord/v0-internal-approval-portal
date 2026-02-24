'use client';

import { useState, useEffect } from 'react';
import { Shield, Database, RefreshCw, AlertCircle, CheckCircle, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MainSettings() {
  const [currentContract, setCurrentContract] = useState<string>('Loading...');
  const [newContract, setNewContract] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deployStatus, setDeployStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    fetchCurrentContract();
  }, []);

  const fetchCurrentContract = async () => {
    try {
      const response = await fetch('/api/update-contract');
      const data = await response.json();
      setCurrentContract(data.contractAddress);
      
      // Also check localStorage for any updated address
      const storedAddress = localStorage.getItem('contract_address');
      if (storedAddress && storedAddress !== 'Not set') {
        setCurrentContract(storedAddress);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch contract:', error);
      setCurrentContract('Error loading contract');
    }
  };

  const handleDeployContract = async () => {
    setIsDeploying(true);
    setDeployStatus({ type: 'info', message: 'Deploying new contract to BSC... This may take a minute.' });

    try {
      const response = await fetch('/api/deploy-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNewContract(data.contractAddress);
        setDeployStatus({
          type: 'success',
          message: `Contract deployed successfully! Address: ${data.contractAddress}`
        });
      } else {
        throw new Error(data.error || 'Deployment failed');
      }
    } catch (error: any) {
      console.error('[v0] Deployment error:', error);
      setDeployStatus({
        type: 'error',
        message: `Deployment failed: ${error.message}`
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleUpdateContract = async () => {
    if (!newContract || !newContract.startsWith('0x')) {
      setDeployStatus({
        type: 'error',
        message: 'Please enter a valid contract address'
      });
      return;
    }

    setIsUpdating(true);
    setDeployStatus({ type: 'info', message: 'Updating contract address...' });

    try {
      const response = await fetch('/api/update-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress: newContract })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store in localStorage for immediate use
        localStorage.setItem('contract_address', newContract);
        setCurrentContract(newContract);
        setDeployStatus({
          type: 'success',
          message: 'Contract address updated successfully! The webapp will use this new contract.'
        });
        setNewContract('');
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (error: any) {
      console.error('[v0] Update error:', error);
      setDeployStatus({
        type: 'error',
        message: `Update failed: ${error.message}`
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisposeContract = () => {
    if (confirm('Are you sure you want to dispose the current contract? This action cannot be undone.')) {
      localStorage.removeItem('contract_address');
      setCurrentContract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not set');
      setDeployStatus({
        type: 'info',
        message: 'Contract disposed. Using default contract address.'
      });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pb-24 sm:pb-28 md:pb-32">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse-glow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-glow animation-delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm sm:text-base">Back to Verification</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/30 animate-float">
            <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3">
            Contract Management
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Deploy and manage smart contracts for USDT verification
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-[rgba(10,20,30,0.4)] backdrop-blur-3xl p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-emerald-500/40 shadow-2xl shadow-emerald-900/20 relative overflow-hidden animate-slide-up space-y-6 sm:space-y-8">
          {/* Top gradient border */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          {/* Current Contract Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Database className="w-5 h-5" />
              <h2 className="text-lg sm:text-xl font-semibold">Current Contract</h2>
            </div>
            <div className="bg-black/30 border border-emerald-500/30 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Address:</p>
              <p className="text-sm sm:text-base font-mono text-white break-all">{currentContract}</p>
            </div>
            <button
              onClick={handleDisposeContract}
              className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-red-500/80 to-red-600/80 text-white hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Dispose Current Contract
            </button>
          </div>

          {/* Deploy New Contract Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Shield className="w-5 h-5" />
              <h2 className="text-lg sm:text-xl font-semibold">Deploy New Contract</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Deploy a new MetaArbExecutor contract using the relayer wallet. This will create a fresh contract on BSC.
            </p>
            <button
              onClick={handleDeployContract}
              disabled={isDeploying}
              className="w-full py-3 sm:py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:translate-y-0 relative overflow-hidden group"
            >
              {isDeploying ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Deploying Contract...
                </span>
              ) : (
                'Deploy New Contract'
              )}
            </button>
          </div>

          {/* Update Contract Section */}
          {newContract && (
            <div className="space-y-3 sm:space-y-4 border-t border-emerald-500/20 pt-6 sm:pt-8">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <RefreshCw className="w-5 h-5" />
                <h2 className="text-lg sm:text-xl font-semibold">Update Active Contract</h2>
              </div>
              <div className="bg-black/30 border border-emerald-500/30 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">New Contract Address:</p>
                <p className="text-sm sm:text-base font-mono text-emerald-400 break-all">{newContract}</p>
              </div>
              <button
                onClick={handleUpdateContract}
                disabled={isUpdating}
                className="w-full py-3 sm:py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0"
              >
                {isUpdating ? 'Updating...' : 'Use This Contract'}
              </button>
            </div>
          )}

          {/* Manual Contract Input */}
          <div className="space-y-3 sm:space-y-4 border-t border-emerald-500/20 pt-6 sm:pt-8">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Database className="w-5 h-5" />
              <h2 className="text-lg sm:text-xl font-semibold">Manual Contract Update</h2>
            </div>
            <input
              type="text"
              value={newContract}
              onChange={(e) => setNewContract(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black/30 border border-emerald-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 transition-colors text-sm sm:text-base font-mono"
            />
            <button
              onClick={handleUpdateContract}
              disabled={isUpdating || !newContract}
              className="w-full py-3 sm:py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:shadow-lg hover:shadow-slate-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0"
            >
              Update Contract Address
            </button>
          </div>

          {/* Status Messages */}
          {deployStatus.type && (
            <div className={`p-3 sm:p-4 rounded-xl border flex items-start gap-3 animate-slide-up ${
              deployStatus.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : deployStatus.type === 'error'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}>
              {deployStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : deployStatus.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />
              )}
              <p className={`text-xs sm:text-sm leading-relaxed ${
                deployStatus.type === 'success' 
                  ? 'text-emerald-300' 
                  : deployStatus.type === 'error'
                  ? 'text-red-300'
                  : 'text-blue-300'
              }`}>
                {deployStatus.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-8 sm:bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-gray-300 backdrop-blur-md bg-black/60 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full border border-emerald-500/30 shadow-lg z-50 whitespace-nowrap">
        <span className="hidden sm:inline">Secured by </span>
        <span className="text-emerald-400 font-semibold">USDT Compliance Network</span>
      </footer>
    </div>
  );
}
