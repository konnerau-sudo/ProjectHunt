import { supabase } from '@/lib/supabaseClient';

/**
 * Checks if the current user has completed onboarding
 * by verifying if their profile exists in the database
 */
export async function checkOnboardingStatus(): Promise<{
  hasProfile: boolean;
  user: any;
  error?: string;
}> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { hasProfile: false, user: null, error: 'Not authenticated' };
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      // If error is "PGRST116" (no rows), user hasn't completed onboarding
      if (profileError.code === 'PGRST116') {
        return { hasProfile: false, user };
      }
      return { hasProfile: false, user, error: profileError.message };
    }

    // Profile exists and has a name (minimum onboarding requirement)
    const hasValidProfile = profile && profile.name && profile.name.trim().length > 0;
    
    return { hasProfile: hasValidProfile, user };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return { hasProfile: false, user: null, error: 'Unknown error' };
  }
}

/**
 * Determines where to redirect user after successful login
 */
export function getPostLoginRedirect(hasProfile: boolean): string {
  return hasProfile ? '/discover' : '/onboarding';
}
