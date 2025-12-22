# SEO & AEO Testing Guide for Localhost

## 🚀 Quick Start Testing

### 1. Start Your Development Server

```bash
cd client
pnpm install
pnpm run dev
```

Your app should be running at `http://localhost:3000`

### 2. Test Basic Pages

Open these URLs in your browser:

- **Homepage**: http://localhost:3000
- **City Page**: http://localhost:3000/paris (or any city slug)
- **Attraction Page**: http://localhost:3000/paris/eiffel-tower (or any attraction)
- **About Page**: http://localhost:3000/about
- **Contact Page**: http://localhost:3000/contact

## 🔍 Testing Metadata

### Method 1: View Page Source (Easiest)

1. Open any page in your browser
2. Right-click → "View Page Source" (or press `Ctrl+U` / `Cmd+U`)
3. Search for these tags:

**Look for:**
```html
<!-- Page Title -->
<title>Paris Travel Guide | Tooryst - Best Time to Visit</title>

<!-- Meta Description -->
<meta name="description" content="Discover Paris's top 150 attractions...">

<!-- Open Graph Tags -->
<meta property="og:title" content="Paris Travel Guide | Tooryst">
<meta property="og:image" content="/api/collage?images=...">
<meta property="og:url" content="http://localhost:3000/paris">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Paris Travel Guide | Tooryst">

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "City",
  "name": "Paris"
}
</script>
```

### Method 2: Browser DevTools

1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Go to **Elements** tab
3. Expand `<head>` section
4. Look for `<meta>` tags and `<script type="application/ld+json">`

### Method 3: SEO Browser Extensions

Install these Chrome/Firefox extensions:

1. **META SEO inspector** - Shows all meta tags
2. **SEO Meta in 1 Click** - Quick SEO overview
3. **Detailed SEO Extension** - Comprehensive analysis

## 🖼️ Testing City Image Collages

### Test Collage API Endpoint

1. **Find a city with attractions**:
   ```
   http://localhost:3000/paris
   ```

2. **View page source** and find the collage URL:
   ```html
   <meta property="og:image" content="/api/collage?images=url1,url2,url3&city=Paris&width=1200&height=630">
   ```

3. **Copy the collage URL** and open it directly:
   ```
   http://localhost:3000/api/collage?images=https://example.com/img1.jpg,https://example.com/img2.jpg&city=Paris&width=1200&height=630
   ```

4. **You should see**: An SVG image with 6 attraction images in a grid

### Test Collage Component

Create a test page to see the collage:

```typescript
// client/src/app/test-collage/page.tsx
import { CityCollage } from '@/components/ui/CityCollage';

export default function TestCollagePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">City Collage Test</h1>
      <CityCollage 
        citySlug="paris" 
        cityName="Paris"
        width={1200}
        height={630}
      />
    </div>
  );
}
```

Visit: `http://localhost:3000/test-collage`

## 📊 Testing Structured Data

### Method 1: View in Browser

1. Open any page
2. View page source
3. Search for `application/ld+json`
4. Copy the JSON content
5. Paste into a JSON formatter to verify structure

### Method 2: Google Rich Results Test (Works with localhost!)

1. Open your page in browser
2. View page source
3. Copy the **entire HTML** (Ctrl+A, Ctrl+C)
4. Go to: https://search.google.com/test/rich-results
5. Click **"CODE"** tab
6. Paste your HTML
7. Click **"TEST CODE"**
8. See validation results!

### Method 3: Schema Markup Validator

1. Copy structured data JSON from page source
2. Go to: https://validator.schema.org/
3. Paste JSON
4. Click **"Validate"**
5. Fix any errors shown

## 🗺️ Testing Sitemap

### View Sitemap

Open in browser:
```
http://localhost:3000/sitemap.xml
```

**You should see:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:3000</loc>
    <lastmod>2024-12-22</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>http://localhost:3000/paris</loc>
    <lastmod>2024-12-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- More URLs... -->
</urlset>
```

### Validate Sitemap

1. Copy sitemap XML content
2. Go to: https://www.xml-sitemaps.com/validate-xml-sitemap.html
3. Paste XML
4. Click **"Validate"**

## 🤖 Testing Robots.txt

### View Robots.txt

Open in browser:
```
http://localhost:3000/robots.txt
```

**You should see:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /search?*

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: http://localhost:3000/sitemap.xml
Host: http://localhost:3000
```

## 🎨 Testing Social Media Previews

### Facebook/LinkedIn Preview

**Option 1: Facebook Sharing Debugger (Requires public URL)**
- Won't work with localhost directly
- Use ngrok (see below) to test

**Option 2: Manual Preview**

1. Install browser extension: **Social Share Preview**
2. Visit your page
3. Click extension icon
4. See how it looks on Facebook/LinkedIn

### Twitter Card Preview

**Option 1: Twitter Card Validator (Requires public URL)**
- Won't work with localhost directly
- Use ngrok (see below) to test

**Option 2: Manual Check**

