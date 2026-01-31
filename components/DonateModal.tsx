import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { EthosProfile } from '../types';
import { saveDonation } from '../services/donationApi';
import { BASE_SEPOLIA_USDC_ADDRESS, USDC_DECIMALS, ERC20_ABI } from '../constants';

interface DonateModalProps {
  profile: EthosProfile;
  recipientWallet: string;
  onClose: () => void;
  onSuccess: (amount: string) => void;
  onShare: () => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ profile, recipientWallet, onClose, onSuccess, onShare }) => {
  const { isConnected, address, chainId } = useAccount();
  const [amount, setAmount] = useState<string>('');
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  
  const { data: hash, writeContract, isPending: isSending, error } = useWriteContract();
  
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Save to database ONLY once after successful transaction
  useEffect(() => {
    if (isSuccess && amount && !hasAttemptedSave) {
      setHasAttemptedSave(true);
      saveDonationToDatabase();
    }
  }, [isSuccess, amount, hasAttemptedSave]);

  const saveDonationToDatabase = async () => {
    if (!address) return;

    setIsSavingToDb(true);
    setDbError(null);

    try {
      await saveDonation({
        donorAddress: address,
        recipientUsername: profile.username,
        recipientAvatar: profile.avatarUrl,
        amount: amount,
        timestamp: Date.now(),
        transactionHash: hash || undefined,
      });

      // Call onSuccess after successful database save
      onSuccess(amount);
    } catch (error) {
      console.error('Error saving donation to database:', error);
      setDbError('Donation was sent on-chain but failed to save to database. Please refresh the page.');
    } finally {
      setIsSavingToDb(false);
    }
  };

  const handleSend = () => {
    if (!amount || isNaN(Number(amount)) || !address) return;
    const amountInUnits = parseUnits(amount, USDC_DECIMALS);
    writeContract({
      address: BASE_SEPOLIA_USDC_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipientWallet as `0x${string}`, amountInUnits],
      account: address,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md glass-card rounded-3xl overflow-hidden border-cyan-500/30 border-2">
        {/* Header */}
        <div className="ethos-gradient p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold font-azeera">Send Tribute</h2>
              <p className="text-white/80 text-sm">Supporting @{profile.username}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onShare}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Share this profile"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
             <img src={profile.avatarUrl} className="w-12 h-12 rounded-full border border-white/10" alt="" />
             <div className="overflow-hidden">
               <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">To Wallet</p>
               <p className="text-sm text-cyan-400 truncate font-mono">{recipientWallet}</p>
             </div>
          </div>

          {!isSuccess && (
            <div className="space-y-2">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-widest">Amount (USDC)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  disabled={isSending || isWaiting}
                />
                <span className="absolute right-4 top-3.5 text-slate-500 font-bold">USDC</span>
              </div>
              <p className="text-[10px] text-slate-500">Network: Base Sepolia</p>
            </div>
          )}

          {!isConnected ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-sm text-slate-400 text-center">Connect your wallet to send tokens</p>
              <ConnectButton />
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6 space-y-4">
              {isSavingToDb ? (
                <>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Saving to Database...</h3>
                  <p className="text-slate-400 text-sm">Recording your donation on our platform</p>
                </>
              ) : dbError ? (
                <>
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6v2m0 4v2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Donation Sent ⚠️</h3>
                  <p className="text-yellow-400 text-sm">{dbError}</p>
                  <div className="flex gap-3 mt-6">
                    <button onClick={onShare} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors">Share</button>
                    <button onClick={onClose} className="flex-1 py-3 ethos-gradient text-white rounded-xl font-bold transition-opacity hover:opacity-90">Done</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Tribute Sent!</h3>
                  <p className="text-slate-400 text-sm">Your donation has been confirmed on-chain and saved to our platform.</p>
                  <div className="flex gap-3 mt-6">
                    <button onClick={onShare} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors">Share</button>
                    <button onClick={onClose} className="flex-1 py-3 ethos-gradient text-white rounded-xl font-bold transition-opacity hover:opacity-90">Done</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
               {error && (
                 <p className="text-red-400 text-xs text-center bg-red-500/10 p-2 rounded max-h-24 overflow-y-auto">
                   {error.message.includes('insufficient') ? 'Insufficient USDC balance' : 'Transaction failed. Please try again.'}
                 </p>
               )}
               <button 
                onClick={handleSend}
                disabled={!amount || isSending || isWaiting}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  !amount || isSending || isWaiting 
                  ? 'bg-slate-800 text-slate-600' 
                  : 'ethos-gradient text-white hover:scale-[1.02] shadow-lg shadow-cyan-500/20'
                }`}
               >
                 {(isSending || isWaiting) && (
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                 )}
                 {isWaiting ? 'Confirming...' : isSending ? 'Checking Wallet...' : 'Send Tribute'}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonateModal;
