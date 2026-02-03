import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { EthosProfile, DonationState, DonationRecord } from './types';
import { fetchTopCredibilityUsers, fetchUserByUsername, fetchUserByAddress, extractAddressFromUserkeys } from './services/ethosService';
import { saveDonation, getAllDonations } from './services/donationApi';
import EthosLogo from './components/EthosLogo';
import FounderMode from './components/FounderMode';
import ProfileCard from './components/ProfileCard';
import { MY_ACCOUNT, getCombinedProfiles } from './constants';
import DonateModal from './components/DonateModal';
import { searchEthosUsersWithGemini, paginateResults, sortProfiles } from './services/geminiService';
import DonationHistory from './components/DonationHistory';

type SortOption = 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc';
type ViewType = 'discover' | 'founder';

const MIN_CREDIBILITY = parseInt(import.meta.env.VITE_REACT_APP_MIN_CREDIBILITY_SCORE || '1200');
const ITEMS_PER_PAGE = parseInt(import.meta.env.VITE_REACT_APP_ITEMS_PER_PAGE || '12');
const INITIAL_FETCH = parseInt(import.meta.env.VITE_REACT_APP_INITIAL_FETCH_COUNT || '150');
const SAVED_TALENT_STORAGE_KEY = 'ethos_saved_talent';

