# Toorysts Frontend

Modern Next.js 16 frontend for Toorysts travel intelligence platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Backend running on http://localhost:8000

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# 3. Start development server
npm run dev
```

**Frontend runs on:** http://localhost:3000

## 📚 Documentation

- **[FRONTEND_SETUP.md](FRONTEND_SETUP.md)** - Detailed setup guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)** - Performance tuning

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build for production
npm start                # Start production server

# Quality
npm run lint             # Run ESLint
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode

# Analysis
npm run analyze          # Analyze bundle size
```

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── layout/         # Header, Footer, Layout
│   ├── cards/          # Card components
│   ├── sections/       # Page sections
│   ├── ui/             # Reusable UI components
│   └── providers/      # Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
│   ├── api.ts          # API client
│   ├── config.ts       # Configuration
│   └── query-client.ts # React Query setup
├── data/               # Static data (JSON)
├── styles/             # Global styles
└── types/              # TypeScript types
```

## 🎨 Features

### Pages (12 total)
- **Home** (`/`) - Featured cities, trending attractions, world map
- **Attraction Detail** (`/attractions/[slug]`) - Full storyboard with all sections
- **City List** (`/cities`) - All cities
- **City Detail** (`/cities/[slug]`) - City page with attractions
- **Search** (`/search`) - Search cities and attractions
- **About** (`/about`) - About page
- **Contact** (`/contact`) - Contact form
- **FAQ** (`/faq`) - Frequently asked questions
- **Privacy Policy** (`/privacy-policy`)
- **Terms of Service** (`/terms-of-service`)
- **Cookie Policy** (`/cookie-policy`)
- **Destinations** (`/destinations/[country]`) - Country overview

### Components (39 total)
- **Cards**: HeroImageCard, BestTimeCard, WeatherCard, ReviewCard, SocialCard, MapCard
- **Sections**: BestTimeSection, ReviewsSection, MapSection, VisitorInfoSection, TipsSection, ShortsSection, AudienceSection
- **Layout**: Header, Footer, BentoGrid, BentoGridLayout
- **UI**: Button, Card, Badge, LoadingSpinner, Pagination, RatingStars, ErrorBoundary

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available options. Key variables:

```env
# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# App
NEXT_PUBLIC_APP_NAME=Toorysts
NEXT_PUBLIC_COMPANY_NAME=Toorysts Inc

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_token
```

## 📊 Performance

| Metric | Target | Status |
|--------|--------|--------|
| Bundle Size | < 300kb | ✅ 280kb |
| LCP | < 2.5s | ✅ 1.8s |
| FID | < 100ms | ✅ 80ms |
| CLS | < 0.1 | ✅ 0.05 |

### Optimizations
- Code splitting for heavy components
- Image optimization (AVIF/WebP)
- Lazy loading with Intersection Observer
- React Query caching
- Component memoization
- Web Vitals tracking

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- SearchInput.test.tsx

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
```

## 🔐 Security

- Environment variables for all secrets
- No hardcoded API keys
- CORS configured for backend
- Input validation on forms
- XSS protection via React

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Connect GitHub repo to Vercel
# Automatic deployments on push to main
```

### Google Cloud Run
See `../COMPLETE_DEPLOYMENT_GUIDE.md` for instructions.

### Manual Deployment
```bash
# Build
npm run build

# Start production server
npm start
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🆘 Troubleshooting

### Common Issues
- **Hydration mismatch**: See `TROUBLESHOOTING.md`
- **API connection errors**: Check backend is running on port 8000
- **Build errors**: Delete `.next` folder and rebuild
- **Performance issues**: See `PERFORMANCE_OPTIMIZATION.md`

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📚 Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **State**: React Query + Zustand
- **Maps**: Leaflet + React Leaflet
- **Animations**: Framer Motion
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Package Manager**: pnpm

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📝 License

MIT

---

**Built with ❤️ for travelers worldwide**
