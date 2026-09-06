import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { useState } from 'react';
// Must come before globals.css: it defines the custom properties that both the
// Tailwind preset and globals.css read.
import '@ethcali/design-tokens/tokens.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [queryClient] = useState(() => new QueryClient());

  if (!PRIVY_APP_ID) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', padding: '2rem', textAlign: 'center', backgroundColor: 'var(--surface-slab)', color: 'var(--signal-reverted)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Configuration Error</h1>
        <p style={{ fontSize: '1rem', color: 'var(--signal-reverted)' }}>NEXT_PUBLIC_PRIVY_APP_ID is missing. Set it in your .env file.</p>
      </div>
    );
  }
  
  // Define metadata constants
  const title = 'ETH CALI - Web3 Wallet';
  const description = 'Fully open-sourced Web3 wallet for the ETH CALI community.';
  const siteUrl = 'https://wallet.ethcali.org';
  const imageUrl = `${siteUrl}/branding/Banner1200x400.png`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/branding/favicon.svg" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={siteUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={imageUrl} />
        
        {/* Additional SEO metadata */}
        <meta name="keywords" content="ethereum, wallet, crypto, blockchain, web3, optimism, ETHCALI" />
        <meta name="author" content="ETH Cali" />
      </Head>

      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          // 'wallet' enables Sign-In With Ethereum (SIWE) for external wallets
          loginMethods: ['email', 'passkey', 'wallet', 'google'],
          appearance: {
            theme: 'dark',
            // Privy's modal renders outside our stylesheet, so it cannot read a
            // token. This is --eth-blue from @ethcali/design-tokens, typed as hex.
            accentColor: '#2B23EF',
            logo: '/logotethcali.png',
            walletChainType: 'ethereum-only',
            showWalletLoginFirst: false,
            // Show detected browser extension wallets first, then common options
            walletList: [
              'detected_ethereum_wallets',
              'metamask',
              'wallet_connect',
              'coinbase_wallet',
              'rainbow',
            ],
          },
          embeddedWallets: {
            ethereum: {
              // Only create embedded wallets for email/passkey users;
              // external-wallet users already have their own wallet.
              createOnLogin: 'users-without-wallets',
            },
            showWalletUIs: true,
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </PrivyProvider>
    </>
  );
}

export default MyApp; 
