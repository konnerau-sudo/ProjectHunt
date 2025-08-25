'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { ChatThread } from '@/components/chat/ChatThread';
import { cn } from '@/lib/utils';

// Mock data for conversations
const mockConversations = [
  {
    id: '1',
    participant: {
      name: 'Sarah Weber',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isOnline: true,
      project: 'EcoTracker App'
    },
    lastMessage: {
      content: 'Hey! Dein EcoTracker Projekt klingt super spannend. Wie kann ich helfen?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
      isRead: false,
      senderId: '2'
    },
    unreadCount: 2,
    isPinned: false
  },
  {
    id: '2',
    participant: {
      name: 'Max Müller',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isOnline: false,
      project: 'AI Code Review Bot'
    },
    lastMessage: {
      content: 'Danke für das Like! Lass uns über die AI Integration sprechen.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true,
      senderId: '1'
    },
    unreadCount: 0,
    isPinned: true
  },
  {
    id: '3',
    participant: {
      name: 'Anna Schmidt',
      avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isOnline: true,
      project: 'Local Food Network'
    },
    lastMessage: {
      content: 'Perfekt! Ich schicke dir morgen das Design-Mockup.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true,
      senderId: '1'
    },
    unreadCount: 0,
    isPinned: false
  },
  {
    id: '4',
    participant: {
      name: 'Tom Fischer',
      avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isOnline: false,
      project: 'Fitness Buddy App'
    },
    lastMessage: {
      content: 'Super! Wann können wir das erste Meeting machen?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      isRead: true,
      senderId: '2'
    },
    unreadCount: 0,
    isPinned: false
  },
  {
    id: '5',
    participant: {
      name: 'Lisa Bauer',
      avatarUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isOnline: true,
      project: 'Smart Home Dashboard'
    },
    lastMessage: {
      content: 'Ich hätte noch eine Idee für das Backend...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      isRead: true,
      senderId: '1'
    },
    unreadCount: 0,
    isPinned: false
  }
];

export default function Chats() {
  const searchParams = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  // Handle URL parameter for initial conversation selection
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && mockConversations.find(conv => conv.id === conversationParam)) {
      setSelectedConversationId(conversationParam);
    }
  }, [searchParams]);
  
  const selectedConversation = mockConversations.find(conv => conv.id === selectedConversationId);
  const showThread = selectedConversationId && selectedConversation;

  return (
    <div className="h-[calc(100vh-5rem)] flex bg-white dark:bg-gray-900">
      {/* Conversations List - Hidden on mobile when thread is open */}
      <div className={cn(
        "w-full md:w-96 md:border-r border-gray-200 dark:border-gray-700 flex-shrink-0",
        showThread && isMobile && "hidden"
      )}>
        <ConversationsList
          conversations={mockConversations}
          selectedId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />
      </div>

      {/* Chat Thread - Takes full width on mobile, right side on desktop */}
      <div className={cn(
        "flex-1 flex flex-col",
        !showThread && "hidden md:flex"
      )}>
        {showThread ? (
          <ChatThread
            conversation={selectedConversation}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          // Empty state for desktop
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center max-w-sm mx-auto px-4">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Wähle eine Konversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Starte ein Gespräch mit anderen Projekt-Mitwirkenden aus der Liste links.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}