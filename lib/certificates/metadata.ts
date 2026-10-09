/**
 * The ERC-721 metadata a certificate's tokenURI points at — the same shape as
 * the Buildathon's 29 tokens, so a collection page reads them as one set.
 *
 * Builders carry Builder + Project; the team carries Contributor + Role and no
 * Project. Prizes become Prize traits. `image` and `properties.pdf` are
 * ipfs:// so the token never depends on a gateway.
 */
import { CERT_ROLES, achievementEn, credentialUrl, honorLabel, type CertEvent, type CertRole, type Honor } from './events';

export interface MetadataInput {
  role: CertRole;
  memberName: string;
  projectName: string | null;
  credentialId: string;
  honors: Honor[];
  imageCid: string;
  pdfCid: string;
}

export function certificateMetadata(c: MetadataInput, ev: CertEvent) {
  const role = CERT_ROLES[c.role];
  const builder = c.role === 'builder' && c.projectName;
  const verify = credentialUrl(c.credentialId);
  const what = builder ? c.projectName : role.label.en;
  const eventDate = Math.floor(Date.parse(`${ev.startsOn}T00:00:00Z`) / 1000);
  return {
    name: `${c.memberName} — ${what} · ${ev.headline}`,
    description:
      `${achievementEn({ role: c.role, memberName: c.memberName, projectName: c.projectName }, ev)}` +
      ` (${ev.title}), ${ev.location}, ${ev.eventDates}. Soulbound certificate issued by ETH Cali.` +
      ` Credential ${c.credentialId}. Verify: ${verify}`,
    image: `ipfs://${c.imageCid}`,
    external_url: verify,
    attributes: [
      builder ? { trait_type: 'Builder', value: c.memberName } : { trait_type: 'Contributor', value: c.memberName },
      ...(builder ? [{ trait_type: 'Project', value: c.projectName as string }] : []),
      { trait_type: 'Role', value: role.label.en },
      { trait_type: 'Event', value: ev.eventName },
      { trait_type: 'Issuer', value: 'ETH Cali' },
      ...c.honors.map((h) => ({ trait_type: 'Prize', value: honorLabel(h, 'en') })),
      { trait_type: 'Credential ID', value: c.credentialId },
      { display_type: 'date', trait_type: 'Event date', value: eventDate },
      { trait_type: 'Blockchain', value: 'Ethereum Mainnet' },
    ],
    properties: {
      credential_id: c.credentialId,
      role: c.role,
      pdf: `ipfs://${c.pdfCid}`,
      verify_url: verify,
    },
  };
}
