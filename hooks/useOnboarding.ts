'use client';

import { useState, useEffect } from 'react';
import { useUserProfileStore } from '@/lib/userProfileStore';

export interface OnboardingUserProfile {
  name: string;
  location: string;
  about: string;
  profileImage: File | null;
  profileImagePreview: string | null;
}

export interface OnboardingProject {
  title: string;
  teaser: string;
  categories: string[];
  status: 'offen' | 'in_arbeit' | 'abgeschlossen';
}

/**
 * Hook for managing onboarding data
 * Provides compatibility layer between onboarding UI and user profile store
 */
export function useOnboarding() {
  const store = useUserProfileStore();
  
  // Local state for onboarding steps
  const [userProfile, setUserProfile] = useState<OnboardingUserProfile>({
    name: '',
    location: '',
    about: '',
    profileImage: null,
    profileImagePreview: null,
  });

  const [project, setProject] = useState<OnboardingProject>({
    title: '',
    teaser: '',
    categories: [],
    status: 'offen',
  });

  // Load existing data from store on mount
  useEffect(() => {
    store.loadFromOnboarding();
    
    const profileData = store.getOnboardingProfile();
    const projectData = store.getOnboardingProject();
    
    setUserProfile({
      name: profileData.name,
      location: profileData.location,
      about: profileData.about,
      profileImage: null,
      profileImagePreview: store.profile.profileImagePreview,
    });

    setProject({
      title: projectData.title,
      teaser: projectData.teaser,
      categories: projectData.categories,
      status: projectData.status as 'offen' | 'in_arbeit' | 'abgeschlossen',
    });
  }, [store]);

  const handleProfileChange = (field: keyof OnboardingUserProfile, value: string) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Bild ist zu groß. Maximal 5MB erlaubt.');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Bitte wähle eine Bilddatei aus.');
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setUserProfile(prev => ({
        ...prev,
        profileImage: file,
        profileImagePreview: previewUrl
      }));

      // Upload to store
      store.uploadAvatar(file);
    }
  };

  const removeImage = () => {
    if (userProfile.profileImagePreview) {
      URL.revokeObjectURL(userProfile.profileImagePreview);
    }
    setUserProfile(prev => ({
      ...prev,
      profileImage: null,
      profileImagePreview: null
    }));
    
    // Clear from store
    store.updateTempProfile({ 
      avatarUrl: null, 
      profileImage: null, 
      profileImagePreview: null 
    });
  };

  const handleProjectChange = (field: keyof OnboardingProject, value: string | string[]) => {
    setProject(prev => ({ ...prev, [field]: value }));
  };

  const handleKategorieToggle = (kategorie: string) => {
    setProject(prev => ({
      ...prev,
      categories: prev.categories.includes(kategorie)
        ? prev.categories.filter((k: string) => k !== kategorie)
        : [...prev.categories, kategorie]
    }));
  };

  // Save onboarding data to the user profile store
  const saveOnboardingData = () => {
    // Update profile data
    store.updateTempProfile({
      name: userProfile.name,
      location: userProfile.location,
      bio: userProfile.about,
      about: userProfile.about,
    });

    // Add project if it doesn't exist
    if (project.title) {
      const existingProject = store.tempProfile.projects.find(p => p.title === project.title);
      if (!existingProject) {
        store.addProject({
          title: project.title,
          description: project.teaser,
          teaser: project.teaser,
          categories: project.categories,
          status: project.status,
        });
      }
    }

    // Save everything
    store.saveProfile();
  };

  return {
    // State
    userProfile,
    project,
    
    // Handlers
    handleProfileChange,
    handleImageUpload,
    removeImage,
    handleProjectChange,
    handleKategorieToggle,
    saveOnboardingData,
    
    // Store access for compatibility
    store,
  };
}

