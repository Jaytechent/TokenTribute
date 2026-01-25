import { DonationRecord } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Save a donation to the database
 */
export const saveDonation = async (donation: Omit<DonationRecord, 'id'> & { transactionHash?: string }): Promise<DonationRecord> => {
  try {
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        donorAddress: donation.donorAddress,
        recipientUsername: donation.recipientUsername,
        recipientAvatar: donation.recipientAvatar,
        amount: donation.amount,
        transactionHash: donation.transactionHash || '',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save donation');
    }

    const data = await response.json();
    return {
      id: data._id,
      donorAddress: data.donorAddress,
      recipientUsername: data.recipientUsername,
      recipientAvatar: data.recipientAvatar,
      amount: data.amount,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error('Error saving donation:', error);
    throw error;
  }
};

/**
 * Get all public donations
 */
export const getAllDonations = async (): Promise<DonationRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/donations`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch donations');
    }

    const data = await response.json();
    return data.map((d: any) => ({
      id: d._id,
      donorAddress: d.donorAddress,
      recipientUsername: d.recipientUsername,
      recipientAvatar: d.recipientAvatar,
      amount: d.amount,
      timestamp: d.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching donations:', error);
    return [];
  }
};

/**
 * Get donations for a specific recipient
 */
export const getDonationsByRecipient = async (username: string): Promise<DonationRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/donations/recipient/${username}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch donations');
    }

    const data = await response.json();
    return data.map((d: any) => ({
      id: d._id,
      donorAddress: d.donorAddress,
      recipientUsername: d.recipientUsername,
      recipientAvatar: d.recipientAvatar,
      amount: d.amount,
      timestamp: d.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching donations:', error);
    return [];
  }
};

/**
 * Get donations by donor address
 */
export const getDonationsByDonor = async (address: string): Promise<DonationRecord[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/donations/donor/${address}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch donations');
    }

    const data = await response.json();
    return data.map((d: any) => ({
      id: d._id,
      donorAddress: d.donorAddress,
      recipientUsername: d.recipientUsername,
      recipientAvatar: d.recipientAvatar,
      amount: d.amount,
      timestamp: d.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching donations:', error);
    return [];
  }
};

/**
 * Get founder's saved talent
 */
export const getSavedTalent = async (founderAddress: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/talent/${founderAddress}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch saved talent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching saved talent:', error);
    return [];
  }
};

/**
 * Save a talent profile
 */
export const saveTalent = async (founderAddress: string, profile: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/talent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        founderAddress,
        profileId: profile.id,
        displayName: profile.displayName,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        credibilityScore: profile.credibilityScore,
        profileUrl: profile.profileUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save talent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving talent:', error);
    throw error;
  }
};

/**
 * Remove saved talent
 */
export const removeSavedTalent = async (talentId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/talent/${talentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove talent');
    }
  } catch (error) {
    console.error('Error removing talent:', error);
    throw error;
  }
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
};