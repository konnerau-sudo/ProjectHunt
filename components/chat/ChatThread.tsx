'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MoreVertical, 
  User,
  Archive,
  Flag,
  UserCircle,
  Circle
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { MessagesVirtualList } from './MessagesVirtualList';
import { Composer } from './Composer';
import { Conversation } from './ConversationsList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Message as DBMessage } from '@/types/projecthunt';

// Local message type for the UI component
interface UIMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  deliveryStatus: 'sending' | 'sent' | 'delivered' | 'read';
  isRead: boolean;
}



interface ChatThreadProps {
  conversation: Conversation;
  onBack: () => void;
}

export function ChatThread({ conversation, onBack }: ChatThreadProps) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUserId = '1'; // Mock current user ID - In production würde das aus dem Auth-Context kommen

  // Konvertiert Datenbank-Messages zu UI-Messages
  const convertDBMessageToUIMessage = (dbMessage: DBMessage): UIMessage => ({
    id: dbMessage.id!,
    senderId: dbMessage.sender_id,
    content: dbMessage.content,
    timestamp: new Date(dbMessage.created_at!),
    deliveryStatus: 'read', // In einer echten App würde man das aus der DB holen
    isRead: true
  });

  // Nachrichten laden beim Komponenten-Mount
  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mock typing simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(Math.random() > 0.8);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages?matchId=${conversation.id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Laden der Nachrichten');
      }

      const data = await response.json();
      const uiMessages = (data.messages || []).map(convertDBMessageToUIMessage);
      setMessages(uiMessages);
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Laden der Nachrichten');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (isSending || content.trim().length === 0) return;

    try {
      setIsSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: conversation.id,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Senden der Nachricht');
      }

      const data = await response.json();
      
      // Neue Nachricht zu den bestehenden hinzufügen
      const newUIMessage = convertDBMessageToUIMessage(data.message);
      setMessages(prev => [...prev, newUIMessage]);
      toast.success('Nachricht gesendet!');
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden der Nachricht');
    } finally {
      setIsSending(false);
    }
  };

  // Keyboard support for back navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const handleArchive = () => {
    toast.success('Gespräch archiviert');
    onBack();
  };

  const handleReport = () => {
    toast.success('Gespräch gemeldet');
  };

  const handleViewProfile = () => {
    toast.info('Profil-Ansicht kommt bald');
  };

  const { participant } = conversation;

  return (
    <div className="flex flex-col h-dvh md:h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Back Button - Only visible on mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="md:hidden min-w-[44px] min-h-[44px] p-2 flex-shrink-0"
              aria-label="Zurück"
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onBack();
                }
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              {participant.isOnline && (
                <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-500 text-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {participant.name}
              </h2>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {participant.project}
                </p>
                {participant.isOnline && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    Online
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Weitere Aktionen"
                  className="p-2 min-w-[44px] min-h-[44px]"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewProfile}>
                  <UserCircle className="w-4 h-4 mr-2" />
                  Profil ansehen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archivieren
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport} className="text-red-600">
                  <Flag className="w-4 h-4 mr-2" />
                  Melden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div 
        id="messages-scroll" 
        className="flex-1 overflow-y-auto overscroll-contain"
        ref={scrollRef}
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Nachrichten werden geladen...</p>
            </div>
          </div>
        ) : (
          <MessagesVirtualList
            messages={messages}
            currentUserId={currentUserId}
            participant={participant}
            isTyping={isTyping}
          />
        )}
      </div>
      
      {/* Composer - Sticky at bottom */}
      <div className="sticky bottom-0 inset-x-0 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60 flex-shrink-0">
        <div className="p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <Composer
            conversationId={conversation.id}
            onSendMessage={sendMessage}
            disabled={isSending}
          />
        </div>
      </div>
    </div>
  );
}