const HomePage: React.FC = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<EthosProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<EthosProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('score-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState<ViewType>('discover');
  const [toast, setToast] = useState<{message: string, visible: boolean}>({ message: '', visible: false });
  const [history, setHistory] = useState<DonationRecord[]>([]);
  const [savedTalent, setSavedTalent] = useState<EthosProfile[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingTalent, setLoadingTalent] = useState(false);

  const [donation, setDonation] = useState<DonationState>({
    isOpen: false,
    profile: null,
    extractedWallet: null,
  });

  const [userEthosScore, setUserEthosScore] = useState(0);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const copyShareLink = (username: string) => {
    const shareUrl = `${window.location.origin}/donate/${profile.username}`;

    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showToast('✨ Share link copied to clipboard!');
      })
      .catch(() => {
        showToast('Failed to copy link. Please try again.');
      });
  };

  // Fetch user's Ethos credibility score
  const fetchUserCredibilityScore = async (walletAddress: string) => {
    try {
      const user = await fetchUserByAddress(walletAddress);
      if (user) {
        const score = (user as any).score || (user as any).credibilityScore || 0;
        setUserEthosScore(score);
        console.log(`✅ User Ethos score: ${score}`);
      }
    } catch (error) {
      console.error('Error fetching user score:', error);
      setUserEthosScore(0);
    }
  };

  // Fetch user's credibility score when address changes
  useEffect(() => {
    if (address) {
      fetchUserCredibilityScore(address);
    } else {
      setUserEthosScore(0);
    }
  }, [address]);

  // Load all donations on mount
  useEffect(() => {
    const loadAllDonations = async () => {
      setLoadingHistory(true);
      try {
        const donations = await getAllDonations();
        setHistory(donations);
      } catch (error) {
        console.error('Error loading donations:', error);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadAllDonations();
  }, []);

  // Load saved talent from localStorage on mount
  useEffect(() => {
    const loadSavedTalentFromStorage = () => {
      try {
        const stored = localStorage.getItem(SAVED_TALENT_STORAGE_KEY);
        if (stored) {
          const talentProfiles: EthosProfile[] = JSON.parse(stored);
          setSavedTalent(talentProfiles);
          console.log(`✅ Loaded ${talentProfiles.length} saved talent profiles from localStorage`);
        }
      } catch (error) {
        console.error('Error loading saved talent from localStorage:', error);
      }
    };
    loadSavedTalentFromStorage();
  }, []);

  // Fetch initial profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const fetchedProfiles = await fetchTopCredibilityUsers(INITIAL_FETCH);
const combinedProfiles = getCombinedProfiles(fetchedProfiles);
setProfiles(combinedProfiles);
setFilteredProfiles(combinedProfiles);
        setFilteredProfiles(fetchedProfiles);
        
        const params = new URLSearchParams(window.location.search);
        const targetUsername = params.get('profile');
        if (targetUsername) {
          const matchedProfile = fetchedProfiles.find(p => p.username === targetUsername);
          if (matchedProfile) {
            const wallet = extractAddressFromUserkeys(matchedProfile.userkeys);
            if (wallet && matchedProfile.credibilityScore >= MIN_CREDIBILITY) {
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
        showToast('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  
    if (!query.trim()) {
      setFilteredProfiles(profiles);
      return;
    }
  
    setSearching(true);
    try {
      // Check if match exists in loaded profiles
      const localMatch = profiles.find(p => 
        p.username.toLowerCase() === query.toLowerCase()
      );
  
      if (localMatch) {
        setFilteredProfiles([localMatch]);
        setSearching(false);
        return;
      }
  
      // Use Gemini semantic search on loaded profiles
      const searchResult = await searchEthosUsersWithGemini(query, profiles);
      
      if (searchResult.profiles.length > 0) {
        setFilteredProfiles(searchResult.profiles);
      } else {
        // If no results in loaded profiles, try Ethos API
        const fetchedUser = await fetchUserByUsername(query);
        if (fetchedUser) {
          const wallet = extractAddressFromUserkeys(fetchedUser.userkeys);
          if (wallet && (fetchedUser as any).score >= MIN_CREDIBILITY) {
            const newProfile: EthosProfile = {
              id: fetchedUser.profileId?.toString() || query,
              displayName: fetchedUser.displayName,
              username: fetchedUser.username,
              avatarUrl: fetchedUser.avatarUrl,
              description: fetchedUser.description,
              credibilityScore: (fetchedUser as any).score || 0,
              userkeys: fetchedUser.userkeys,
              profileUrl: fetchedUser.profileUrl,
              stats: {
                reviewsReceived: fetchedUser.stats?.review?.received || { positive: 0, neutral: 0, negative: 0 },
                vouchesGiven: fetchedUser.stats?.vouch?.given?.count || 0,
                vouchesReceived: fetchedUser.stats?.vouch?.received?.count || 0,
              },
            };
            setFilteredProfiles([newProfile]);
          } else {
            showToast('User does not meet credibility requirements');
            setFilteredProfiles([]);
          }
        } else {
          showToast('User not found');
          setFilteredProfiles([]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast('Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Sort and paginate profiles
  const sortedProfiles = useMemo(() => {
    return sortProfiles(filteredProfiles, sortBy);
  }, [filteredProfiles, sortBy]);

  const paginatedProfiles = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProfiles.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [sortedProfiles, currentPage]);

  const totalPages = Math.ceil(sortedProfiles.length / ITEMS_PER_PAGE);

  const handleDonationSuccess = async (amount: string) => {
    if (!donation.profile || !address) return;
    
    try {
      await saveDonation({
        donorAddress: address,
        recipientUsername: donation.profile.username,
        recipientAvatar: donation.profile.avatarUrl,
        amount: amount,
        timestamp: Date.now(),
      });

      const updatedHistory = await getAllDonations();
      setHistory(updatedHistory);
      
      showToast(`Donated ${amount} USDC! ✨`);
    } catch (error) {
      console.error('Error saving donation:', error);
      showToast('Failed to save donation to database');
    }
  };

  const openDonateModal = (profile: EthosProfile) => {
    const wallet = extractAddressFromUserkeys(profile.userkeys);
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

  // Save talent to localStorage only
  const saveTalentForFounder = (profile: EthosProfile) => {
    if (savedTalent.find(t => t.id === profile.id)) {
      showToast(`${profile.displayName} is already saved`);
      return;
    }

    try {
      const updatedTalent = [profile, ...savedTalent];
      setSavedTalent(updatedTalent);
      localStorage.setItem(SAVED_TALENT_STORAGE_KEY, JSON.stringify(updatedTalent));
      showToast(`${profile.displayName} added to your talent pool! ✨`);
    } catch (error) {
      console.error('Error saving talent to localStorage:', error);
      showToast('Failed to save talent.');
    }
  };

  // Remove talent from localStorage
  const removeSavedTalent = (profileId: string) => {
    const updatedTalent = savedTalent.filter(t => t.id !== profileId);
    setSavedTalent(updatedTalent);
    localStorage.setItem(SAVED_TALENT_STORAGE_KEY, JSON.stringify(updatedTalent));
    showToast('Removed from talent pool');
  };

  // Clear all saved talent from localStorage
  const clearAllSavedTalent = () => {
    setSavedTalent([]);
    localStorage.removeItem(SAVED_TALENT_STORAGE_KEY);
    showToast('Talent pool cleared');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full -z-10"></div>

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-slate-900 border border-ethos-cyan/50 text-ethos-cyan px-6 py-3 rounded-full shadow-2xl shadow-ethos-cyan/20 font-bold flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          {toast.message}
        </div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => window.location.href = '/'}
        >
          <EthosLogo />
          <span className="text-xl font-azeera font-bold tracking-tighter text-white">TokenTribute</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => { setViewType('discover'); setCurrentPage(1); setSearchQuery(''); setFilteredProfiles(profiles); }}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                viewType === 'discover'
                  ? 'bg-ethos-gradient text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setViewType('founder')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                viewType === 'founder'
                  ? 'bg-ethos-gradient text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Founder Mode
            </button>
            <button
              onClick={() => navigate('/guide')}
              className="px-4 py-2 rounded-lg font-bold transition-all text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Guide
            </button>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      {viewType === 'discover' ? (
        <>
          {/* Hero Section */}
          <header className="px-6 pt-16 pb-8 lg:pt-24 lg:pb-12 flex flex-col items-center text-center max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              <div className="text-left space-y-6">
                <h1 className="text-5xl lg:text-7xl font-azeera font-bold leading-tight bg-gradient-to-r from-white via-ethos-cyan to-ethos-purple bg-clip-text text-transparent">
                  Honor <br/>Credibility
                </h1>
                <p className="text-xl text-slate-400 max-w-xl">
                  A peer-to-peer donation bridge. Reward high-credibility Ethos members directly with USDC on Base.
                </p>
                <div className="flex items-center gap-2 bg-slate-900/50 w-fit px-4 py-2 rounded-full border border-white/5 text-sm text-ethos-cyan font-medium">
                  <span className="w-2 h-2 rounded-full bg-ethos-cyan animate-pulse"></span>
                  Requirement: Credibility ≥ {MIN_CREDIBILITY}
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm">
                   {loadingHistory ? (
                     <div className="glass-card rounded-2xl p-6 text-center text-slate-400">
                       Loading donation history...
                     </div>
                   ) : (
                     <DonationHistory history={history} />
                   )}
                </div>
              </div>
            </div>
          </header>

          {/* Profiles Grid */}
          <main className="flex-grow px-6 pb-24 max-w-7xl mx-auto w-full mt-12">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by username or name... (e.g., 'vitalik')"
                  className="w-full bg-slate-900/80 border border-ethos-cyan/30 rounded-xl px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-ethos-cyan transition-all"
                />
                {searching && (
                  <div className="absolute right-4 top-3">
                    <svg className="animate-spin h-5 w-5 text-ethos-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">Search results from {filteredProfiles.length} profiles</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-azeera font-bold text-white">VERIFIED ETHOS Members</h2>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => { setSortBy(e.target.value as SortOption); setCurrentPage(1); }}
                  className="bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ethos-cyan transition-all cursor-pointer hover:bg-slate-800"
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
            ) : paginatedProfiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {paginatedProfiles.map(profile => (
                    <ProfileCard 
                      key={profile.id} 
                      profile={profile} 
                      onDonate={openDonateModal}
                      onProfileClick={() => window.open(profile.profileUrl, '_blank')}
                      onShowToast={showToast}
                      userEthosScore={userEthosScore}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-colors"
                    >
                      ← Prev
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                      return pageNum <= totalPages ? (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-ethos-gradient text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ) : null;
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">No profiles found. Does this person has Ethos account? </p>
              </div>
            )}
          </main>
        </>
      ) : (
        /* Founder Mode */
        <FounderMode
          profiles={profiles}
          savedTalent={savedTalent}
          history={history}
          onShowToast={showToast}
                      userEthosScore={userEthosScore}
          loadingTalent={loadingTalent}
          onSaveTalent={saveTalentForFounder}
          onRemoveTalent={removeSavedTalent}
          onClearAllTalent={clearAllSavedTalent}
          onDonate={openDonateModal}
        
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-60">
            <span className="text-sm font-azeera font-bold">TokenTribute</span>
            <span className="text-xs text-slate-500">© 2026</span>
          </div>
          <div className="flex gap-12 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2"><span className="w-1 h-1 bg-ethos-cyan rounded-full"></span> Powered by Ethos Network</span>
            <span className="flex items-center gap-2"><span className="w-1 h-1 bg-ethos-purple rounded-full"></span> Built on Base</span>
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

export default HomePage;