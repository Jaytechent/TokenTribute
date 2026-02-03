


export const BASE_SEPOLIA_USDC_ADDRESS = import.meta.env.VITE_USDC_CONTRACT_ADDRESS ;
export const USDC_DECIMALS = 6;

export const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  }
] as const;

export const ELIGIBILITY_THRESHOLD = 1400;

// ============================================
// YOUR ACCOUNT (OWNER) - ONLY ACCOUNT
// ============================================

export const MY_ACCOUNT = {
  id: "0",
  displayName: "Hallenjay",
  username: "hallenjayArt",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=hallenjayArt",
  description: "Creator & Builder on Base | TokenTribute Founder",
  credibilityScore: 1800,
  userkeys: [
    "address:0xD1C7bf8990FbA07F9C8B57529e3D9753D00A73aA",
    "twitter:hallenjayArt",
    "github:jaytechent"
  ],
  profileUrl: "https://x.com/hallenjayArt",
  stats: {
    reviewsReceived: { positive: 45, neutral: 8, negative: 2 },
    vouchesGiven: 120,
    vouchesReceived: 95,
  },
  isFeatured: true,
  isOwner: true,
};

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Get all profiles including your account
 * Combine your account with fetched Ethos profiles
 * No mock profiles, only real Ethos data
 */
export const getCombinedProfiles = (ethosProfiles: any[] = []) => {
  // Filter out duplicates (in case your account exists in Ethos)
  const ethosFiltered = ethosProfiles.filter(
    (profile) => profile.username.toLowerCase() !== MY_ACCOUNT.username.toLowerCase()
  );
  
  // Return with your account first, then Ethos profiles
  return [
    MY_ACCOUNT,
    ...ethosFiltered,
  ];
};