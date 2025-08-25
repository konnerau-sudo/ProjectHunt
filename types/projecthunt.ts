export type Collab = 'offen' | 'suche_hilfe' | 'biete_hilfe';

export type UserProfile = {
  id?: string;            // auth.users.id
  name: string;
  location?: string;
  about?: string;
};

export type Project = {
  id?: string;
  owner_id?: string;
  title: string;
  teaser?: string;
  categories: string[];
  status: Collab;
  created_at?: string;
};

export type SwipeDirection = 'like' | 'skip';

export type Swipe = {
  id?: string;
  swiper_id: string;
  project_id: string;
  direction: SwipeDirection;
  created_at?: string;
};

export type Match = {
  id?: string;
  a_id: string;
  b_id: string;
  created_at?: string;
};

export type Message = {
  id?: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at?: string;
};

export const CATEGORIES = [
  'FinTech', 'EdTech', 'DevTools', 'Healthcare', 'E-Commerce', 'AI', 
  'Design', 'Marketing', 'Mobile App', 'Web App', 'Gaming', 'Social Media',
  'Produktivität', 'Umwelt', 'Food', 'Nachhaltigkeit', 'IoT', 'Blockchain',
  'VR/AR', 'Content Creation', 'Fitness', 'Travel', 'Music', 'Photo/Video'
] as const;
export type Category = typeof CATEGORIES[number];
