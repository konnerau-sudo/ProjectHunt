'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthCodeError(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
            <CardDescription>
              Es gab ein Problem bei der Anmeldung. Der Magic Link ist möglicherweise abgelaufen oder ungültig.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/sign-in">
                Erneut anmelden
              </Link>
            </Button>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Probleme beim Einloggen?</p>
              <p>Stelle sicher, dass du den neuesten Magic Link verwendest.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
