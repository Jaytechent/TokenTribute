
import React, { useState } from 'react';
import { EthosProfile } from '../types';
import { ELIGIBILITY_THRESHOLD } from '../constants';

interface ProfileCardProps {
  profile: EthosProfile;
  onDonate: (profile: EthosProfile) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onDonate }) => {
  const [copied, setCopied] = useState(false);
  const isEligible = profile.credibilityScore >= ELIGIBILITY_THRESHOLD;
  const wallet = profile.userkeys.find(k => k.startsWith("address:"))?.replace("address:", "");
  const canDonate = isEligible && !!wallet;

  let tooltip = "";
  if (!isEligible) tooltip = "User not eligible for donations (Score < 1400)";
  else if (!wallet) tooltip = "No wallet linked to this profile";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?profile=${profile.username}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`glass-card p-6 rounded-2xl transition-all duration-300 group ${isEligible ? 'eligible-glow hover:-translate-y-1' : 'opacity-60'}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img 
            src={profile.avatarUrl} 
            alt={profile.username} 
            className="w-16 h-16 rounded-full border-2 border-slate-700 object-cover"
          />
          {isEligible && (
            <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1 border-2 border-[#0A0E17]">
              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{profile.displayName}</h3>
          <p className="text-slate-400 text-sm">@{profile.username}</p>
        </div>
        
        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-cyan-400 transition-all relative"
          title="Share direct donation link"
        >
          {copied ? (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap animate-bounce">
              Copied!
            </span>
          ) : null}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Credibility Score</span>
          <span className={`font-bold ${isEligible ? 'text-cyan-400' : 'text-slate-400'}`}>
            {profile.credibilityScore}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Status</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isEligible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
            {isEligible ? 'Eligible' : 'Not Eligible'}
          </span>
        </div>

        <div className="pt-4">
          <button
            onClick={() => canDonate && onDonate(profile)}
            disabled={!canDonate}
            title={tooltip}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
              canDonate 
              ? 'ethos-gradient text-white hover:opacity-90 active:scale-95 shadow-lg shadow-cyan-500/20' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {canDonate ? 'Donate USDC' : 'Ineligible'}
          </button>
          {!wallet && isEligible && (
            <p className="text-[10px] text-center mt-2 text-amber-400/80">Missing Wallet Address</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
