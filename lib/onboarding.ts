import { UserProfile, Project } from '@/src/types/projecthunt';

export const LS_KEYS = {
  profile: 'ph.profile',
  project: 'ph.project',
} as const;

type StoredProfile = Pick<UserProfile, 'name' | 'location' | 'about'>;
type StoredProject = Pick<Project, 'title' | 'teaser' | 'categories' | 'status'>;

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const p = localStorage.getItem(LS_KEYS.profile);
    const pr = localStorage.getItem(LS_KEYS.project);
    if (!p || !pr) return false;
    const profile: StoredProfile = JSON.parse(p);
    const project: StoredProject = JSON.parse(pr);
    return Boolean(profile?.name && project?.title);
  } catch {
    return false;
  }
}

export function saveOnboardingData(profile: StoredProfile, project: StoredProject): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEYS.profile, JSON.stringify(profile ?? {}));
  localStorage.setItem(LS_KEYS.project, JSON.stringify(project ?? {}));
}
