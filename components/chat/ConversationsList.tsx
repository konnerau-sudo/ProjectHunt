'use client';

import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Pin, 
  Archive, 
  MoreVertical,
  User,
  Circle,
  MessageCircle,
  Users
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  participant: {
    name: string;
    avatarUrl?: string;
    isOnline: boolean;
    project: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isArchived?: boolean;
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
}

type FilterType = 'all' | 'unread' | 'archived';

export function ConversationsList({ 
  conversations, 
  selectedId, 
  onSelectConversation 
}: ConversationsListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Filter logic
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Apply filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'archived':
        filtered = filtered.filter(conv => conv.isArchived);
        break;
      default:
        filtered = filtered.filter(conv => !conv.isArchived);
    }

    // Sort: pinned first, then by timestamp
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
    });
  }, [conversations, filter]);

  const handlePin = (conversationId: string, isPinned: boolean) => {
    toast.success(isPinned ? 'Gespräch angepinnt' : 'Pin entfernt');
    // In real app: update conversation state
  };

  const handleArchive = (conversationId: string) => {
    toast.success('Gespräch archiviert');
    // In real app: update conversation state
  };

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Chats
            </h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Neuen Chat starten"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          {(['all', 'unread', 'archived'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="text-xs"
            >
              {filterType === 'all' && 'Alle'}
              {filterType === 'unread' && 'Ungelesen'}
              {filterType === 'archived' && 'Archiviert'}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            {filter === 'archived' ? (
              <>
                <Archive className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Keine archivierten Chats
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Archivierte Gespräche erscheinen hier
                </p>
              </>
            ) : (
              <>
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Noch keine Gespräche
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Starte dein erstes Gespräch mit anderen Projekt-Mitwirkenden
                </p>
                <Button size="sm" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Projekte entdecken</span>
                </Button>
              </>
            )}
          </div>
        ) : (
          // Conversations
          <div className="space-y-0">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                onSelect={onSelectConversation}
                onPin={handlePin}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onArchive: (id: string) => void;
}

function ConversationItem({ 
  conversation, 
  isSelected, 
  onSelect, 
  onPin, 
  onArchive 
}: ConversationItemProps) {
  const { participant, lastMessage, unreadCount, isPinned } = conversation;

  return (
    <div
      className={cn(
        "flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative group",
        isSelected && "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500"
      )}
      onClick={() => onSelect(conversation.id)}
      role="button"
      tabIndex={0}
      aria-label={`Gespräch mit ${participant.name} öffnen`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(conversation.id);
        }
      }}
    >
      {/* Avatar with online indicator */}
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={participant.avatarUrl} alt={participant.name} />
          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        {participant.isOnline && (
          <Circle className="absolute -bottom-0.5 -right-0.5 w-4 h-4 fill-green-500 text-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <h3 className={cn(
              "font-semibold text-sm truncate",
              unreadCount > 0 ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-200"
            )}>
              {participant.name}
            </h3>
            {isPinned && <Pin className="w-3 h-3 text-gray-400" />}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatRelativeTime(lastMessage.timestamp)}
            </span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px] h-5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-sm truncate pr-2",
            unreadCount > 0 
              ? "font-medium text-gray-900 dark:text-gray-100" 
              : "text-gray-600 dark:text-gray-400"
          )}>
            {lastMessage.content}
          </p>
          
          {/* Context menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                onClick={(e) => e.stopPropagation()}
                aria-label="Aktionen"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(conversation.id, !isPinned);
                }}
              >
                <Pin className="w-4 h-4 mr-2" />
                {isPinned ? 'Pin entfernen' : 'Anpinnen'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(conversation.id);
                }}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archivieren
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {participant.project}
        </p>
      </div>
    </div>
  );
}
