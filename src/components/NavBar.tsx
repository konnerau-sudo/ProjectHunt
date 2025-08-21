'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Compass, MessageCircle, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import SignOutButton from '@/components/auth/SignOutButton';

const navItems = [
  {
    name: 'Discover',
    href: '/discover',
    icon: Compass,
  },
  {
    name: 'Chats',
    href: '/chats',
    icon: MessageCircle,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 safe-area-pb">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <LogOut className="w-4 h-4" />
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}