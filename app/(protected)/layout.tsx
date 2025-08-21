import NavBar from '@/src/components/NavBar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="pb-20">
        {children}
      </main>
      <NavBar />
    </div>
  );
}