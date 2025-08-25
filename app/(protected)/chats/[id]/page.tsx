'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Mock data for static generation
const mockMatches = [
  { id: '1' },
  { id: '2' },
  { id: '3' }
];

export async function generateStaticParams() {
  return mockMatches.map((match) => ({
    id: match.id,
  }));
}

export default function ChatDetail({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main chat page with the conversation selected
    // The main chat page will handle the selection through URL state or other mechanism
    router.replace(`/chats?conversation=${params.id}`);
  }, [params.id, router]);

  // Loading state while redirecting
  return (
    <div className="h-[calc(100vh-5rem)] flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Chat wird geladen...</p>
      </div>
    </div>
  );
}