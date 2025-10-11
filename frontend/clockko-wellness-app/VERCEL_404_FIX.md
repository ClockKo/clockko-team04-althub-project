# Fix for Vercel 404 on Page Refresh - Complete Solution

## 🚨 The Problem
When you refresh a page like `/settings/profile` on your Vercel-hosted SPA, you get a 404 error because:

1. **Vercel tries to find a physical file** at `/settings/profile/index.html`
2. **The file doesn't exist** because React Router handles routing client-side
3. **Result**: 404 Not Found error

## ✅ The Solution

### 1. Updated `vercel.json` Configuration
Your `vercel.json` has been updated with the correct `rewrites` configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2. Added `_redirects` File (Fallback)
A `_redirects` file has been created in `/public/` as additional insurance:

```
/* /index.html 200
```

### 3. React Router Configuration (Already Correct)
Your `App.tsx` uses `BrowserRouter` correctly:

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/settings/profile" element={<ProfileSettings />} />
    {/* Other routes... */}
  </Routes>
</BrowserRouter>
```

## 🔧 Deployment Steps

### Step 1: Remove Conflicting Files
**Important**: Remove the `404.html` file if it exists, as it can interfere:

```bash
# In your project root
rm frontend/clockko-wellness-app/404.html
```

### Step 2: Deploy to Vercel
```bash
cd frontend/clockko-wellness-app

# Test build locally first
npm run build
npm run preview

# Deploy to Vercel
vercel --prod
```

### Step 3: Test After Deployment
1. Visit your Vercel URL (e.g., `https://yourapp.vercel.app`)
2. Navigate to any route (e.g., `/settings/profile`)
3. **Refresh the page** - should NOT get 404
4. Test deep links by directly visiting URLs

## 🔍 Debugging if Still Getting 404s

### Check 1: Verify Vercel Configuration
In Vercel Dashboard → Your Project → Settings → Functions:
- Ensure "Framework Preset" is set to **Vite**
- Check "Output Directory" is set to **dist**

### Check 2: Environment Variables
Ensure your environment variables are set correctly:
- `VITE_API_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`

### Check 3: Build Logs
Check Vercel build logs for any errors:
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Check build logs for errors

### Check 4: Network Tab
In browser DevTools → Network tab:
1. Navigate to a route
2. Refresh page
3. Check if it's loading `/index.html` (should be 200, not 404)

## 🛠️ Alternative Solutions

### Option 1: Use Hash Router (Last Resort)
If `BrowserRouter` continues causing issues, switch to `HashRouter`:

```tsx
import { HashRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      {/* Your routes */}
    </Router>
  )
}
```

**Note**: This changes URLs from `/settings/profile` to `/#/settings/profile`

### Option 2: Subdirectory Deployment
If deploying to a subdirectory, update `vite.config.ts`:

```ts
export default defineConfig({
  base: '/your-subdirectory/',  // e.g., '/clockko/'
  // ... other config
})
```

## ✅ Verification Checklist

After deployment, test these scenarios:

- [ ] Direct navigation to `/` works
- [ ] Direct navigation to `/dashboard` works
- [ ] Direct navigation to `/settings/profile` works
- [ ] Refreshing any page doesn't show 404
- [ ] Browser back/forward buttons work
- [ ] All routes load correctly

## 🎯 Expected Behavior

After implementing this fix:

1. **All routes accessible** via direct URL
2. **Page refresh works** on any route
3. **No 404 errors** on SPA routes
4. **Proper fallback** to React Router for client-side routing

The key is that `rewrites` tells Vercel: "For any path that doesn't match a static file, serve `/index.html` and let React Router handle the routing."

## 🚀 Ready to Deploy

Your configuration is now ready! The next deployment should resolve the 404 refresh issue completely.