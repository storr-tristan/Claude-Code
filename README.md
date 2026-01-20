# HubSpot Performance Metrics Dashboard

A React application designed to be embedded as a HubSpot CRM card, enabling Product Specialists to quickly fetch advertising performance metrics from Google Ads, Meta Ads, Microsoft Ads, and Amazon Ads, and paste them into optimization notes.

## Features

- **Multi-Platform Support**: Query metrics from Google, Meta, Microsoft, and Amazon advertising platforms
- **Dynamic Date Ranges**: Select predefined ranges (7, 14, 30 days) or choose custom dates
- **Editable Output**: Metrics are formatted in Markdown and can be edited before copying
- **One-Click Copy**: Copy formatted metrics directly to clipboard for pasting into HubSpot notes
- **Mock Data Ready**: Built with mock services that can be easily swapped with real API integrations
- **Azure Deployment**: Configured for deployment to Azure Static Web Apps (frontend) and Azure App Service (backend)

## Architecture

```
┌─────────────────────────────────────┐
│   HubSpot CRM Card (iFrame)        │
│   ┌─────────────────────────────┐  │
│   │  React Frontend             │  │
│   │  (Azure Static Web Apps)    │  │
│   └─────────────┬───────────────┘  │
└─────────────────┼───────────────────┘
                  │
                  │ HTTP/REST
                  │
        ┌─────────▼──────────┐
        │  Express Backend   │
        │  (Azure App Service)│
        └─────────┬──────────┘
                  │
        ┌─────────┴──────────┐
        │   Mock Services    │
        │  (Replace with     │
        │   Real APIs)       │
        └────────────────────┘
```

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **Axios** for API requests
- **date-fns** for date manipulation
- **Lucide React** for icons

### Backend
- **Node.js 18+** with TypeScript
- **Express** web framework
- **CORS** enabled for HubSpot embedding
- **Mock services** for each platform (easily replaceable)

## Project Structure

```
.
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── PlatformSelector.tsx
│   │   │   ├── AccountSelector.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   └── MetricsDisplay.tsx
│   │   ├── services/        # API client
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/           # Utility functions
│   │   │   └── formatters.ts
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   │   └── metricsController.ts
│   │   ├── services/        # Mock platform services
│   │   │   ├── googleAdsService.ts
│   │   │   ├── metaAdsService.ts
│   │   │   ├── amazonAdsService.ts
│   │   │   └── microsoftAdsService.ts
│   │   ├── routes/          # API routes
│   │   │   └── index.ts
│   │   ├── types/           # TypeScript types
│   │   │   └── index.ts
│   │   ├── config/          # Configuration
│   │   │   └── index.ts
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── HUBSPOT_SETUP.md         # HubSpot integration guide
├── AZURE_DEPLOYMENT.md      # Azure deployment guide
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Claude-Code
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure backend environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings (optional for mock data)
   ```

4. **Start the backend server**:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

5. **Install frontend dependencies** (in a new terminal):
   ```bash
   cd frontend
   npm install
   ```

6. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

7. **Open your browser**:
   Navigate to `http://localhost:3000`

## API Endpoints

### Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |
| GET | `/api/accounts/:platform` | Get all accounts for a platform |
| POST | `/api/metrics` | Fetch metrics for an account |

### Example Requests

**Get Google Ads accounts**:
```bash
curl http://localhost:3001/api/accounts/google_ads
```

**Fetch metrics**:
```bash
curl -X POST http://localhost:3001/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "google_ads",
    "accountId": "google_123",
    "startDate": "2024-01-01",
    "endDate": "2024-01-07"
  }'
```

## Platform-Specific Metrics

### Google Ads
- Impressions
- Clicks
- CTR (Click-Through Rate)
- Conversions
- CPA (Cost Per Acquisition)
- Total Spend
- ROAS (Return on Ad Spend)

### Meta Ads
- Reach
- Impressions
- Clicks
- CTR
- Conversions
- CPA
- Total Spend
- ROAS

### Amazon Ads
- Impressions
- Clicks
- CTR
- Orders
- ACoS (Advertising Cost of Sale)
- Total Spend
- Total Sales

### Microsoft Ads
- Impressions
- Clicks
- CTR
- Conversions
- CPA
- Total Spend
- ROAS

## Integrating Real APIs

The application is built with mock services that return realistic random data. To connect to real advertising APIs:

