import React from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'ETH CALI Wallet', 
  description = 'A secure and easy-to-use Ethereum wallet to get into web3 easily. Fully open-sourced with gas fees sponsored by ETH CALI.' 
}) => {
  // Define the site URL and image paths for metadata
  const siteUrl = 'https://papayapp.vercel.app';
  const imageUrl = `${siteUrl}/banner_ethcali.jpg`;
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-black transition-colors duration-300">
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

      <header className="py-8 px-4 text-center border-b border-cyan-500/20 bg-black relative z-10">
        <div className="relative py-6 flex flex-col items-center">
          <img 
            src="/logo_eth_cali_blanco.png" 
            alt="ETH CALI Logo" 
            className="w-36 h-auto mb-4 filter drop-shadow-md md:w-40"
          />
          <h1 className="text-white text-xl font-semibold text-shadow-sm md:text-2xl font-mono">{title}</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="bg-gray-900 rounded-xl shadow-md p-4 md:p-6 transition-colors duration-300">
          {children}
        </div>
      </main>

      <footer className="py-6 px-4 text-center border-t border-cyan-500/20 bg-black text-white text-sm font-mono">
        <p className="opacity-90">POWERED_BY_ETH_CALI</p>
      </footer>
    </div>
  );
};

export default Layout; 