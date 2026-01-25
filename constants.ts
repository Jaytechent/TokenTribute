
export const BASE_SEPOLIA_USDC_ADDRESS = '0xf7464321de37bde4c03aaeef6b1e7b71379a9a64';
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

// Mock profiles for initial UI showcase in case the live API is restricted/needs keys
export const MOCK_PROFILES = [
  {
    id: "1",
    displayName: "Vitalik Buterin",
    username: "vitalik",
    avatarUrl: "https://picsum.photos/seed/vitalik/200",
    credibilityScore: 2450,
    userkeys: ["address:0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", "twitter:vitalik"]
  },
  {
    id: "2",
    displayName: "Satoshi G",
    username: "anonymous_dev",
    avatarUrl: "https://picsum.photos/seed/sat/200",
    credibilityScore: 1350,
    userkeys: ["address:0x1234567890123456789012345678901234567890"]
  },
  {
    id: "3",
    displayName: "Base Builder",
    username: "buildbase",
    avatarUrl: "https://picsum.photos/seed/base/200",
    credibilityScore: 1680,
    userkeys: ["address:0x000000000000000000000000000000000000dEaD"]
  },
  {
    id: "4",
    displayName: "Ethos Explorer",
    username: "ethos_user",
    avatarUrl: "https://picsum.photos/seed/ethos/200",
    credibilityScore: 1420,
    userkeys: ["github:ethosuser"] // Missing wallet
  },
  {
    id: "5",
    displayName: "DeFi Degen",
    username: "yield_farmer",
    avatarUrl: "https://picsum.photos/seed/degen/200",
    credibilityScore: 800,
    userkeys: ["address:0x5555555555555555555555555555555555555555"]
  }
];
