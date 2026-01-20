# Azure Deployment Guide

This guide covers deploying both the frontend and backend of the HubSpot Metrics Dashboard to Azure.

## Architecture Overview

- **Frontend**: Azure Static Web Apps (React application)
- **Backend**: Azure App Service (Node.js API)

## Prerequisites

1. Azure account with an active subscription
2. [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
3. Node.js 18+ installed locally
4. Git installed

## Part 1: Deploy Backend API to Azure App Service

### Option A: Using Azure Portal

1. **Create an App Service**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource" → "Web App"
   - Configure:
     - **Name**: `hubspot-metrics-api` (must be globally unique)
     - **Runtime stack**: Node 18 LTS
     - **Operating System**: Linux
     - **Region**: Choose closest to your users
     - **Pricing**: B1 (Basic) or higher

2. **Configure Deployment**:
   - In your App Service, go to "Deployment Center"
   - Choose deployment source:
     - **GitHub**: Connect your repository (recommended)
     - **Local Git**: Push directly from local
     - **Azure Pipelines**: For CI/CD

3. **Set Environment Variables**:
   - Go to "Configuration" → "Application settings"
   - Add the following:
     ```
     PORT=8080
     NODE_ENV=production
     CORS_ORIGIN=https://YOUR_STATIC_WEB_APP_URL.azurestaticapps.net

     # Add your API credentials
     GOOGLE_ADS_CLIENT_ID=your_value
     GOOGLE_ADS_CLIENT_SECRET=your_value
     # ... etc (see backend/.env.example)
     ```

4. **Deploy**:
   - If using GitHub: Push to main branch to trigger deployment
   - If using Local Git:
     ```bash
     cd backend
     git remote add azure <your-azure-git-url>
     git push azure main
     ```

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create a resource group
az group create --name hubspot-metrics-rg --location eastus

# Create an App Service Plan
az appservice plan create \
  --name hubspot-metrics-plan \
  --resource-group hubspot-metrics-rg \
  --sku B1 \
  --is-linux

# Create the Web App
az webapp create \
  --name hubspot-metrics-api \
  --resource-group hubspot-metrics-rg \
  --plan hubspot-metrics-plan \
  --runtime "NODE|18-lts"

# Configure startup command
az webapp config set \
  --name hubspot-metrics-api \
  --resource-group hubspot-metrics-rg \
  --startup-file "node dist/index.js"

# Set environment variables
az webapp config appsettings set \
  --name hubspot-metrics-api \
  --resource-group hubspot-metrics-rg \
  --settings \
    PORT=8080 \
    NODE_ENV=production \
    CORS_ORIGIN=https://YOUR_STATIC_WEB_APP_URL.azurestaticapps.net

# Deploy from local Git
cd backend
npm run build
az webapp deployment source config-local-git \
  --name hubspot-metrics-api \
  --resource-group hubspot-metrics-rg

# Get deployment credentials and push
git remote add azure <deployment-url>
git push azure main
```

### Backend Deployment Script

Create a deployment script for easy updates:

```bash
# backend/deploy.sh
#!/bin/bash

echo "Building backend..."
npm run build

echo "Deploying to Azure..."
az webapp deployment source config-zip \
  --resource-group hubspot-metrics-rg \
  --name hubspot-metrics-api \
  --src dist.zip

echo "Deployment complete!"
```

## Part 2: Deploy Frontend to Azure Static Web Apps

### Option A: Using Azure Portal

1. **Create Static Web App**:
   - Go to Azure Portal
   - Click "Create a resource" → "Static Web App"
   - Configure:
     - **Name**: `hubspot-metrics-frontend`
     - **Region**: Choose closest to your users
     - **Source**: GitHub (recommended)
     - **Repository**: Select your repo
     - **Branch**: main
     - **Build Presets**: React
     - **App location**: `/frontend`
     - **Output location**: `dist`

2. **Configure Environment Variables**:
   - In Static Web App settings, go to "Configuration"
   - Add:
     ```
     VITE_API_URL=https://hubspot-metrics-api.azurewebsites.net/api
     ```

3. **Deploy**:
   - Push to your main branch
   - GitHub Actions will automatically build and deploy

### Option B: Using Azure CLI

```bash
# Create Static Web App
az staticwebapp create \
  --name hubspot-metrics-frontend \
  --resource-group hubspot-metrics-rg \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location eastus \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist" \
  --login-with-github

# Configure app settings
az staticwebapp appsettings set \
  --name hubspot-metrics-frontend \
  --setting-names VITE_API_URL=https://hubspot-metrics-api.azurewebsites.net/api
```

### Frontend Deployment Configuration

Azure Static Web Apps uses a configuration file for build settings:

Create `.github/workflows/azure-static-web-apps.yml` (auto-generated):

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          api_location: ""
          output_location: "dist"
```

## Part 3: Configure Custom Domains (Optional)

### Backend (App Service)

```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name hubspot-metrics-api \
  --resource-group hubspot-metrics-rg \
  --hostname api.yourdomain.com

# Enable HTTPS
az webapp config ssl bind \
  --certificate-thumbprint YOUR_CERT_THUMBPRINT \
  --ssl-type SNI \
  --name hubspot-metrics-api \
  --resource-group hubspot-metrics-rg
```

### Frontend (Static Web App)

1. In Azure Portal, go to your Static Web App
2. Navigate to "Custom domains"
3. Click "Add" and follow the prompts
4. Update DNS records as instructed
5. SSL certificate is automatically provisioned

## Part 4: Post-Deployment Configuration

### Update CORS Settings

After deploying both apps, update the backend CORS configuration:

1. Go to App Service → Configuration
2. Update `CORS_ORIGIN` to your Static Web App URL
3. Restart the App Service

### Update Frontend API URL

1. Go to Static Web App → Configuration
2. Set `VITE_API_URL` to your App Service URL
3. Trigger a new deployment

### Test the Deployment

1. Visit your Static Web App URL
2. Open browser console
3. Test each platform:
   - Select a platform
   - Choose an account
   - Fetch metrics
4. Verify no CORS errors
5. Check that metrics are displayed

## Monitoring and Logging

### Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app hubspot-metrics-insights \
  --location eastus \
  --resource-group hubspot-metrics-rg

# Connect to App Service
az webapp config appsettings set \
  --name hubspot-metrics-api \
  --resource-group hubspot-metrics-rg \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING=<connection-string>
```

### View Logs

```bash
# Stream App Service logs
az webapp log tail \
  --name hubspot-metrics-api \
  --resource-group hubspot-metrics-rg

# View Static Web App logs
az staticwebapp logs show \
  --name hubspot-metrics-frontend \
  --resource-group hubspot-metrics-rg
```

## Troubleshooting

### Backend Issues

1. **App won't start**:
   - Check startup command: `node dist/index.js`
   - Verify Node version: 18 LTS
   - Check logs: `az webapp log tail`

2. **500 errors**:
   - Check environment variables
   - Verify build succeeded (`npm run build`)
   - Check Application Insights for errors

### Frontend Issues

1. **Build fails**:
   - Check `app_location` and `output_location` in workflow
   - Verify dependencies in package.json
   - Check GitHub Actions logs

2. **API calls fail**:
   - Verify VITE_API_URL is set correctly
   - Check CORS configuration on backend
   - Inspect network tab in browser

## Cost Optimization

- **Development**: Use Free tier for Static Web Apps, B1 for App Service
- **Production**: Consider P1V2 or higher for App Service with autoscaling
- **Monitoring**: Application Insights has a generous free tier

## Security Best Practices

1. **Use Azure Key Vault** for API credentials:
   ```bash
   # Create Key Vault
   az keyvault create \
     --name hubspot-metrics-kv \
     --resource-group hubspot-metrics-rg \
     --location eastus

   # Add secrets
   az keyvault secret set \
     --vault-name hubspot-metrics-kv \
     --name GoogleAdsClientId \
     --value "your-client-id"
   ```

2. **Enable Managed Identity** for App Service to access Key Vault

3. **Restrict CORS** to only HubSpot and your frontend domains

4. **Enable HTTPS only** on both services

5. **Set up Azure Front Door** for additional security and CDN

## Continuous Deployment

Both services support automatic deployment:

- **Frontend**: Push to main branch triggers GitHub Actions
- **Backend**: Set up GitHub Actions or Azure Pipelines

Example backend GitHub Action:

```yaml
# .github/workflows/backend-deploy.yml
name: Deploy Backend to Azure

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Build
        run: |
          cd backend
          npm run build

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: hubspot-metrics-api
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: backend
```

## Support

For Azure-specific issues:
- [Azure Documentation](https://docs.microsoft.com/en-us/azure/)
- [Azure Support](https://azure.microsoft.com/en-us/support/)
