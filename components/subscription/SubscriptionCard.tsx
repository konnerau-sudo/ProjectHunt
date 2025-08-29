'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Stripe konfigurieren
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  priceId: string;
  popular?: boolean;
  features: string[];
  buttonText: string;
}

interface SubscriptionCardProps {
  userSubscriptionStatus?: 'active' | 'inactive' | 'canceled';
  onBack?: () => void; // Nur für active subscription Status verwendet
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monatlich',
    price: '4,99 €',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
    buttonText: 'Monatlich abonnieren',
    features: [
      'Unlimitierte Swipes',
      'Alle verfügbaren Projekte',
      'Direkter Kontakt zu Partnern',
      'Jederzeit kündbar'
    ]
  },
  {
    id: 'yearly',
    name: 'Jährlich',
    price: '39,99 €',
    originalPrice: '59,88 €',
    discount: '–30%',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly_placeholder',
    buttonText: 'Jährlich abonnieren',
    popular: true,
    features: [
      'Unlimitierte Swipes',
      'Alle verfügbaren Projekte', 
      'Direkter Kontakt zu Partnern',
      '30% Ersparnis gegenüber monatlich',
      'Prioritärer Support'
    ]
  }
];

export default function SubscriptionCard({ userSubscriptionStatus = 'inactive', onBack }: SubscriptionCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Stripe ENV Check
  const isStripeConfigured = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY &&
    process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY
  );

  // Tracking Events (vorbereitet)
  const trackEvent = (event: string, data?: Record<string, any>) => {
    // TODO: Implement tracking
    console.log('Track:', event, data);
  };

  const handleCheckout = async (priceId: string, planId: string) => {
    if (!isStripeConfigured) {
      toast({
        title: "Konfigurationsfehler",
        description: "Stripe ist noch nicht konfiguriert. Bitte später erneut versuchen.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(planId);
      trackEvent('upsell_click', { plan: planId });

      // Checkout Session erstellen
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Checkout Session konnte nicht erstellt werden');
      }

      const { sessionId } = await response.json();

      if (!sessionId) {
        throw new Error('Keine Session ID erhalten');
      }

      // Stripe Checkout öffnen
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe konnte nicht geladen werden');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe Checkout Error:', error);
        throw new Error(error.message || 'Checkout konnte nicht gestartet werden');
      }

    } catch (error: any) {
      console.error('Subscription error:', error);
      trackEvent('checkout_error', { plan: planId, error: error?.message || 'Unknown error' });
      
      toast({
        title: "Checkout nicht möglich",
        description: "Bitte später erneut versuchen.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  // Wenn User bereits aktives Abo hat
  if (userSubscriptionStatus === 'active') {
    return (
      <div className="container mx-auto px-4 py-8 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Du hast unlimitierte Swipes aktiviert!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Entdecke noch mehr spannende Projekte ohne Limits.
            </p>
            <Button 
              onClick={onBack}
              className="w-full"
              size="lg"
              aria-label="Zurück zu Discover"
            >
              Zurück zu Discover
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Deine Swipes sind aufgebraucht 🚫
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hol dir unlimitierte Swipes und entdecke noch mehr spannende Projekte 🚀
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20 shadow-blue-100 dark:shadow-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1 shadow-sm">
                    Beliebt
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {plan.price}
                  </span>
                  {plan.originalPrice && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm text-gray-500 line-through">
                        {plan.originalPrice}
                      </span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {plan.discount}
                      </span>
                    </div>
                  )}
                </div>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.id === 'monthly' ? 'pro Monat' : 'pro Jahr'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(plan.priceId, plan.id)}
                  disabled={loading !== null || !isStripeConfigured}
                  className={`w-full h-12 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600'
                  }`}
                  size="lg"
                  aria-label={`${plan.buttonText} für ${plan.price}`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Lädt...
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Text */}
        <div className="text-center space-y-4">
          {!isStripeConfigured && (
            <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-md">
              Stripe noch nicht konfiguriert – Testmodus aktiv
            </p>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Jederzeit kündbar. Testmodus.
          </p>
        </div>
      </div>
    </div>
  );
}
