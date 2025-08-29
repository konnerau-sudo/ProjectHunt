import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface ChatItem {
  match_id: string;
  other_user_id: string;
  other_user_name: string;
  last_message_content: string;
  last_message_timestamp: string;
  unread_count: number;
  project_title: string;
}

export interface ChatsResponse {
  items: ChatItem[];
}

export function useChats() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const loadChats = async (limit = 20, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/chats?limit=${limit}&offset=${offset}`, {
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
        
        throw new Error(errorData.error || errorData.message || 'Failed to load chats');
      }

      const data: ChatsResponse = await response.json();
      setChats(data.items || []);
      
    } catch (err: any) {
      console.error('Error loading chats:', err);
      setError(err.message || 'Failed to load chats');
      toast.error('Fehler beim Laden der Chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  return {
    chats,
    loading,
    error,
    authRequired,
    refetch: () => loadChats(),
    loadMore: (offset: number) => loadChats(20, offset)
  };
}
