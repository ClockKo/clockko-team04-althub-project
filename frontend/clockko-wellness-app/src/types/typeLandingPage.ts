
// Landing Page
export interface LandingPageContent {
  features: LandingFeature[];
  heroText: string;
  callToActionText: string;
  testimonials?: Testimonial[];
}

export interface LandingFeature {
  title: string;
  description: string;
  iconUrl?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  quote: string;
  avatarUrl?: string;
}