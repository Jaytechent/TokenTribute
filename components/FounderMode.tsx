import React, { useState } from 'react';
import { EthosProfile, DonationRecord } from '../types';
import ChatModal from './ChatModal';

interface FounderModeProps {
  profiles: EthosProfile[];
  savedTalent: EthosProfile[];
  history: DonationRecord[];
  userEthosScore: number;
  loadingTalent: boolean;
  onSaveTalent: (profile: EthosProfile) => void;
  onRemoveTalent: (profileId: string) => void;
  onClearAllTalent: () => void;
  onDonate: (profile: EthosProfile) => void;
  onShowToast: (message: string) => void;
}

const FounderMode: React.FC<FounderModeProps> = ({
  profiles,
  savedTalent,
  history,
  userEthosScore,
  loadingTalent,
  onSaveTalent,
  onRemoveTalent,
  onClearAllTalent,
  onDonate,
  onShowToast,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<EthosProfile | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [chatProfile, setChatProfile] = useState<EthosProfile | null>(null);

  // Extract tags/roles from description (e.g., "Developer", "Designer", "Founder")
  const extractTags = (description: string): string[] => {
    if (!description) return ['User'];
    const tags = description.match(/(?:^|,)\s*([^,]+)(?=,|$)/g) || [];
    return tags
      .map(tag => tag.replace(/^[,\s]+|[,\s]+$/g, '').trim())
      .filter(tag => tag.length > 0)
      .slice(0, 3);
  };

  const allTags = new Set<string>();
  profiles.forEach(p => {
    extractTags(p.description).forEach(tag => allTags.add(tag));
  });

  const filteredProfiles = filterTag === 'all' 
    ? profiles 
    : profiles.filter(p => extractTags(p.description).includes(filterTag));

  const handleViewProfile = (profile: EthosProfile) => {
    setSelectedProfile(profile);
  };

  const handleCloseModal = () => {
    setSelectedProfile(null);
  };

  const handleOpenChat = (profile: EthosProfile) => {
    const talentAddress = profile.userkeys?.find(k => k.startsWith('address:'))?.replace('address:', '');
    if (talentAddress) {
      setChatProfile(profile);
    } else {
      onShowToast('Unable to open chat - wallet address not found');
    }
  };

  return (
    <main className="flex-grow px-6 pb-24 max-w-7xl mx-auto w-full mt-12">
      <div className="space-y-12">
        {/* Founder Dashboard Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-azeera font-bold text-white">Founder's Talent Pool</h1>
          <p className="text-slate-400">
            Discover and save high-credibility talent for your team. Build relationships with vetted creators and contributors.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="glass-card p-6 rounded-2xl border border-ethos-cyan/20">
              <div className="text-3xl font-bold text-ethos-cyan">{savedTalent.length}</div>
              <div className="text-slate-400 text-sm">Saved Talents</div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-ethos-cyan/20">
              <div className="text-3xl font-bold text-ethos-cyan">{profiles.length}</div>
              <div className="text-slate-400 text-sm">Total Eligible Profiles</div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-ethos-cyan/20">
              <div className="text-3xl font-bold text-ethos-cyan">{history.length}</div>
              <div className="text-slate-400 text-sm">Platform Donations</div>
            </div>
          </div>
        </div>

        {/* Saved Talent Section */}
        {loadingTalent ? (
          <div className="text-center text-slate-400">Loading your saved talent...</div>
        ) : savedTalent.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-azeera font-bold text-white">
                Your Saved Talent ({savedTalent.length})
              </h2>
              <button
                onClick={onClearAllTalent}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTalent.map(profile => (
                <div
                  key={profile.id}
                  className="glass-card rounded-2xl overflow-hidden border border-ethos-cyan/30 hover:border-ethos-cyan/50 transition-all group cursor-pointer"
                >
                  {/* Profile Header */}
                  <div
                    className="ethos-gradient p-4 flex items-center justify-between hover:opacity-90"
                    onClick={() => window.open(profile.profileUrl, '_blank')}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.avatarUrl}
                        className="w-12 h-12 rounded-full border-2 border-white"
                        alt={profile.displayName}
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{profile.displayName}</p>
                        <p className="text-white/70 text-xs">@{profile.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveTalent(profile.id);
                      }}
                      className="text-white hover:bg-white/20 p-1 rounded"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Profile Details */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 uppercase font-bold">Credibility Score</p>
                      <div className="text-2xl font-bold text-ethos-cyan">{profile.credibilityScore}</div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-ethos-cyan to-ethos-purple h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((profile.credibilityScore / 2500) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Tags */}
                    {extractTags(profile.description).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {extractTags(profile.description).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-ethos-cyan/20 text-ethos-cyan rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-white/10">
                      <div>
                        <p className="text-xs text-slate-500">Reviews</p>
                        <p className="text-lg font-bold text-white">
                          {profile.stats.reviewsReceived.positive}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Vouches</p>
                        <p className="text-lg font-bold text-white">
                          {profile.stats.vouchesReceived}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <a
                        href={profile.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-colors text-center"
                      >
                        View Profile
                      </a>
                      <button
                        onClick={() => onDonate(profile)}
                        className="flex-1 py-2 bg-ethos-gradient text-white text-sm font-bold rounded-lg transition-opacity hover:opacity-90"
                      >
                        Donate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">
              No saved talents yet. Discover and save talented profiles below!
            </p>
          </div>
        )}

        {/* Talent Discovery */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-azeera font-bold text-white">Discover Talent</h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterTag('all')}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                  filterTag === 'all'
                    ? 'bg-ethos-gradient text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({profiles.length})
              </button>
              {Array.from(allTags)
                .sort()
                .map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                      filterTag === tag
                        ? 'bg-ethos-gradient text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tag} ({profiles.filter(p => extractTags(p.description).includes(tag)).length})
                  </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.slice(0, 12).map(profile => (
              <div
                key={profile.id}
                onClick={() => handleViewProfile(profile)}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-ethos-cyan/50 transition-all group cursor-pointer hover:shadow-lg hover:shadow-ethos-cyan/20"
              >
                {/* Profile Image Background */}
                <div className="h-40 bg-gradient-to-b from-ethos-cyan/20 to-slate-900 relative overflow-hidden">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  <div>
                    <p className="font-bold text-white">{profile.displayName}</p>
                    <p className="text-sm text-ethos-cyan">@{profile.username}</p>
                  </div>

                  {/* Tags/Role */}
                  {extractTags(profile.description).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {extractTags(profile.description).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-ethos-cyan/20 text-ethos-cyan rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Credibility */}
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-400">Credibility</span>
                      <span className="text-lg font-bold text-ethos-cyan">{profile.credibilityScore}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-ethos-cyan to-ethos-purple h-2 rounded-full"
                        style={{
                          width: `${Math.min((profile.credibilityScore / 2500) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/30 p-2 rounded">
                      <p className="text-slate-500">Reviews</p>
                      <p className="font-bold text-white">{profile.stats.reviewsReceived.positive}</p>
                    </div>
                    <div className="bg-slate-900/30 p-2 rounded">
                      <p className="text-slate-500">Vouches</p>
                      <p className="font-bold text-white">{profile.stats.vouchesReceived}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSaveTalent(profile);
                      }}
                      disabled={loadingTalent}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all disabled:opacity-50 ${
                        savedTalent.find(t => t.id === profile.id)
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {savedTalent.find(t => t.id === profile.id) ? '✓ Saved' : '+ Save'}
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDonate(profile);
                      }}
                      className="flex-1 py-2 bg-ethos-gradient text-white font-bold rounded-lg transition-opacity hover:opacity-90"
                    >
                      Donate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="glass-card rounded-2xl max-w-2xl w-full border border-ethos-cyan/30 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 flex justify-end p-4 bg-slate-900/80">
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Header Image */}
            <div className="h-64 bg-gradient-to-b from-ethos-cyan/20 to-slate-900 relative overflow-hidden">
              <img
                src={selectedProfile.avatarUrl}
                alt={selectedProfile.displayName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>

            {/* Profile Info */}
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-white">{selectedProfile.displayName}</h2>
                <p className="text-xl text-ethos-cyan">@{selectedProfile.username}</p>
              </div>

              {/* Bio/Description */}
              {selectedProfile.description && (
                <div>
                  <p className="text-sm text-slate-400 uppercase font-bold mb-2">About</p>
                  <p className="text-slate-300">{selectedProfile.description}</p>
                </div>
              )}

              {/* Tags */}
              {extractTags(selectedProfile.description).length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 uppercase font-bold mb-3">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {extractTags(selectedProfile.description).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-ethos-cyan/20 text-ethos-cyan rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-white/10">
                  <p className="text-slate-500 text-sm">Credibility Score</p>
                  <p className="text-2xl font-bold text-ethos-cyan">{selectedProfile.credibilityScore}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-white/10">
                  <p className="text-slate-500 text-sm">Reviews</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedProfile.stats.reviewsReceived.positive}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-white/10">
                  <p className="text-slate-500 text-sm">Vouches</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedProfile.stats.vouchesReceived}
                  </p>
                </div>
              </div>

              {/* Credibility Progress */}
              <div>
                <p className="text-sm text-slate-400 uppercase font-bold mb-2">Credibility Progress</p>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-ethos-cyan to-ethos-purple h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((selectedProfile.credibilityScore / 2500) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {selectedProfile.credibilityScore} / 2500 points
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    onSaveTalent(selectedProfile);
                    handleCloseModal();
                  }}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    savedTalent.find(t => t.id === selectedProfile.id)
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-ethos-gradient text-white hover:opacity-90'
                  }`}
                >
                  {savedTalent.find(t => t.id === selectedProfile.id) ? '✓ Already Saved' : '+ Save to Talent Pool'}
                </button>
                <button
                  onClick={() => {
                    onDonate(selectedProfile);
                    handleCloseModal();
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
                >
                  Send Donation
                </button>
                <button
                  onClick={() => handleOpenChat(selectedProfile)}
                  className="flex-1 py-3 bg-ethos-purple hover:bg-ethos-purple-dark text-white font-bold rounded-lg transition-colors"
                >
                  💬 Chat
                </button>
                <a
                  href={selectedProfile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors text-center"
                >
                  View on Ethos
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatProfile && (
        <ChatModal
          talentUsername={chatProfile.username}
          talentAddress={chatProfile.userkeys?.find(k => k.startsWith('address:'))?.replace('address:', '') || ''}
          ethosScore={userEthosScore}
          onClose={() => setChatProfile(null)}
        />
      )}
    </main>
  );
};

export default FounderMode;