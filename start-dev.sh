#!/bin/bash

# Start both frontend and backend in Codespaces
echo "🚀 Starting HubSpot Metrics Dashboard..."

# Start backend in background
echo "📊 Starting backend on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on port 3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:3001"
echo ""
echo "In Codespaces, look for the 'PORTS' tab at the bottom."
echo "Click the globe icon 🌐 next to port 3000 to open the app."
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
wait
