import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';

export default function Home() {
  const { login, ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [currentChainId, setCurrentChainId] = useState(8453);

  const userWallet = wallets?.[0];

  // Auto-redirect authenticated users to wallet
  React.useEffect(() => {
    if (ready && authenticated && userWallet) {
      router.push('/wallet');
    }
  }, [ready, authenticated, userWallet, router]);

  // Loading timeout state
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) {
        setLoadingTimeout(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [ready]);

  if (!ready) {
    if (loadingTimeout) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Initialization Error</h2>
            <p className="text-gray-400 mb-4">Taking too long to initialize.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return <Loading fullScreen={true} text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {authenticated && (
        <Navigation 
          currentChainId={currentChainId}
          onChainChange={setCurrentChainId}
        />
      )}
      
      {!authenticated ? (
        // Professional Landing Page
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">

            {/* Hero Section */}
            <div className="text-center mb-10 sm:mb-16">
              <div className="relative h-16 sm:h-24 mx-auto mb-6 sm:mb-8 w-auto">
                <Image
                  src="/logotethcali.png"
                  alt="ETH CALI"
                  width={96}
                  height={96}
                  className="h-16 sm:h-24 mx-auto w-auto"
                  priority
                />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6 px-2">
                ETH CALI WALLET
              </h1>
              <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                Secure multi-chain wallet with gas sponsorship, sybil-resistant identity verification,
                and professional-grade infrastructure for the decentralized web.
              </p>
            </div>

            {/* CTA at top */}
            <div className="text-center mb-10 sm:mb-16 px-4">
              <button
                onClick={login}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl text-white font-bold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                GO TO WALLET
              </button>
            </div>
            

            {/* Features Section */}
            <div className="mb-12 sm:mb-20">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Features</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
                  Powerful tools built for the modern Web3 experience
                </p>
              </div>

              {/* Core Features */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-gray-900/50 border border-cyan-500/20 rounded-xl p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl">🔗</span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-cyan-400 mb-2 sm:mb-3">Multi-Chain</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Seamlessly interact across Base, Ethereum, Optimism, and Unichain.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-blue-500/20 rounded-xl p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl">💸</span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-blue-400 mb-2 sm:mb-3">Sponsorship</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    First time? We sponsor your transactions.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl">🛡️</span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-purple-400 mb-2 sm:mb-3">Sybil-Resistant</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    An app owned by humans who care about privacy.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-green-500/20 rounded-xl p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl">⛽</span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-green-400 mb-2 sm:mb-3">Faucet ETH</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Builders need gas for deployments. We gotchu.
                  </p>
                </div>
              </div>
            </div>

            {/* Infrastructure Section */}
            <div className="mb-12 sm:mb-20">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Infrastructure</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
                  Built on reliable and secure infrastructure partners
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-8">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Image src="/infraused/privy.png" alt="Privy" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" unoptimized />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-blue-400 mb-2 sm:mb-3">Privy</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Secure authentication with email and passkeys.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Image src="/infraused/zkpassportid.png" alt="ZK Passport" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" unoptimized />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-purple-400 mb-2 sm:mb-3">ZK Passport</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Sybil-resistant identity with zero-knowledge proofs.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Image src="/infraused/ens.png" alt="Ethereum Name Service" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" unoptimized />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-purple-400 mb-2 sm:mb-3">ENS</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Decentralized naming on Ethereum and Internet.
                  </p>
                </div>

              </div>
            </div>

            {/* Supported Networks Section */}
            <div className="mb-12 sm:mb-20">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Supported Networks</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4 mb-6 sm:mb-8">
                  Connect across multiple blockchain networks
                </p>
              </div>
              <div className="flex justify-center items-center gap-4 sm:gap-12 flex-wrap px-4">
                <Image src="/chains/base.jpeg" alt="Base" width={64} height={64} className="h-10 sm:h-16 w-auto" unoptimized />
                <Image src="/chains/ethereum.png" alt="Ethereum" width={64} height={64} className="h-10 sm:h-16 w-auto" unoptimized />
                <Image src="/chains/op mainnet.png" alt="Optimism" width={64} height={64} className="h-10 sm:h-16 w-auto" unoptimized />
                <Image src="/chains/unichain.png" alt="Unichain" width={64} height={64} className="h-10 sm:h-16 w-auto" unoptimized />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="bg-gray-900 border-t border-gray-700">
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                {/* Logo & Social - Full width on mobile */}
                <div className="col-span-2 sm:col-span-1">
                  <div className="mb-4">
                    <Image src="/logotethcali.png" alt="ETH CALI" width={200} height={96} className="h-12 sm:h-16 w-auto mb-3 sm:mb-4" unoptimized />
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm mb-4">El Jardín Infinito del Pacífico Colombiano</p>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <a href="https://twitter.com/ethcali_org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-lg sm:text-xl">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://www.linkedin.com/company/eth-cali/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-lg sm:text-xl">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="https://instagram.com/ethcali.eth" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-lg sm:text-xl">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://www.youtube.com/@ethereumcali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-lg sm:text-xl">
                      <i className="fab fa-youtube"></i>
                    </a>
                    <a href="https://github.com/ethcali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-lg sm:text-xl">
                      <i className="fab fa-github"></i>
                    </a>
                    <a href="https://t.me/ethcali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-lg sm:text-xl">
                      <i className="fab fa-telegram"></i>
                    </a>
                  </div>
                </div>

                {/* Community */}
                <div className="col-span-1">
                  <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Community</h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li><a href="https://discord.gg/GvkDmHnDuE" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs sm:text-sm">Discord</a></li>
                    <li><a href="https://t.me/ethcali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs sm:text-sm">Telegram</a></li>
                    <li><a href="https://www.meetup.com/members/378305434/group/36837943/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs sm:text-sm">Meetup</a></li>
                    <li><a href="https://lu.ma/ethcali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs sm:text-sm">Luma</a></li>
                  </ul>
                </div>

                {/* Web3 Profiles */}
                <div className="col-span-1">
                  <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Web3 Profiles</h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    <li><a href="https://app.ens.domains/name/ethereumcali.eth/details" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs sm:text-sm">ENS</a></li>
                    <li><a href="https://opensea.io/es/ETHCALI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs sm:text-sm">OpenSea</a></li>
                    <li><a href="https://zora.co/@ethcali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs sm:text-sm">Zora</a></li>
                    <li><a href="https://farcaster.xyz/ethereumcali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs sm:text-sm">Farcaster</a></li>
                    <li><a href="https://mirror.xyz/0x55C9fbf09c056ACac807CD674e34F1F8Df0E711d" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs sm:text-sm">Mirror</a></li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">&copy; 2023 Ethereum Cali. Todos los derechos reservados.</p>
                <div>
                  <Image src="/branding/Logo_Nodo_CLO_ETH_CO-01.png" alt="Ethereum Colombia Node" width={120} height={32} className="h-6 sm:h-8 w-auto" unoptimized />
                </div>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        // Loading while redirecting to wallet
        <div className="min-h-screen flex items-center justify-center">
          <Loading fullScreen={true} text="Redirecting to wallet..." />
        </div>
      )}
    </div>
  );
}
