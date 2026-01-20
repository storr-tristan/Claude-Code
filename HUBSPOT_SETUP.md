# HubSpot CRM Card Setup Guide

This guide explains how to integrate the Performance Metrics Dashboard as a custom CRM card in HubSpot.

## Prerequisites

1. HubSpot account with access to CRM Extensions
2. Your app deployed on Azure (see deployment guide)
3. HubSpot developer account

## Setup Steps

### 1. Create a HubSpot App

1. Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Click "Create app" in the "Apps" section
3. Fill in your app details:
   - **App name**: Performance Metrics Dashboard
   - **Description**: Fetch advertising metrics from multiple platforms
   - **Logo**: Upload your company logo (optional)

### 2. Configure CRM Cards

1. In your HubSpot app settings, navigate to "CRM Cards"
2. Click "Create CRM card"
3. Configure the card:
   - **Title**: Performance Metrics
   - **Data fetch URL**: `https://YOUR_AZURE_APP_URL.azurewebsites.net`
   - **Target record types**: Select where the card should appear:
     - ✓ Contacts
     - ✓ Companies
     - ✓ Deals
     - (Select based on your use case)

### 3. Configure the iFrame

Since this is a custom React app, you'll use an iFrame card:

1. Choose "iFrame" as the card type
2. Set the iFrame URL to your deployed frontend: `https://YOUR_AZURE_STATIC_APP_URL.azurestaticapps.net`
3. Configure iFrame properties:
   - **Width**: 100%
   - **Height**: 600px (adjust as needed)

### 4. Set Up Authentication (Optional)

For production use with HubSpot context:

1. In your app settings, go to "Auth"
2. Set up OAuth if you want to authenticate users
3. Add the following scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.companies.read`
   - `crm.objects.deals.read`

### 5. Install the App

1. In the developer portal, click "Install" to install the app in your HubSpot account
2. Grant the requested permissions
3. The card should now appear in the selected record types

## Testing the Card

1. Navigate to a Contact, Company, or Deal record in HubSpot
2. Look for the "Performance Metrics" card in the right sidebar
3. Test the functionality:
   - Select a platform
   - Choose an account
   - Pick a date range
   - Fetch metrics
   - Edit and copy the output

## Customization Options

### Adjusting Card Position

In HubSpot CRM, you can:
- Drag and drop the card to reorder it
- Pin it to the top of the sidebar
- Hide it if not needed

### Styling for HubSpot

The app uses HubSpot's brand colors (orange: #ff7a59). You can customize these in:
- `frontend/tailwind.config.js` - Color scheme
- `frontend/src/App.tsx` - Layout and spacing

## Troubleshooting

### Card Not Loading

1. Check browser console for CORS errors
2. Verify your Azure app URL is correct
3. Ensure the app is deployed and running
4. Check that CORS is enabled on your backend:
   ```typescript
   // In backend/src/index.ts
   app.use(cors({
     origin: '*', // Or specify HubSpot domains
   }));
   ```

### No Data Showing

1. Verify the backend API is running
2. Check network tab for failed API requests
3. Ensure the backend URL in frontend is correct (check `.env` file)

### Authentication Issues

1. Verify your HubSpot app credentials
2. Check OAuth token hasn't expired
3. Ensure proper scopes are requested

## Production Deployment

For production use:

1. **Security**:
   - Enable HTTPS on both frontend and backend
   - Restrict CORS to HubSpot domains only
   - Store API credentials in Azure Key Vault
   - Implement rate limiting on the backend

2. **CORS Configuration**:
   ```typescript
   // backend/src/config/index.ts
   corsOrigin: process.env.CORS_ORIGIN || 'https://app.hubspot.com'
   ```

3. **Environment Variables**:
   - Set all API credentials in Azure App Service Configuration
   - Never commit `.env` files to version control

## Support

For issues or questions:
- Check the main README.md for setup instructions
- Review HubSpot's [CRM Cards documentation](https://developers.hubspot.com/docs/api/crm/extensions/custom-cards)
- Contact your development team

## Next Steps

1. Connect real API credentials (see backend/.env.example)
2. Replace mock services with actual API integrations
3. Add error logging and monitoring
4. Implement user feedback collection
