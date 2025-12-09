import { PrivyProvider } from '@privy-io/react-auth';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { ThemeProvider } from '../context/ThemeContext';

function MyApp({ Component, pageProps }: AppProps) {
  // App ID from the Privy Dashboard (using environment variable)
  const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "cmavjopg6021ilh0ng5vnr5gc";
  
  // Log in development to help debug
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔐 Privy App ID:', PRIVY_APP_ID ? 'Configured' : 'Missing');
  }
  
  // Define metadata constants
  const title = 'ETH CALI - Web3 Wallet';
  const description = 'A secure and easy-to-use Ethereum wallet to get into web3 easily. Fully open-sourced with gas fees sponsored by ETH CALI.';
  const siteUrl = 'https://papayapp.vercel.app';
  const imageUrl = `${siteUrl}/banner_ethcali.jpg`;

  return (
    <ThemeProvider>
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
          loginMethods: ['email'],
          appearance: {
            theme: 'light',
            accentColor: '#4B66F3',
            logo: '/logo_eth_cali.png',
          },
          embeddedWallets: {
            createOnLogin: 'all-users',
            showWalletUIs: true,
          },
        }}
      >
        <Component {...pageProps} />
      </PrivyProvider>
    </ThemeProvider>
  );
}

export default MyApp; 