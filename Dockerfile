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

# Create production env file
RUN cat > .env.production <<'EOF'
NEXT_PUBLIC_API_BASE_URL=https://api.tooryst.co/api/v1
NEXT_PUBLIC_APP_URL=https://tooryst.co
NEXT_PUBLIC_APP_NAME=Tooryst
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_REVALIDATE_SECONDS=300
NEXT_PUBLIC_COMPANY_NAME=Tooryst
NEXT_PUBLIC_COMPANY_DESCRIPTION=Discover the best times to visit your favorite attractions. Get real-time crowd levels and plan your perfect visit.
NEXT_PUBLIC_COMPANY_TAGLINE=Your Guide to Unforgettable Destinations
NEXT_PUBLIC_COMPANY_FOUNDED=2024
NEXT_PUBLIC_CONTACT_EMAIL=travel@thebettervacation.com
NEXT_PUBLIC_SUPPORT_EMAIL=travel@thebettervacation.com
NEXT_PUBLIC_PHONE_NUMBER=+91 73588-08488
NEXT_PUBLIC_OFFICE_ADDRESS=Firestorm Internet, 203, 30C, Bollineni Hillside, Perumbakkam Main Road, Nookampalayam, Chennai, India – 600126
NEXT_PUBLIC_SOCIAL_TWITTER=https://twitter.com/bettervacation_
NEXT_PUBLIC_SOCIAL_LINKEDIN=https://www.linkedin.com/company/thebettervacation/
NEXT_PUBLIC_SOCIAL_PINTEREST=https://www.pinterest.com/thebettervacation/
NEXT_PUBLIC_SOCIAL_FACEBOOK=https://www.facebook.com/thebettervacation
NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://www.instagram.com/thebettervacation/
NEXT_PUBLIC_SOCIAL_YOUTUBE=https://www.youtube.com/channel/UCmSy2vAcpu2ULN0tHV6aA1A
NEXT_PUBLIC_STAT_DESTINATIONS=45
NEXT_PUBLIC_STAT_ATTRACTIONS=966
NEXT_PUBLIC_STAT_REVIEWS=46000
NEXT_PUBLIC_STAT_USERS=125000
NEXT_PUBLIC_FAQ_COUNT=8
NEXT_PUBLIC_COMPANY_WEBSITE=https://tooryst.co
NEXT_PUBLIC_PRIVACY_POLICY_URL=/privacy-policy
NEXT_PUBLIC_TERMS_OF_SERVICE_URL=/terms-of-service
NEXT_PUBLIC_COOKIE_POLICY_URL=/cookie-policy
NEXT_PUBLIC_DEFAULT_META_DESCRIPTION=Discover and explore attractions worldwide with authentic travel insights from our community
NEXT_PUBLIC_SITE_NAME=Tooryst
NEXT_PUBLIC_BRAND_COLOR=#3B82F6
NEXT_PUBLIC_ENABLE_CONTACT_FORM=false
NEXT_PUBLIC_ENABLE_NEWSLETTER=false
NEXT_PUBLIC_ENABLE_AUTH=false
NEXT_PUBLIC_ENABLE_BLOG=false
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw
NEXT_PUBLIC_FALLBACK_ATTRACTION_IMAGE=https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80
NEXT_PUBLIC_FALLBACK_CITY_IMAGE=https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80
NEXT_PUBLIC_FALLBACK_HERO_IMAGE=https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80
NEXT_PUBLIC_SEARCH_PAGE_SIZE=12
NEXT_PUBLIC_CITIES_FETCH_LIMIT=100
NEXT_PUBLIC_ATTRACTIONS_FETCH_LIMIT=12
NEXT_PUBLIC_COUNTRY_DATA_LIMIT=1000
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=13
NEXT_PUBLIC_MAP_BOUNDS_PADDING_TOP=50
NEXT_PUBLIC_MAP_BOUNDS_PADDING_RIGHT=50
NEXT_PUBLIC_MAP_BOUNDS_PADDING_BOTTOM=50
NEXT_PUBLIC_MAP_BOUNDS_PADDING_LEFT=50
NEXT_PUBLIC_MAP_RETRY_LIMIT=2
NEXT_PUBLIC_COLLAGE_IMAGE_LIMIT=6
NEXT_PUBLIC_SEARCH_SUGGESTION_LIMIT=5
NEXT_PUBLIC_DEBOUNCE_MS=300
NEXT_PUBLIC_RATING_DECIMAL_PLACES=1
NEXT_PUBLIC_DEFAULT_BACKGROUND=linear-gradient(120deg, rgba(37,99,235,0.85), rgba(147,51,234,0.85))
NEXT_PUBLIC_HERO_OVERLAY=linear-gradient(120deg, rgba(15,23,42,0.7), rgba(15,23,42,0.4))
NEXT_PUBLIC_GA_ID=toosits
NEXT_PUBLIC_HOTJAR_ID=
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_MAINTENANCE_MESSAGE=We are currently performing scheduled maintenance. Please check back soon!
NEXT_PUBLIC_SEARCH_TITLE=Search Tooryst
NEXT_PUBLIC_SEARCH_PLACEHOLDER=Search cities or attractions
NEXT_PUBLIC_SEARCH_BUTTON=Search
NEXT_PUBLIC_SEARCH_LOADING=Searching…
NEXT_PUBLIC_SEARCH_NO_RESULTS=No results found. Try a different search term or explore popular cities.
NEXT_PUBLIC_SEARCH_EMPTY_STATE=No cities or attractions available. Try searching for a specific city or attraction.
NEXT_PUBLIC_SEARCH_ERROR=Something went wrong. Try again.
NEXT_PUBLIC_FILTER_CITIES=Cities
NEXT_PUBLIC_FILTER_ATTRACTIONS=Attractions
NEXT_PUBLIC_CITY_CARD_ATTRACTIONS_LABEL=attractions
NEXT_PUBLIC_CITY_CARD_VIEW_BUTTON=View city guide →
NEXT_PUBLIC_SECTION_CITIES_HEADER=Cities
NEXT_PUBLIC_SECTION_ATTRACTIONS_HEADER=Attractions
NEXT_PUBLIC_TRENDING_EYEBROW=Trending Now
NEXT_PUBLIC_TRENDING_HEADING=Live attraction signals
NEXT_PUBLIC_TRENDING_SUBHEADING=Based on real visitor demand, crowd comfort, and seasonal weather.
NEXT_PUBLIC_TRENDING_EMPTY=No trending attractions available yet.
NEXT_PUBLIC_CITIES_EYEBROW=Explore
NEXT_PUBLIC_CITIES_HEADING=Popular Cities
NEXT_PUBLIC_CITIES_SEE_ALL=See all cities →
NEXT_PUBLIC_CITIES_EMPTY=No cities available yet.
NEXT_PUBLIC_GLOBE_EYEBROW=Global
NEXT_PUBLIC_GLOBE_HEADING=Explore the World
NEXT_PUBLIC_GLOBE_VIEW_CITY=View City →
NEXT_PUBLIC_NEWSLETTER_EYEBROW=Stay in the loop
NEXT_PUBLIC_NEWSLETTER_HEADING=Get next-week travel intel
NEXT_PUBLIC_NEWSLETTER_SUBHEADING=Weekly guidance on crowd comfort, ideal itineraries, and under-the-radar cities.
NEXT_PUBLIC_NEWSLETTER_PLACEHOLDER=you@example.com
NEXT_PUBLIC_NEWSLETTER_BUTTON=Get travel intel
NEXT_PUBLIC_EMPTY_STATE_HEADING=No Data Available
NEXT_PUBLIC_EMPTY_STATE_MESSAGE=The database is empty. Import attractions data to get started with your travel storyboard.
NEXT_PUBLIC_EMPTY_STATE_SETUP_TITLE=Setup Instructions
NEXT_PUBLIC_LOADING_GLOBE=Loading globe...
NEXT_PUBLIC_LOADING_RESULTS=Loading results…
NEXT_PUBLIC_PAGINATION_PREVIOUS=Previous
NEXT_PUBLIC_PAGINATION_NEXT=Next
NEXT_PUBLIC_PAGINATION_PAGE=Page
NEXT_PUBLIC_ACTION_VIEW=View
NEXT_PUBLIC_ACTION_EXPLORE=Explore
NEXT_PUBLIC_ACTION_SEARCH=Search
NEXT_PUBLIC_ACTION_FILTER=Filter
EOF

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