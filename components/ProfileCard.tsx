import React from 'react';
import { EthosProfile } from '../types';

interface ProfileCardProps {
  profile: EthosProfile;
  onDonate: (profile: EthosProfile) => void;
  onProfileClick?: () => void;
  onShowToast?: (message: string) => void;
  userEthosScore?: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  onDonate, 
  onProfileClick,
  onShowToast,
  userEthosScore = 0
}) => {
  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      window.open(profile.profileUrl, '_blank');
    }
  };

  // ✅ Donation share link - uses toast instead of alert
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // ⛔ prevent profile click
    const shareUrl = `${window.location.origin}/donate/${profile.username}`;

    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        if (onShowToast) {
          onShowToast('✨ Share link copied to clipboard!');
        }
      })
      .catch(() => {
        if (onShowToast) {
          onShowToast('Failed to copy link. Please try again.');
        }
      });
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-ethos-cyan/30 transition-all group">
      {/* Profile Header with Image - Clickable */}
      <div 
        className="h-40 bg-gradient-to-b from-ethos-cyan/20 to-slate-900 relative overflow-hidden cursor-pointer hover:from-ethos-cyan/40 transition-all"
        onClick={handleProfileClick}
      >
        <img 
          src={profile.avatarUrl} 
          alt={profile.displayName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src =
              'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
              profile.username;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-4">
        {/* Avatar, Name & Share Icon */}
        <div 
          className="flex items-start justify-between cursor-pointer group/header"
          onClick={handleProfileClick}
        >
          <div className="flex items-start gap-3 flex-1">
            <img 
              src={profile.avatarUrl} 
              className="w-12 h-12 rounded-full border-2 border-ethos-cyan/50 group-hover/header:border-ethos-cyan transition-all flex-shrink-0" 
              alt={profile.displayName}
              onError={(e) => {
                e.currentTarget.src =
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
                  profile.username;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white group-hover/header:text-ethos-cyan transition-colors truncate">
                {profile.displayName}
              </p>
              <p className="text-sm text-slate-400 truncate">
                @{profile.username}
              </p>
            </div>
          </div>

          {/* ✅ SHARE BADGE (fixed) */}
          <button
            onClick={handleShareClick}
            className="flex-shrink-0"
            title="Share donation link"
          >
            <svg
              className="w-5 h-5 text-slate-400 hover:text-ethos-cyan transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        </div>

        {/* Credibility Score */}
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-500 uppercase font-bold">
              Credibility Score
            </span>
            <span className="text-lg font-bold text-ethos-cyan">
              {profile.credibilityScore}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-ethos-cyan to-ethos-purple h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  (profile.credibilityScore / 2500) * 100,
                  100
                )}%`
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-900/30 p-2 rounded-lg">
            <p className="text-slate-500">Reviews</p>
            <p className="font-bold text-white">
              {profile.stats.reviewsReceived.positive}
            </p>
          </div>
          <div className="bg-slate-900/30 p-2 rounded-lg">
            <p className="text-slate-500">Vouches</p>
            <p className="font-bold text-white">
              {profile.stats.vouchesReceived}
            </p>
          </div>
          <div className="bg-slate-900/30 p-2 rounded-lg">
            <p className="text-slate-500">Sent</p>
            <p className="font-bold text-white">
              {profile.stats.vouchesGiven}
            </p>
          </div>
        </div>

        {/* Description */}
        {profile.description && (
          <p className="text-sm text-slate-400 line-clamp-2">
            {profile.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleProfileClick}
            className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-colors border border-slate-700/50 hover:border-ethos-cyan/50"
          >
            View Profile
          </button>
          
          <button
            onClick={() => onDonate(profile)}
            className="flex-1 py-2 bg-ethos-gradient text-white text-sm font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-ethos-cyan/30"
          >
            Donate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;