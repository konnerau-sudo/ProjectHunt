'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, X, User } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Project } from '@/types/projecthunt';

// Types for UI
interface ProjectCard extends Project {
  owner: {
    name: string;
    avatarUrl?: string;
  };
}

// Mock data (fallback)
const mockProjects: ProjectCard[] = [
  {
    id: '1',
    title: 'EcoTracker App',
    teaser: 'Eine mobile App, die dabei hilft, den persönlichen CO2-Fußabdruck zu verfolgen und nachhaltige Gewohnheiten zu entwickeln. Mit gamifizierten Elementen und Community-Features.',
    categories: ['Mobile App', 'Nachhaltigkeit', 'React Native'],
    status: 'suche_hilfe' as const,
    owner: {
      name: 'Sarah Weber',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  },
  {
    id: '2',
    title: 'AI Code Review Bot',
    teaser: 'Ein intelligenter Bot, der automatisch Code-Reviews durchführt und Verbesserungsvorschläge macht. Integriert sich nahtlos in GitHub und GitLab.',
    categories: ['AI/ML', 'DevTools', 'Python'],
    status: 'offen' as const,
    owner: {
      name: 'Max Müller',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  },
  {
    id: '3',
    title: 'Local Food Network',
    teaser: 'Eine Plattform, die lokale Produzenten mit Verbrauchern verbindet. Frische Lebensmittel direkt vom Bauernhof, ohne Zwischenhändler.',
    categories: ['E-Commerce', 'Lokale Wirtschaft', 'Next.js'],
    status: 'biete_hilfe' as const,
    owner: {
      name: 'Anna Schmidt',
      avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  }
];

const icebreakers = [
  'Was war der Auslöser für eure Idee?',
  'Wo sucht ihr aktuell die größte Unterstützung?',
  'Welche Tech-Entscheidung war bisher die härteste?'
];

const getCollabBadgeVariant = (status: string) => {
  switch (status) {
    case 'suche_hilfe':
      return 'destructive';
    case 'biete_hilfe':
      return 'default';
    case 'offen':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const getCollabText = (status: string) => {
  switch (status) {
    case 'suche_hilfe':
      return 'Suche Hilfe';
    case 'biete_hilfe':
      return 'Biete Hilfe';
    case 'offen':
      return 'Offen';
    default:
      return status;
  }
};

export default function Discover(): JSX.Element {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<ProjectCard | null>(null);

  // Load projects from Supabase
  useEffect(() => {
    const loadProjects = async (): Promise<void> => {
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          // Fallback to mock data if auth fails
          setProjects(mockProjects);
          setLoading(false);
          return;
        }

        // Fetch projects (excluding user's own projects)
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, title, teaser, categories, status, owner_id')
          .neq('owner_id', user?.id || '')
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Projects error:', projectsError);
          setProjects(mockProjects);
          setLoading(false);
          return;
        }

        if (!projectsData || projectsData.length === 0) {
          setProjects([]);
          setLoading(false);
          return;
        }

        // Get unique owner IDs
        const ownerIds = [...new Set(projectsData.map(p => p.owner_id))];

        // Fetch owner profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', ownerIds);

        if (profilesError) {
          console.error('Profiles error:', profilesError);
        }

        // Create profiles map
        const profilesMap = new Map<string, string>();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.id, profile.name || 'Unbekannt');
        });

        // Transform data to ProjectCard format
        const transformedProjects: ProjectCard[] = projectsData.map(project => ({
          id: project.id,
          title: project.title,
          teaser: project.teaser,
          categories: project.categories || [],
          status: project.status,
          owner_id: project.owner_id,
          owner: {
            name: profilesMap.get(project.owner_id) || 'Unbekannt'
          }
        }));

        setProjects(transformedProjects);
        setLoading(false);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects(mockProjects);
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const currentCard = projects[0];

  const handleSkip = (): void => {
    setProjects(prev => prev.slice(1));
  };

  const handleLike = (): void => {
    setCurrentProject(currentCard);
    setShowDialog(true);
  };

  const handleIcebreakerChoice = (icebreaker?: string): void => {
    // In a real app, this would send the icebreaker message
    console.log('Icebreaker sent:', icebreaker || 'Just liked');
    setShowDialog(false);
    setCurrentProject(null);
    setProjects(prev => prev.slice(1));
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center py-16">
            <div className="text-4xl mb-6">⏳</div>
            <h2 className="text-2xl font-bold mb-4">Lade Projekte...</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Einen Moment bitte, wir suchen die neuesten Projekte für dich.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!currentCard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Alles durchgeswiped!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Du hast alle verfügbaren Projekte gesehen. Schau später wieder vorbei!
            </p>
            <Button asChild variant="outline">
              <Link href="/profile">Zurück zum Profil</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Projects</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Swipe through amazing projects
          </p>
        </div>

        {/* Project Card */}
        <Card className="rounded-2xl shadow-lg mb-8 overflow-hidden">
          <CardContent className="p-6 flex flex-col space-y-4">
            {/* Project Name */}
            <h2 className="text-2xl font-bold leading-tight">{currentCard.title}</h2>
            
            {/* Teaser */}
            <p className="text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
              {currentCard.teaser}
            </p>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {currentCard.categories.map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
            
            {/* Collaboration Badge */}
            <div className="flex justify-start">
              <Badge variant={getCollabBadgeVariant(currentCard.status)} className="text-xs">
                {getCollabText(currentCard.status)}
              </Badge>
            </div>
            
            {/* Owner */}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentCard.owner.avatarUrl} alt={currentCard.owner.name} />
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {currentCard.owner.name}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSkip}
            className="rounded-full w-16 h-16 p-0 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <X className="w-6 h-6 text-gray-500" />
          </Button>
          <Button
            size="lg"
            onClick={handleLike}
            className="rounded-full w-16 h-16 p-0 bg-green-500 hover:bg-green-600 border-2 border-green-500"
          >
            <Heart className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Icebreaker Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                Send an Icebreaker?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-4">
              {icebreakers.map((icebreaker, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left h-auto p-4 whitespace-normal"
                  onClick={() => handleIcebreakerChoice(icebreaker)}
                >
                  {icebreaker}
                </Button>
              ))}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleIcebreakerChoice()}
              >
                Nur liken
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}