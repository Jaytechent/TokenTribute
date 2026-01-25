
export interface EthosProfile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  description: string;
  credibilityScore: number;
  userkeys: string[];
  profileUrl: string; // Link to Ethos profile
  stats: {
    reviewsReceived: {
      positive: number;
      neutral: number;
      negative: number;
    };
    vouchesGiven: number;
    vouchesReceived: number;
  };
}

export interface DonationRecord {
  id: string;
  donorAddress: string;
  recipientUsername: string;
  recipientAvatar: string;
  amount: string;
  timestamp: number;
}

export interface DonationState {
  isOpen: boolean;
  profile: EthosProfile | null;
  extractedWallet: string | null;
}

// export interface EthosProfile {
//   id: string;
//   displayName: string;
//   username: string;
//   avatarUrl: string;
//   credibilityScore: number;
//   userkeys: string[];
// }

// export interface DonationState {
//   isOpen: boolean;
//   profile: EthosProfile | null;
//   extractedWallet: string | null;
// }

// export interface DonationRecord {
//   id: string;
//   donorAddress: string;
//   recipientUsername: string;
//   recipientAvatar: string;
//   amount: string;
//   timestamp: number;
// }
