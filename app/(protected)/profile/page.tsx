import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export default function Profile() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
                <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account and showcase your projects
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your Creator Profile</CardTitle>
            <CardDescription>
              Show the world your amazing projects and skills
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Profile (soon...)
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              We're creating a beautiful profile experience where you can showcase 
              your projects, skills, and connect with the community.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}