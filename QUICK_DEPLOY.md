# Quick Deploy Guide - Test Your App in 5 Minutes

## Deploy Backend (Render.com - FREE)

1. Go to https://render.com and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your repository: `Claude-Code`
4. Configure:
   - **Name**: `hubspot-metrics-api`
   - **Branch**: `claude/hubspot-react-design-tRjaK`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Click **"Create Web Service"**
6. **Copy the URL** (e.g., `https://hubspot-metrics-api.onrender.com`)

## Deploy Frontend (Vercel - FREE)

1. Go to https://vercel.com and sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your repository: `Claude-Code`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL` = `https://your-render-backend-url.onrender.com/api`

5. Click **"Deploy"**
6. **Your app is live!** Vercel gives you a URL like: `https://claude-code-xxx.vercel.app`

## Test Your Live App

Visit your Vercel URL and test:
1. Select a platform
2. Choose an account
3. Pick a date range
4. Fetch metrics
5. Copy the output

## Alternative: Deploy Both to Render

Render can also host the frontend:

1. Create another Web Service for frontend
2. Set **Static Site** instead
3. Build command: `cd frontend && npm install && npm run build`
4. Publish directory: `frontend/dist`

## Update Backend CORS

Once deployed, update your backend environment variable on Render:
- `CORS_ORIGIN` = `https://your-vercel-app.vercel.app`

Restart the backend service on Render.

## That's It!

You now have a live, publicly accessible version of your HubSpot Metrics Dashboard that you can:
- Test from any device
- Share with your team
- Demo to stakeholders
- Embed in HubSpot

Both Vercel and Render offer:
- ✅ Free tier (no credit card needed)
- ✅ Automatic deployments on git push
- ✅ HTTPS by default
- ✅ Custom domains (optional)
