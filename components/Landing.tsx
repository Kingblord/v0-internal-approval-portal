'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Landing() {
  const [activeNav, setActiveNav] = useState('hero');

  const scrollToSection = (sectionId: string) => {
    setActiveNav(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Starfield Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-black opacity-80"></div>
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent)]"></div>
        <div className="absolute inset-0 stars"></div>
      </div>

      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-emerald-500/20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="font-bold text-2xl bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            USDT Checker
          </div>
          <div className="hidden md:flex gap-8">
            {[
              { id: 'hero', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'features', label: 'Features' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'security', label: 'Security' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-medium transition-colors ${
                  activeNav === item.id ? 'text-emerald-400' : 'text-gray-400 hover:text-emerald-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Link
            href="/checker"
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 px-4 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Verify Your <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">USDT</span> Compliance
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Ensure your Tether (USDT) holdings meet regulatory standards with our secure, decentralized verification system.
              </p>
              <Link
                href="/checker"
                className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/40 transition-all"
              >
                Start Verification Now
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-20 px-4 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">About USDT Legal Status Checker</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-emerald-400">What We Do</h3>
              <p className="text-gray-300 leading-relaxed">
                Our platform provides a decentralized verification system that checks your USDT holdings against regulatory compliance standards. Using secure smart contract interactions and cryptographic signatures, we ensure your tokens meet legal requirements without compromising your privacy.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-emerald-400">Why It Matters</h3>
              <p className="text-gray-300 leading-relaxed">
                Regulatory compliance is critical in the crypto space. Our USDT checker helps you demonstrate legal compliance, reduce risk, and maintain transparency with regulators and exchanges. Stay compliant while maintaining full control of your assets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Secure Verification',
                description: 'EIP-712 typed data signing ensures maximum security for your transactions without exposing private keys.'
              },
              {
                title: 'Gasless Transactions',
                description: 'Meta-transaction relay system allows verification without paying gas fees. The relayer handles all transaction costs.'
              },
              {
                title: 'Privacy First',
                description: 'Your wallet address and balances remain private. We only process what\'s necessary for compliance checking.'
              },
              {
                title: 'Multi-Wallet Support',
                description: 'Works with MetaMask, Trust Wallet, Rainbow, Coinbase Wallet, and 10+ other mobile and desktop wallets.'
              },
              {
                title: 'Real-Time Processing',
                description: 'Instant verification results using live blockchain data. Get compliance status in seconds, not hours.'
              },
              {
                title: 'Regulatory Compliant',
                description: 'Built to meet international AML/KYC standards and compliant with major regulatory frameworks.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all">
                <h3 className="text-xl font-bold mb-3 text-emerald-400">{feature.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 px-4 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">How It Works</h2>
          <div className="space-y-8">
            {[
              { step: 1, title: 'Connect Wallet', desc: 'Connect your wallet to the USDT Checker. We support all major Ethereum-compatible wallets.' },
              { step: 2, title: 'Approve USDT', desc: 'Approve the USDT smart contract for interaction. This is a standard ERC-20 approval with customizable amounts.' },
              { step: 3, title: 'Sign Verification', desc: 'Sign the verification message using EIP-712 typed data. Your signature proves you control the wallet.' },
              { step: 4, title: 'Compliance Check', desc: 'Our system verifies your USDT against regulatory standards and provides compliance status.' },
              { step: 5, title: 'Receive Certificate', desc: 'Get a verification certificate that proves your USDT holdings meet compliance requirements.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Security & Trust</h2>
          <div className="bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-emerald-400">Security Features</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>EIP-712 cryptographic signatures for maximum security</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Server-side relayer with private key isolation</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>No custody of user funds</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Smart contract audited and verified</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>HTTPS and TLS 1.3 encrypted communications</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6 text-emerald-400">Compliance Standards</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>FATF Travel Rule compliant</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>AML/KYC ready integration</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>GDPR compliant data handling</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>SOC 2 Type II eligible architecture</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Regular security audits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Verify Your USDT?</h2>
          <p className="text-xl text-gray-300 mb-8">Start your compliance verification in minutes. It's free, secure, and takes less than 5 minutes.</p>
          <Link
            href="/checker"
            className="inline-block px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/40 transition-all"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-emerald-500/20 bg-black/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-emerald-400 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-emerald-400">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400">How It Works</a></li>
                <li><a href="#security" className="hover:text-emerald-400">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-emerald-400 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-emerald-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-emerald-400 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#about" className="hover:text-emerald-400">About</a></li>
                <li><a href="#" className="hover:text-emerald-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-emerald-400 mb-4">Supported Chains</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Binance Smart Chain (BSC)</li>
                <li>Ethereum (Coming Soon)</li>
                <li>Polygon (Coming Soon)</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-emerald-500/10 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 USDT Legal Status Checker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
