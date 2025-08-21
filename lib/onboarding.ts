export const LS_KEYS = {
  profile: 'ph.profile',
  project: 'ph.project',
} as const;

type Profile = { name?: string; location?: string; about?: string };
type Project = { title?: string; teaser?: string; categories?: string[]; collab?: 'offen'|'suche_hilfe'|'biete_hilfe' };

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const p = localStorage.getItem(LS_KEYS.profile);
    const pr = localStorage.getItem(LS_KEYS.project);
    if (!p || !pr) return false;
    const profile: Profile = JSON.parse(p);
    const project: Project = JSON.parse(pr);
    return Boolean(profile?.name && project?.title);
  } catch {
    return false;
  }
}

export function saveOnboardingData(profile: Profile, project: Project) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEYS.profile, JSON.stringify(profile ?? {}));
  localStorage.setItem(LS_KEYS.project, JSON.stringify(project ?? {}));
}
