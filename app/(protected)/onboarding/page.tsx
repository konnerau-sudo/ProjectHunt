import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Onboarding() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Welcome to ProjectHunt!</CardTitle>
            <CardDescription className="text-lg">
              Let's get you set up to discover amazing projects
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Onboarding (soon...)
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              We're working on creating an amazing onboarding experience for you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}