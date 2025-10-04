# Pool Heat Pump Dashboard

Modern Next.js dashboard for monitoring AquaTemp heat pump performance with real-time metrics, COP analysis, and embedded Grafana panels.

## Features

- ⚡ **Real-time Monitoring**: Live power, temperature, and COP metrics
- 📊 **Grafana Integration**: Embedded panels for complex visualizations
- 🎯 **Direct InfluxDB Queries**: Fast, type-safe data fetching
- 🎨 **Modern UI**: Built with Next.js 15, shadcn/ui, and Tailwind CSS
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔄 **Auto-refresh**: Configurable 30-second updates

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Data Source**: InfluxDB 2.x
- **Charts**: Embedded Grafana panels
- **Language**: TypeScript

## Prerequisites

- Node.js 20+ and npm
- InfluxDB 2.x running with Home Assistant data
- Grafana running with dashboards configured
- Home Assistant with AquaTemp integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd pool-dashboard
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# InfluxDB Configuration
INFLUXDB_URL=http://192.168.0.6:8086
INFLUXDB_TOKEN=your_influxdb_token_here  # Get from InfluxDB or HA config
INFLUXDB_ORG=81297bfe8c7b49bd
INFLUXDB_BUCKET=homeassistant

# Grafana Configuration
NEXT_PUBLIC_GRAFANA_URL=http://192.168.0.6:3000
NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA=f0d68b75-8119-4ca3-b749-dfa9d8f116b3
NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_GENERAL=88495143-b01e-484a-9a04-3ef230fa5d25

# App Configuration
NEXT_PUBLIC_REFRESH_INTERVAL=30000
NEXT_PUBLIC_DEFAULT_DEVICE=aloha_sensory_aquatics
```

#### Getting Your InfluxDB Token

**Option 1: From Home Assistant**
```bash
ssh hassio@192.168.0.30
cat /config/influxdb.yaml | grep token
```

**Option 2: From InfluxDB UI**
1. Open http://192.168.0.6:8086
2. Login with admin credentials
3. Go to Data → API Tokens
4. Copy the `homeassistant` token

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
pool-dashboard/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx       # Dashboard layout
│   │   └── page.tsx         # Main dashboard
│   └── api/
│       └── influx/
│           └── current/     # Current metrics API
│               └── route.ts
├── components/
│   ├── dashboard/
│   │   ├── metric-card.tsx  # KPI card component
│   │   └── grafana-panel.tsx # Grafana embed
│   └── ui/                  # shadcn components
├── hooks/
│   └── use-influx-data.ts   # Data fetching hook
├── lib/
│   ├── influxdb.ts          # InfluxDB client
│   ├── queries/
│   │   ├── current-metrics.ts  # Sensor queries
│   │   └── calculations.ts     # COP, cost calculations
│   └── types/
│       ├── sensors.ts       # Type definitions
│       └── dashboard.ts     # Dashboard types
└── .env.local               # Environment variables
```

## Key Components

### MetricCard
Displays KPIs with color-coded thresholds:
```tsx
<MetricCard
  title="COP"
  value={cop}
  threshold={{ green: 4.0, yellow: 3.0 }}
  icon={TrendingUp}
/>
```

### GrafanaPanel
Embeds Grafana panels:
```tsx
<GrafanaPanel
  dashboardUid="your-dashboard-uid"
  panelId={7}
  height={350}
/>
```

### useInfluxData Hook
Fetches data with auto-refresh:
```tsx
const { data, loading, error } = useInfluxData('/api/influx/current');
```

## API Endpoints

### GET `/api/influx/current`
Returns current metrics with calculated values.

**Query Parameters:**
- `device` - Device name (default: aloha_sensory_aquatics)
- `flowRate` - Water flow rate in L/min (default: 100)
- `regularTariff` - Regular electricity rate (default: 2.50)
- `lowTariff` - Low tariff rate (default: 1.00)

**Response:**
```json
{
  "timestamp": "2025-01-01T10:00:00Z",
  "device": "aloha_sensory_aquatics",
  "metrics": {
    "power": 5.2,
    "energyToday": 45.3,
    "poolTemp": 28.5,
    ...
  },
  "calculated": {
    "cop": { "cop": 4.2, "heatOutputKW": 21.84, ... },
    "thermalLift": 18.5,
    "costToday": 113.25,
    "dutyCycle": 65.3
  }
}
```

## Calculations

### COP (Coefficient of Performance)
```
Heat Output (kW) = 0.0698 × FlowRate (L/min) × ΔT (°C)
COP = Heat Output (kW) / Electrical Power (kW)
```

### Thermal Lift
```
Thermal Lift = Pool Temperature - Ambient Temperature
```

### Daily Cost
```
Cost = (Regular kWh × Regular Rate) + (Low Tariff kWh × Low Rate)
```

## Thresholds

| Metric | Excellent | Good | Poor |
|--------|-----------|------|------|
| COP | > 4.0 | 3.0-4.0 | < 3.0 |
| Power | < 2.5 kW | 2.5-5 kW | > 5 kW |
| Water ΔT | 2-3°C | 1-2°C | < 1°C |
| Thermal Lift | < 10°C | 10-15°C | > 15°C |

## Troubleshooting

### No Data Showing

1. **Check InfluxDB connection:**
   ```bash
   curl http://192.168.0.6:8086/health
   ```

2. **Verify token is correct:**
   - Check `.env.local` has valid token
   - Test in InfluxDB UI

3. **Check sensors exist:**
   - Go to Home Assistant → Developer Tools → States
   - Search for `aloha_sensory_aquatics`

### Grafana Panels Not Loading

1. **Check Grafana is accessible:**
   ```bash
   curl http://192.168.0.6:3000/api/health
   ```

2. **Verify dashboard UIDs:**
   - Open Grafana dashboards
   - Check URLs match `.env.local` values

3. **Enable anonymous access (if needed):**
   - Grafana → Configuration → Settings → Auth → Anonymous
   - Enable anonymous auth for embeds

### API Errors

Check browser console and terminal logs for detailed error messages.

## Performance

- **Initial Load**: < 2 seconds
- **Auto-refresh**: Every 30 seconds (configurable)
- **API Response**: < 500ms

## Deployment

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t pool-dashboard .
docker run -p 3000:3000 --env-file .env.local pool-dashboard
```

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Contributing

This dashboard is part of the AquaTemp Home Assistant integration project.

## License

MIT

## Support

For issues or questions:
- Check ALOHA_DASHBOARD_README.md for heat pump specifics
- Review Grafana dashboard documentation
- Check Home Assistant integration logs
