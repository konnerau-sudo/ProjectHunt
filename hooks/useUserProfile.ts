'use client';

import { useEffect } from 'react';
import { useUserProfileStore } from '@/lib/userProfileStore';

/**
 * Custom hook that provides a convenient interface to the user profile store
 * Automatically initializes the profile data from onboarding and auth
 */
export function useUserProfile() {
  const store = useUserProfileStore();
  
  // Initialize data on mount
  useEffect(() => {
    store.initializeFromStorage();
  }, [store.initializeFromStorage]);

  return {
    // Profile data
    profile: store.profile,
    tempProfile: store.tempProfile,
    
    // UI state
    isEditing: store.isEditing,
    hasChanges: store.hasChanges,
    
    // Profile management
    startEditing: store.startEditing,
    updateProfile: store.updateTempProfile,
    saveProfile: store.saveProfile,
    cancelChanges: store.cancelChanges,
    
    // Skills management
    addSkill: store.addSkill,
    removeSkill: store.removeSkill,
    
    // Projects management
    addProject: store.addProject,
    updateProject: store.updateProject,
    removeProject: store.removeProject,
    
    // Avatar management
    uploadAvatar: store.uploadAvatar,
    
    // Onboarding integration
    getOnboardingProfile: store.getOnboardingProfile,
    getOnboardingProject: store.getOnboardingProject,
    saveToOnboarding: store.saveToOnboarding,
  };
}

