'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { UserProfile, Project } from '@/types/projecthunt'

export async function upsertProfile(profileData: {
  name: string
  location?: string
  about?: string
}): Promise<void> {
  const supabase = await createSupabaseServer()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  // Upsert profile
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: profileData.name,
      location: profileData.location,
      about: profileData.about,
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(`Failed to save profile: ${error.message}`)
  }
}

export async function createProject(projectData: {
  title: string
  teaser?: string
  categories: string[]
  status: 'offen' | 'suche_hilfe' | 'biete_hilfe'
}): Promise<void> {
  const supabase = await createSupabaseServer()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  // Create project
  const { error } = await supabase
    .from('projects')
    .insert({
      owner_id: user.id,
      title: projectData.title,
      teaser: projectData.teaser,
      categories: projectData.categories,
      status: projectData.status,
      created_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }
}
