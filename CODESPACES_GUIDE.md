# GitHub Codespaces Guide

Complete guide for running the HubSpot Metrics Dashboard in GitHub Codespaces.

## Quick Start

1. **Open your repository on GitHub**
2. Click the green **"Code"** button
3. Select **"Codespaces"** tab
4. Click **"Create codespace on claude/hubspot-react-design-tRjaK"**

Wait for the Codespace to load (2-3 minutes first time).

## Option A: Automatic Startup (Easiest)

Once your Codespace loads, run:

```bash
./start-dev.sh
```

This script will:
- Start the backend on port 3001
- Start the frontend on port 3000
- Display instructions for accessing the app

## Option B: Manual Startup

### Terminal 1 - Backend:
```bash
cd backend
npm install  # Only needed first time
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

## Accessing Your App

### If Ports Forward Automatically ✅

Look for a popup notification in the bottom-right corner that says:
> "Your application running on port 3000 is available"

Click **"Open in Browser"**

### If Ports Don't Forward Automatically 🔧

#### Step 1: Open the Ports Panel

Look at the bottom of the screen for tabs like:
- TERMINAL | PORTS | PROBLEMS | OUTPUT | DEBUG CONSOLE

Click the **"PORTS"** tab.

Can't find it? Press:
- **Windows/Linux**: `Ctrl + Shift + P`
- **Mac**: `Cmd + Shift + P`

Type: "View: Toggle Ports" and press Enter.

#### Step 2: Forward Ports Manually

In the PORTS panel:

1. Click the **"Forward a Port"** button (or `+` icon)
2. Type `3000` and press Enter
3. Click the **"Forward a Port"** button again
4. Type `3001` and press Enter

#### Step 3: Make Ports Public

For each port (3000 and 3001):

1. **Right-click** on the port
2. Select **"Port Visibility"**
3. Choose **"Public"**

#### Step 4: Open the Frontend

In the PORTS panel, find port **3000**:
- Click the **🌐 globe icon** in the "Local Address" column
- Or hover over the address and click "Open in Browser"

Your app will open in a new browser tab!

## Troubleshooting

### Port Already in Use

If you see an error like "Port 3000 is already in use":

```bash
# Kill the process on port 3000
kill -9 $(lsof -ti:3000)

# Kill the process on port 3001
kill -9 $(lsof -ti:3001)

# Restart the servers
./start-dev.sh
```

### Dependencies Not Installed

If you get module errors:

```bash
# Reinstall backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Reinstall frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Ports Panel Not Showing

1. Press `Ctrl/Cmd + J` to open the bottom panel
2. Look for the PORTS tab
3. Or use Command Palette: `Ctrl/Cmd + Shift + P` → "View: Toggle Ports"

### Backend API Not Responding

1. Check the backend terminal for errors
2. Verify backend is running: `curl http://localhost:3001/api/health`
3. Restart backend: Stop with `Ctrl+C` and run `npm run dev` again

### CORS Errors in Browser Console

The backend is configured with `CORS_ORIGIN=*` for development, so this shouldn't happen. If it does:

1. Check `backend/src/index.ts` has:
   ```typescript
   app.use(cors({ origin: '*' }));
   ```
2. Restart the backend server

## Testing the App in Codespaces

Once you have the app open:

1. **Select Platform**: Choose "Google Ads"
2. **Select Account**: Choose "Acme Corp - Google Ads"
3. **Date Range**: Leave as "Last 7 days"
4. **Click**: "Fetch Metrics" button
5. **View**: Formatted markdown metrics appear
6. **Edit**: Modify the text if needed
7. **Copy**: Click the "Copy" button
8. **Paste**: Into any text editor to verify

Try all four platforms:
- Google Ads
- Meta Ads
- Microsoft Ads
- Amazon Ads

Each has different metrics and formatting!

## Codespaces Features

### Auto-Save
Your changes are automatically saved to the cloud.

### Persistent Storage
Codespaces keeps your environment for several days after you close it.

### Multiple Codespaces
You can have multiple Codespaces for different branches.

### Stop vs Delete
- **Stop**: Preserves your environment (free, can resume later)
- **Delete**: Removes everything (use when done)

## Cost

- **Free tier**: 120 hours/month of Codespaces (for 2-core machines)
- This project uses minimal resources
- Remember to **stop** your Codespace when not using it!

To stop:
1. Go to https://github.com/codespaces
2. Find your Codespace
3. Click "..." → "Stop codespace"

## Dev Container Configuration

The `.devcontainer/devcontainer.json` file automatically:
- Sets up Node.js 18
- Forwards ports 3000 and 3001
- Installs dependencies on creation
- Configures VS Code extensions

If ports still don't forward, the configuration will retry on each restart.

## VS Code Extensions (Auto-Installed)

Your Codespace includes:
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Autocomplete for Tailwind classes

## Tips for Codespaces

1. **Use the integrated terminal**: Supports multiple tabs
2. **Enable auto-save**: File → Auto Save
3. **Use keyboard shortcuts**: Learn common VS Code shortcuts
4. **Check ports regularly**: Keep the PORTS tab visible
5. **Stop when done**: Save your free hours

## Next Steps After Testing

Once you've tested in Codespaces:

1. If everything works → Deploy to production (see AZURE_DEPLOYMENT.md)
2. If you need changes → Make them in Codespaces and commit
3. Connect real APIs → Follow backend/.env.example
4. Set up HubSpot card → Follow HUBSPOT_SETUP.md

---

**Having issues?** Check the troubleshooting section above or reach out to your development team.
