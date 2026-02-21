'use client';

import { Loader2 } from 'lucide-react';

interface CardStepProps {
  icon: string;
  title: string;
  description: string;
  loading: boolean;
  error: string | null;
  showTerms?: boolean;
  buttons: Array<{
    label: string;
    onClick: () => void;
    primary: boolean;
  }>;
}

export default function CardStep({
  icon,
  title,
  description,
  loading,
  error,
  showTerms = false,
  buttons,
}: CardStepProps) {
  return (
    <div className="bg-[rgba(10,20,30,0.95)] backdrop-blur-3xl p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-900/20 relative overflow-hidden animate-slide-up">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

      {/* Icon with float animation */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl border-2 border-emerald-500/30 shadow-lg animate-float">
        {icon}
      </div>

      {/* Title with gradient text */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 sm:mb-3 bg-gradient-to-r from-white via-emerald-50 to-teal-100 bg-clip-text text-transparent leading-tight px-2">
        {title}
      </h1>

      {/* Description */}
      <p className="text-center text-xs sm:text-sm md:text-base text-gray-400 mb-5 sm:mb-7 leading-relaxed px-2">
        {description}
      </p>

      {/* Terms and Conditions */}
      {showTerms && (
        <div className="mb-5 sm:mb-6 bg-black/40 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 max-h-48 sm:max-h-56 md:max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-black/20">
          <h3 className="text-sm sm:text-base font-semibold text-emerald-400 mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Terms and Conditions
          </h3>
          <div className="text-[10px] sm:text-xs text-gray-400 space-y-3 sm:space-y-4 leading-relaxed">
            <p className="font-medium text-white">1. Acceptance of Terms</p>
            <p>By accessing and using the USDT Legal Status Checker service, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please discontinue use of this service immediately.</p>

            <p className="font-medium text-white">2. Service Description</p>
            <p>The USDT Legal Status Checker provides verification services to assess compliance of USDT holdings with applicable regulatory standards. This service requires wallet connection, token approval, and cryptographic signature for verification purposes.</p>

            <p className="font-medium text-white">3. User Responsibilities</p>
            <p>You are responsible for maintaining the security of your wallet credentials and private keys. You acknowledge that this service requires granting token approval permissions and signing transactions, and you accept full responsibility for these actions.</p>

            <p className="font-medium text-white">4. Privacy and Data Usage</p>
            <p>We collect wallet addresses and transaction signatures solely for verification purposes. This data is processed securely and is not shared with third parties except as required by law or regulatory compliance.</p>

            <p className="font-medium text-white">5. Regulatory Compliance</p>
            <p>You represent and warrant that you are not located in a jurisdiction where use of this service is prohibited, and that your use complies with all applicable local laws and regulations regarding cryptocurrency ownership and transfers.</p>

            <p className="font-medium text-white">6. No Financial Advice</p>
            <p>This service provides verification status only and does not constitute financial, legal, or investment advice. You should consult with qualified professionals before making any financial decisions.</p>

            <p className="font-medium text-white">7. Limitation of Liability</p>
            <p>The service is provided "as is" without warranties of any kind. We shall not be liable for any damages arising from your use of this service, including but not limited to loss of funds, data breaches, or regulatory actions.</p>

            <p className="font-medium text-white">8. Smart Contract Interactions</p>
            <p>By approving and signing transactions, you authorize smart contract interactions on the Binance Smart Chain network. You acknowledge the irreversible nature of blockchain transactions.</p>

            <p className="font-medium text-white">9. Termination</p>
            <p>We reserve the right to suspend or terminate access to this service at any time for any reason, including violation of these terms or suspicious activity.</p>

            <p className="font-medium text-white">10. Amendments</p>
            <p>These terms may be updated at any time. Continued use of the service after changes constitutes acceptance of the modified terms.</p>

            <p className="text-emerald-400 font-medium mt-6">By clicking "Sign & Accept Terms", you confirm that you have read and agree to these Terms and Conditions.</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-6 text-[10px] sm:text-xs text-red-400 flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-2.5 sm:space-y-3">
        {buttons.map((button, idx) => (
          <button
            key={idx}
            onClick={button.onClick}
            disabled={loading}
            className={`w-full py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
              button.primary
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white hover:shadow-xl hover:shadow-emerald-500/50 hover:-translate-y-1 animate-gradient'
                : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:shadow-lg hover:shadow-slate-500/30 hover:-translate-y-0.5 border border-slate-600/50'
            }`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <span className="relative z-10">{button.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
