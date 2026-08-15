/**
 * Lets the user add other people's usernames to compare stats against,
 * without needing accounts for them. Stored locally per-device, same as
 * everything else in this app.
 */

const STORAGE_KEY = 'codetrack_compare_profiles';

export interface CompareProfile {
  id: string;
  label: string;
  leetcode?: string;
  github?: string;
  codeforces?: string;
}

export function getCompareProfiles(): CompareProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCompareProfiles(profiles: CompareProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Storage unavailable — nothing more we can do client-side.
  }
}

export function addCompareProfile(profile: Omit<CompareProfile, 'id'>): CompareProfile {
  const newProfile: CompareProfile = { ...profile, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  const profiles = getCompareProfiles();
  writeCompareProfiles([...profiles, newProfile]);
  return newProfile;
}

export function removeCompareProfile(id: string) {
  const profiles = getCompareProfiles();
  writeCompareProfiles(profiles.filter((p) => p.id !== id));
}
