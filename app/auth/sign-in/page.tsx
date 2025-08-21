'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { checkOnboardingStatus, getPostLoginRedirect } from '@/lib/checkOnboardingStatus';

type SignInForm = {
  email: string;
  password: string;
  remember: boolean;
};

export default function SignIn(): JSX.Element {
  const router = useRouter();
  const [form, setForm] = useState<SignInForm>({ 
    email: '', 
    password: '', 
    remember: true 
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showMagicLink, setShowMagicLink] = useState<boolean>(false);
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);

  // Check if user is already logged in and redirect appropriately
  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      try {
        const { hasProfile, user } = await checkOnboardingStatus();
        if (user) {
          const redirectTo = getPostLoginRedirect(hasProfile);
          router.push(redirectTo);
        }
      } catch (err) {
        console.error('Error checking user:', err);
      }
    };

    checkUser();
  }, [router]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Check onboarding status and redirect appropriately
          const { hasProfile } = await checkOnboardingStatus();
          const redirectTo = getPostLoginRedirect(hasProfile);
          router.push(redirectTo);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, type, checked, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handlePasswordSignIn = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    if (form.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes('Invalid login credentials')) {
          setError('E-Mail oder Passwort ist falsch.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Bitte bestätige zuerst deine E-Mail-Adresse.');
        } else {
          setError(error.message);
        }
      } else if (data?.session) {
        // Successfully signed in - check onboarding status
        const { hasProfile } = await checkOnboardingStatus();
        const redirectTo = getPostLoginRedirect(hasProfile);
        router.push(redirectTo);
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
      console.error('Password sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) {
      setError('Bitte gib eine E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: form.email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setMagicLinkSent(true);
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
      console.error('Magic link error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Magic Link sent success screen
  if (magicLinkSent && showMagicLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center">
              <div className="text-4xl mb-4">📧</div>
              <CardTitle className="text-2xl font-bold">Check deine E-Mail!</CardTitle>
              <CardDescription>
                Wir haben dir einen Magic Link an <strong>{form.email}</strong> gesendet.
                Klicke auf den Link in der E-Mail, um dich anzumelden.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMagicLinkSent(false);
                  setShowMagicLink(false);
                  setForm(prev => ({ ...prev, email: '' }));
                }}
              >
                Andere E-Mail verwenden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
        
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">Anmelden</CardTitle>
            <CardDescription className="text-center">
              {showMagicLink 
                ? 'Wir senden dir einen Magic Link zum Einloggen.'
                : 'Melde dich mit deinen Zugangsdaten an.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showMagicLink ? (
              // Standard Password Login Form
              <form onSubmit={handlePasswordSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="deine@email.de"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mindestens 6 Zeichen"
                      value={form.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="h-12 pr-12"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    name="remember"
                    checked={form.remember}
                    onCheckedChange={(checked) => 
                      setForm(prev => ({ ...prev, remember: !!checked }))
                    }
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                    Eingeloggt bleiben
                  </Label>
                </div>
                
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base" 
                  disabled={loading}
                >
                  {loading ? 'Anmelden...' : 'Anmelden'}
                </Button>
              </form>
            ) : (
              // Magic Link Form
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magicEmail">E-Mail-Adresse</Label>
                  <Input
                    id="magicEmail"
                    name="email"
                    type="email"
                    placeholder="deine@email.de"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                    disabled={loading}
                  />
                </div>
                
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  variant="secondary"
                  className="w-full h-12 text-base" 
                  disabled={loading}
                >
                  {loading ? 'Wird gesendet...' : 'Magic Link senden'}
                </Button>
              </form>
            )}
            
            {/* Navigation Links */}
            <div className="mt-6 space-y-3 text-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex justify-between items-center">
                <Link 
                  href="/auth/reset-password" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Passwort vergessen?
                </Link>
                <Link 
                  href="/auth/sign-up" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Noch kein Konto? Jetzt registrieren
                </Link>
              </div>
            </div>

            {/* Magic Link Toggle */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowMagicLink(!showMagicLink);
                  setError('');
                  setMagicLinkSent(false);
                }}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline transition-colors"
              >
                {showMagicLink ? 'Zurück zum Passwort-Login' : 'Lieber per Magic Link?'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}