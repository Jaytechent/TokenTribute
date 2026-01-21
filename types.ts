
export interface EthosProfile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  credibilityScore: number;
  userkeys: string[];
}

export interface DonationState {
  isOpen: boolean;
  profile: EthosProfile | null;
  extractedWallet: string | null;
}

export interface DonationRecord {
  id: string;
  donorAddress: string;
  recipientUsername: string;
  recipientAvatar: string;
  amount: string;
  timestamp: number;
}