1. **Obtain API credentials** for each platform:
   - [Google Ads API](https://developers.google.com/google-ads/api/docs/start)
   - [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis)
   - [Amazon Advertising API](https://advertising.amazon.com/API/docs)
   - [Microsoft Advertising API](https://docs.microsoft.com/en-us/advertising/guides/)

2. **Add credentials to backend/.env**:
   ```bash
   # See backend/.env.example for all required variables
   GOOGLE_ADS_CLIENT_ID=your_client_id
   GOOGLE_ADS_CLIENT_SECRET=your_client_secret
   # ... etc
   ```

3. **Replace mock services** in `backend/src/services/`:
   - Each service has clear TODO comments indicating where to add real API calls
   - The service interface remains the same, so no frontend changes needed
   - Example:
     ```typescript
     // In googleAdsService.ts
     async getMetrics(accountId: string, startDate: string, endDate: string) {
       // TODO: Replace this with actual Google Ads API call
       // Example using google-ads-api library:
       const customer = client.Customer({
         customer_id: accountId,
         refresh_token: config.googleAds.refreshToken,
       });
       const report = await customer.report({ ... });
       return transformToMetrics(report);
     }
     ```

4. **Install platform SDKs**:
   ```bash
   cd backend
   npm install google-ads-api facebook-nodejs-business-sdk amazon-advertising-api-sdk
   ```

## Deployment

### Azure Deployment

See [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) for detailed deployment instructions.

Quick start:
1. Deploy backend to Azure App Service
2. Deploy frontend to Azure Static Web Apps
3. Update CORS and API URL configurations
4. Set environment variables in Azure

### HubSpot Integration

See [HUBSPOT_SETUP.md](./HUBSPOT_SETUP.md) for HubSpot CRM card setup.

Quick start:
1. Create a HubSpot app in the Developer Portal
2. Add a CRM card with iFrame pointing to your deployed frontend
3. Install the app in your HubSpot account
4. The card will appear in Contact, Company, and Deal records

## Development

### Build for Production

**Frontend**:
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

**Backend**:
```bash
cd backend
npm run build
# Output in backend/dist/
```

### Running Production Build Locally

**Backend**:
```bash
cd backend
npm run build
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
npm run preview
```

## Customization

### Changing Metrics

To add or modify metrics for a platform:

1. Update types in `backend/src/types/index.ts` and `frontend/src/types/index.ts`
2. Modify the service in `backend/src/services/{platform}Service.ts`
3. Update the `formatMetrics` method to include new fields

### Styling

The app uses Tailwind CSS with HubSpot brand colors. To customize:

- Colors: Edit `frontend/tailwind.config.js`
- Layout: Modify components in `frontend/src/components/`
- Global styles: Edit `frontend/src/index.css`

### Date Range Options

To add more date range options, edit `frontend/src/components/DateRangePicker.tsx`:

```tsx
<option value="60">Last 60 days</option>
<option value="90">Last 90 days</option>
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Check backend CORS configuration in `backend/src/index.ts`
2. Ensure `CORS_ORIGIN` in backend/.env matches your frontend URL
3. For HubSpot embedding, add HubSpot domains to CORS whitelist

### API Connection Issues

If the frontend can't connect to the backend:

1. Verify backend is running on port 3001
2. Check `VITE_API_URL` in frontend/.env
3. Ensure Vite proxy is configured in `frontend/vite.config.ts`

### Build Failures

If builds fail:

1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear build cache: `rm -rf dist`
3. Check Node.js version: `node -v` (should be 18+)

## Contributing

This is a framework designed to be customized by your development team. Key areas for contribution:

1. **API Integration**: Replace mock services with real platform APIs
2. **Error Handling**: Add comprehensive error handling and user feedback
3. **Testing**: Add unit and integration tests
4. **Monitoring**: Integrate with Application Insights or similar
5. **Security**: Implement authentication and authorization

## License

[Your License Here]

## Support

For questions or issues:
- Check the troubleshooting section above
- Review [HUBSPOT_SETUP.md](./HUBSPOT_SETUP.md) for HubSpot-specific issues
- Review [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) for deployment issues
- Contact your development team

## Next Steps

1. ✅ Set up local development environment
2. ✅ Test with mock data
3. 🔲 Obtain API credentials for platforms
4. 🔲 Replace mock services with real API integrations
5. 🔲 Deploy to Azure
6. 🔲 Create HubSpot CRM card
7. 🔲 Test in HubSpot environment
8. 🔲 Train Product Specialists on usage
9. 🔲 Monitor and iterate based on feedback
