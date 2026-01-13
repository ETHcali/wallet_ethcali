import React from 'react';
import Image from 'next/image';
import { getNetworkLogoUrl } from '../utils/tokenUtils';

interface NetworkSwitcherProps {
  currentChainId: number;
  onNetworkChange: (chainId: number) => void;
}

const NETWORKS = [
  {
    id: 8453,
    name: 'Base',
    logoUrl: getNetworkLogoUrl(8453),
    activeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    inactiveColor: 'bg-gray-800 text-gray-500 border-gray-700'
  },
  {
    id: 1,
    name: 'Ethereum',
    logoUrl: getNetworkLogoUrl(1),
    activeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    inactiveColor: 'bg-gray-800 text-gray-500 border-gray-700'
  },
  {
    id: 10,
    name: 'Optimism',
    logoUrl: getNetworkLogoUrl(10),
    activeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    inactiveColor: 'bg-gray-800 text-gray-500 border-gray-700'
  },
  {
    id: 130,
    name: 'Unichain',
    logoUrl: getNetworkLogoUrl(130),
    activeColor: 'bg-green-500/20 text-green-400 border-green-500/50',
    inactiveColor: 'bg-gray-800 text-gray-500 border-gray-700'
  }
];

export default function NetworkSwitcher({ currentChainId, onNetworkChange }: NetworkSwitcherProps) {
  const handleClick = (networkId: number) => {
    onNetworkChange(networkId);
  };

  return (
    <div className="flex gap-3 p-1 bg-gray-900 rounded-xl border border-cyan-500/20">
      {NETWORKS.map((network) => {
        const isActive = currentChainId === network.id;
        return (
          <button
            key={network.id}
            onClick={() => handleClick(network.id)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-mono font-bold transition-all
              ${isActive ? network.activeColor : network.inactiveColor}
              hover:scale-105
            `}
          >
            <Image
              src={network.logoUrl}
              alt={`${network.name} logo`}
              width={24}
              height={24}
              className={`w-6 h-6 object-contain ${network.logoUrl.includes('.svg') ? '' : 'rounded-full'}`}
              unoptimized
            />
            <span className="text-sm">{network.name.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}

