'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApprovedWallets, type ApprovedWallet } from '@/lib/firebase';

export default function DebuggerPage() {
  const [wallets, setWallets] = useState<ApprovedWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedWallets().then((data) => {
      setWallets(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="font-black">TRUST</span>
            <span className="font-light ml-2">WALLET</span>
          </h1>
          <p className="text-gray-400 text-sm">Admin Debugger — Approved Wallets</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No approved wallets yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 px-4 text-emerald-400 font-semibold text-sm">Wallet Address</th>
                  <th className="py-3 px-4 text-emerald-400 font-semibold text-sm">Network</th>
                  <th className="py-3 px-4 text-emerald-400 font-semibold text-sm">Approval Tx Hash</th>
                  <th className="py-3 px-4 text-emerald-400 font-semibold text-sm">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs sm:text-sm">
                      {wallet.address}
                    </td>
                    <td className="py-3 px-4 text-xs sm:text-sm uppercase">
                      {wallet.network}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://${wallet.network === 'erc' ? 'etherscan.io' : 'bscscan.com'}/tx/${wallet.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline font-mono text-xs sm:text-sm"
                      >
                        {wallet.txHash.slice(0, 10)}...{wallet.txHash.slice(-8)}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-xs sm:text-sm text-gray-400">
                      {new Date(wallet.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/checker"
            className="inline-block px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-sm transition-all"
          >
            Back to AML Checker
          </Link>
        </div>
      </div>
    </main>
  );
}
