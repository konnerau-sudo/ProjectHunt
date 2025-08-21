'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MessageCircle, Heart, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Mock data
const mockMatches = [
  {
    id: '1',
    other: {
      name: 'Sarah Weber',
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    lastMessage: 'Hey! Dein EcoTracker Projekt klingt super spannend. Wie kann ich helfen?'
  },
  {
    id: '2',
    other: {
      name: 'Max Müller',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    lastMessage: 'Danke für das Like! Lass uns über die AI Integration sprechen.'
  }
];

const mockMyLikes = [
  {
    id: '1',
    projectName: 'Local Food Network'
  },
  {
    id: '2',
    projectName: 'Fitness Buddy App'
  }
];

const mockReceivedLikes = [
  {
    id: '1',
    projectName: 'EcoTracker App',
    user: {
      name: 'Anna Schmidt',
      avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  },
  {
    id: '2',
    projectName: 'AI Code Review Bot',
    user: {
      name: 'Tom Fischer',
      avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  }
];

export default function Chats() {
  const [matches] = useState(mockMatches);
  const [myLikes] = useState(mockMyLikes);
  const [receivedLikes, setReceivedLikes] = useState(mockReceivedLikes);

  const handleLikeBack = (likeId: string, userName: string) => {
    toast.success('Liked back!');
    // In a real app, this would create a match and remove from received likes
    setReceivedLikes(prev => prev.filter(like => like.id !== likeId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Messages</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect and collaborate with creators
          </p>
        </div>

        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="matches" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Matches</span>
            </TabsTrigger>
            <TabsTrigger value="my-likes" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Meine Likes</span>
            </TabsTrigger>
            <TabsTrigger value="received-likes" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Erhaltene Likes</span>
            </TabsTrigger>
          </TabsList>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Noch keine Matches
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Swipe durch Projekte, um deine ersten Matches zu finden!
                </p>
              </div>
            ) : (
              matches.map((match) => (
                <Link key={match.id} href={`/chats/${match.id}`}>
                  <Card className="rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={match.other.avatarUrl} alt={match.other.name} />
                          <AvatarFallback>
                            <User className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100">
                            {match.other.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {match.lastMessage}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>

          {/* My Likes Tab */}
          <TabsContent value="my-likes" className="space-y-4">
            {myLikes.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Noch keine Likes
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Like Projekte, die dich interessieren!
                </p>
              </div>
            ) : (
              myLikes.map((like) => (
                <Card key={like.id} className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                          {like.projectName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Warten auf Match…</span>
                        </p>
                      </div>
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Received Likes Tab */}
          <TabsContent value="received-likes" className="space-y-4">
            {receivedLikes.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Noch keine Likes erhalten
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Teile deine Projekte, um Likes zu erhalten!
                </p>
              </div>
            ) : (
              receivedLikes.map((like) => (
                <Card key={like.id} className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={like.user.avatarUrl} alt={like.user.name} />
                          <AvatarFallback>
                            <User className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-gray-100">
                            {like.user.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            hat <span className="font-medium">{like.projectName}</span> geliked
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleLikeBack(like.id, like.user.name)}
                      >
                        Like zurück
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}