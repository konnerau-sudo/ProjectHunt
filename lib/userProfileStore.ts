'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LS_KEYS } from './onboarding';

export interface Skill {
  id: string;
  name: string;
}

export interface UserProject {
  id: string;
  title: string;
  description: string;
  categories: string[];
  status: 'offen' | 'in_arbeit' | 'abgeschlossen';
  teaser?: string;
}

export interface UserProfileData {
  // Basic Info
  name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  
  // Avatar
  avatarUrl: string | null;
  profileImage: File | null;
  profileImagePreview: string | null;
  
  // Extended Profile
  skills: Skill[];
  projects: UserProject[];
  
  // Onboarding specific
  about: string; // Used in onboarding, maps to bio
}

interface UserProfileStore {
  // Main profile data
  profile: UserProfileData;
  tempProfile: UserProfileData;
  
  // UI State
  isEditing: boolean;
  hasChanges: boolean;
  
  // Profile management
  updateTempProfile: (updates: Partial<UserProfileData>) => void;
  saveProfile: () => void;
  cancelChanges: () => void;
  startEditing: () => void;
  
  // Skills management
  addSkill: (skill: string) => void;
  removeSkill: (skillId: string) => void;
  
  // Projects management
  addProject: (project: Omit<UserProject, 'id'>) => void;
  updateProject: (projectId: string, updates: Partial<UserProject>) => void;
  removeProject: (projectId: string) => void;
  
  // Avatar management
  uploadAvatar: (file: File) => Promise<string>;
  
  // Onboarding integration
  loadFromOnboarding: () => void;
  saveToOnboarding: () => void;
  getOnboardingProfile: () => { name: string; location: string; about: string };
  getOnboardingProject: () => { title: string; teaser: string; categories: string[]; status: string };
  
  // Initialize from localStorage
  initializeFromStorage: () => void;
  
  // Load user email from auth
  loadUserEmail: () => Promise<void>;
}

