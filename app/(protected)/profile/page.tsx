'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, Project, CATEGORIES } from '@/types/projecthunt';

interface ProfileData extends UserProfile {
  email?: string;
}

interface UserProject extends Project {
  id: string;
}

export default function Profile(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    location: '',
    about: ''
  });
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async (): Promise<void> => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/auth/sign-in');
        return;
      }

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      } else if (profileData) {
        setProfile({
          id: profileData.id,
          name: profileData.name || '',
          location: profileData.location || '',
          about: profileData.about || '',
          email: user.email
        });
      }

      // Load user's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error loading projects:', projectsError);
      } else if (projectsData) {
        setProjects(projectsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleProfileSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            name: profile.name.trim(),
            location: profile.location?.trim() || null,
            about: profile.about?.trim() || null,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('Error saving profile:', error);
        alert('Fehler beim Speichern des Profils.');
      } else {
        setEditMode(false);
        alert('Profil erfolgreich gespeichert!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Fehler beim Speichern des Profils.');
    } finally {
      setSaving(false);
    }
  };

  const handleProjectSave = async (projectId: string): Promise<void> => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: project.title.trim(),
          teaser: project.teaser?.trim() || null,
          categories: project.categories || [],
          status: project.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('Error saving project:', error);
        alert('Fehler beim Speichern des Projekts.');
      } else {
        setEditingProject(null);
        alert('Projekt erfolgreich gespeichert!');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Fehler beim Speichern des Projekts.');
    } finally {
      setSaving(false);
    }
  };

  const handleProjectDelete = async (projectId: string): Promise<void> => {
    if (!confirm('Möchten Sie dieses Projekt wirklich löschen?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        alert('Fehler beim Löschen des Projekts.');
      } else {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        alert('Projekt erfolgreich gelöscht!');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Fehler beim Löschen des Projekts.');
    } finally {
      setSaving(false);
    }
  };

  const updateProject = (projectId: string, field: keyof Project, value: any): void => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, [field]: value } : p
    ));
  };

  const toggleCategory = (projectId: string, category: string): void => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const categories = p.categories || [];
        const newCategories = categories.includes(category)
          ? categories.filter(c => c !== category)
          : [...categories, category];
        return { ...p, categories: newCategories };
      }
      return p;
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-4">Lade Profil...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
                <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-4xl font-bold mb-2">{profile.name || 'Dein Profil'}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {profile.email}
          </p>
        </div>

        {/* Profile Information Card */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Profil-Informationen</CardTitle>
              <CardDescription>
                Deine Grunddaten aus dem Onboarding
              </CardDescription>
            </div>
            <Button
              variant={editMode ? "outline" : "default"}
              onClick={() => editMode ? setEditMode(false) : setEditMode(true)}
              disabled={saving}
            >
              {editMode ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {editMode ? 'Abbrechen' : 'Bearbeiten'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {editMode ? (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Dein vollständiger Name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Standort</Label>
                  <Input
                    id="location"
                    value={profile.location || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Stadt, Land"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="about">Über mich</Label>
                  <Textarea
                    id="about"
                    value={profile.about || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, about: e.target.value }))}
                    placeholder="Erzähle etwas über dich..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                
                <Button onClick={handleProfileSave} disabled={saving} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Speichern...' : 'Profil speichern'}
                </Button>
              </div>
            ) : (
              // View Mode
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</Label>
                  <p className="text-lg">{profile.name || 'Nicht angegeben'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Standort</Label>
                  <p className="text-lg">{profile.location || 'Nicht angegeben'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Über mich</Label>
                  <p className="text-lg whitespace-pre-wrap">{profile.about || 'Nicht angegeben'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Projects Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Meine Projekte</CardTitle>
            <CardDescription>
              Deine Projekte aus dem Onboarding und weitere
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Noch keine Projekte</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Erstelle dein erstes Projekt über das Onboarding oder füge hier ein neues hinzu.
                </p>
                <Button onClick={() => router.push('/onboarding')} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Projekt hinzufügen
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((project) => (
                  <Card key={project.id} className="border">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription>
                          Status: {project.status === 'offen' ? 'Offen' : 
                                   project.status === 'suche_hilfe' ? 'Suche Hilfe' : 'Biete Hilfe'}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProject(editingProject === project.id ? null : project.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProjectDelete(project.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {editingProject === project.id ? (
                        // Edit Project Mode
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`title-${project.id}`}>Projekttitel *</Label>
                            <Input
                              id={`title-${project.id}`}
                              value={project.title}
                              onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`teaser-${project.id}`}>Teaser</Label>
                            <Textarea
                              id={`teaser-${project.id}`}
                              value={project.teaser || ''}
                              onChange={(e) => updateProject(project.id, 'teaser', e.target.value)}
                              placeholder="Kurze Beschreibung deines Projekts..."
                              className="mt-1"
                              maxLength={150}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {(project.teaser || '').length}/150 Zeichen
                            </p>
                          </div>
                          
                          <div>
                            <Label>Kategorien</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {CATEGORIES.map((category) => (
                                <Badge
                                  key={category}
                                  variant={project.categories?.includes(category) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => toggleCategory(project.id, category)}
                                >
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <Label>Status</Label>
                            <div className="flex space-x-2 mt-2">
                              {['offen', 'suche_hilfe', 'biete_hilfe'].map((status) => (
                                <Badge
                                  key={status}
                                  variant={project.status === status ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => updateProject(project.id, 'status', status)}
                                >
                                  {status === 'offen' ? 'Offen' : 
                                   status === 'suche_hilfe' ? 'Suche Hilfe' : 'Biete Hilfe'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleProjectSave(project.id)}
                              disabled={saving}
                              className="flex-1"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {saving ? 'Speichern...' : 'Speichern'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingProject(null)}
                              className="flex-1"
                            >
                              Abbrechen
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Project Mode
                        <div className="space-y-3">
                          {project.teaser && (
                            <p className="text-gray-700 dark:text-gray-300">{project.teaser}</p>
                          )}
                          
                          {project.categories && project.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.categories.map((category, index) => (
                                <Badge key={index} variant="outline">{category}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}