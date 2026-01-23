import { useState } from 'react';
import Image from 'next/image';
import { useDesignInfo, useDesignDiscountConfig, useDesignRemainingSupply } from '../../hooks/useSwagStore';
import { useSetDesignActive } from '../../hooks/swag';
import { AdminProductEditModal } from './AdminProductEditModal';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import { logger } from '../../utils/logger';
import { useSwagAddresses } from '../../utils/network';

export function AdminProductList() {
  const { swag1155, chainId } = useSwagAddresses();
  const { designInfo, isLoading: isDesignLoading, refetch: refetchDesign } = useDesignInfo(swag1155 || '', chainId);
  const { discountConfig, isLoading: isDiscountLoading } = useDesignDiscountConfig(swag1155 || '', chainId);
  const { remaining, isLoading: isSupplyLoading } = useDesignRemainingSupply(swag1155 || '', chainId);
  const { setDesignActive, canSet } = useSetDesignActive(swag1155 || '', chainId);
  const [editingDesign, setEditingDesign] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isLoading = isDesignLoading || isDiscountLoading || isSupplyLoading;

  const handleToggleActive = async () => {
    if (!designInfo || !canSet) return;
    
    setIsToggling(true);
    try {
      await setDesignActive(!designInfo.active);
      await refetchDesign();
    } catch (error) {
      logger.error('Error toggling Design active status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update Design status');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3 text-slate-400">Loading Design...</span>
        </div>
      </div>
    );
  }

  if (!designInfo) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
        <p className="text-red-300">No Design found at this address.</p>
        <p className="text-red-200 text-sm mt-2">Design Address: {swag1155}</p>
      </div>
    );
  }

  const imageUrl = getIPFSGatewayUrl(designInfo.imageUrl || '') || '/logo_eth_cali.png';
  const minted = Number(designInfo.minted);
  const totalSupply = Number(designInfo.totalSupply);
  const price = Number(designInfo.pricePerUnit) / 1_000_000; // Assuming 6 decimals

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Manage Design</h2>
        <button
          onClick={() => refetchDesign()}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Design Image */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <Image
              src={imageUrl}
              alt={designInfo.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={imageUrl.startsWith('https://gateway.pinata.cloud')}
            />
          </div>
        </div>

        {/* Design Info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{designInfo.name}</h3>
            <p className="text-sm text-slate-400">{designInfo.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Price</p>
              <p className="text-green-400 font-mono">${price.toFixed(2)} USDC</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Status</p>
              {designInfo.active ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  Inactive
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">Supply</p>
            <div className="text-sm">
              <span className="text-white">{minted}</span>
              <span className="text-slate-500"> / {totalSupply}</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${totalSupply > 0 ? (minted / totalSupply) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{remaining} remaining</p>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Traits</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300">
                Gender: {designInfo.gender}
              </span>
              <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300">
                Color: {designInfo.color}
              </span>
              <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300">
                Style: {designInfo.style}
              </span>
            </div>
          </div>

          {discountConfig && (discountConfig.poapEnabled || discountConfig.smartContractEnabled) && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Discounts</p>
              <div className="space-y-1">
                {discountConfig.poapEnabled && (
                  <div className="text-xs text-slate-300">
                    POAP: Event #{discountConfig.poapEventId.toString()} - {discountConfig.discountType === 0 ? `${Number(discountConfig.poapDiscount) / 100}%` : `${Number(discountConfig.poapDiscount) / 1_000_000} USDC`}
                  </div>
                )}
                {discountConfig.smartContractEnabled && (
                  <div className="text-xs text-slate-300">
                    Contract: {discountConfig.smartContractAddress.slice(0, 10)}... - {discountConfig.discountType === 0 ? `${Number(discountConfig.smartContractDiscount) / 100}%` : `${Number(discountConfig.smartContractDiscount) / 1_000_000} USDC`}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => setEditingDesign(true)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
            >
              Edit Design
            </button>
            <button
              onClick={handleToggleActive}
              disabled={!canSet || isToggling}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm transition ${
                designInfo.active
                  ? 'border-red-600 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'border-green-600 bg-green-500/10 text-green-400 hover:bg-green-500/20'
              } disabled:opacity-50`}
            >
              {isToggling ? 'Updating...' : designInfo.active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {editingDesign && swag1155 && (
        <AdminProductEditModal
          designAddress={swag1155}
          chainId={chainId}
          onClose={() => setEditingDesign(false)}
          onSuccess={() => {
            setEditingDesign(false);
            refetchDesign();
          }}
        />
      )}
    </div>
  );
}