// Create initial empty profile
const createEmptyProfile = (): UserProfileData => ({
  name: '',
  username: '',
  email: '',
  bio: '',
  location: '',
  avatarUrl: null,
  profileImage: null,
  profileImagePreview: null,
  skills: [],
  projects: [],
  about: '', // For onboarding compatibility
});

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      profile: createEmptyProfile(),
      tempProfile: createEmptyProfile(),
      isEditing: false,
      hasChanges: false,

      updateTempProfile: (updates) => {
        set((state) => {
          const newTempProfile = { ...state.tempProfile, ...updates };
          return {
            tempProfile: newTempProfile,
            hasChanges: JSON.stringify(newTempProfile) !== JSON.stringify(state.profile)
          };
        });
      },

      saveProfile: () => {
        set((state) => {
          const newProfile = { ...state.tempProfile };
          // Sync bio and about
          newProfile.about = newProfile.bio;
          
          return {
            profile: newProfile,
            hasChanges: false,
            isEditing: false
          };
        });
        
        // Save to onboarding storage as well
        get().saveToOnboarding();
      },

      cancelChanges: () => {
        set((state) => ({
          tempProfile: { ...state.profile },
          hasChanges: false,
          isEditing: false
        }));
      },

      startEditing: () => {
        set({ isEditing: true });
      },

      addSkill: (skillName) => {
        const newSkill: Skill = {
          id: Date.now().toString(),
          name: skillName
        };
        set((state) => {
          const newSkills = [...state.tempProfile.skills, newSkill];
          const newTempProfile = { ...state.tempProfile, skills: newSkills };
          return {
            tempProfile: newTempProfile,
            hasChanges: JSON.stringify(newTempProfile) !== JSON.stringify(state.profile)
          };
        });
      },

      removeSkill: (skillId) => {
        set((state) => {
          const newSkills = state.tempProfile.skills.filter(skill => skill.id !== skillId);
          const newTempProfile = { ...state.tempProfile, skills: newSkills };
          return {
            tempProfile: newTempProfile,
            hasChanges: JSON.stringify(newTempProfile) !== JSON.stringify(state.profile)
          };
        });
      },

      addProject: (projectData) => {
        const newProject: UserProject = {
          ...projectData,
          id: Date.now().toString(),
          description: projectData.description || projectData.teaser || ''
        };
        set((state) => {
          const newProjects = [...state.tempProfile.projects, newProject];
          const newTempProfile = { ...state.tempProfile, projects: newProjects };
          return {
            tempProfile: newTempProfile,
            hasChanges: JSON.stringify(newTempProfile) !== JSON.stringify(state.profile)
          };
        });
      },

      updateProject: (projectId, updates) => {
        set((state) => {
          const newProjects = state.tempProfile.projects.map(project =>
            project.id === projectId ? { ...project, ...updates } : project
          );
          const newTempProfile = { ...state.tempProfile, projects: newProjects };
          return {
            tempProfile: newTempProfile,
            hasChanges: JSON.stringify(newTempProfile) !== JSON.stringify(state.profile)
          };
        });
      },

      removeProject: (projectId) => {
        set((state) => {
          const newProjects = state.tempProfile.projects.filter(project => project.id !== projectId);
          const newTempProfile = { ...state.tempProfile, projects: newProjects };
          return {
            tempProfile: newTempProfile,
            hasChanges: JSON.stringify(newTempProfile) !== JSON.stringify(state.profile)
          };
        });
      },

      uploadAvatar: async (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            get().updateTempProfile({ 
              avatarUrl: dataUrl,
              profileImage: file,
              profileImagePreview: dataUrl
            });
            resolve(dataUrl);
          };
          reader.readAsDataURL(file);
        });
      },

      loadFromOnboarding: () => {
        if (typeof window === 'undefined') return;
        
        try {
          // Load from onboarding localStorage
          const profileData = localStorage.getItem(LS_KEYS.profile);
          const projectData = localStorage.getItem(LS_KEYS.project);
          
          if (profileData || projectData) {
            const profile = profileData ? JSON.parse(profileData) : {};
            const project = projectData ? JSON.parse(projectData) : {};
            
            set((state) => {
              // Generate username from name if not present
              const generateUsername = (name: string) => {
                return name
                  .toLowerCase()
                  .replace(/[^a-z0-9\s]/g, '')
                  .replace(/\s+/g, '_')
                  .substring(0, 20);
              };

              const updatedProfile: UserProfileData = {
                ...state.profile,
                name: profile.name || '',
                username: state.profile.username || (profile.name ? generateUsername(profile.name) : ''),
                location: profile.location || '',
                bio: profile.about || '',
                about: profile.about || '',
              };
              
              // Convert onboarding project to user project format
              if (project.title) {
                const existingProject = updatedProfile.projects.find(p => p.title === project.title);
                if (!existingProject) {
                  const newProject: UserProject = {
                    id: Date.now().toString(),
                    title: project.title,
                    description: project.teaser || '',
                    teaser: project.teaser,
                    categories: project.categories || [],
                    status: project.status || 'offen'
                  };
                  updatedProfile.projects = [...updatedProfile.projects, newProject];
                }
              }
              
              return {
                profile: updatedProfile,
                tempProfile: { ...updatedProfile }
              };
            });
          }
        } catch (error) {
          console.error('Error loading from onboarding data:', error);
        }
      },

      saveToOnboarding: () => {
        if (typeof window === 'undefined') return;
        
        const { profile } = get();
        
        // Save profile data to onboarding format
        const onboardingProfile = {
          name: profile.name,
          location: profile.location,
          about: profile.bio
        };
        
        // Save first project to onboarding format (if exists)
        const firstProject = profile.projects[0];
        const onboardingProject = firstProject ? {
          title: firstProject.title,
          teaser: firstProject.description,
          categories: firstProject.categories,
          status: firstProject.status
        } : {};
        
        localStorage.setItem(LS_KEYS.profile, JSON.stringify(onboardingProfile));
        localStorage.setItem(LS_KEYS.project, JSON.stringify(onboardingProject));
      },

      getOnboardingProfile: () => {
        const { profile } = get();
        return {
          name: profile.name,
          location: profile.location,
          about: profile.bio
        };
      },

      getOnboardingProject: () => {
        const { profile } = get();
        const firstProject = profile.projects[0];
        return firstProject ? {
          title: firstProject.title,
          teaser: firstProject.description,
          categories: firstProject.categories,
          status: firstProject.status
        } : {
          title: '',
          teaser: '',
          categories: [],
          status: 'offen'
        };
      },

      initializeFromStorage: () => {
        get().loadFromOnboarding();
        get().loadUserEmail();
      },

      loadUserEmail: async () => {
        try {
          // Import supabase dynamically to avoid SSR issues
          const { supabase } = await import('@/lib/supabaseClient');
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user?.email) {
            set((state) => ({
              profile: { ...state.profile, email: user.email || '' },
              tempProfile: { ...state.tempProfile, email: user.email || '' }
            }));
          }
        } catch (error) {
          console.error('Error loading user email:', error);
        }
      }
    }),
    {
      name: 'user-profile-store',
      partialize: (state) => ({ 
        profile: state.profile 
      })
    }
  )
);
