# Quick Start Guide - Pool Dashboard

Get your heat pump dashboard running in 5 minutes!

## 1. Prerequisites Check

Make sure you have:
- ✅ Node.js 20+ installed (`node --version`)
- ✅ InfluxDB running at http://192.168.0.6:8086
- ✅ Grafana running at http://192.168.0.6:3000
- ✅ Home Assistant with AquaTemp integration

## 2. Get Your InfluxDB Token

**Quick method:**
```bash
ssh hassio@192.168.0.30
cat /config/influxdb.yaml | grep token
```

Copy the token value.

## 3. Configure Environment

```bash
cd pool-dashboard
cp .env.example .env.local
```

Edit `.env.local` and paste your InfluxDB token:
```bash
INFLUXDB_TOKEN=paste_your_token_here
```

## 4. Install and Run

```bash
npm install
npm run dev
```

## 5. Open Dashboard

Navigate to: **http://localhost:3000**

You should see:
- ✅ Current power, COP, energy metrics
- ✅ Pool temperature and status
- ✅ Embedded Grafana charts
- ✅ Auto-refreshing every 30 seconds

## Troubleshooting

### "No data showing"

**Check InfluxDB connection:**
```bash
curl http://192.168.0.6:8086/health
```

Should return: `{"name":"influxdb","message":"ready for queries and writes","status":"pass"}`

**Test your token:**
```bash
curl -XPOST "http://192.168.0.6:8086/api/v2/query?org=81297bfe8c7b49bd" \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/vnd.flux" \
  -d 'from(bucket:"homeassistant") |> range(start: -5m) |> limit(n: 5)'
```

### "Grafana panels not loading"

**Check Grafana is accessible:**
```bash
curl http://192.168.0.6:3000/api/health
```

**Enable anonymous access (if needed):**
1. Open Grafana: http://192.168.0.6:3000
2. Login as admin
3. Go to Configuration → Settings → Auth
4. Enable "Anonymous access"
5. Set role to "Viewer"

### "API errors in console"

**Check the browser console (F12) for specific errors.**

Common fixes:
- Restart the dev server: `Ctrl+C` then `npm run dev`
- Clear `.next` cache: `rm -rf .next && npm run dev`
- Check environment variables are set correctly

## Next Steps

1. **Customize settings:**
   - Flow rate: Default is 100 L/min
   - Pool volume: Default is 200 m³
   - Tariff rates: Default R2.50/R1.00

2. **Add more devices:**
   - Update `NEXT_PUBLIC_DEFAULT_DEVICE` in `.env.local`
   - Restart server

3. **Deploy to production:**
   - See README.md for Docker or Vercel deployment

## Quick Reference

### Default Values
- **Device**: aloha_sensory_aquatics
- **Flow Rate**: 100 L/min
- **Pool Volume**: 200 m³
- **Regular Tariff**: R2.50/kWh
- **Low Tariff**: R1.00/kWh
- **Refresh Interval**: 30 seconds

### API Endpoint
```
GET /api/influx/current?device=aloha&flowRate=100&regularTariff=2.50
```

### Sensor IDs
- Z04: Actual Power (W)
- Z06: Cumulative Energy (kWh)
- Z07: Hourly Energy (kWh)
- Z08: Compressor Runtime (hours)
- T02: Inlet/Pool Temp (°C)
- T03: Outlet Temp (°C)
- T05: Ambient Temp (°C)
- O07: Compressor Frequency (Hz)

## Support

For detailed documentation, see **README.md**.

For heat pump specifics, see **../ALOHA_DASHBOARD_README.md**.

---

**That's it! You now have a modern, real-time heat pump dashboard running! 🎉**
