
import React, { useState, useEffect, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { EthosProfile, DonationState, DonationRecord } from './types';
import { MOCK_PROFILES } from './constants';
import EthosLogo from './components/EthosLogo';
import ProfileCard from './components/ProfileCard';
import DonateModal from './components/DonateModal';
import DonationHistory from './components/DonationHistory';

type SortOption = 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc';

const App: React.FC = () => {
  const { address } = useAccount();
  const [profiles, setProfiles] = useState<EthosProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('score-desc');
  const [toast, setToast] = useState<{message: string, visible: boolean}>({ message: '', visible: false });
  const [history, setHistory] = useState<DonationRecord[]>([
    {
      id: 'h1',
      donorAddress: '0x1A2B3C4D5E6F7G8H9I0J',
      recipientUsername: 'vitalik',
      recipientAvatar: 'https://picsum.photos/seed/vitalik/200',
      amount: '500',
      timestamp: Date.now() - 300000 
    },
    {
      id: 'h2',
      donorAddress: '0x00000000000000000000',
      recipientUsername: 'buildbase',
      recipientAvatar: 'https://picsum.photos/seed/base/200',
      amount: '50',
      timestamp: Date.now() - 3600000
    }
  ]);

  const [donation, setDonation] = useState<DonationState>({
    isOpen: false,
    profile: null,
    extractedWallet: null,
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const copyShareLink = (username: string) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?profile=${username}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Donation link copied to clipboard!');
    });
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        await new Promise(r => setTimeout(r, 1200));
        setProfiles(MOCK_PROFILES);
        
        const params = new URLSearchParams(window.location.search);
        const targetUsername = params.get('profile');
        if (targetUsername) {
          const matchedProfile = MOCK_PROFILES.find(p => p.username === targetUsername);
          if (matchedProfile) {
            const wallet = matchedProfile.userkeys.find(k => k.startsWith("address:"))?.replace("address:", "");
            if (wallet && matchedProfile.credibilityScore >= 1400) {
              setDonation({
                isOpen: true,
                profile: matchedProfile,
                extractedWallet: wallet
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch profiles", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      switch (sortBy) {
        case 'score-desc': return b.credibilityScore - a.credibilityScore;
        case 'score-asc': return a.credibilityScore - b.credibilityScore;
        case 'name-asc': return a.displayName.localeCompare(b.displayName);
        case 'name-desc': return b.displayName.localeCompare(a.displayName);
        default: return 0;
      }
    });
  }, [profiles, sortBy]);

  const handleDonationSuccess = (amount: string) => {
    if (!donation.profile || !address) return;
    
    const newRecord: DonationRecord = {
      id: Date.now().toString(),
      donorAddress: address,
      recipientUsername: donation.profile.username,
      recipientAvatar: donation.profile.avatarUrl,
      amount: amount,
      timestamp: Date.now()
    };

    setHistory(prev => [newRecord, ...prev]);
  };

  const openDonateModal = (profile: EthosProfile) => {
    const wallet = profile.userkeys.find(k => k.startsWith("address:"))?.replace("address:", "");
    if (wallet) {
      setDonation({
        isOpen: true,
        profile,
        extractedWallet: wallet,
      });
      const newUrl = `${window.location.origin}${window.location.pathname}?profile=${profile.username}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const closeDonateModal = () => {
    setDonation({ isOpen: false, profile: null, extractedWallet: null });
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full -z-10"></div>

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-slate-900 border border-cyan-500/50 text-cyan-400 px-6 py-3 rounded-full shadow-2xl shadow-cyan-500/20 font-bold flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          {toast.message}
        </div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 ethos-gradient rounded-lg flex items-center justify-center font-azeera font-bold text-black text-sm">T</div>
          <span className="text-xl font-azeera font-bold tracking-tighter text-white">TokenTribute</span>
        </div>
        <ConnectButton />
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-16 pb-8 lg:pt-24 lg:pb-12 flex flex-col items-center text-center max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div className="text-left space-y-6">
            <h1 className="text-5xl lg:text-7xl font-azeera font-bold leading-tight bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Honor <br/>Credibility
            </h1>
            <p className="text-xl text-slate-400 max-w-xl">
              A peer-to-peer donation bridge. Reward high-credibility Ethos members directly with USDC on Base.
            </p>
            <div className="flex items-center gap-2 bg-slate-900/50 w-fit px-4 py-2 rounded-full border border-white/5 text-sm text-cyan-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Requirement: Credibility ≥ 1400
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
               <DonationHistory history={history} />
            </div>
          </div>
        </div>
      </header>

      {/* Profiles Grid */}
      <main className="flex-grow px-6 pb-24 max-w-7xl mx-auto w-full mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-azeera font-bold text-white">Eligible Members</h2>
            <p className="text-slate-500 text-sm mt-1">Showing {profiles.length} profiles from Ethos</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer hover:bg-slate-800"
            >
              <option value="score-desc">Credibility: High to Low</option>
              <option value="score-asc">Credibility: Low to High</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card h-64 rounded-2xl animate-pulse flex flex-col p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-full"></div>
                  <div className="space-y-2 py-2 flex-grow">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-20 bg-slate-800/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProfiles.map(profile => (
              <ProfileCard 
                key={profile.id} 
                profile={profile} 
                onDonate={openDonateModal}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-60">
            <span className="text-sm font-azeera font-bold">TokenTribute</span>
            <span className="text-xs text-slate-500">© 2024</span>
          </div>
          <div className="flex gap-12 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2"><span className="w-1 h-1 bg-cyan-500 rounded-full"></span> Powered by Ethos Network</span>
            <span className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> Built on Base</span>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {donation.isOpen && donation.profile && donation.extractedWallet && (
        <DonateModal 
          profile={donation.profile}
          recipientWallet={donation.extractedWallet}
          onClose={closeDonateModal}
          onSuccess={handleDonationSuccess}
          onShare={() => copyShareLink(donation.profile!.username)}
        />
      )}
    </div>
  );
};

export default App;