Look for these tags in page source:
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Your Title">
<meta name="twitter:description" content="Your Description">
<meta name="twitter:image" content="http://localhost:3000/api/collage?...">
```

## 🌐 Testing with Public URL (Using ngrok)

To test social media previews and external validators:

### 1. Install ngrok

```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
```

### 2. Start ngrok

```bash
# In a new terminal, while your dev server is running
ngrok http 3000
```

**You'll get a public URL:**
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

### 3. Test with External Tools

Now you can use:

**Facebook Sharing Debugger:**
```
https://developers.facebook.com/tools/debug/
Enter: https://abc123.ngrok.io/paris
```

**Twitter Card Validator:**
```
https://cards-dev.twitter.com/validator
Enter: https://abc123.ngrok.io/paris
```

**Google Rich Results Test:**
```
https://search.google.com/test/rich-results
Enter: https://abc123.ngrok.io/paris
```

## 🧪 Testing Checklist

### Homepage Test
- [ ] Title includes "Tooryst"
- [ ] Meta description present
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Organization schema present
- [ ] Website schema present

### City Page Test (e.g., /paris)
- [ ] Title includes city name
- [ ] Description mentions attraction count
- [ ] Open Graph image is collage URL
- [ ] City schema with geo coordinates
- [ ] Keywords include city name
- [ ] Canonical URL correct

### Attraction Page Test (e.g., /paris/eiffel-tower)
- [ ] Title includes attraction + city name
- [ ] Hero image from database used
- [ ] TouristAttraction schema present
- [ ] Rating/review data included
- [ ] Opening hours present
- [ ] Geo coordinates included

### Static Pages Test
- [ ] About page has unique title
- [ ] Contact page has unique description
- [ ] Privacy policy indexed correctly
- [ ] Terms of service indexed correctly

### Sitemap Test
- [ ] Sitemap accessible at /sitemap.xml
- [ ] Contains all static pages
- [ ] Contains city pages
- [ ] Contains attraction pages
- [ ] Valid XML format

### Robots.txt Test
- [ ] Accessible at /robots.txt
- [ ] Allows main pages
- [ ] Disallows /api/ and /admin/
- [ ] Includes sitemap URL
- [ ] Allows AI crawlers (GPTBot, etc.)

## 🐛 Common Issues & Fixes

### Issue: Collage not showing

**Check:**
1. Do attractions have images in database?
2. Is API endpoint accessible?
3. Check browser console for errors

**Fix:**
```bash
# Check API response
curl http://localhost:3000/api/collage?images=test.jpg&city=Paris
```

### Issue: Metadata not updating

**Fix:**
```bash
# Clear Next.js cache
rm -rf .next
pnpm run dev
```

### Issue: Structured data errors

**Fix:**
1. Copy JSON from page source
2. Validate at https://validator.schema.org/
3. Check for missing required fields
4. Ensure data types match schema

### Issue: Sitemap empty

**Check:**
1. Is backend API running?
2. Are cities/attractions in database?
3. Check console for fetch errors

**Fix:**
```bash
# Test API endpoints
curl http://localhost:8000/api/v1/cities
curl http://localhost:8000/api/v1/attractions
```

## 📱 Testing on Mobile

### Using Your Phone

1. **Find your computer's local IP:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Access from phone:**
   ```
   http://192.168.1.XXX:3000
   ```
   (Replace XXX with your IP)

3. **Test mobile view:**
   - Check responsive design
   - Test collage images
   - Verify meta tags

## 🎯 Quick Test Commands

### Test All Pages at Once

Create a test script:

```bash
# test-seo.sh
#!/bin/bash

echo "Testing SEO Implementation..."

# Test homepage
curl -s http://localhost:3000 | grep -o '<title>.*</title>'

# Test city page
curl -s http://localhost:3000/paris | grep -o '<title>.*</title>'

# Test attraction page
curl -s http://localhost:3000/paris/eiffel-tower | grep -o '<title>.*</title>'

# Test sitemap
curl -s http://localhost:3000/sitemap.xml | head -20

# Test robots
curl -s http://localhost:3000/robots.txt

echo "Tests complete!"
```

Run:
```bash
chmod +x test-seo.sh
./test-seo.sh
```

## 📚 Useful Testing Tools

### Browser Extensions
- **META SEO inspector** - Chrome/Firefox
- **SEO Meta in 1 Click** - Chrome
- **Detailed SEO Extension** - Chrome
- **Social Share Preview** - Chrome

### Online Tools
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Validator**: https://validator.schema.org/
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html

### Command Line Tools
```bash
# Check meta tags
curl -s http://localhost:3000 | grep -i '<meta'

# Check structured data
curl -s http://localhost:3000 | grep -A 20 'application/ld+json'

# Check Open Graph
curl -s http://localhost:3000 | grep 'og:'

# Check Twitter Cards
curl -s http://localhost:3000 | grep 'twitter:'
```

## ✅ Success Indicators

You'll know SEO is working when:

1. ✅ Page titles are dynamic and include city/attraction names
2. ✅ Meta descriptions are unique per page
3. ✅ Open Graph images show collages for cities
4. ✅ Structured data validates without errors
5. ✅ Sitemap includes all your pages
6. ✅ Robots.txt allows search engines
7. ✅ Social media previews look good

---

**Happy Testing! 🚀**

If you encounter any issues, check the console logs and verify your backend API is returning data correctly.