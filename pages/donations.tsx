import { useState, useMemo } from 'react';
import Head from 'next/head';
import Layout from '../components/shared/Layout';
import Navigation from '../components/Navigation';
import CampaignCard from '../components/donations/CampaignCard';
import DonateModal from '../components/donations/DonateModal';
import DonorWall from '../components/donations/DonorWall';
import BeneficiaryCard from '../components/donations/BeneficiaryCard';
import BankTransferPanel from '../components/donations/BankTransferPanel';
import CurrencyToggle from '../components/donations/CurrencyToggle';
import {
  useActiveCampaigns,
  useCampaignRowId,
  useDonationAddresses,
  useDeployedDonationChains,
} from '../hooks/donations';
import { CHAIN_IDS, NETWORK_NAMES, type ChainId } from '../config/constants';
import type { Campaign } from '../types/donations';

export default function DonationsPage() {
  const deployedChains = useDeployedDonationChains();

  // Celo first — it is where COPm lives, the natural currency for local donors.
  const defaultChainId = deployedChains[0]?.chainId ?? CHAIN_IDS.CELO;
  const [chainId, setChainId] = useState<number>(defaultChainId);

  const { tokens, isDeployed, vault } = useDonationAddresses(chainId);
  const { data: campaigns = [], isLoading } = useActiveCampaigns(chainId);

  const [donating, setDonating] = useState<Campaign | null>(null);
  const [wallToken, setWallToken] = useState(0);

  const featured = campaigns[0] ?? null;
  const { data: featuredRowId } = useCampaignRowId(chainId, vault, featured?.id ?? null);
  const selectedToken = useMemo(
    () => tokens[Math.min(wallToken, tokens.length - 1)],
    [tokens, wallToken],
  );

  return (
    // Matches every other page root: globals.css only goes dark under
    // prefers-color-scheme, so a light-mode visitor saw white-on-white.
    <div className="min-h-screen bg-surface-void">
      <Layout>
        <Head>
          <title>Donate · ETH Cali</title>
          <meta
            name="description"
            content="Support ETH Cali relief campaigns. Donate in ETH, USDC or COPm — funds go straight to the ethcali.eth multisig."
          />
        </Head>

        <Navigation />

        {/* No wrapper padding or max-width here: Layout already supplies both.
          Nesting a second one doubled the gutter on a phone and the inner
          max-width could never win against the outer one anyway. */}
        <main>
          <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-content-primary sm:text-2xl">
                Donations
              </h1>
              <p className="mt-1 text-sm text-content-muted">
                Direct support, settled onchain and visible to everyone.
              </p>
            </div>
            <CurrencyToggle />
          </header>

          {/* Network picker — only chains with a deployed vault */}
          {deployedChains.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {deployedChains.map((chain) => (
                <button
                  key={chain.chainId}
                  type="button"
                  onClick={() => {
                    setChainId(chain.chainId);
                    setWallToken(0);
                  }}
                  className={`min-h-tap rounded-control border px-4 text-sm font-semibold transition-colors ${
                    chain.chainId === chainId
                      ? 'border-eth-blue bg-eth-blue/15 text-eth-blue-text'
                      : 'border-line-hairline bg-surface-inset text-content-secondary hover:border-line-strong'
                  }`}
                >
                  {chain.name}
                </button>
              ))}
            </div>
          )}

          {/* Not deployed anywhere yet — an honest empty state, not a broken page */}
          {!isDeployed && (
            <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-8 text-center">
              
              <h2 className="mb-2 text-lg font-bold text-content-primary">
                Not live yet
              </h2>
              <p className="mx-auto max-w-md text-sm text-content-muted">
                The donation contract has not been deployed to{' '}
                {NETWORK_NAMES[chainId as ChainId] ?? 'this network'} yet. Once
                it is, campaigns will appear here automatically.
              </p>
            </div>
          )}

          {isDeployed && isLoading && (
            <p className="py-12 text-center text-sm text-content-faint">
              Loading campaigns…
            </p>
          )}

          {isDeployed && !isLoading && campaigns.length === 0 && (
            <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-8 text-center">
              <h2 className="mb-2 text-lg font-bold text-content-primary">
                No open campaigns
              </h2>
              <p className="text-sm text-content-muted">
                There are no active campaigns on{' '}
                {NETWORK_NAMES[chainId as ChainId]} right now.
              </p>
            </div>
          )}

          {isDeployed && campaigns.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    chainId={chainId}
                    onDonate={() => setDonating(campaign)}
                  />
                ))}

                {featured && selectedToken && (
                  <>
                    {tokens.length > 1 && (
                      <div className="flex flex-wrap gap-2">
                        {tokens.map((t, i) => (
                          <button
                            key={t.address}
                            type="button"
                            onClick={() => setWallToken(i)}
                            className={`min-h-[40px] rounded-control border px-4 text-xs font-semibold transition-colors ${
                              i === wallToken
                                ? 'border-eth-blue bg-eth-blue/15 text-eth-blue-text'
                                : 'border-line-hairline bg-surface-inset text-content-muted hover:border-line-strong'
                            }`}
                          >
                            {t.symbol}
                          </button>
                        ))}
                      </div>
                    )}
                    <DonorWall
                      campaignId={featured.id}
                      token={selectedToken}
                      chainId={chainId}
                    />
                  </>
                )}
              </div>

              <aside className="space-y-4">
                {featured && (
                  <BeneficiaryCard
                    beneficiary={featured.beneficiary}
                    chainId={chainId}
                    autoForward={featured.autoForward}
                  />
                )}

                {/* Renders nothing unless the campaign has published accounts. */}
                <BankTransferPanel campaignId={featuredRowId ?? null} />

                {vault && (
                  <div className="rounded-card border border-line-hairline bg-surface-inset/50 p-4 text-xs text-content-muted">
                    <h3 className="mb-2 text-sm font-semibold text-content-secondary">
                      How this works
                    </h3>
                    <ul className="space-y-1.5">
                      <li>
                        · Donate in {tokens.map((t) => t.symbol).join(', ')}.
                      </li>
                      <li>
                        · Qualifying donations mint a receipt NFT to your
                        wallet.
                      </li>
                      <li>
                        · Every donation is public and verifiable onchain.
                      </li>
                    </ul>
                  </div>
                )}
              </aside>
            </div>
          )}
        </main>

        {donating && (
          <DonateModal
            campaign={donating}
            chainId={chainId}
            onClose={() => setDonating(null)}
          />
        )}
      </Layout>
    </div>
  );
}
