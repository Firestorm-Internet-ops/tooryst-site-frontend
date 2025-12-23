# Dockerfile
FROM node:22.20.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set build-time environment variables
ENV NEXT_PUBLIC_API_BASE_URL=https://api.tooryst.co/api/v1
ENV NEXT_PUBLIC_APP_URL=https://tooryst.co
ENV NEXT_PUBLIC_APP_NAME=Tooryst
ENV NEXT_PUBLIC_API_TIMEOUT=30000
ENV NEXT_PUBLIC_REVALIDATE_SECONDS=300
ENV NEXT_PUBLIC_COMPANY_NAME=Tooryst
ENV NEXT_PUBLIC_COMPANY_DESCRIPTION="Discover the best times to visit your favorite attractions. Get real-time crowd levels and plan your perfect visit."
ENV NEXT_PUBLIC_COMPANY_TAGLINE="Your Guide to Unforgettable Destinations"
ENV NEXT_PUBLIC_COMPANY_FOUNDED=2024
ENV NEXT_PUBLIC_CONTACT_EMAIL=travel@thebettervacation.com
ENV NEXT_PUBLIC_SUPPORT_EMAIL=travel@thebettervacation.com
ENV NEXT_PUBLIC_PHONE_NUMBER="+91 73588-08488"
ENV NEXT_PUBLIC_OFFICE_ADDRESS="Firestorm Internet, 203, 30C, Bollineni Hillside, Perumbakkam Main Road, Nookampalayam, Chennai, India – 600126"
ENV NEXT_PUBLIC_SOCIAL_TWITTER=https://twitter.com/bettervacation_
ENV NEXT_PUBLIC_SOCIAL_LINKEDIN=https://www.linkedin.com/company/thebettervacation/
ENV NEXT_PUBLIC_SOCIAL_PINTEREST=https://www.pinterest.com/thebettervacation/
ENV NEXT_PUBLIC_SOCIAL_FACEBOOK=https://www.facebook.com/thebettervacation
ENV NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://www.instagram.com/thebettervacation/
ENV NEXT_PUBLIC_SOCIAL_YOUTUBE=https://www.youtube.com/channel/UCmSy2vAcpu2ULN0tHV6aA1A
ENV NEXT_PUBLIC_STAT_DESTINATIONS=45
ENV NEXT_PUBLIC_STAT_ATTRACTIONS=966
ENV NEXT_PUBLIC_STAT_REVIEWS=46000
ENV NEXT_PUBLIC_STAT_USERS=125000
ENV NEXT_PUBLIC_FAQ_COUNT=8
ENV NEXT_PUBLIC_COMPANY_WEBSITE=https://tooryst.co
ENV NEXT_PUBLIC_PRIVACY_POLICY_URL=/privacy-policy
ENV NEXT_PUBLIC_TERMS_OF_SERVICE_URL=/terms-of-service
ENV NEXT_PUBLIC_COOKIE_POLICY_URL=/cookie-policy
ENV NEXT_PUBLIC_DEFAULT_META_DESCRIPTION="Discover and explore attractions worldwide with authentic travel insights from our community"
ENV NEXT_PUBLIC_SITE_NAME=Tooryst
ENV NEXT_PUBLIC_BRAND_COLOR="#3B82F6"
ENV NEXT_PUBLIC_ENABLE_CONTACT_FORM=false
ENV NEXT_PUBLIC_ENABLE_NEWSLETTER=false
ENV NEXT_PUBLIC_ENABLE_AUTH=false
ENV NEXT_PUBLIC_ENABLE_BLOG=false
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
ENV NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw
ENV NEXT_PUBLIC_FALLBACK_ATTRACTION_IMAGE=https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80
ENV NEXT_PUBLIC_FALLBACK_CITY_IMAGE=https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80
ENV NEXT_PUBLIC_FALLBACK_HERO_IMAGE=https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80
ENV NEXT_PUBLIC_SEARCH_PAGE_SIZE=12
ENV NEXT_PUBLIC_CITIES_FETCH_LIMIT=100
ENV NEXT_PUBLIC_ATTRACTIONS_FETCH_LIMIT=12
ENV NEXT_PUBLIC_COUNTRY_DATA_LIMIT=1000
ENV NEXT_PUBLIC_MAP_DEFAULT_ZOOM=13
ENV NEXT_PUBLIC_MAP_BOUNDS_PADDING_TOP=50
ENV NEXT_PUBLIC_MAP_BOUNDS_PADDING_RIGHT=50
ENV NEXT_PUBLIC_MAP_BOUNDS_PADDING_BOTTOM=50
ENV NEXT_PUBLIC_MAP_BOUNDS_PADDING_LEFT=50
ENV NEXT_PUBLIC_MAP_RETRY_LIMIT=2
ENV NEXT_PUBLIC_COLLAGE_IMAGE_LIMIT=6
ENV NEXT_PUBLIC_SEARCH_SUGGESTION_LIMIT=5
ENV NEXT_PUBLIC_DEBOUNCE_MS=300
ENV NEXT_PUBLIC_RATING_DECIMAL_PLACES=1
ENV NEXT_PUBLIC_DEFAULT_BACKGROUND="linear-gradient(120deg, rgba(37,99,235,0.85), rgba(147,51,234,0.85))"
ENV NEXT_PUBLIC_HERO_OVERLAY="linear-gradient(120deg, rgba(15,23,42,0.7), rgba(15,23,42,0.4))"
ENV NEXT_PUBLIC_GA_ID=toosits
ENV NEXT_PUBLIC_HOTJAR_ID=""
ENV NEXT_PUBLIC_ENVIRONMENT=production
ENV NEXT_PUBLIC_APP_VERSION=1.0.0
ENV NEXT_PUBLIC_MAINTENANCE_MODE=false
ENV NEXT_PUBLIC_MAINTENANCE_MESSAGE="We are currently performing scheduled maintenance. Please check back soon!"
ENV NEXT_PUBLIC_SEARCH_TITLE="Search Tooryst"
ENV NEXT_PUBLIC_SEARCH_PLACEHOLDER="Search cities or attractions"
ENV NEXT_PUBLIC_SEARCH_BUTTON=Search
ENV NEXT_PUBLIC_SEARCH_LOADING="Searching…"
ENV NEXT_PUBLIC_SEARCH_NO_RESULTS="No results found. Try a different search term or explore popular cities."
ENV NEXT_PUBLIC_SEARCH_EMPTY_STATE="No cities or attractions available. Try searching for a specific city or attraction."
ENV NEXT_PUBLIC_SEARCH_ERROR="Something went wrong. Try again."
ENV NEXT_PUBLIC_FILTER_CITIES=Cities
ENV NEXT_PUBLIC_FILTER_ATTRACTIONS=Attractions
ENV NEXT_PUBLIC_CITY_CARD_ATTRACTIONS_LABEL=attractions
ENV NEXT_PUBLIC_CITY_CARD_VIEW_BUTTON="View city guide →"
ENV NEXT_PUBLIC_SECTION_CITIES_HEADER=Cities
ENV NEXT_PUBLIC_SECTION_ATTRACTIONS_HEADER=Attractions
ENV NEXT_PUBLIC_TRENDING_EYEBROW="Trending Now"
ENV NEXT_PUBLIC_TRENDING_HEADING="Live attraction signals"
ENV NEXT_PUBLIC_TRENDING_SUBHEADING="Based on real visitor demand, crowd comfort, and seasonal weather."
ENV NEXT_PUBLIC_TRENDING_EMPTY="No trending attractions available yet."
ENV NEXT_PUBLIC_CITIES_EYEBROW=Explore
ENV NEXT_PUBLIC_CITIES_HEADING="Popular Cities"
ENV NEXT_PUBLIC_CITIES_SEE_ALL="See all cities →"
ENV NEXT_PUBLIC_CITIES_EMPTY="No cities available yet."
ENV NEXT_PUBLIC_GLOBE_EYEBROW=Global
ENV NEXT_PUBLIC_GLOBE_HEADING="Explore the World"
ENV NEXT_PUBLIC_GLOBE_VIEW_CITY="View City →"
ENV NEXT_PUBLIC_NEWSLETTER_EYEBROW="Stay in the loop"
ENV NEXT_PUBLIC_NEWSLETTER_HEADING="Get next-week travel intel"
ENV NEXT_PUBLIC_NEWSLETTER_SUBHEADING="Weekly guidance on crowd comfort, ideal itineraries, and under-the-radar cities."
ENV NEXT_PUBLIC_NEWSLETTER_PLACEHOLDER=you@example.com
ENV NEXT_PUBLIC_NEWSLETTER_BUTTON="Get travel intel"
ENV NEXT_PUBLIC_EMPTY_STATE_HEADING="No Data Available"
ENV NEXT_PUBLIC_EMPTY_STATE_MESSAGE="The database is empty. Import attractions data to get started with your travel storyboard."
ENV NEXT_PUBLIC_EMPTY_STATE_SETUP_TITLE="Setup Instructions"
ENV NEXT_PUBLIC_LOADING_GLOBE="Loading globe..."
ENV NEXT_PUBLIC_LOADING_RESULTS="Loading results…"
ENV NEXT_PUBLIC_PAGINATION_PREVIOUS=Previous
ENV NEXT_PUBLIC_PAGINATION_NEXT=Next
ENV NEXT_PUBLIC_PAGINATION_PAGE=Page
ENV NEXT_PUBLIC_ACTION_VIEW=View
ENV NEXT_PUBLIC_ACTION_EXPLORE=Explore
ENV NEXT_PUBLIC_ACTION_SEARCH=Search
ENV NEXT_PUBLIC_ACTION_FILTER=Filter

# Build Next.js app
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]