
import React from 'react';
import { DonationRecord } from '../types';

interface DonationHistoryProps {
  history: DonationRecord[];
}

const DonationHistory: React.FC<DonationHistoryProps> = ({ history }) => {
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="glass-card rounded-3xl p-6 border-white/5 h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <h3 className="font-azeera text-sm font-bold tracking-widest text-white uppercase">Live Tribute Feed</h3>
      </div>
      
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8 italic">No recent activity yet...</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="flex items-start gap-4 group animate-in slide-in-from-right duration-500">
              <img 
                src={item.recipientAvatar} 
                alt="" 
                className="w-10 h-10 rounded-full border border-white/10 grayscale group-hover:grayscale-0 transition-all"
              />
              <div className="flex-grow min-w-0">
                <p className="text-sm text-slate-300 leading-tight">
                  <span className="text-cyan-400 font-mono font-medium">{formatAddress(item.donorAddress)}</span>
                  <span className="text-slate-500 mx-1">donated</span>
                  <span className="text-white font-bold">{item.amount} USDC</span>
                  <span className="text-slate-500 mx-1">to</span>
                  <span className="text-cyan-400 font-medium">@{item.recipientUsername}</span>
                </p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">
                  {getTimeAgo(item.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DonationHistory;
