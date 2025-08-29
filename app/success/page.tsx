'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown für automatische Weiterleitung
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/discover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleContinue = () => {
    router.push('/discover');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8 px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Erfolgreich abonniert! 🎉
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Vielen Dank für dein Abonnement! Du hast jetzt Zugang zu:
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>✅ Unlimitierte Swipes</li>
              <li>✅ Alle verfügbaren Projekte</li>
              <li>✅ Direkter Kontakt zu Projektpartnern</li>
            </ul>
          </div>

          {sessionId && (
            <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              Session ID: {sessionId.slice(0, 20)}...
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Weiter zu Discover
            </Button>
            
            <p className="text-sm text-gray-500">
              Automatische Weiterleitung in {countdown} Sekunden...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Lade...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

