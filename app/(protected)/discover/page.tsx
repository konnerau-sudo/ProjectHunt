'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, X, User } from 'lucide-react';
import Link from 'next/link';

// Mock data
const mockProjects = [
  {
    id: '1',
    name: 'EcoTracker App',
    teaser: 'Eine mobile App, die dabei hilft, den persönlichen CO2-Fußabdruck zu verfolgen und nachhaltige Gewohnheiten zu entwickeln. Mit gamifizierten Elementen und Community-Features.',
    categories: ['Mobile App', 'Nachhaltigkeit', 'React Native'],
    collab: 'suche_hilfe' as const,
    owner: {
      name: 'Sarah Weber',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  },
  {
    id: '2',
    name: 'AI Code Review Bot',
    teaser: 'Ein intelligenter Bot, der automatisch Code-Reviews durchführt und Verbesserungsvorschläge macht. Integriert sich nahtlos in GitHub und GitLab.',
    categories: ['AI/ML', 'DevTools', 'Python'],
    collab: 'offen' as const,
    owner: {
      name: 'Max Müller',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  },
  {
    id: '3',
    name: 'Local Food Network',
    teaser: 'Eine Plattform, die lokale Produzenten mit Verbrauchern verbindet. Frische Lebensmittel direkt vom Bauernhof, ohne Zwischenhändler.',
    categories: ['E-Commerce', 'Lokale Wirtschaft', 'Next.js'],
    collab: 'biete_hilfe' as const,
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

const getCollabBadgeVariant = (collab: string) => {
  switch (collab) {
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

const getCollabText = (collab: string) => {
  switch (collab) {
    case 'suche_hilfe':
      return 'Suche Hilfe';
    case 'biete_hilfe':
      return 'Biete Hilfe';
    case 'offen':
      return 'Offen';
    default:
      return collab;
  }
};

export default function Discover() {
  const [projects, setProjects] = useState(mockProjects);
  const [showDialog, setShowDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState<typeof mockProjects[0] | null>(null);

  const currentCard = projects[0];

  const handleSkip = () => {
    setProjects(prev => prev.slice(1));
  };

  const handleLike = () => {
    setCurrentProject(currentCard);
    setShowDialog(true);
  };

  const handleIcebreakerChoice = (icebreaker?: string) => {
    // In a real app, this would send the icebreaker message
    console.log('Icebreaker sent:', icebreaker || 'Just liked');
    setShowDialog(false);
    setCurrentProject(null);
    setProjects(prev => prev.slice(1));
  };

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
            <h2 className="text-2xl font-bold leading-tight">{currentCard.name}</h2>
            
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
              <Badge variant={getCollabBadgeVariant(currentCard.collab)} className="text-xs">
                {getCollabText(currentCard.collab)}
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