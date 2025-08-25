'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload, Camera } from 'lucide-react';
import { useUserProfileStore } from '@/lib/userProfileStore';
import { toast } from 'sonner';

export function AccountSection() {
  const { 
    tempProfile, 
    isEditing, 
    updateTempProfile, 
    uploadAvatar 
  } = useUserProfileStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wähle eine Bilddatei aus');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bild ist zu groß (max. 5MB)');
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast.success('Avatar erfolgreich geändert');
    } catch (error) {
      toast.error('Fehler beim Hochladen des Avatars');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Account
        </CardTitle>
        <CardDescription>
          Grundlegende Informationen zu deinem Profil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="space-y-2">
          <Label htmlFor="avatar">Profilbild</Label>
          <div className="flex items-center gap-4">
            <div 
              className={`relative ${isEditing ? 'cursor-pointer group' : ''}`}
              onClick={handleAvatarClick}
            >
              <Avatar className="w-16 h-16">
                <AvatarImage src={tempProfile.avatarUrl || ''} alt={tempProfile.name} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            {isEditing && (
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Wird hochgeladen...' : 'Bild ändern'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Avatar-Datei auswählen"
                />
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          {isEditing ? (
            <Input
              id="name"
              value={tempProfile.name}
              onChange={(e) => updateTempProfile({ name: e.target.value })}
              placeholder="Dein vollständiger Name"
              required
              aria-describedby="name-description"
            />
          ) : (
            <p className="text-sm text-gray-900 dark:text-gray-100 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              {tempProfile.name}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Benutzername *</Label>
          {isEditing ? (
            <Input
              id="username"
              value={tempProfile.username}
              onChange={(e) => updateTempProfile({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              placeholder="benutzername"
              required
              aria-describedby="username-description"
            />
          ) : (
            <p className="text-sm text-gray-900 dark:text-gray-100 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              @{tempProfile.username}
            </p>
          )}
          <p id="username-description" className="text-xs text-gray-500">
            Nur Kleinbuchstaben, Zahlen und Unterstriche erlaubt
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <p className="text-sm text-gray-900 dark:text-gray-100 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            {tempProfile.email}
          </p>
          <p className="text-xs text-gray-500">
            E-Mail kann derzeit nicht geändert werden
          </p>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Standort</Label>
          {isEditing ? (
            <Input
              id="location"
              value={tempProfile.location}
              onChange={(e) => updateTempProfile({ location: e.target.value })}
              placeholder="Stadt, Land"
              aria-describedby="location-description"
            />
          ) : (
            <p className="text-sm text-gray-900 dark:text-gray-100 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              {tempProfile.location || 'Kein Standort angegeben'}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                id="bio"
                value={tempProfile.bio}
                onChange={(e) => updateTempProfile({ bio: e.target.value })}
                placeholder="Erzähle etwas über dich..."
                rows={4}
                maxLength={280}
                aria-describedby="bio-counter"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Optional</span>
                <span id="bio-counter">{tempProfile.bio.length}/280 Zeichen</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-900 dark:text-gray-100 p-3 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[80px] whitespace-pre-wrap">
              {tempProfile.bio || 'Keine Bio hinzugefügt'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
