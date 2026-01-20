import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [queryClient] = useState(() => new QueryClient());

  if (!PRIVY_APP_ID) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', padding: '2rem', textAlign: 'center', backgroundColor: '#0a0a0a', color: '#ef4444' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Configuration Error</h1>
        <p style={{ fontSize: '1rem', color: '#fca5a5' }}>NEXT_PUBLIC_PRIVY_APP_ID is missing. Set it in your .env file.</p>
      </div>
    );
  }
  
  // Define metadata constants
  const title = 'ETH CALI - Web3 Wallet';
  const description = 'A secure and easy-to-use Ethereum wallet to get into web3 easily. Fully open-sourced with gas fees sponsored by ETH CALI.';
  const siteUrl = 'https://wallet.ethcali.org';
  const imageUrl = `${siteUrl}/banner_ethcali.jpg`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/1x1ethcali.png" type="image/png" />
        
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
        <meta name="author" content="ETH CALI" />
      </Head>

      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['email', 'passkey'],
          appearance: {
            theme: 'dark',
            accentColor: '#06b6d4',
            logo: '/logotethcali.png',
            walletChainType: 'ethereum-only',
            showWalletLoginFirst: false,
          },
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'all-users',
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
