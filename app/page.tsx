import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🚀 ProjectHunt
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Discover amazing projects, connect with creators, and showcase your own work 
              to a community that celebrates innovation and creativity.
            </p>
          </div>
          
          <div className="pt-4">
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
              <Link href="/auth/sign-in">
                Get Started
              </Link>
            </Button>
          </div>
          
          <div className="pt-8 text-sm text-gray-500 dark:text-gray-400">
            Join thousands of creators sharing their projects
          </div>
        </div>
      </div>
    </div>
  );
}