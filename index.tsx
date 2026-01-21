
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [baseSepolia],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'TokenTribute',
  projectId: 'YOUR_PROJECT_ID_OR_MOCK', // In a real app, use a WalletConnect Project ID
  chains,
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains} theme={darkTheme({
        accentColor: '#00D1FF',
        accentColorForeground: 'black',
        borderRadius: 'medium',
      })}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
