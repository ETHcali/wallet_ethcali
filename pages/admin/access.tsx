import Head from 'next/head';
import AdminShell from '../../components/admin/AdminShell';
import { AccessManager } from '../../components/admin/AccessManager';

/**
 * Admins and permissions across the whole app, in one place. Each product
 * page carries the same manager scoped to its own contract; this page is the
 * full matrix — every contract, every role, the seed operator check.
 */
export default function AdminAccessPage() {
  return (
    <AdminShell
      active="access"
      title="Admins & access"
      subtitle="Every role on every contract, read from the chain. Add people by email — they sign in with a code and their wallet is created for them — or by wallet."
    >
      <Head>
        <title>Access · Admin · ETH Cali</title>
      </Head>

      <div className="mb-4 rounded-card border border-line-hairline bg-surface-inset/50 p-4 text-xs leading-relaxed text-content-muted">
        <p className="font-semibold text-content-secondary">What each role reaches in the app</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li><span className="text-content-secondary">Site content and artwork</span> (ethcali.org events, team, partners): Admin on DonationVault.</li>
          <li><span className="text-content-secondary">Swag desk</span>: Admin or Fulfilment on the swag collection. Names for the desk are kept on Swag → Team.</li>
          <li><span className="text-content-secondary">Faucet</span>: Admin on FaucetManager. <span className="text-content-secondary">Identity</span>: owner of ZKPassportNFT.</li>
          <li>Super admin on a contract is what lets a wallet add or remove the others there.</li>
        </ul>
      </div>

      <AccessManager />
    </AdminShell>
  );
}
