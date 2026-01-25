import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WagmiProvider, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// Multiple RPC endpoints for Base Sepolia
const baseSepoliaRpcs = [
  'https://sepolia.base.org',
  'https://base-sepolia-rpc.publicnode.com',
  'https://sepolia-rpc.ankr.com/base',
  'https://base-sepolia.public.blastapi.io',
  'https://rpc.sepolia.basemainnet.io',
  'https://base-sepolia.drpc.org',
];

// Create a simple fallback transport using the first available RPC
const createFallbackTransport = (rpcs: string[]) => {
  return http(rpcs[0], {
    retryCount: 3,
    retryDelay: 1000,
  });
};

const config = getDefaultConfig({
  appName: 'TokenTribute',
  projectId: '345cb8dcc8e9ec849140ecf8a91a505c',
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: createFallbackTransport(baseSepoliaRpcs),
  },
  ssr: true,
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#00D1FF',
          accentColorForeground: 'black',
          borderRadius: 'medium',
        })}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);