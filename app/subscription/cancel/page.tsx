'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  // Tracking Event (vorbereitet)
  useEffect(() => {
    // TODO: Implement tracking
    console.log('Track: checkout_cancel');
  }, []);

  const handleBackToDiscover = () => {
    router.push('/discover');
  };

  const handleTryAgain = () => {
    router.push('/after-swipe');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8 px-4 pb-[env(safe-area-inset-bottom)]">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Checkout abgebrochen
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            Kein Problem! Du kannst jederzeit zurückkommen.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Deine kostenlosen Swipes sind weiterhin verfügbar. 
              Für unlimitierte Swipes kannst du das Abo jederzeit aktivieren.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleTryAgain}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              size="lg"
              aria-label="Erneut versuchen - Zurück zum Subscription-Angebot"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Erneut versuchen
            </Button>
            
            <Button 
              onClick={handleBackToDiscover}
              variant="outline"
              className="w-full h-12"
              size="lg"
              aria-label="Zurück zu Discover - Weiter mit kostenlosen Swipes"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zu Discover
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Du hast Fragen? Kontaktiere uns jederzeit über den Support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

