'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit3 } from 'lucide-react';
import { useUserProfileStore } from '@/lib/userProfileStore';

export function ProfileHeader() {
  const { tempProfile, isEditing, startEditing } = useUserProfileStore();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-24 h-24 sm:w-20 sm:h-20">
              <AvatarImage src={tempProfile.avatarUrl || ''} alt={tempProfile.name} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Dein Profil
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Verwalte deine Informationen und zeige deine Projekte
            </p>
            
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {tempProfile.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                @{tempProfile.username}
              </p>
              {tempProfile.location && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  📍 {tempProfile.location}
                </p>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <Button
              onClick={startEditing}
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Profil bearbeiten"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Bearbeiten</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
