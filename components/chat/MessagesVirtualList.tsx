'use client';

import { forwardRef, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Check, CheckCheck, Clock, User } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  deliveryStatus: 'sending' | 'sent' | 'delivered' | 'read';
  isRead: boolean;
}

interface Participant {
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  project: string;
}

interface MessagesVirtualListProps {
  messages: Message[];
  currentUserId: string;
  participant: Participant;
  isTyping: boolean;
}

export const MessagesVirtualList = forwardRef<HTMLDivElement, MessagesVirtualListProps>(
  ({ messages, currentUserId, participant, isTyping }, _ref) => {
    // Group messages by day
    const groupedMessages = useMemo(() => {
      const groups: { date: string; messages: Message[] }[] = [];
      
      messages.forEach((message) => {
        const dateKey = message.timestamp.toDateString();
        const existingGroup = groups.find(group => group.date === dateKey);
        
        if (existingGroup) {
          existingGroup.messages.push(message);
        } else {
          groups.push({ date: dateKey, messages: [message] });
        }
      });
      
      return groups;
    }, [messages]);

    return (
      <div 
        className="p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat-Nachrichten"
      >
        {/* Welcome message for new conversations */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Schreibt euch zum ersten Mal!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs">
              Schreibe die erste Nachricht, um die Unterhaltung zu starten.
            </p>
          </div>
        )}

        {/* Message groups by day */}
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <DayDivider date={new Date(group.date)} />
            <div className="space-y-2 mt-4">
              {group.messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const prevMessage = index > 0 ? group.messages[index - 1] : null;
                const nextMessage = index < group.messages.length - 1 ? group.messages[index + 1] : null;
                
                // Group consecutive messages from same sender
                const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;
                const showName = !prevMessage || prevMessage.senderId !== message.senderId;
                
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    participant={participant}
                    showAvatar={showAvatar}
                    showName={showName && !isOwn}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <TypingIndicator participant={participant} />
        )}
      </div>
    );
  }
);

MessagesVirtualList.displayName = 'MessagesVirtualList';

interface DayDividerProps {
  date: Date;
}

function DayDivider({ date }: DayDividerProps) {
  const isToday = new Date().toDateString() === date.toDateString();
  const isYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
  
  let displayText: string;
  
  if (isToday) {
    displayText = 'Heute';
  } else if (isYesterday) {
    displayText = 'Gestern';
  } else {
    displayText = date.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }

  return (
    <div className="flex items-center my-6" role="separator" aria-label={`Nachrichten vom ${displayText}`}>
      <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
      <span 
        className="inline-flex h-7 px-3 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium leading-none"
        aria-label={displayText}
      >
        {displayText}
      </span>
      <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  participant: Participant;
  showAvatar: boolean;
  showName: boolean;
}

function MessageBubble({ message, isOwn, participant, showAvatar, showName }: MessageBubbleProps) {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className={cn("flex items-end space-x-2", isOwn && "flex-row-reverse space-x-reverse")}
      role="article"
      aria-label={`Nachricht von ${isOwn ? 'dir' : participant.name} um ${formatTime(message.timestamp)}`}
    >
      {/* Avatar */}
      <div className="w-8 h-8 flex-shrink-0">
        {showAvatar && !isOwn && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={participant.avatarUrl} alt={participant.name} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message content */}
      <div className={cn("flex flex-col max-w-[75%]", isOwn && "items-end")}>
        {showName && (
          <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-1">
            {participant.name}
          </span>
        )}
        
        <div
          className={cn(
            "relative px-4 py-2 rounded-2xl break-words",
            isOwn 
              ? "bg-blue-500 text-white rounded-br-sm" 
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Message info */}
          <div className={cn(
            "flex items-center space-x-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}>
            <span className={cn(
              "text-xs",
              isOwn ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
            )}>
              {formatTime(message.timestamp)}
            </span>
            
            {isOwn && (
              <DeliveryStatusIcon status={message.deliveryStatus} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeliveryStatusIconProps {
  status: Message['deliveryStatus'];
}

function DeliveryStatusIcon({ status }: DeliveryStatusIconProps) {
  const iconClass = "w-3 h-3 text-blue-100";
  
  switch (status) {
    case 'sending':
      return <Clock className={iconClass} />;
    case 'sent':
      return <Check className={iconClass} />;
    case 'delivered':
      return <CheckCheck className={iconClass} />;
    case 'read':
      return <CheckCheck className="w-3 h-3 text-green-300" />;
    default:
      return null;
  }
}

interface TypingIndicatorProps {
  participant: Participant;
}

function TypingIndicator({ participant }: TypingIndicatorProps) {
  return (
    <div className="flex items-end space-x-2" role="status" aria-label={`${participant.name} schreibt`}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={participant.avatarUrl} alt={participant.name} />
        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs">
          <User className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
      
      <span className="sr-only">{participant.name} schreibt gerade</span>
    </div>
  );
}
