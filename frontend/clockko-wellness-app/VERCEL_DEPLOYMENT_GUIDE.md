# ClockKo Frontend - Vercel Deployment Guide

## Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Backend Deployed**: Your FastAPI backend should be deployed first (Railway/Render/etc.)
4. **Google OAuth Setup**: Production OAuth client configured

## Step-by-Step Deployment

### 1. Prepare Environment Variables
Before deploying, you need to set up your production environment variables in Vercel:

**Required Variables:**
```bash
VITE_API_BASE_URL=https://your-backend-url.com
VITE_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
```

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend/clockko-wellness-app`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend/clockko-wellness-app

# Deploy
vercel

# For production deployment
vercel --prod
```

### 3. Configure Environment Variables in Vercel
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend-url.com` | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID` | `your-production-client-id.apps.googleusercontent.com` | Production, Preview, Development |
| `VITE_APP_ENV` | `production` | Production |
| `VITE_ENABLE_DEBUG` | `false` | Production |

### 4. Update Google OAuth Settings
In Google Cloud Console:
1. Go to **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add your Vercel domains to **Authorized JavaScript origins**:
   ```
   https://your-app-name.vercel.app
   https://your-custom-domain.com (if using custom domain)
   ```
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app
   https://your-custom-domain.com (if using custom domain)
   ```

### 5. Custom Domain (Optional)
1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Google OAuth settings with new domain

## Deployment Configuration Files

The project includes optimized configuration:

### `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
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
    }
  ]
}
```

### Build Optimization
- **Static Asset Caching**: Assets cached for 1 year
- **Security Headers**: XSS protection, content type sniffing prevention
- **SPA Routing**: All routes redirect to `index.html` for client-side routing

## Troubleshooting

### Common Issues

#### 1. 404 on Page Refresh
**Problem**: Direct navigation to routes returns 404
**Solution**: Ensure `vercel.json` includes the catch-all route (already configured)

#### 2. Environment Variables Not Working
**Problem**: `VITE_` variables not available in build
**Solution**: 
- Ensure variables are prefixed with `VITE_`
- Set in Vercel Dashboard, not just in `.env` files
- Redeploy after adding variables

#### 3. API Calls Failing
**Problem**: Cannot connect to backend
**Solutions**:
- Verify `VITE_API_BASE_URL` is correct
- Check backend CORS settings allow your Vercel domain
- Ensure backend is deployed and accessible

#### 4. Google OAuth Not Working
**Problem**: OAuth redirect fails
**Solutions**:
- Add Vercel domain to Google OAuth authorized origins
- Use production OAuth client ID
- Check redirect URIs are correctly configured

### Build Errors

#### Missing Dependencies
```bash
# If build fails due to missing dependencies
npm install
```

#### TypeScript Errors
```bash
# Check for TypeScript errors locally
npm run build

# Fix any type errors before deploying
```

### Performance Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

#### Environment-Specific Builds
- Production builds automatically optimize for size and performance
- Source maps disabled in production
- Console logs can be conditionally disabled

## Post-Deployment Checklist

- [ ] Frontend accessible at Vercel URL
- [ ] All pages load correctly (no 404s)
- [ ] API calls work properly
- [ ] Google OAuth login functional
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable (Lighthouse score)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Environment variables properly set

## Monitoring and Maintenance

### Vercel Analytics
Enable Vercel Analytics for insights:
1. Vercel Dashboard → **Analytics**
2. Enable Web Analytics
3. Monitor Core Web Vitals

### Deployment Previews
- Every push to non-main branches creates preview deployments
- Use for testing before production deployment
- Preview URLs are automatically generated

### Automatic Deployments
- Production: Automatically deploys from `main` branch
- Preview: Automatically creates previews for pull requests
- Configure branch settings in Vercel Dashboard

## Support

### Vercel Documentation
- [Vercel Vite Guide](https://vercel.com/guides/deploying-vite-to-vercel)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)

### Project-Specific Issues
- Check backend connectivity
- Verify OAuth configuration
- Review build logs in Vercel Dashboard