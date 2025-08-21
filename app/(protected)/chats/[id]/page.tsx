import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Mock data for static generation
const mockMatches = [
  { id: '1' },
  { id: '2' }
];

export async function generateStaticParams() {
  return mockMatches.map((match) => ({
    id: match.id,
  }));
}

export default function ChatDetail({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/chats">← Back to Chats</Link>
          </Button>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Chat Detail</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Chat #{params.id} (soon...)
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Individual chat conversations will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}