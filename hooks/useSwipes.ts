'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { 
  FeedProject, 
  SwipeRequest, 
  SwipeResponse, 
  SwipeStats,
  SwipeError 
} from '@/types/swipes';

interface UseSwipesReturn {
  // State
  projects: FeedProject[];
  isLoading: boolean;
  error: string | null;
  swipeStats: SwipeStats | null;
  
  // Actions
  swipeProject: (projectId: string, direction: 'like' | 'skip') => Promise<void>;
  loadMoreProjects: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  
  // Computed
  hasMoreProjects: boolean;
  currentProject: FeedProject | null;
}

export function useSwipes(): UseSwipesReturn {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [projects, setProjects] = useState<FeedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeStats, setSwipeStats] = useState<SwipeStats | null>(null);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    hasMore: true
  });

  // Load initial feed
  const loadFeed = useCallback(async (offset = 0, append = false) => {
    try {
      if (!append) setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/feed?limit=${pagination.limit}&offset=${offset}`);
      
      // Handle authentication error - let OnboardingGate handle routing
      if (response.status === 401) {
        console.warn('User not authenticated - OnboardingGate will handle routing');
        setError('Authentication required');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load feed: ${response.status}`);
      }

      const data = await response.json();
      
      // New API structure: { items: [...] }
      const projects = data.items || [];
      
      if (append) {
        setProjects(prev => [...prev, ...projects]);
      } else {
        setProjects(projects);
      }

      setPagination(prev => ({
        ...prev,
        offset: offset + projects.length,
        hasMore: projects.length === pagination.limit // Simple hasMore logic
      }));

    } catch (err: any) {
      console.error('Feed load error:', err);
      setError(err.message || 'Failed to load projects');
      
      // Show error toast for non-auth errors
      if (!err.message?.includes('Authentication required')) {
        toast({
          title: "Fehler beim Laden",
          description: "Projekte konnten nicht geladen werden.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, router, toast]);

  // Load swipe statistics
  const loadSwipeStats = useCallback(async () => {
    try {
      const response = await fetch('/api/swipes');
      
      // Handle authentication error (non-critical for stats)
      if (response.status === 401) {
        console.warn('Stats load error (unauthenticated) - non-critical');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load stats: ${response.status}`);
      }

      const json = await response.json();
      // New API structure: { today, allTime, remainingToday }
      setSwipeStats({
        todaySwipes: json.today || 0,
        allTime: json.allTime || 0,
        remainingSwipes: json.remainingToday || 0,
        maxDailySwipes: 10, // Keep existing structure
        limitReached: (json.remainingToday || 0) <= 0
      });

    } catch (err: any) {
      console.warn('Stats load error (non-critical):', err);
      // Don't set error state for stats - it's non-critical
    }
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([
      loadFeed(0, false),
      loadSwipeStats()
    ]);
  }, [loadFeed, loadSwipeStats]);

  // Swipe a project
  const swipeProject = useCallback(async (projectId: string, direction: 'like' | 'skip') => {
    try {
      // Optimistic UI: Remove project immediately
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Update swipe count optimistically
      setSwipeStats(prev => prev ? {
        ...prev,
        todaySwipes: prev.todaySwipes + 1,
        remainingSwipes: Math.max(0, prev.remainingSwipes - 1),
        limitReached: prev.remainingSwipes <= 1
      } : null);

      const swipeRequest: SwipeRequest = { projectId, direction };
      
      const response = await fetch('/api/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swipeRequest)
      });

      // Handle authentication error - let OnboardingGate handle routing  
      if (response.status === 401) {
        console.warn('User not authenticated during swipe - OnboardingGate will handle routing');
        throw new Error('Authentication required');
      }

      const data = await response.json();

      if (!response.ok) {        
        // Handle specific error cases
        if (response.status === 409 && data.error === 'ALREADY_SWIPED') {
          // Project already swiped - ignore silently (optimistic UI was correct)
          return;
        }
        
        if (response.status === 429 && data.error === 'LIMIT') {
          // Daily limit reached - redirect to upsell
          router.push('/after-swipe');
          return;
        }
        
        throw new Error(data.error || 'Swipe failed');
      }

      // Successful swipe - refresh stats to get accurate data
      await loadSwipeStats();

      // Track swipe event (für Analytics)
      console.log('Swipe tracked:', {
        projectId,
        direction,
        success: true
      });

    } catch (err: any) {
      console.error('Swipe error:', err);
      
      // Rollback optimistic update for non-auth errors
      if (!err.message?.includes('Authentication required')) {
        await refreshFeed();
        
        toast({
          title: "Swipe fehlgeschlagen",
          description: "Bitte versuchen Sie es erneut.",
          variant: "destructive"
        });
      }
    }
  }, [router, toast, loadSwipeStats]);

  // Load more projects (pagination)
  const loadMoreProjects = useCallback(async () => {
    if (!pagination.hasMore || isLoading) return;
    
    await loadFeed(pagination.offset, true);
  }, [loadFeed, pagination.hasMore, pagination.offset, isLoading]);

  // Refresh entire feed
  const refreshFeed = useCallback(async () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    await Promise.all([
      loadFeed(0, false),
      loadSwipeStats()
    ]);
  }, [loadFeed, loadSwipeStats]);

  return {
    // State
    projects,
    isLoading,
    error,
    swipeStats,
    
    // Actions
    swipeProject,
    loadMoreProjects,
    refreshFeed,
    
    // Computed
    hasMoreProjects: pagination.hasMore,
    currentProject: projects[0] || null
  };
}

