export const LS_KEYS = { 
  profile: 'ph.profile', 
  project: 'ph.project' 
} as const;

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const profileData = localStorage.getItem(LS_KEYS.profile);
    const projectData = localStorage.getItem(LS_KEYS.project);
    
    if (!profileData || !projectData) return false;
    
    const profile = JSON.parse(profileData);
    const project = JSON.parse(projectData);
    
    // Check minimal required fields
    return !!(profile?.name && project?.title);
  } catch {
    return false;
  }
}

export function saveOnboardingData(profile: any, project: any) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LS_KEYS.profile, JSON.stringify(profile));
    localStorage.setItem(LS_KEYS.project, JSON.stringify(project));
  } catch (error) {
    console.error('Failed to save onboarding data:', error);
  }
}

export function clearOnboardingData() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(LS_KEYS.profile);
    localStorage.removeItem(LS_KEYS.project);
  } catch (error) {
    console.error('Failed to clear onboarding data:', error);
  }
}
