'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Tracking Event (vorbereitet)
  useEffect(() => {
    // TODO: Implement tracking
    console.log('Track: checkout_success', { sessionId });
  }, [sessionId]);

  useEffect(() => {
    // Countdown für automatische Weiterleitung
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleContinue = () => {
    setIsRedirecting(true);
    router.push('/discover');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8 px-4 pb-[env(safe-area-inset-bottom)]">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <div className="text-green-600 dark:text-green-400 text-lg">🎉</div>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            Erfolgreich abonniert!
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            Vielen Dank für dein Vertrauen
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
              Du hast jetzt Zugang zu:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Unlimitierte Swipes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Alle verfügbaren Projekte
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Direkter Kontakt zu Projektpartnern
              </li>
            </ul>
          </div>

          {sessionId && (
            <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-3 rounded border">
              <div className="font-mono break-all">
                Session: {sessionId.slice(0, 8)}...{sessionId.slice(-8)}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              disabled={isRedirecting}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              size="lg"
              aria-label="Weiter zu Discover - Unlimitierte Swipes nutzen"
            >
              {isRedirecting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Weiterleitung...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Jetzt unlimitiert swipen
                </div>
              )}
            </Button>
            
            {countdown > 0 && !isRedirecting && (
              <p className="text-sm text-gray-500">
                Automatische Weiterleitung in {countdown} Sekunden...
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bei Fragen erreichst du uns jederzeit über den Support.
              <br />
              Jederzeit kündbar in deinem Profil.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Lade...</p>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}

