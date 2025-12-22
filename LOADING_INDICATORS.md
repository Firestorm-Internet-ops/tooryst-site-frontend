# Loading Indicators Guide

This guide explains how to use the loading indicators and navigation feedback components in the Tooryst application.

## Overview

The application now includes several loading indicators to provide visual feedback during navigation and async operations:

1. **NavigationProgress** - Top loading bar for page navigation
2. **LoadingSpinner** - Reusable spinner component
3. **NavigationLink** - Link component with loading state
4. **LoadingButton** - Button component with loading state
5. **useNavigationLoading** - Hook for programmatic navigation with loading

## Components

### NavigationProgress

Automatically shows a progress bar at the top of the page during navigation. Already integrated into the root layout.

**Features:**
- Gradient progress bar (blue → purple → pink)
- Smooth animation
- Auto-hides after navigation completes
- Accessible with ARIA attributes

**Location:** `client/src/components/ui/NavigationProgress.tsx`

### LoadingSpinner

A reusable spinner component for loading states.

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// With size
<LoadingSpinner size="small" />
<LoadingSpinner size="medium" />
<LoadingSpinner size="large" />

// With label
<LoadingSpinner label="Loading attractions..." />
```

### NavigationLink

A Link component that shows loading state when clicked.

**Usage:**
```tsx
import { NavigationLink } from '@/components/ui/NavigationLink';

// Basic usage
<NavigationLink href="/attractions/eiffel-tower">
  View Attraction
</NavigationLink>

// With loading spinner
<NavigationLink 
  href="/attractions/eiffel-tower"
  showLoadingSpinner={true}
>
  View Attraction
</NavigationLink>

// With custom loading text
<NavigationLink 
  href="/attractions/eiffel-tower"
  showLoadingSpinner={true}
  loadingText="Loading attraction..."
>
  View Attraction
</NavigationLink>
```

### LoadingButton

A button component with built-in loading state.

**Usage:**
```tsx
import { LoadingButton } from '@/components/ui/LoadingButton';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await someAsyncOperation();
    setIsLoading(false);
  };

  return (
    <LoadingButton
      loading={isLoading}
      onClick={handleClick}
      variant="primary"
      size="medium"
    >
      Submit
    </LoadingButton>
  );
}
```

**Variants:**
- `primary` - Blue background (default)
- `secondary` - Gray background
- `outline` - Border with transparent background
- `ghost` - No background

**Sizes:**
- `small` - Compact button
- `medium` - Standard button (default)
- `large` - Large button

### useNavigationLoading Hook

For programmatic navigation with loading state.

**Usage:**
```tsx
import { useNavigationLoading } from '@/hooks/useNavigationLoading';

function MyComponent() {
  const { isLoading, navigateWithLoading } = useNavigationLoading();

  const handleNavigate = () => {
    navigateWithLoading('/attractions/eiffel-tower');
  };

  return (
    <button onClick={handleNavigate} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Go to Attraction'}
    </button>
  );
}
```

## Implementation Examples

### Attraction Card with Loading

The `AttractionCard` component has been updated to use `NavigationLink`:

```tsx
<NavigationLink
  href={attractionUrl}
  showLoadingSpinner={true}
  className="bg-white rounded-2xl shadow hover:shadow-lg"
>
  {/* Card content */}
</NavigationLink>
```

### Search Results with Loading

```tsx
function SearchResults() {
  const { results, isLoading } = useSearch(query);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner label="Searching..." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {results.map(result => (
        <NavigationLink
          key={result.id}
          href={result.url}
          showLoadingSpinner={true}
        >
          {result.name}
        </NavigationLink>
      ))}
    </div>
  );
}
```

### Form Submission with Loading

```tsx
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitForm();
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <LoadingButton
        type="submit"
        loading={isSubmitting}
        loadingText="Submitting..."
        variant="primary"
        size="large"
      >
        Submit
      </LoadingButton>
    </form>
  );
}
```

## Styling

The loading bar animation is defined in `client/src/app/globals.css`:

```css
@keyframes loading-bar {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-loading-bar {
  animation: loading-bar 1s ease-in-out infinite;
}
```

## Accessibility

All loading components include proper ARIA attributes:

- `role="progressbar"` for progress indicators
- `role="status"` for spinners
- `aria-live="polite"` for dynamic updates
- `aria-label` for screen reader descriptions
- `aria-valuetext` for progress state

## Best Practices

1. **Use NavigationProgress globally** - It's already in the layout, no need to add it elsewhere
2. **Use NavigationLink for internal links** - Provides consistent loading feedback
3. **Use LoadingButton for async actions** - Better UX than disabled buttons
4. **Show loading states for operations > 300ms** - Prevents unnecessary flashing
5. **Provide meaningful loading text** - "Loading attraction..." is better than "Loading..."
6. **Don't stack loading indicators** - One clear indicator is better than multiple

## Performance Considerations

- The NavigationProgress component uses `usePathname` and `useSearchParams` which are client-side only
- Loading states are managed locally to avoid unnecessary re-renders
- Minimum loading time of 300ms prevents flash of loading state for fast operations
- Progress bar completes at 90% and waits for actual navigation to finish

## Troubleshooting

**Loading bar doesn't show:**
- Check that NavigationProgress is in the root layout
- Verify the component is client-side ('use client' directive)

**Loading spinner doesn't appear:**
- Ensure the loading state is properly managed
- Check that the component is imported correctly

**Navigation feels slow:**
- The minimum loading time is 300ms by design
- Adjust the timeout in NavigationProgress if needed

**Multiple loading indicators:**
- Use only one type of loading indicator per action
- The global NavigationProgress handles page navigation
- Use LoadingSpinner or LoadingButton for specific actions
