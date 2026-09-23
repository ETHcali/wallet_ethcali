import React from 'react';
import type { ChainInfo } from '../../config/chains';

interface ChainPickerProps {
  /** The chains this feature is deployed on — `chainsFor(feature)`. */
  chains: readonly ChainInfo[];
  value: number;
  onChange: (chainId: ChainInfo['id']) => void;
  /** Render the row even for a single chain. Off by default: one option is not a choice. */
  alwaysShow?: boolean;
  className?: string;
}

/**
 * The in-page chain picker. Chooses which deployment a feature reads from; it
 * never touches the wallet. The wallet is moved lazily by `useRequireChain`
 * right before signing, so a visitor can browse Optimism vaults with a wallet
 * on Base and only switch when they claim.
 */
const ChainPicker: React.FC<ChainPickerProps> = ({
  chains,
  value,
  onChange,
  alwaysShow = false,
  className = '',
}) => {
  if (chains.length === 0 || (chains.length === 1 && !alwaysShow)) return null;

  return (
    <div role="radiogroup" aria-label="Network" className={`flex flex-wrap gap-2 ${className}`}>
      {chains.map((chain) => {
        const selected = chain.id === value;
        return (
          <button
            key={chain.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(chain.id)}
            className={`min-h-tap rounded-control border px-4 font-mono text-sm transition-colors ${
              selected
                ? 'border-line-brand bg-eth-blue-wash text-eth-blue-text'
                : 'border-line-hairline bg-surface-inset text-content-secondary hover:border-line-strong'
            }`}
          >
            {chain.name}
          </button>
        );
      })}
    </div>
  );
};

export default ChainPicker;
