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

# Accept build args
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ENVIRONMENT
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT
ARG SENTRY_AUTH_TOKEN

# Create production env file - each variable on separate echo
RUN echo "NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}" > .env.production && \
    echo "NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}" >> .env.production && \
    echo "NEXT_PUBLIC_APP_NAME=Tooryst" >> .env.production && \
    echo "NEXT_PUBLIC_API_TIMEOUT=30000" >> .env.production && \
    echo "NEXT_PUBLIC_REVALIDATE_SECONDS=300" >> .env.production && \
    echo "NEXT_PUBLIC_COMPANY_NAME=Tooryst" >> .env.production && \
    echo "NEXT_PUBLIC_COMPANY_DESCRIPTION=Discover the best times to visit your favorite attractions. Get real-time crowd levels and plan your perfect visit." >> .env.production && \
    echo "NEXT_PUBLIC_COMPANY_TAGLINE=Your Guide to Unforgettable Destinations" >> .env.production && \
    echo "NEXT_PUBLIC_COMPANY_FOUNDED=2024" >> .env.production && \
    echo "NEXT_PUBLIC_CONTACT_EMAIL=travel@thebettervacation.com" >> .env.production && \
    echo "NEXT_PUBLIC_SUPPORT_EMAIL=travel@thebettervacation.com" >> .env.production && \
    echo "NEXT_PUBLIC_PHONE_NUMBER=+91 73588-08488" >> .env.production && \
    echo "NEXT_PUBLIC_OFFICE_ADDRESS=Firestorm Internet, 203, 30C, Bollineni Hillside, Perumbakkam Main Road, Nookampalayam, Chennai, India – 600126" >> .env.production && \
    echo "NEXT_PUBLIC_SOCIAL_TWITTER=https://twitter.com/bettervacation_" >> .env.production && \
    echo "NEXT_PUBLIC_SOCIAL_LINKEDIN=https://www.linkedin.com/company/thebettervacation/" >> .env.production && \
    echo "NEXT_PUBLIC_SOCIAL_PINTEREST=https://www.pinterest.com/thebettervacation/" >> .env.production && \
    echo "NEXT_PUBLIC_SOCIAL_FACEBOOK=https://www.facebook.com/thebettervacation" >> .env.production && \
    echo "NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://www.instagram.com/thebettervacation/" >> .env.production && \
    echo "NEXT_PUBLIC_SOCIAL_YOUTUBE=https://www.youtube.com/channel/UCmSy2vAcpu2ULN0tHV6aA1A" >> .env.production && \
    echo "NEXT_PUBLIC_STAT_DESTINATIONS=45" >> .env.production && \
    echo "NEXT_PUBLIC_STAT_ATTRACTIONS=966" >> .env.production && \
    echo "NEXT_PUBLIC_STAT_REVIEWS=46000" >> .env.production && \
    echo "NEXT_PUBLIC_STAT_USERS=125000" >> .env.production && \
    echo "NEXT_PUBLIC_FAQ_COUNT=8" >> .env.production && \
    echo "NEXT_PUBLIC_COMPANY_WEBSITE=https://tooryst.co" >> .env.production && \
    echo "NEXT_PUBLIC_PRIVACY_POLICY_URL=/privacy-policy" >> .env.production && \
    echo "NEXT_PUBLIC_TERMS_OF_SERVICE_URL=/terms-of-service" >> .env.production && \
    echo "NEXT_PUBLIC_COOKIE_POLICY_URL=/cookie-policy" >> .env.production && \
    echo "NEXT_PUBLIC_DEFAULT_META_DESCRIPTION=Discover and explore attractions worldwide with authentic travel insights from our community" >> .env.production && \
    echo "NEXT_PUBLIC_SITE_NAME=Tooryst" >> .env.production && \
    echo "NEXT_PUBLIC_BRAND_COLOR=#3B82F6" >> .env.production && \
    echo "NEXT_PUBLIC_ENABLE_CONTACT_FORM=false" >> .env.production && \
    echo "NEXT_PUBLIC_ENABLE_NEWSLETTER=false" >> .env.production && \
    echo "NEXT_PUBLIC_ENABLE_AUTH=false" >> .env.production && \
    echo "NEXT_PUBLIC_ENABLE_BLOG=false" >> .env.production && \
    echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}" >> .env.production && \
    echo "NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=${NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}" >> .env.production && \
    echo "NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw" >> .env.production && \
    echo "NEXT_PUBLIC_FALLBACK_ATTRACTION_IMAGE=/images/fallbacks/attraction-fallback.jpg" >> .env.production && \
    echo "NEXT_PUBLIC_FALLBACK_CITY_IMAGE=/images/fallbacks/city-fallback.jpg" >> .env.production && \
    echo "NEXT_PUBLIC_FALLBACK_HERO_IMAGE=/images/fallbacks/hero-fallback.jpg" >> .env.production && \
    echo "NEXT_PUBLIC_SEARCH_PAGE_SIZE=12" >> .env.production && \
    echo "NEXT_PUBLIC_CITIES_FETCH_LIMIT=100" >> .env.production && \
    echo "NEXT_PUBLIC_ATTRACTIONS_FETCH_LIMIT=12" >> .env.production && \
    echo "NEXT_PUBLIC_COUNTRY_DATA_LIMIT=1000" >> .env.production && \
    echo "NEXT_PUBLIC_MAP_DEFAULT_ZOOM=13" >> .env.production && \
    echo "NEXT_PUBLIC_MAP_BOUNDS_PADDING_TOP=50" >> .env.production && \
    echo "NEXT_PUBLIC_MAP_BOUNDS_PADDING_RIGHT=50" >> .env.production && \
    echo "NEXT_PUBLIC_MAP_BOUNDS_PADDING_BOTTOM=50" >> .env.production && \
    echo "NEXT_PUBLIC_MAP_BOUNDS_PADDING_LEFT=50" >> .env.production && \
    echo "NEXT_PUBLIC_MAP_RETRY_LIMIT=2" >> .env.production && \
    echo "NEXT_PUBLIC_COLLAGE_IMAGE_LIMIT=6" >> .env.production && \
    echo "NEXT_PUBLIC_SEARCH_SUGGESTION_LIMIT=5" >> .env.production && \
    echo "NEXT_PUBLIC_DEBOUNCE_MS=300" >> .env.production && \
    echo "NEXT_PUBLIC_RATING_DECIMAL_PLACES=1" >> .env.production && \
    echo "NEXT_PUBLIC_DEFAULT_BACKGROUND=linear-gradient(120deg, rgba(37,99,235,0.85), rgba(147,51,234,0.85))" >> .env.production && \
    echo "NEXT_PUBLIC_HERO_OVERLAY=linear-gradient(120deg, rgba(15,23,42,0.7), rgba(15,23,42,0.4))" >> .env.production && \
    echo "NEXT_PUBLIC_GA_ID=toosits" >> .env.production && \
    echo "NEXT_PUBLIC_HOTJAR_ID=" >> .env.production && \
    echo "NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}" >> .env.production && \
    echo "NEXT_PUBLIC_APP_VERSION=1.0.0" >> .env.production && \
    echo "NEXT_PUBLIC_MAINTENANCE_MODE=false" >> .env.production && \
    echo "NEXT_PUBLIC_MAINTENANCE_MESSAGE=We are currently performing scheduled maintenance. Please check back soon!" >> .env.production && \
    echo "NEXT_PUBLIC_SEARCH_TITLE=Search Tooryst" >> .env.production && \
    echo "NEXT_PUBLIC_SEARCH_PLACEHOLDER=Search cities or attractions" >> .env.production && \
    echo "NEXT_PUBLIC_SEARCH_BUTTON=Search" >> .env.production && \
    echo "NEXT_PUBLIC_SEARCH_LOADING=Searching…" >> .env.production && \
    echo "NEXT_PUBLIC_SEARCH_NO_RESULTS=No results found. Try a different search term or explore popular cities." >> .env.production && \
    echo "NEXT_PUBLIC_SEARCH_EMPTY_STATE=No cities or attractions available. Try searching for a specific city or attraction." >> .env.production && \
    echo "NEXT_PUBLIC_SEARCH_ERROR=Something went wrong. Try again." >> .env.production && \
    echo "NEXT_PUBLIC_FILTER_CITIES=Cities" >> .env.production && \
    echo "NEXT_PUBLIC_FILTER_ATTRACTIONS=Attractions" >> .env.production && \
    echo "NEXT_PUBLIC_CITY_CARD_ATTRACTIONS_LABEL=attractions" >> .env.production && \
    echo "NEXT_PUBLIC_CITY_CARD_VIEW_BUTTON=View city guide →" >> .env.production && \
    echo "NEXT_PUBLIC_SECTION_CITIES_HEADER=Cities" >> .env.production && \
    echo "NEXT_PUBLIC_SECTION_ATTRACTIONS_HEADER=Attractions" >> .env.production && \
    echo "NEXT_PUBLIC_TRENDING_EYEBROW=Trending Now" >> .env.production && \
    echo "NEXT_PUBLIC_TRENDING_HEADING=Live attraction signals" >> .env.production && \
    echo "NEXT_PUBLIC_TRENDING_SUBHEADING=Based on real visitor demand, crowd comfort, and seasonal weather." >> .env.production && \
    echo "NEXT_PUBLIC_TRENDING_EMPTY=No trending attractions available yet." >> .env.production && \
    echo "NEXT_PUBLIC_CITIES_EYEBROW=Explore" >> .env.production && \
    echo "NEXT_PUBLIC_CITIES_HEADING=Popular Cities" >> .env.production && \
    echo "NEXT_PUBLIC_CITIES_SEE_ALL=See all cities →" >> .env.production && \
    echo "NEXT_PUBLIC_CITIES_EMPTY=No cities available yet." >> .env.production && \
    echo "NEXT_PUBLIC_GLOBE_EYEBROW=Global" >> .env.production && \
    echo "NEXT_PUBLIC_GLOBE_HEADING=Explore the World" >> .env.production && \
    echo "NEXT_PUBLIC_GLOBE_VIEW_CITY=View City →" >> .env.production && \
    echo "NEXT_PUBLIC_NEWSLETTER_EYEBROW=Stay in the loop" >> .env.production && \
    echo "NEXT_PUBLIC_NEWSLETTER_HEADING=Get next-week travel intel" >> .env.production && \
    echo "NEXT_PUBLIC_NEWSLETTER_SUBHEADING=Weekly guidance on crowd comfort, ideal itineraries, and under-the-radar cities." >> .env.production && \
    echo "NEXT_PUBLIC_NEWSLETTER_PLACEHOLDER=you@example.com" >> .env.production && \
    echo "NEXT_PUBLIC_NEWSLETTER_BUTTON=Get travel intel" >> .env.production && \
    echo "NEXT_PUBLIC_EMPTY_STATE_HEADING=No Data Available" >> .env.production && \
    echo "NEXT_PUBLIC_EMPTY_STATE_MESSAGE=The database is empty. Import attractions data to get started with your travel storyboard." >> .env.production && \
    echo "NEXT_PUBLIC_EMPTY_STATE_SETUP_TITLE=Setup Instructions" >> .env.production && \
    echo "NEXT_PUBLIC_LOADING_GLOBE=Loading globe..." >> .env.production && \
    echo "NEXT_PUBLIC_LOADING_RESULTS=Loading results…" >> .env.production && \
    echo "NEXT_PUBLIC_PAGINATION_PREVIOUS=Previous" >> .env.production && \
    echo "NEXT_PUBLIC_PAGINATION_NEXT=Next" >> .env.production && \
    echo "NEXT_PUBLIC_PAGINATION_PAGE=Page" >> .env.production && \
    echo "NEXT_PUBLIC_ACTION_VIEW=View" >> .env.production && \
    echo "NEXT_PUBLIC_ACTION_EXPLORE=Explore" >> .env.production && \
    echo "NEXT_PUBLIC_ACTION_SEARCH=Search" >> .env.production && \
    echo "NEXT_PUBLIC_ACTION_FILTER=Filter" >> .env.production && \
    echo "NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}" >> .env.production && \
    echo "NEXT_PUBLIC_SENTRY_ENVIRONMENT=${NEXT_PUBLIC_SENTRY_ENVIRONMENT}" >> .env.production && \
    echo "NEXT_PUBLIC_SENTRY_ENABLED=true" >> .env.production && \
    echo "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=1.0" >> .env.production && \
    echo "NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1" >> .env.production && \
    echo "NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0" >> .env.production && \
    echo "SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}" >> .env.production

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
