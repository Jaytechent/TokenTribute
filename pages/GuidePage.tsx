import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import EthosLogo from '../components/EthosLogo';

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

const GuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('what');
  const navigate = useNavigate();

  const sections: GuideSection[] = [
    {
      id: 'what',
      title: '🎯 What is TokenTribute?',
      icon: '🎯',
      content: (
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-2xl border border-ethos-cyan/30">
            <h3 className="text-3xl font-bold text-white mb-4">Honor Credibility, Directly</h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              TokenTribute is a peer-to-peer donation platform that leverages the Ethos credibility system to enable direct, meaningful rewards for high-credibility members in the crypto ecosystem. 
            </p>
            <p className="text-slate-300 text-lg leading-relaxed mt-4">
              We connect donors who want to reward talent with high-credibility creators, developers, and contributors - all powered by Ethos Network's verified credibility scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl border border-ethos-cyan/20 hover:border-ethos-cyan/50 transition-all">
              <div className="text-5xl mb-4">💰</div>
              <h4 className="text-xl font-bold text-white mb-2">Direct Donations</h4>
              <p className="text-slate-400">Send USDC instantly to high-credibility Ethos members on Base chain</p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-ethos-cyan/20 hover:border-ethos-cyan/50 transition-all">
              <div className="text-5xl mb-4">✅</div>
              <h4 className="text-xl font-bold text-white mb-2">Verified Credibility</h4>
              <p className="text-slate-400">Every recipient has been vetted through Ethos Network's credibility scoring</p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-ethos-cyan/20 hover:border-ethos-cyan/50 transition-all">
              <div className="text-5xl mb-4">🔗</div>
              <h4 className="text-xl font-bold text-white mb-2">Community Driven</h4>
              <p className="text-slate-400">Connect, chat, and build relationships with vetted talent</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'problem',
      title: '🚨 The Problem We Solve',
      icon: '🚨',
      content: (
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-2xl border border-red-500/30 bg-red-500/5">
            <h3 className="text-2xl font-bold text-white mb-4">Why This Matters</h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              The crypto ecosystem has a critical problem that nobody is solving effectively:
            </p>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-6 rounded-xl border border-red-500/20 bg-red-500/5">
              <h4 className="text-xl font-bold text-red-400 mb-3">❌ No Direct Reward Mechanism</h4>
              <p className="text-slate-300">
                There's no easy way for community members to directly reward and support talented contributors. Traditional methods require:
              </p>
              <ul className="list-disc list-inside text-slate-400 mt-3 space-y-1">
                <li>Complex hiring processes</li>
                <li>Formal employment agreements</li>
                <li>Trust verification on your own</li>
                <li>Manual vetting processes</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-xl border border-red-500/20 bg-red-500/5">
              <h4 className="text-xl font-bold text-red-400 mb-3">❌ Credibility is Scattered</h4>
              <p className="text-slate-300">
                Credibility signals exist everywhere but nowhere unified:
              </p>
              <ul className="list-disc list-inside text-slate-400 mt-3 space-y-1">
                <li>Twitter followers (easily manipulated)</li>
                <li>Discord activity (no standard)</li>
                <li>GitHub contributions (incomplete picture)</li>
                <li>Formal credentials (outdated)</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-xl border border-red-500/20 bg-red-500/5">
              <h4 className="text-xl font-bold text-red-400 mb-3">❌ Sybil & Fraud Risk</h4>
              <p className="text-slate-300">
                When you want to reward or support someone, you can't easily verify they're legitimate:
              </p>
              <ul className="list-disc list-inside text-slate-400 mt-3 space-y-1">
                <li>Risk of supporting fake accounts</li>
                <li>No peer-reviewed verification</li>
                <li>Prone to social engineering</li>
                <li>Difficult to spot scammers</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'solution',
      title: '✨ Our Solution',
      icon: '✨',
      content: (
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
            <h3 className="text-2xl font-bold text-white mb-4">How TokenTribute Fixes This</h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              We leverage Ethos Network's credibility system to create a frictionless donation platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h4 className="text-xl font-bold text-emerald-400 mb-3">🎯 Instant Credibility</h4>
              <p className="text-slate-300">
                See real credibility scores powered by Ethos Network's peer-reviewed system that factors in reviews, vouches, wallet age, and more.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h4 className="text-xl font-bold text-emerald-400 mb-3">💸 One-Click Donations</h4>
              <p className="text-slate-300">
                Send USDC directly to verified Ethos members with a single click. No middlemen, no fees, just peer-to-peer support.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h4 className="text-xl font-bold text-emerald-400 mb-3">🔍 Anti-Sybil Built-In</h4>
              <p className="text-slate-300">
                Ethos Network's credibility system includes sybil resistance through reputation mechanisms that are hard to game.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h4 className="text-xl font-bold text-emerald-400 mb-3">🤝 Community Connection</h4>
              <p className="text-slate-300">
                Chat directly with talent, build relationships, and discover contributors aligned with your values.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h4 className="text-xl font-bold text-emerald-400 mb-3">📊 Transparency</h4>
              <p className="text-slate-300">
                See public donation leaderboards and contribution history. Everything is transparent and on-chain.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h4 className="text-xl font-bold text-emerald-400 mb-3">⚡ Built on Base</h4>
              <p className="text-slate-300">
                Fast, cheap transactions on Base chain. Send donations instantly without worrying about gas fees.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'unique',
      title: '🏆 Why We\'re Unique',
      icon: '🏆',
      content: (
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-2xl border border-ethos-cyan/30">
            <h3 className="text-2xl font-bold text-white mb-6">What Sets TokenTribute Apart</h3>
            
            <div className="space-y-4">
              <div className="border-l-4 border-ethos-cyan pl-6 py-3">
                <h4 className="text-xl font-bold text-white mb-2">🔐 Credibility-First Design</h4>
                <p className="text-slate-300">
                  We're the only platform that uses Ethos Network's verified credibility scores as the foundation. Every member must meet minimum credibility thresholds.
                </p>
              </div>

              <div className="border-l-4 border-ethos-purple pl-6 py-3">
                <h4 className="text-xl font-bold text-white mb-2">🎭 Dual-Mode Ecosystem</h4>
                <p className="text-slate-300">
                  Discover Mode for casual supporters + Founder Mode for teams building talent pools. One app, two powerful use cases.
                </p>
              </div>

              <div className="border-l-4 border-ethos-cyan pl-6 py-3">
                <h4 className="text-xl font-bold text-white mb-2">💬 Integrated Messaging</h4>
                <p className="text-slate-300">
                  Chat directly with talent before or after donations. Build relationships, not just transactions.
                </p>
              </div>

              <div className="border-l-4 border-ethos-purple pl-6 py-3">
                <h4 className="text-xl font-bold text-white mb-2">📈 Talent Pool Management</h4>
                <p className="text-slate-300">
                  Save and organize high-credibility talent for future reference. Build your network proactively.
                </p>
              </div>

              <div className="border-l-4 border-ethos-cyan pl-6 py-3">
                <h4 className="text-xl font-bold text-white mb-2">🌐 Ethos-Native</h4>
                <p className="text-slate-300">
                  Deeply integrated with Ethos Network's APIs. Real-time credibility scores that update automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: '⚙️ Key Features',
      icon: '⚙️',
      content: (
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-2xl border border-ethos-cyan/30">
            <h3 className="text-2xl font-bold text-white mb-6">Everything You Need</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-xl border border-slate-700">
              <h4 className="text-lg font-bold text-ethos-cyan mb-3">🔍 Discover Mode</h4>
              <ul className="space-y-2 text-slate-300">
                <li>✓ Browse high-credibility users</li>
                <li>✓ Real-time Ethos credibility scores</li>
                <li>✓ Semantic search powered by Gemini AI</li>
                <li>✓ Filter & sort by credibility</li>
                <li>✓ Share donation links</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-xl border border-slate-700">
              <h4 className="text-lg font-bold text-ethos-cyan mb-3">🏢 Founder Mode</h4>
              <ul className="space-y-2 text-slate-300">
                <li>✓ Save talent to your pool</li>
                <li>✓ Filter by specialties</li>
                <li>✓ Detailed profile modals</li>
                <li>✓ Track donation history</li>
                <li>✓ Manage team relationships</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-xl border border-slate-700">
              <h4 className="text-lg font-bold text-ethos-cyan mb-3">💸 Donations</h4>
              <ul className="space-y-2 text-slate-300">
                <li>✓ Send USDC on Base chain</li>
                <li>✓ One-click donations</li>
                <li>✓ Transaction history</li>
                <li>✓ Public donation feed</li>
                <li>✓ Recipient leaderboards</li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-xl border border-slate-700">
              <h4 className="text-lg font-bold text-ethos-cyan mb-3">💬 Messaging</h4>
              <ul className="space-y-2 text-slate-300">
                <li>✓ Direct peer-to-peer chat</li>
                <li>✓ Real-time messaging</li>
                <li>✓ Conversation history</li>
                <li>✓ Credibility-gated</li>
                <li>✓ No spam</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full -z-10"></div>

      {/* Navbar */}
      <nav className="border-b border-white/5 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <EthosLogo />
          <span className="text-xl font-azeera font-bold tracking-tighter text-white">TokenTribute</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800"
            >
              App
            </button>
            <button
              onClick={() => navigate('/guide')}
              className="px-4 py-2 rounded-lg font-bold transition-all bg-ethos-gradient text-white"
            >
              Guide
            </button>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow px-6 pb-24 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="pt-12 mb-12">
          <h1 className="text-5xl lg:text-6xl font-azeera font-bold leading-tight bg-gradient-to-r from-white via-ethos-cyan to-ethos-purple bg-clip-text text-transparent mb-4">
            About TokenTribute
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl">
            Learn how we're revolutionizing peer-to-peer support in crypto through credibility
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-slate-700 pb-4">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === section.id
                  ? 'bg-ethos-gradient text-white'
                  : 'text-slate-400 hover:text-white bg-slate-900/30 hover:bg-slate-800'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mb-12">
          {sections.find(s => s.id === activeTab)?.content}
        </div>

        {/* CTA */}
        <div className="glass-card p-8 rounded-2xl border border-ethos-cyan/30 text-center space-y-6 mb-12">
          <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="text-slate-300 text-lg">
            Connect your wallet and start discovering high-credibility talent to support or reward.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-ethos-gradient text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Launch App →
          </a>
        </div>
      </main>
    </div>
  );
};

export default GuidePage;