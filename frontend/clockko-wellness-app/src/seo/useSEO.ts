import { useHead } from '@unhead/react';
import { seoConfig, pageSEO, structuredData } from './seoConfig';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  pageType?: keyof typeof pageSEO;
  structuredData?: object;
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonical,
  noIndex = false,
  ogImage,
  pageType,
  structuredData: customStructuredData
}: SEOProps = {}) => {
  
  // Get page-specific config if pageType is provided
  const pageConfig = pageType ? pageSEO[pageType] : null;
  
  // Build final SEO values with priority: props > pageConfig > defaults
  const finalTitle = title || (pageConfig && 'title' in pageConfig ? pageConfig.title : seoConfig.siteName);
  const finalDescription = description || (pageConfig && 'description' in pageConfig ? pageConfig.description : seoConfig.description);
  const finalKeywords = keywords || (pageConfig && 'keywords' in pageConfig ? pageConfig.keywords : seoConfig.defaultMeta.keywords);
  const finalCanonical = canonical || (pageConfig && 'canonical' in pageConfig ? pageConfig.canonical : undefined);
  
  useHead({
    title: finalTitle,
    meta: [
      // Basic meta tags
      { name: 'description', content: finalDescription },
      { name: 'keywords', content: finalKeywords },
      { name: 'author', content: seoConfig.defaultMeta.author },
      { name: 'viewport', content: seoConfig.defaultMeta.viewport },
      { name: 'robots', content: noIndex ? 'noindex, nofollow' : 'index, follow' },
      
      // Open Graph
      { property: 'og:title', content: finalTitle },
      { property: 'og:description', content: finalDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: seoConfig.siteName },
      { property: 'og:url', content: finalCanonical ? `${seoConfig.siteUrl}${finalCanonical}` : seoConfig.siteUrl },
      ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: finalTitle },
      { name: 'twitter:description', content: finalDescription },
      { name: 'twitter:site', content: seoConfig.social.twitter },
      ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
      
      // Additional meta tags
      { name: 'theme-color', content: '#3B82F6' }, // ClockKo brand color
      { name: 'msapplication-TileColor', content: '#3B82F6' },
    ],
    
    // Canonical URL
    ...(finalCanonical ? {
      link: [
        { rel: 'canonical', href: `${seoConfig.siteUrl}${finalCanonical}` }
      ]
    } : {}),
    
    // Structured data
    script: [
      ...(customStructuredData ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify(customStructuredData)
      }] : []),
      
      // Default organization schema
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          ...seoConfig.organization
        })
      }
    ]
  });
};

// Specific hooks for common pages
export const useHomeSEO = () => useSEO({ pageType: 'home', structuredData: structuredData.softwareApplication });

export const useFeatureSEO = (feature: 'timeTracking' | 'focusTimer' | 'teamCollaboration') => {
  const featureConfig = pageSEO.features[feature];
  return useSEO({
    title: featureConfig.title,
    description: featureConfig.description,
    keywords: featureConfig.keywords
  });
};

export const usePricingSEO = () => useSEO({ pageType: 'pricing' });

export const useProtectedPageSEO = (title: string, description?: string) => {
  return useSEO({
    title: `${title} - ClockKo`,
    description: description || `Access your ${title.toLowerCase()} in ClockKo productivity dashboard.`,
    noIndex: true // Protected pages should not be indexed
  });
};