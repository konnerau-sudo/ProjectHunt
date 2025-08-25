'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Send, Paperclip, Smile } from 'lucide-react';
import { toast } from 'sonner';

interface ComposerProps {
  conversationId: string;
  onSendMessage: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const STORAGE_KEY_PREFIX = 'chat_draft_';
const MAX_LENGTH = 2000;

export function Composer({ 
  conversationId, 
  onSendMessage, 
  placeholder = "Nachricht eingeben...",
  maxLength = MAX_LENGTH 
}: ComposerProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draftKey = `${STORAGE_KEY_PREFIX}${conversationId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setMessage(savedDraft);
    }
  }, [conversationId]);

  // Save draft to localStorage when message changes
  useEffect(() => {
    const draftKey = `${STORAGE_KEY_PREFIX}${conversationId}`;
    if (message.trim()) {
      localStorage.setItem(draftKey, message);
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [message, conversationId]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || isSending) return;
    
    if (trimmedMessage.length > maxLength) {
      toast.error(`Nachricht ist zu lang (max. ${maxLength} Zeichen)`);
      return;
    }

    setIsSending(true);
    
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      
      // Clear draft from localStorage
      const draftKey = `${STORAGE_KEY_PREFIX}${conversationId}`;
      localStorage.removeItem(draftKey);
      
      // Focus textarea again
      textareaRef.current?.focus();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Nachricht konnte nicht gesendet werden');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachment = () => {
    toast.info('Anhänge sind noch nicht verfügbar');
  };

  const handleEmoji = () => {
    toast.info('Emoji-Picker kommt bald');
  };

  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars <= 100;
  const canSend = message.trim().length > 0 && !isSending && remainingChars >= 0;

  return (
    <div className="p-2 bg-transparent">
      <div className="flex items-end space-x-2">
        {/* Attachment Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAttachment}
          className="p-2 flex-shrink-0"
          aria-label="Datei anhängen"
          disabled={isSending}
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative flex items-center">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSending}
            className={cn(
              "w-full min-h-[44px] max-h-[120px] resize-none rounded-2xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 py-3 px-4 text-base leading-none",
              isNearLimit && "border-orange-300 focus:ring-orange-500"
            )}
            rows={1}
            maxLength={maxLength}
            aria-label="Nachricht eingeben"
            aria-describedby={isNearLimit ? "char-counter" : undefined}
          />
          
          {/* Character Counter */}
          {isNearLimit && (
            <div 
              id="char-counter"
              className={cn(
                "absolute -top-6 right-0 text-xs",
                remainingChars < 0 ? "text-red-500" : "text-orange-500"
              )}
              aria-live="polite"
            >
              {remainingChars >= 0 ? `${remainingChars} übrig` : `${Math.abs(remainingChars)} zu viel`}
            </div>
          )}

          {/* Emoji Button (inside textarea) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleEmoji}
            className="absolute bottom-1 right-1 p-1.5 h-auto"
            aria-label="Emoji hinzufügen"
            disabled={isSending}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "p-2 flex-shrink-0 transition-all duration-200",
            canSend 
              ? "bg-blue-500 hover:bg-blue-600 text-white" 
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
          aria-label="Nachricht senden"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>
          Enter zum Senden, Shift+Enter für neue Zeile
        </span>
        {message.length > 0 && !isNearLimit && (
          <span>
            {message.length}/{maxLength} Zeichen
          </span>
        )}
      </div>
    </div>
  );
}
