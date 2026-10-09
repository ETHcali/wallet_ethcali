/** The team master list: ethcali.org's public profile, and the private contact beside it. */

/** team_members — published on ethcali.org's about page. */
export interface TeamProfile {
  id: number;
  slug: string;
  name: string;
  role_es: string | null;
  role_en: string | null;
  status: string | null;
  since: string | null;
  image_path: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  sort_order: number;
  is_published: boolean;
}

/** team_member_contacts — service role only, never on the site. */
export interface TeamContact {
  email: string | null;
  emails: string[];
  telegram: string | null;
  wallet: string | null;
}

export interface TeamMasterMember {
  profile: TeamProfile;
  contact: TeamContact | null;
}

export interface TeamMasterResponse {
  team: TeamMasterMember[];
}

/** POST creates (profile.slug and profile.name required); PUT updates `id`. Either part may be omitted on PUT. */
export interface TeamSaveBody {
  id?: number;
  profile?: Partial<Omit<TeamProfile, 'id'>>;
  contact?: Partial<TeamContact>;
}

export interface TeamSaveResponse {
  member: TeamMasterMember;
}
