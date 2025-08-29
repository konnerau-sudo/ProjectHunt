export interface SwipeData {
  id: string;
  swiper_id: string;
  project_id: string;
  direction: 'like' | 'skip';
  created_at: string;
}

export interface SwipeRequest {
  projectId: string;
  direction: 'like' | 'skip';
}

export interface SwipeResponse {
  success: boolean;
  swipe: {
    id: string;
    projectId: string;
    direction: 'like' | 'skip';
    createdAt: string;
  };
  remainingSwipes: number;
}

export interface SwipeError {
  error: string;
  code?: 'ALREADY_SWIPED' | 'LIMIT_REACHED' | 'PROJECT_NOT_FOUND';
  limit?: number;
  count?: number;
}

export interface SwipeStats {
  todaySwipes: number;
  allTime?: number; // Optional for backward compatibility
  maxDailySwipes: number;
  remainingSwipes: number;
  limitReached: boolean;
}

export interface FeedProject {
  id: string;
  title: string;
  teaser: string | null;
  categories: string[];
  status: 'offen' | 'suche_hilfe' | 'biete_hilfe';
  createdAt: string;
  owner: {
    id: string;
    name: string;
  };
}

export interface FeedResponse {
  projects: FeedProject[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    totalAvailable: number;
  };
  meta: {
    timestamp: string;
    userId: string;
  };
}

export interface SwipeAction {
  type: 'SWIPE_PROJECT';
  payload: {
    projectId: string;
    direction: 'like' | 'skip';
    optimistic?: boolean;
  };
}

export interface SwipeState {
  isLoading: boolean;
  error: string | null;
  swipedProjects: Set<string>;
  todaySwipeCount: number;
  remainingSwipes: number;
  limitReached: boolean;
}

