'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, X, AlertCircle } from 'lucide-react';
import { useUserProfileStore } from '@/lib/userProfileStore';
import { toast } from 'sonner';

export function ProfileActions() {
  const { 
    hasChanges, 
    isEditing, 
    saveProfile, 
    cancelChanges,
    tempProfile 
  } = useUserProfileStore();

  const handleSave = () => {
    // Basic validation
    if (!tempProfile.name.trim()) {
      toast.error('Name ist erforderlich');
      return;
    }

    if (!tempProfile.username.trim()) {
      toast.error('Benutzername ist erforderlich');
      return;
    }

    if (tempProfile.bio.length > 280) {
      toast.error('Bio ist zu lang (max. 280 Zeichen)');
      return;
    }

    try {
      saveProfile();
      toast.success('Änderungen erfolgreich gespeichert!', {
        description: 'Dein Profil wurde aktualisiert.',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Fehler beim Speichern', {
        description: 'Bitte versuche es erneut.',
      });
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'Möchtest du wirklich abbrechen? Alle nicht gespeicherten Änderungen gehen verloren.'
      );
      if (!confirmed) return;
    }

    cancelChanges();
    toast.info('Änderungen wurden verworfen');
  };

  if (!isEditing && !hasChanges) {
    return null;
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-orange-900 dark:text-orange-100">
                Ungespeicherte Änderungen
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Du hast Änderungen vorgenommen, die noch nicht gespeichert wurden.
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 sm:flex-none border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-100 hover:bg-orange-100 dark:hover:bg-orange-900"
            >
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
