'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { checkOnboardingStatus, getPostLoginRedirect } from '@/lib/checkOnboardingStatus';

export default function SignUp(): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    acceptTerms: false
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Check if user is already logged in
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

  const handleInputChange = (field: string, value: string | boolean): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Bitte gib deinen Namen ein.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Bitte gib eine E-Mail-Adresse ein.');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: { 
            name: formData.name.trim(), 
            location: formData.location.trim() || null 
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user && data.session) {
        // User is immediately authenticated (email confirmation disabled)
        try {
          // Bootstrap profile immediately
          await fetch('/api/auth/bootstrap-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name.trim(),
              location: formData.location.trim() || null
            })
          });
        } catch (bootstrapError) {
          console.error('Profile bootstrap error:', bootstrapError);
          // Continue anyway - profile will be created in onboarding
        }
        
        // After successful registration, always go to onboarding
        router.push('/onboarding');
      } else {
        // Email confirmation required
        setSuccess(true);
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center">
              <div className="text-4xl mb-4">✅</div>
              <CardTitle className="text-2xl font-bold">Bestätige deine E-Mail!</CardTitle>
              <CardDescription>
                Wir haben dir eine Bestätigungs-E-Mail an <strong>{formData.email}</strong> gesendet.
                Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                Nach der Bestätigung geht's direkt mit dem Onboarding weiter! 🚀
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/sign-in">
                  Zur Anmeldung
                </Link>
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
            <CardTitle className="text-2xl font-bold text-center">🚀 Account erstellen</CardTitle>
            <CardDescription className="text-center">
              Erstelle deinen ProjectHunt Account und starte durch!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dein vollständiger Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="deine@email.de"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 6 Zeichen"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  minLength={6}
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Standort (optional)</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Stadt, Land"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                  Ich akzeptiere die AGB und Datenschutzerklärung
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
                {loading ? 'Account wird erstellt...' : 'Account erstellen'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Schon ein Konto?{' '}
              <Link href="/auth/sign-in" className="text-blue-600 dark:text-blue-400 hover:underline">
                Jetzt anmelden
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
