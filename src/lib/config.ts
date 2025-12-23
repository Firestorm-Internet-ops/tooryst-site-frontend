/**
 * Configuration utility for accessing environment variables
 * Provides type-safe access to all public environment variables
 */

export const config = {
  // API & Core
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Tooryst',
  apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  revalidateSeconds: parseInt(process.env.NEXT_PUBLIC_REVALIDATE_SECONDS || '300'),

  // Company Info
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Tooryst Inc',
  companyDescription: process.env.NEXT_PUBLIC_COMPANY_DESCRIPTION || 'Discover authentic travel experiences through community insights',
  companyTagline: process.env.NEXT_PUBLIC_COMPANY_TAGLINE || 'Your Guide to Unforgettable Destinations',
  companyFounded: process.env.NEXT_PUBLIC_COMPANY_FOUNDED || '2024',
  companyWebsite: process.env.NEXT_PUBLIC_COMPANY_WEBSITE || 'https://tooryst.com',

  // Contact Information
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'travel@thebettervacation.com',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'travel@thebettervacation.com',
  phoneNumber: process.env.NEXT_PUBLIC_PHONE_NUMBER || '+91 73588-08488',
  officeAddress: process.env.NEXT_PUBLIC_OFFICE_ADDRESS || 'Firestorm Internet, 203, 30C, Bollineni Hillside, Perumbakkam Main Road, Nookampalayam, Chennai, India – 600126',

  // Social Media
  social: {
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '',
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || '',
    github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB || '',
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || '',
  },

  // Team Members
  team: [
    {
      id: 1,
      name: process.env.NEXT_PUBLIC_TEAM_MEMBER_1_NAME || 'John Smith',
      role: process.env.NEXT_PUBLIC_TEAM_MEMBER_1_ROLE || 'Founder & CEO',
      bio: process.env.NEXT_PUBLIC_TEAM_MEMBER_1_BIO || 'Travel enthusiast',
      image: process.env.NEXT_PUBLIC_TEAM_MEMBER_1_IMAGE || '/images/team/default.jpg',
    },
    {
      id: 2,
      name: process.env.NEXT_PUBLIC_TEAM_MEMBER_2_NAME || 'Sarah Johnson',
      role: process.env.NEXT_PUBLIC_TEAM_MEMBER_2_ROLE || 'CTO',
      bio: process.env.NEXT_PUBLIC_TEAM_MEMBER_2_BIO || 'Tech lead',
      image: process.env.NEXT_PUBLIC_TEAM_MEMBER_2_IMAGE || '/images/team/default.jpg',
    },
    {
      id: 3,
      name: process.env.NEXT_PUBLIC_TEAM_MEMBER_3_NAME || 'Michael Chen',
      role: process.env.NEXT_PUBLIC_TEAM_MEMBER_3_ROLE || 'Product Manager',
      bio: process.env.NEXT_PUBLIC_TEAM_MEMBER_3_BIO || 'Product strategist',
      image: process.env.NEXT_PUBLIC_TEAM_MEMBER_3_IMAGE || '/images/team/default.jpg',
    },
  ],

  // Statistics
  stats: {
    destinations: parseInt(process.env.NEXT_PUBLIC_STAT_DESTINATIONS || '245'),
    attractions: parseInt(process.env.NEXT_PUBLIC_STAT_ATTRACTIONS || '5300'),
    reviews: parseInt(process.env.NEXT_PUBLIC_STAT_REVIEWS || '48000'),
    users: parseInt(process.env.NEXT_PUBLIC_STAT_USERS || '125000'),
  },

  // Policy URLs
  privacyPolicyUrl: process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || '/privacy-policy',
  termsOfServiceUrl: process.env.NEXT_PUBLIC_TERMS_OF_SERVICE_URL || '/terms-of-service',
  cookiePolicyUrl: process.env.NEXT_PUBLIC_COOKIE_POLICY_URL || '/cookie-policy',

  // Meta & SEO
  defaultMetaDescription: process.env.NEXT_PUBLIC_DEFAULT_META_DESCRIPTION || 'Discover attractions worldwide',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Tooryst',
  brandColor: process.env.NEXT_PUBLIC_BRAND_COLOR || '#3B82F6',

  // Feature Flags
  features: {
    enableContactForm: process.env.NEXT_PUBLIC_ENABLE_CONTACT_FORM !== 'false',
    enableNewsletter: process.env.NEXT_PUBLIC_ENABLE_NEWSLETTER !== 'false',
    enableAuth: process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true',
    enableBlog: process.env.NEXT_PUBLIC_ENABLE_BLOG !== 'false',
  },

  // Deployment
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
  maintenanceMessage: process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE || 'Under maintenance',

  // Maps & Location
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',

  // Images & Media
  images: {
    fallbackAttraction: process.env.NEXT_PUBLIC_FALLBACK_ATTRACTION_IMAGE || 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
    fallbackCity: process.env.NEXT_PUBLIC_FALLBACK_CITY_IMAGE || 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80',
    fallbackHero: process.env.NEXT_PUBLIC_FALLBACK_HERO_IMAGE || 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
  },

  // Pagination & Limits
  pagination: {
    searchPageSize: parseInt(process.env.NEXT_PUBLIC_SEARCH_PAGE_SIZE || '12'),
    citiesFetchLimit: parseInt(process.env.NEXT_PUBLIC_CITIES_FETCH_LIMIT || '999999'),
    attractionsFetchLimit: parseInt(process.env.NEXT_PUBLIC_ATTRACTIONS_FETCH_LIMIT || '999999'),
    countryDataLimit: parseInt(process.env.NEXT_PUBLIC_COUNTRY_DATA_LIMIT || '1000'),
  },

  // Map Configuration
  map: {
    defaultZoom: parseInt(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM || '13'),
    zoomThresholds: {
      veryLarge: { span: parseFloat(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_VERY_LARGE_SPAN || '5'), zoom: parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_VERY_LARGE_ZOOM || '8') },
      large: { span: parseFloat(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_LARGE_SPAN || '2'), zoom: parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_LARGE_ZOOM || '9') },
      medium: { span: parseFloat(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_MEDIUM_SPAN || '1'), zoom: parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_MEDIUM_ZOOM || '10') },
      mediumSmall: { span: parseFloat(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_MEDIUM_SMALL_SPAN || '0.5'), zoom: parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_MEDIUM_SMALL_ZOOM || '11') },
      small: { span: parseFloat(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_SMALL_SPAN || '0.2'), zoom: parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_SMALL_ZOOM || '12') },
      verySmall: { span: parseFloat(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_VERY_SMALL_SPAN || '0.1'), zoom: parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_VERY_SMALL_ZOOM || '13') },
      tiny: { span: parseFloat(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_TINY_SPAN || '0.05'), zoom: parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_TINY_ZOOM || '14') },
      default: parseInt(process.env.NEXT_PUBLIC_MAP_ZOOM_THRESHOLD_DEFAULT || '15'),
    },
    boundsPadding: parseInt(process.env.NEXT_PUBLIC_MAP_BOUNDS_PADDING || '50'),
    retryLimit: parseInt(process.env.NEXT_PUBLIC_MAP_RETRY_LIMIT || '2'),
  },

  // UI Configuration
  ui: {
    collageImageLimit: parseInt(process.env.NEXT_PUBLIC_COLLAGE_IMAGE_LIMIT || '6'),
    searchSuggestionLimit: parseInt(process.env.NEXT_PUBLIC_SEARCH_SUGGESTION_LIMIT || '5'),
    debounceMs: parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_MS || '300'),
    ratingDecimalPlaces: parseInt(process.env.NEXT_PUBLIC_RATING_DECIMAL_PLACES || '1'),
  },

  // Colors & Gradients
  gradients: {
    defaultBackground: process.env.NEXT_PUBLIC_DEFAULT_BACKGROUND || 'linear-gradient(120deg, rgba(37,99,235,0.85), rgba(147,51,234,0.85))',
    heroOverlay: process.env.NEXT_PUBLIC_HERO_OVERLAY || 'linear-gradient(120deg, rgba(15,23,42,0.7), rgba(15,23,42,0.4))',
  },

  // Page-specific text content
  text: {
    // Search/Explore page
    search: {
      title: process.env.NEXT_PUBLIC_SEARCH_TITLE || 'Search Tooryst',
      placeholder: process.env.NEXT_PUBLIC_SEARCH_PLACEHOLDER || 'Search cities or attractions',
      button: process.env.NEXT_PUBLIC_SEARCH_BUTTON || 'Search',
      loading: process.env.NEXT_PUBLIC_SEARCH_LOADING || 'Searching…',
      noResults: process.env.NEXT_PUBLIC_SEARCH_NO_RESULTS || 'No results found. Try a different search term or explore popular cities.',
      emptyState: process.env.NEXT_PUBLIC_SEARCH_EMPTY_STATE || 'No cities or attractions available. Try searching for a specific city or attraction.',
      error: process.env.NEXT_PUBLIC_SEARCH_ERROR || 'Something went wrong. Try again.',
    },
    
    // Filters
    filters: {
      all: process.env.NEXT_PUBLIC_FILTER_ALL || 'All',
      cities: process.env.NEXT_PUBLIC_FILTER_CITIES || 'Cities',
      attractions: process.env.NEXT_PUBLIC_FILTER_ATTRACTIONS || 'Attractions',
    },

    // City cards
    cityCard: {
      attractionsLabel: process.env.NEXT_PUBLIC_CITY_CARD_ATTRACTIONS_LABEL || 'attractions',
      viewButton: process.env.NEXT_PUBLIC_CITY_CARD_VIEW_BUTTON || 'View city guide →',
    },

    // Section headers
    sections: {
      cities: process.env.NEXT_PUBLIC_SECTION_CITIES_HEADER || 'Cities',
      attractions: process.env.NEXT_PUBLIC_SECTION_ATTRACTIONS_HEADER || 'Attractions',
    },

    // Homepage
    hero: {
      eyebrow: process.env.NEXT_PUBLIC_HERO_EYEBROW || 'Travel Intelligence',
      heading: process.env.NEXT_PUBLIC_HERO_HEADING || 'Discover the Best Time to Travel',
      subheading: process.env.NEXT_PUBLIC_HERO_SUBHEADING || 'Live crowd signals, hyperlocal weather, and visitor sentiment—all in one travel guide.',
      searchPlaceholder: process.env.NEXT_PUBLIC_HERO_SEARCH_PLACEHOLDER || 'Search cities, attractions, or stories',
      cta: process.env.NEXT_PUBLIC_HERO_CTA || 'Explore',
      pillars: [
        process.env.NEXT_PUBLIC_HERO_PILLAR_1 || 'Crowd comfort scores',
        process.env.NEXT_PUBLIC_HERO_PILLAR_2 || 'Weather & seasonality',
        process.env.NEXT_PUBLIC_HERO_PILLAR_3 || 'Real traveler insights',
      ],
    },

    trending: {
      eyebrow: process.env.NEXT_PUBLIC_TRENDING_EYEBROW || 'Trending Now',
      heading: process.env.NEXT_PUBLIC_TRENDING_HEADING || 'Live attraction signals',
      subheading: process.env.NEXT_PUBLIC_TRENDING_SUBHEADING || 'Based on real visitor demand, crowd comfort, and seasonal weather.',
      empty: process.env.NEXT_PUBLIC_TRENDING_EMPTY || 'No trending attractions available yet.',
    },

    cities: {
      eyebrow: process.env.NEXT_PUBLIC_CITIES_EYEBROW || 'Explore',
      heading: process.env.NEXT_PUBLIC_CITIES_HEADING || 'Popular Cities',
      seeAll: process.env.NEXT_PUBLIC_CITIES_SEE_ALL || 'See all cities →',
      empty: process.env.NEXT_PUBLIC_CITIES_EMPTY || 'No cities available yet.',
    },

    globe: {
      eyebrow: process.env.NEXT_PUBLIC_GLOBE_EYEBROW || 'Global',
      heading: process.env.NEXT_PUBLIC_GLOBE_HEADING || 'Explore the World',
      viewCity: process.env.NEXT_PUBLIC_GLOBE_VIEW_CITY || 'View City →',
    },

    newsletter: {
      eyebrow: process.env.NEXT_PUBLIC_NEWSLETTER_EYEBROW || 'Stay in the loop',
      heading: process.env.NEXT_PUBLIC_NEWSLETTER_HEADING || 'Get next-week travel intel',
      subheading: process.env.NEXT_PUBLIC_NEWSLETTER_SUBHEADING || 'Weekly guidance on crowd comfort, ideal itineraries, and under-the-radar cities.',
      placeholder: process.env.NEXT_PUBLIC_NEWSLETTER_PLACEHOLDER || 'you@example.com',
      button: process.env.NEXT_PUBLIC_NEWSLETTER_BUTTON || 'Get travel intel',
    },

    emptyState: {
      heading: process.env.NEXT_PUBLIC_EMPTY_STATE_HEADING || 'No Data Available',
      message: process.env.NEXT_PUBLIC_EMPTY_STATE_MESSAGE || 'The database is empty. Import attractions data to get started with your travel storyboard.',
      setupTitle: process.env.NEXT_PUBLIC_EMPTY_STATE_SETUP_TITLE || 'Setup Instructions',
    },

    // Common UI text
    loading: {
      globe: process.env.NEXT_PUBLIC_LOADING_GLOBE || 'Loading globe...',
      results: process.env.NEXT_PUBLIC_LOADING_RESULTS || 'Loading results…',
    },

    pagination: {
      previous: process.env.NEXT_PUBLIC_PAGINATION_PREVIOUS || 'Previous',
      next: process.env.NEXT_PUBLIC_PAGINATION_NEXT || 'Next',
      page: process.env.NEXT_PUBLIC_PAGINATION_PAGE || 'Page',
    },

    actions: {
      view: process.env.NEXT_PUBLIC_ACTION_VIEW || 'View',
      explore: process.env.NEXT_PUBLIC_ACTION_EXPLORE || 'Explore',
      search: process.env.NEXT_PUBLIC_ACTION_SEARCH || 'Search',
      filter: process.env.NEXT_PUBLIC_ACTION_FILTER || 'Filter',
    },
  },
};

export default config;
