# Sigma Fund Dashboard

Frontend dashboard for the Sigma Fund AGI Trading System.

## Architecture

- **Frontend**: Static HTML/CSS/JS dashboard deployed on Vercel
- **Backend**: API-only service running on Railway
- **Communication**: Cross-origin API calls from Vercel to Railway

## Features

- Portfolio overview with real-time data
- Position manager status (phantom losses cleared ✅)
- AGI system monitoring
- Clean separation from backend complexity

## Deployment

This dashboard is automatically deployed to Vercel when pushed to the main branch.

## API Integration

The dashboard calls the Railway backend API at:
`https://web-production-bb823.up.railway.app/api/*`

## Status

✅ Phantom losses cleared from position manager  
🔧 Dashboard moved to Vercel for improved stability  
📊 Real-time data integration via Railway API
EOF < /dev/null