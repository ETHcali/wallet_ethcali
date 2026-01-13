import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';

export default function Home() {
  const { login, ready, authenticated, user } = usePrivy();
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
          <div className="container mx-auto px-4 py-16">

            
            {/* Hero Section */}
            <div className="text-center mb-16">
              <img 
                src="/logotethcali.png" 
                alt="ETH CALI" 
                className="h-24 mx-auto mb-8"
              />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
                ETH CALI WALLET
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                Secure multi-chain wallet with gas sponsorship, sybil-resistant identity verification, 
                and professional-grade infrastructure for the decentralized web.
              </p>
            </div>

            {/* CTA at top */}
            <div className="text-center mb-16">
              <button 
                onClick={login}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                GO TO WALLET
              </button>
            </div>
            

            {/* Features Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Features</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Powerful tools built for the modern Web3 experience
                </p>
              </div>
              
              {/* Core Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900/50 border border-cyan-500/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-lg font-bold text-cyan-400 mb-3">Multi-Chain</h3>
                <p className="text-gray-500 text-sm">
                  Seamlessly interact across Base, Ethereum, Optimism, and Unichain networks.
                </p>
              </div>

              <div className="bg-gray-900/50 border border-blue-500/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="text-lg font-bold text-blue-400 mb-3">Sponsorship</h3>
                <p className="text-gray-500 text-sm">
                  If it's your first time, don't be afraid. We sponsor your transactions.
                </p>
              </div>

              <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-lg font-bold text-purple-400 mb-3">Sybil-Resistant</h3>
                <p className="text-gray-500 text-sm">
                  We want an app owned by humans that care about privacy.
                </p>
              </div>

              <div className="bg-gray-900/50 border border-green-500/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⛽</span>
                </div>
                <h3 className="text-lg font-bold text-green-400 mb-3">Faucet ETH</h3>
                <p className="text-gray-500 text-sm">
                  If you are a builder, you need gas for deployments. We gotchu.
                </p>
              </div>
              </div>
            </div>

            {/* Infrastructure Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Infrastructure</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Built on reliable and secure infrastructure partners
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <img src="infraused/privy.png" alt="Privy" className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-400 mb-3">Privy</h3>
                  <p className="text-gray-500 text-sm">
                    Secure authentication with email, passkeys, and external wallet integration.
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <img src="infraused/zkpassportid.png" alt="ZK Passport" className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-400 mb-3">ZK Passport</h3>
                  <p className="text-gray-500 text-sm">
                    Sybil-resistant identity verification using zero-knowledge proofs.
                  </p>
                </div>
              </div>
            </div>

            {/* Supported Networks Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Supported Networks</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                  Connect across multiple blockchain networks
                </p>
              </div>
              <div className="flex justify-center items-center space-x-12 flex-wrap gap-6">
                <img src="/chains/base logo.svg" alt="Base" className="h-16" />
                <img src="/chains/ethereum.png" alt="Ethereum" className="h-16" />
                <img src="/chains/op mainnet.png" alt="Optimism" className="h-16" />
                <img src="/chains/unichain.png" alt="Unichain" className="h-16" />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="bg-gray-900 border-t border-gray-700">
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-1">
                  <div className="mb-4">
                    <img src="/logotethcali.png" alt="ETH CALI" className="h-16 mb-4" />
                  </div>
                  <p className="text-gray-400 text-sm mb-4">El Jardín Infinito del Pacífico Colombiano</p>
                  <div className="flex space-x-4">
                    <a href="https://twitter.com/ethcali_org" target="_blank" className="text-gray-400 hover:text-white text-xl">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://www.linkedin.com/company/ethereum-cali/" target="_blank" className="text-gray-400 hover:text-white text-xl">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="https://instagram.com/ethereumcali.eth" target="_blank" className="text-gray-400 hover:text-white text-xl">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://www.youtube.com/@ethereumcali" target="_blank" className="text-gray-400 hover:text-white text-xl">
                      <i className="fab fa-youtube"></i>
                    </a>
                    <a href="https://github.com/ethcali" target="_blank" className="text-gray-400 hover:text-white text-xl">
                      <i className="fab fa-github"></i>
                    </a>
                    <a href="https://t.me/ethcali" target="_blank" className="text-gray-400 hover:text-white text-xl">
                      <i className="fab fa-telegram"></i>
                    </a>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <h3 className="text-white font-bold mb-4">Community</h3>
                  <ul className="space-y-2">
                    <li><a href="https://discord.gg/GvkDmHnDuE" target="_blank" className="text-gray-400 hover:text-white text-sm">Discord</a></li>
                    <li><a href="https://t.me/ethcali" target="_blank" className="text-gray-400 hover:text-white text-sm">Telegram</a></li>
                    <li><a href="https://www.meetup.com/members/378305434/group/36837943/" target="_blank" className="text-gray-400 hover:text-white text-sm">Meetup</a></li>
                    <li><a href="https://lu.ma/ethcali" target="_blank" className="text-gray-400 hover:text-white text-sm">Luma</a></li>
                  </ul>
                </div>
                
                <div className="col-span-1">
                  <h3 className="text-white font-bold mb-4">Web3 Profiles</h3>
                  <ul className="space-y-2">
                    <li><a href="https://app.ens.domains/name/ethereumcali.eth/details" target="_blank" className="text-gray-400 hover:text-white text-sm">ENS</a></li>
                    <li><a href="https://opensea.io/es/ETHCALI" target="_blank" className="text-gray-400 hover:text-white text-sm">OpenSea</a></li>
                    <li><a href="https://zora.co/@ethcali" target="_blank" className="text-gray-400 hover:text-white text-sm">Zora</a></li>
                    <li><a href="https://farcaster.xyz/ethereumcali" target="_blank" className="text-gray-400 hover:text-white text-sm">Farcaster</a></li>
                    <li><a href="https://mirror.xyz/0x55C9fbf09c056ACac807CD674e34F1F8Df0E711d" target="_blank" className="text-gray-400 hover:text-white text-sm">Mirror</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">&copy; 2023 Ethereum Cali. Todos los derechos reservados.</p>
                <div className="mt-4 md:mt-0">
                  <img src="/branding/Logo_Nodo_CLO_ETH_CO-01.png" alt="Ethereum Colombia Node" className="h-8" />
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
