// SEO Configuration for ClockKo
export const seoConfig = {
  // Base site configuration
  siteName: 'ClockKo',
  siteUrl: 'https://clockko.com', // Update with actual domain
  description: 'ClockKo is a comprehensive productivity app featuring time tracking, task management, co-working spaces, and wellness challenges.',
  
  // Social media handles
  social: {
    twitter: '@clockko',
    linkedin: 'company/clockko',
    instagram: '@clockko_app'
  },
  
  // Schema.org structured data
  organization: {
    name: 'ClockKo',
    logo: '/logo.png', // Update with actual logo path
    sameAs: [
      'https://twitter.com/clockko',
      'https://linkedin.com/company/clockko'
    ]
  },
  
  // Default meta tags for all pages
  defaultMeta: {
    keywords: 'productivity app, time tracking, task management, focus timer, work-life balance, team collaboration, wellness tracking',
    author: 'ClockKo Team',
    viewport: 'width=device-width, initial-scale=1.0',
    robots: 'index, follow'
  }
};

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'ClockKo - Productivity & Wellness App | Time Tracking Made Simple',
    description: 'Boost your productivity with ClockKo - featuring time tracking, task management, co-working spaces, and wellness challenges. Start your free trial today.',
    keywords: 'productivity app, time tracking software, focus timer, work management, team productivity',
    canonical: '/'
  },
  
  features: {
    timeTracking: {
      title: 'Time Tracking Software | ClockKo - Track Work Hours Efficiently',
      description: 'Professional time tracking software with automatic timers, detailed reports, and team collaboration features. Perfect for remote teams and freelancers.',
      keywords: 'time tracking software, work hours tracker, employee time tracking, automatic time tracking'
    },
    
    focusTimer: {
      title: 'Focus Timer & Pomodoro App | ClockKo - Stay Focused & Productive',
      description: 'Advanced focus timer with Pomodoro technique, break reminders, and productivity analytics. Improve concentration and work efficiency.',
      keywords: 'pomodoro timer, focus app, concentration timer, productivity timer, work focus'
    },
    
    teamCollaboration: {
      title: 'Team Productivity Tools | ClockKo - Collaborate & Track Together',
      description: 'Real-time team collaboration with shared workspaces, live productivity tracking, and team analytics. Perfect for remote and hybrid teams.',
      keywords: 'team productivity, collaboration tools, team time tracking, remote work tools'
    }
  },
  
  pricing: {
    title: 'ClockKo Pricing | Affordable Productivity Software Plans',
    description: 'Simple, transparent pricing for individuals and teams. Start free, upgrade anytime. No hidden fees, cancel anytime.',
    keywords: 'productivity app pricing, time tracking cost, team productivity pricing'
  }
};

// Rich snippets / Schema.org data
export const structuredData = {
  softwareApplication: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ClockKo',
    description: seoConfig.description,
    url: seoConfig.siteUrl,
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier available'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150'
    }
  }
};