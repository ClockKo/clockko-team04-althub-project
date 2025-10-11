# Pre-Deployment Checklist for Vercel

## Before Deployment

### 1. Code Quality
- [ ] Run `npm run lint` - Fix all linting errors
- [ ] Run `npm run type-check` - Fix all TypeScript errors  
- [ ] Run `npm run test` - All tests passing
- [ ] Run `npm run build` - Build completes successfully

### 2. Environment Setup
- [ ] Backend API deployed and accessible
- [ ] Update `.env.production` with correct backend URL
- [ ] Google OAuth client ID configured for production domain
- [ ] All required environment variables identified

### 3. Configuration Files
- [ ] `vercel.json` configured correctly
- [ ] `vite.config.ts` optimized for production
- [ ] Package.json scripts updated

## Deployment Steps

### 1. Quick Local Test
```bash
# Test production build locally
npm run build
npm run preview
```

### 2. Deploy to Vercel
Choose one method:

#### Method A: Vercel Dashboard
1. Push code to GitHub
2. Import project in Vercel Dashboard  
3. Set root directory to `frontend/clockko-wellness-app`
4. Configure environment variables
5. Deploy

#### Method B: Vercel CLI
```bash
# Install CLI if not already installed
npm i -g vercel

# Deploy from project root
cd frontend/clockko-wellness-app
vercel --prod
```

### 3. Environment Variables in Vercel
Set these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://your-backend-url.com
VITE_GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com  
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false
```

## Post-Deployment Testing

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works (no 404 on refresh)
- [ ] Login/logout functionality 
- [ ] API calls successful
- [ ] Google OAuth working

### 2. Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals acceptable
- [ ] Fast loading on mobile/desktop

### 3. Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox  
- [ ] Safari (if available)
- [ ] Mobile browsers

## Common Issues & Solutions

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variable Issues
- Ensure all variables prefixed with `VITE_`
- Set in Vercel Dashboard, not just local files
- Redeploy after adding variables

### API Connection Issues  
- Check CORS settings in backend
- Verify backend URL is correct and accessible
- Test API endpoints directly

### OAuth Issues
- Add Vercel domain to Google OAuth authorized origins
- Use production OAuth client ID
- Check redirect URIs

## Rollback Plan
If deployment fails:
1. Revert to previous Vercel deployment via dashboard
2. Fix issues locally
3. Test thoroughly before redeploying

## Monitoring
After successful deployment:
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring
- [ ] Monitor performance metrics
- [ ] Set up deployment notifications

## Files Created/Modified
- `vercel.json` - Vercel configuration
- `.env.production` - Production environment template  
- `vite.config.ts` - Optimized for production
- `package.json` - Added deployment scripts
- `VERCEL_DEPLOYMENT_GUIDE.md` - Detailed deployment guide

## Next Steps
1. Complete this checklist
2. Deploy to Vercel
3. Test thoroughly
4. Configure custom domain (optional)
5. Set up monitoring and analytics