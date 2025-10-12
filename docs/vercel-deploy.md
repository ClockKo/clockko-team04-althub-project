# Frontend on Vercel (with Google OAuth)

This project is ready to deploy the frontend to Vercel. Vercel simplifies SPA hosting, HTTPS, environment variables, preview deployments, and Google OAuth origins.

## 1) Import the project in Vercel
- In Vercel, click "New Project" → "Import Git Repository" and pick this repo.
- Monorepo settings:
  - Root directory: `frontend/clockko-wellness-app`
  - Build command: `pnpm build`
  - Install command: `pnpm install`
  - Output directory: `dist`
- Framework preset: Vite (Vercel will detect it automatically).
- vercel.json is included to support SPA routing.

## 2) Environment variables (Vercel → Project → Settings → Environment Variables)
- VITE_API_BASE_URL = https://j9zh9oli8b.execute-api.us-east-1.amazonaws.com/api
- VITE_GOOGLE_CLIENT_ID = <your-google-client-id>

Leave VITE_BASE unset on Vercel (Vite defaults to "/").

## 3) Google Cloud Console (OAuth)
Add these to your OAuth Client:
- Authorized JavaScript origins:
  - https://<your-project>.vercel.app
  - Optional custom domain: https://<your-domain>
  - Local dev: http://localhost:5173
- Authorized redirect URIs (if using redirect flows):
  - https://<your-project>.vercel.app
  - https://<your-domain>
  - http://localhost:5173

Note: @react-oauth/google primarily validates the origin; include all domains you’ll use.

## 4) Backend CORS
Update the backend to allow the Vercel origin(s). Our backend reads a comma-separated `FRONTEND_URL` env and configures CORS.

- Terraform variable to set: `frontend_url`
  - Example: `https://<your-project>.vercel.app,https://clockko.github.io`
  - For preview deployments (random .vercel.app subdomains), you can temporarily set `*` in non-production or add specific preview URLs.
- Re-apply Terraform for the ECS task to pick up the new env and restart.

## 5) Verify
- Vercel production URL: https://<your-project>.vercel.app
- App should fetch the API at VITE_API_BASE_URL and Google sign-in should render.
- Backend health checks:
  - API: `GET https://j9zh9oli8b.execute-api.us-east-1.amazonaws.com/health`
  - Google config: `GET https://j9zh9oli8b.execute-api.us-east-1.amazonaws.com/health/google`

## 6) Optional: Custom domain
- Add a custom domain in Vercel and update Google OAuth origins and backend `frontend_url` accordingly.

## 7) Keep or disable GitHub Pages
- You can keep the Pages workflow as a fallback or disable its push trigger if you only want Vercel.

---
Troubleshooting:
- If Google button doesn’t show, confirm both frontend `VITE_GOOGLE_CLIENT_ID` and backend `GOOGLE_CLIENT_ID`/secrets are set, and that your origin is listed in Google Cloud Console.
- If API calls fail due to CORS, re-check the backend `frontend_url` list.
