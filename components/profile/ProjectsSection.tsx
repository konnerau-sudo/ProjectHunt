'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, FolderPlus, Folder } from 'lucide-react';
import { useUserProfileStore, type UserProject } from '@/lib/userProfileStore';
import { toast } from 'sonner';
import { CATEGORIES } from '@/types/projecthunt';

interface ProjectFormData {
  title: string;
  description: string;
  categories: string[];
  status: UserProject['status'];
}

const initialFormData: ProjectFormData = {
  title: '',
  description: '',
  categories: [],
  status: 'offen'
};

export function ProjectsSection() {
  const { 
    tempProfile, 
    isEditing, 
    addProject, 
    updateProject, 
    removeProject 
  } = useUserProfileStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<UserProject | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

  const handleOpenDialog = (project?: UserProject) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        categories: project.categories,
        status: project.status
      });
    } else {
      setEditingProject(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    setFormData(initialFormData);
  };

  const handleSaveProject = () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Bitte gib einen Projekttitel ein');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Bitte gib eine Projektbeschreibung ein');
      return;
    }

    if (formData.categories.length === 0) {
      toast.error('Bitte wähle mindestens eine Kategorie');
      return;
    }

    if (editingProject) {
      // Update existing project
      updateProject(editingProject.id, formData);
      toast.success('Projekt erfolgreich aktualisiert');
    } else {
      // Add new project
      addProject(formData);
      toast.success('Projekt erfolgreich hinzugefügt');
    }

    handleCloseDialog();
  };

  const handleDeleteProject = (projectId: string, projectTitle: string) => {
    if (window.confirm(`Möchtest du "${projectTitle}" wirklich löschen?`)) {
      removeProject(projectId);
      toast.success('Projekt gelöscht');
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const getStatusColor = (status: UserProject['status']) => {
    switch (status) {
      case 'offen': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_arbeit': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'abgeschlossen': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: UserProject['status']) => {
    switch (status) {
      case 'offen': return 'Offen';
      case 'in_arbeit': return 'In Arbeit';
      case 'abgeschlossen': return 'Abgeschlossen';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Projekte
        </CardTitle>
        <CardDescription>
          Zeige deine aktuellen und abgeschlossenen Projekte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Projects List */}
        {tempProfile.projects.length > 0 ? (
          <div className="space-y-4">
            {tempProfile.projects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {project.title}
                    </h3>
                    <Badge className={`mt-1 ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  {isEditing && (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(project)}
                        aria-label={`${project.title} bearbeiten`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        className="text-red-600 hover:text-red-700"
                        aria-label={`${project.title} löschen`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {project.description}
                </p>

                {project.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.categories.map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FolderPlus className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-sm mb-2">Noch keine Projekte hinzugefügt</p>
            <p className="text-xs">
              {isEditing 
                ? 'Füge dein erstes Projekt hinzu!' 
                : 'Bearbeite dein Profil, um Projekte hinzuzufügen'
              }
            </p>
          </div>
        )}

        {/* Add Project Button */}
        {isEditing && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Projekt hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Projekt bearbeiten' : 'Neues Projekt'}
                </DialogTitle>
                <DialogDescription>
                  {editingProject 
                    ? 'Bearbeite die Details deines Projekts'
                    : 'Füge ein neues Projekt zu deinem Profil hinzu'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="project-title">Titel *</Label>
                  <Input
                    id="project-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Mein tolles Projekt"
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="project-description">Beschreibung *</Label>
                  <Textarea
                    id="project-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beschreibe dein Projekt..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/500 Zeichen
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: UserProject['status']) => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offen">Offen für Mitarbeiter</SelectItem>
                      <SelectItem value="in_arbeit">In Arbeit</SelectItem>
                      <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label>Kategorien * (mindestens eine)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {CATEGORIES.map((category) => (
                      <Button
                        key={category}
                        type="button"
                        variant={formData.categories.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryToggle(category)}
                        className="justify-start text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.categories.length} Kategorie(n) ausgewählt
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Abbrechen
                </Button>
                <Button type="button" onClick={handleSaveProject}>
                  {editingProject ? 'Speichern' : 'Hinzufügen'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
