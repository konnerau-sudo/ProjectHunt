import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface LikedProject {
  id: string;
  title: string;
  teaser: string;
  categories: string[];
  status: string;
  owner_id: string;
  owner: {
    name: string;
  };
  liked_at: string;
}

export interface LikesResponse {
  items: LikedProject[];
}

export function useLikes() {
  const [likedProjects, setLikedProjects] = useState<LikedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const loadLikes = async (limit = 20, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/likes?limit=${limit}&offset=${offset}`, {
        credentials: 'same-origin'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthRequired(true);
          return;
        }
        
        let errorData: any = null;
        try { 
          errorData = await response.json(); 
        } catch {
          errorData = { raw: await response.text() };
        }
        
        throw new Error(errorData.error || errorData.message || 'Failed to load likes');
      }

      const data: LikesResponse = await response.json();
      setLikedProjects(data.items || []);
      
    } catch (err: any) {
      console.error('Error loading likes:', err);
      setError(err.message || 'Failed to load likes');
      toast.error('Fehler beim Laden der Merkliste');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLikes();
  }, []);

  return {
    likedProjects,
    loading,
    error,
    authRequired,
    refetch: () => loadLikes(),
    loadMore: (offset: number) => loadLikes(20, offset)
  };
}
