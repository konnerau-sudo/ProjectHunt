'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

interface UserProfile {
  name: string
  standort: string
  aboutMe: string
}

interface Project {
  projekttitel: string
  teaser: string
  kategorien: string[]
  status: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  
  // State für User Profile (Schritt 1)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    standort: '',
    aboutMe: ''
  })

  // State für Project (Schritt 2)
  const [project, setProject] = useState<Project>({
    projekttitel: '',
    teaser: '',
    kategorien: [],
    status: ''
  })

  // Dummy Kategorien
  const kategorienOptions = ['FinTech', 'EdTech', 'DevTools', 'HealthTech', 'GreenTech', 'E-Commerce']

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleProjectChange = (field: keyof Project, value: string | string[]) => {
    setProject(prev => ({ ...prev, [field]: value }))
  }

  const handleKategorieToggle = (kategorie: string) => {
    setProject(prev => ({
      ...prev,
      kategorien: prev.kategorien.includes(kategorie)
        ? prev.kategorien.filter(k => k !== kategorie)
        : [...prev.kategorien, kategorie]
    }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleFinish = () => {
    // Log final state to console
    console.log('Onboarding Complete - Final Data:', {
      userProfile,
      project
    })
    
    // Redirect to discover
    router.push('/discover')
  }

  // Validation
  const isStep1Valid = userProfile.name.trim().length > 0
  const isStep2Valid = project.projekttitel.trim().length > 0 && 
                       project.teaser.length <= 150 && 
                       project.status.length > 0

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Dein Profil</CardTitle>
              <CardDescription>
                Erzähl uns etwas über dich
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Dein vollständiger Name"
                  value={userProfile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="standort">Standort</Label>
                <Input
                  id="standort"
                  placeholder="Stadt, Land"
                  value={userProfile.standort}
                  onChange={(e) => handleProfileChange('standort', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutMe">About me</Label>
                <Textarea
                  id="aboutMe"
                  placeholder="Erzähl uns von deinen Skills, Interessen und was du gerne baust..."
                  value={userProfile.aboutMe}
                  onChange={(e) => handleProfileChange('aboutMe', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Dein erstes Projekt</CardTitle>
              <CardDescription>
                Stelle dein aktuelles oder geplantes Projekt vor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projekttitel">Projekttitel *</Label>
                <Input
                  id="projekttitel"
                  placeholder="z.B. AI Chat Assistant"
                  value={project.projekttitel}
                  onChange={(e) => handleProjectChange('projekttitel', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teaser">Teaser</Label>
                <Textarea
                  id="teaser"
                  placeholder="Beschreibe dein Projekt in wenigen Sätzen..."
                  value={project.teaser}
                  onChange={(e) => handleProjectChange('teaser', e.target.value)}
                  rows={3}
                />
                <div className="text-sm text-right text-gray-500">
                  {project.teaser.length}/150 Zeichen
                </div>
              </div>

              <div className="space-y-3">
                <Label>Kategorien</Label>
                <div className="grid grid-cols-2 gap-3">
                  {kategorienOptions.map((kategorie) => (
                    <div key={kategorie} className="flex items-center space-x-2">
                      <Checkbox
                        id={kategorie}
                        checked={project.kategorien.includes(kategorie)}
                        onCheckedChange={() => handleKategorieToggle(kategorie)}
                      />
                      <Label htmlFor={kategorie} className="text-sm">
                        {kategorie}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Status *</Label>
                <RadioGroup
                  value={project.status}
                  onValueChange={(value) => handleProjectChange('status', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="offen" id="offen" />
                    <Label htmlFor="offen">Offen</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="suche-hilfe" id="suche-hilfe" />
                    <Label htmlFor="suche-hilfe">Suche Hilfe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="biete-hilfe" id="biete-hilfe" />
                    <Label htmlFor="biete-hilfe">Biete Hilfe</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">🎉 Dein Profil und erstes Projekt sind bereit!</CardTitle>
              <CardDescription>
                Du kannst jetzt andere Projekte entdecken und dich vernetzen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Dein Profil
                  </h4>
                  <p className="font-medium">{userProfile.name || 'Nicht angegeben'}</p>
                  {userProfile.standort && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{userProfile.standort}</p>
                  )}
                  {userProfile.aboutMe && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{userProfile.aboutMe}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Dein Projekt
                  </h4>
                  <p className="font-medium">{project.projekttitel}</p>
                  {project.teaser && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{project.teaser}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.kategorien.map((kategorie) => (
                      <span key={kategorie} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {kategorie}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Status: {project.status}</p>
                </div>
              </div>
              
              <Button onClick={handleFinish} className="w-full" size="lg">
                Los geht's
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Progress Indicator */}
        <div className="mb-8 text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Schritt {currentStep} von 3
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        {currentStep < 3 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !isStep1Valid) ||
                (currentStep === 2 && !isStep2Valid)
              }
            >
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
