import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DonateModal from '../components/DonateModal';
import { fetchUserByUsername, extractAddressFromUserkeys } from '../services/ethosService';
import { EthosProfile } from '../types';

const DonatePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EthosProfile | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      navigate('/'); // fallback if no username
      return;
    }

    const loadUser = async () => {
      setLoading(true);
      try {
        const user = await fetchUserByUsername(username);
        if (!user) throw new Error('User not found');

        const addr = extractAddressFromUserkeys(user.userkeys || []);
        if (!addr) throw new Error('User wallet not found');

        setProfile({
          id: user.profileId?.toString() || user.id.toString(),
          username: user.username,
          displayName: user.displayName || user.username,
          avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          description: user.description || '',
          credibilityScore: user.score || 0,
          profileUrl: user.profileUrl,
          userkeys: user.userkeys || [],
          stats: {
            reviewsReceived: user.stats?.review?.received || { positive: 0, neutral: 0, negative: 0 },
            vouchesGiven: user.stats?.vouch?.given?.count || 0,
            vouchesReceived: user.stats?.vouch?.received?.count || 0,
          },
        });

        setWallet(addr);
      } catch (err: any) {
        setError(err.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [username, navigate]);

  const handleClose = () => {
    navigate(-1); // go back to previous page
  };

  const handleSuccess = (amount: string) => {
    console.log(`Donation sent: ${amount} USDC`);
    handleClose();
  };

  const handleShare = () => {
    if (!profile) return;
    const shareUrl = `${window.location.origin}/donate/${profile.username}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Donation link copied!\n${shareUrl}`);
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!profile || !wallet) return null;

  return (
    <DonateModal
      profile={profile}
      recipientWallet={wallet}
      onClose={handleClose}
      onSuccess={handleSuccess}
      onShare={handleShare}
    />
  );
};

export default DonatePage;
