'use client'

import NavBar from '@/src/components/NavBar';
import OnboardingGate from '@/src/components/OnboardingGate';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="pb-20">
        <OnboardingGate>
          {children}
        </OnboardingGate>
      </main>
      <NavBar />
    </div>
  );
}