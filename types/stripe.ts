export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  priceId: string;
  popular?: boolean;
  features: string[];
  interval: 'month' | 'year';
}

export interface CheckoutSessionRequest {
  priceId: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  planId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

