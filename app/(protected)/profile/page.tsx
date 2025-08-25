'use client';

import React from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AccountSection } from '@/components/profile/AccountSection';
import { ProjectsSection } from '@/components/profile/ProjectsSection';
import { ProfileActions } from '@/components/profile/ProfileActions';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function Profile() {
  const { isEditing, hasChanges } = useUserProfile();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <ProfileHeader />

          {/* Action Buttons */}
          {(isEditing || hasChanges) && <ProfileActions />}

          {/* Profile Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <AccountSection />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ProjectsSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}