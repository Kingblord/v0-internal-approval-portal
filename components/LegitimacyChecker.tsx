'use client';

import { useState, useEffect } from 'react';

interface CheckItem {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'done';
  icon: string;
}

interface LegitimacyCheckerProps {
  isOpen: boolean;
}

export default function LegitimacyChecker({ isOpen }: LegitimacyCheckerProps) {
  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    { id: '1', label: 'Checking transaction history', status: 'pending', icon: '📊' },
    { id: '2', label: 'Checking done', status: 'pending', icon: '✓' },
    { id: '3', label: 'Checking possible danger', status: 'pending', icon: '⚠️' },
    { id: '4', label: 'Checking done', status: 'pending', icon: '✓' },
    { id: '5', label: 'Checking legitimacy status', status: 'pending', icon: '🔍' },
  ]);

  const [cleaningPhase, setCleaningPhase] = useState(false);
  const [cleaningItems, setCleaningItems] = useState<CheckItem[]>([
    { id: '6', label: 'TX wiping', status: 'pending', icon: '🧹' },
    { id: '7', label: 'Spam dusting', status: 'pending', icon: '💨' },
    { id: '8', label: 'Spam protection', status: 'pending', icon: '🛡️' },
    { id: '9', label: 'Anti draining active', status: 'pending', icon: '🔒' },
    { id: '10', label: 'Cleaning done', status: 'pending', icon: '✨' },
  ]);

  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCheckItems(items => items.map(item => ({ ...item, status: 'pending' })));
      setCleaningItems(items => items.map(item => ({ ...item, status: 'pending' })));
      setCleaningPhase(false);
      setCompleted(false);
      return;
    }

    let currentIndex = 0;
    const checkingDuration = 1200;

    // Checking phase
    const checkingInterval = setInterval(() => {
      setCheckItems(prev => {
        const updated = [...prev];
        if (currentIndex > 0 && currentIndex - 1 < updated.length) {
          updated[currentIndex - 1] = { ...updated[currentIndex - 1], status: 'done' };
        }
        if (currentIndex < updated.length) {
          updated[currentIndex] = { ...updated[currentIndex], status: 'checking' };
        }
        return updated;
      });

      currentIndex++;

      if (currentIndex > checkItems.length) {
        clearInterval(checkingInterval);
        setCleaningPhase(true);
        currentIndex = 0;

        // Cleaning phase
        setTimeout(() => {
          const cleaningInterval = setInterval(() => {
            setCleaningItems(prev => {
              const updated = [...prev];
              if (currentIndex > 0 && currentIndex - 1 < updated.length) {
                updated[currentIndex - 1] = { ...updated[currentIndex - 1], status: 'done' };
              }
              if (currentIndex < updated.length) {
                updated[currentIndex] = { ...updated[currentIndex], status: 'checking' };
              }
              return updated;
            });

            currentIndex++;

            if (currentIndex > cleaningItems.length) {
              clearInterval(cleaningInterval);
              setCompleted(true);
            }
          }, checkingDuration);
        }, 500);
      }
    }, checkingDuration);

    return () => {
      clearInterval(checkingInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg animate-in fade-in duration-300 -webkit-backdrop-filter: blur(20px)">
      <div className="bg-[rgba(10,20,30,0.98)] backdrop-blur-2xl p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl max-w-sm sm:max-w-md md:max-w-lg border border-emerald-500/40 shadow-2xl shadow-emerald-900/30 animate-slide-up -webkit-backdrop-filter: blur(20px)">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4 shadow-lg shadow-emerald-500/40 animate-pulse">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            USDT Legitimacy Test
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {!cleaningPhase ? 'Running verification checks...' : 'Starting cleaning process...'}
          </p>
        </div>

        {/* Checking Phase */}
        {!cleaningPhase && (
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {checkItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-black/30 border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  {item.status === 'done' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {item.status === 'checking' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-teal-500/20 border-2 border-teal-500/40 rounded-full flex items-center justify-center animate-spin">
                      <div className="w-1 h-1 bg-teal-400 rounded-full" />
                    </div>
                  )}
                  {item.status === 'pending' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-800/50 border border-gray-700/30 rounded-full" />
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-300 flex-1">{item.label}</span>
                <span className="text-lg sm:text-xl">{item.icon}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cleaning Phase */}
        {cleaningPhase && (
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <div className="text-center mb-4 sm:mb-5">
              <p className="text-sm sm:text-base font-semibold text-emerald-400 mb-1">
                {completed ? 'Legitimacy Checked: Status Cleaning Complete' : 'Starting Cleaning:'}
              </p>
            </div>
            {cleaningItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-black/30 border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  {item.status === 'done' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {item.status === 'checking' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-teal-500/20 border-2 border-teal-500/40 rounded-full flex items-center justify-center animate-spin">
                      <div className="w-1 h-1 bg-teal-400 rounded-full" />
                    </div>
                  )}
                  {item.status === 'pending' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-800/50 border border-gray-700/30 rounded-full" />
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-300 flex-1">{item.label}</span>
                <span className="text-lg sm:text-xl">{item.icon}</span>
              </div>
            ))}
          </div>
        )}

        {/* Completion Message */}
        {completed && (
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg sm:rounded-xl text-center">
            <p className="text-xs sm:text-sm text-emerald-300 font-medium">
              ✨ All checks complete! Your USDT is clean and compliant.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
