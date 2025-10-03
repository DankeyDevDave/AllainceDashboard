# ✅ Aloha Pool Heat Pump Dashboard - Setup Complete!

## 🎉 Dashboard Successfully Created

Your swim school-optimized heat pump performance dashboard is now live and ready to use!

---

## 🔗 Quick Access

**Dashboard URL:**
```
http://192.168.0.6:3000/d/f0d68b75-8119-4ca3-b749-dfa9d8f116b3/aloha-pool-heat-pump-performance-and-cop-analysis
```

**Grafana Login:**
- URL: http://192.168.0.6:3000
- Username: admin
- Password: [your admin password]

---

## 📊 What's Included - 15 Panels

### Row 1: Key Performance Indicators
1. ✅ **COP Now** - Real-time efficiency (target: >4.0)
2. ✅ **Power Now** - Current electrical draw (kW)
3. ✅ **Energy Today** - Daily consumption (kWh)
4. ✅ **Thermal Lift** - Pool - Ambient temp difference
5. ✅ **Cost Today** - Daily electricity spend (Rands)
6. ✅ **Water ΔT** - Heating effectiveness (target: 2-3°C)

### Row 2: Performance Analysis
7. ✅ **Energy In vs Heat Out** - Dual-axis power/heat graph (15min avg)
8. ✅ **Temperature Monitoring** - Inlet, outlet, ambient temps

### Row 3: Daily Trends & Status
9. ✅ **Daily Energy - Last 7 Days** - Weekly consumption bars
10. ✅ **Pool Temperature** - Current pool temp gauge
11. ✅ **Operating Mode Timeline** - Heat/Cool/Auto/Off status

### Row 4: Operational Metrics
12. ✅ **Water ΔT Over Time** - Temperature differential trend
13. ✅ **Compressor Frequency** - Current Hz gauge (0-120 Hz)
14. ✅ **Duty Cycle Today** - % of day compressor ran
15. ✅ **Runtime Today** - Total hours operated

---

## 🔧 IMPORTANT: Configure Variables First!

Before the dashboard shows accurate data, you MUST set these variables:

### 1. Flow Rate (Critical for COP calculation)
- **Default**: 100 L/min (placeholder)
- **How to find**: Check filtration pump nameplate
- **Typical range**: 60-150 L/min
- **Where to set**: Top of dashboard dropdown

### 2. Pool Volume
- **Default**: 200 m³ (placeholder)
- **How to calculate**: Length × Width × Avg Depth
- **Example**: 25m × 10m × 1.5m = 375 m³
- **Where to set**: Top of dashboard dropdown

### 3. Regular Tariff
- **Default**: R2.50/kWh (placeholder)
- **How to find**: Check your electricity bill
- **Typical**: R2.00-R3.00/kWh
- **Where to set**: Top of dashboard dropdown

### 4. Low Tariff (if on TOU)
- **Default**: R1.00/kWh (placeholder)
- **How to find**: Check bill for off-peak rate
- **Typical**: 40-60% of regular tariff
- **Where to set**: Top of dashboard dropdown

---

## 📐 COP Calculation Formula

The dashboard calculates COP (Coefficient of Performance) using:

```
Heat Output (kW) = 0.0698 × Flow Rate (L/min) × ΔT (°C)
COP = Heat Output (kW) / Electrical Power (kW)
```

**Example:**
- Flow Rate: 100 L/min
- ΔT: 3°C (outlet 29°C - inlet 26°C)
- Electrical Power: 5 kW

**Calculation:**
- Heat = 0.0698 × 100 × 3 = 20.94 kW
- COP = 20.94 / 5 = **4.19** ✅ Excellent!

---

## 🎯 What Good Performance Looks Like

| Metric | Excellent | Good | Poor |
|--------|-----------|------|------|
| **COP** | > 4.5 | 3.5-4.5 | < 3.0 |
| **Water ΔT** | 2-3°C | 1-2°C or 3-4°C | <1°C or >4°C |
| **Thermal Lift** | < 10°C | 10-15°C | > 15°C |
| **Duty Cycle** | 30-50% | 50-80% | > 80% |
| **Pool Temp** | ±0.5°C setpoint | ±1°C setpoint | > ±2°C |

---

## 🚨 Alert Thresholds Set

The dashboard has color-coded thresholds:

### COP:
- 🟢 Green: > 4.0 (Excellent)
- 🟡 Yellow: 3.0-4.0 (Normal)
- 🔴 Red: < 3.0 (Check system)

### Water ΔT:
- 🟢 Green: 2-3°C (Optimal)
- 🟡 Yellow: 1-2°C or 3-4°C (Acceptable)
- 🔴 Red: <1°C or >4°C (Flow issue)

### Thermal Lift:
- 🟢 Green: < 10°C (Easy)
- 🟡 Yellow: 10-15°C (Moderate)
- 🔴 Red: > 15°C (Challenging)

---

## 💰 Cost Analysis

### Typical Costs (200m³ pool, 28°C target):

| Season | Avg Ambient | Expected COP | Daily kWh | Daily Cost @ R2.50 |
|--------|-------------|--------------|-----------|-------------------|
| **Summer** | 25°C | 5.0 | 30 | R75 |
| **Autumn** | 15°C | 4.0 | 50 | R125 |
| **Winter** | 10°C | 3.0 | 80 | R200 |
| **Spring** | 18°C | 4.5 | 40 | R100 |

**Annual estimate**: ~18,250 kWh = ~R45,600 @ R2.50/kWh

### Savings with Pool Cover:
- **Overnight heat loss**: Reduced by 50-70%
- **Energy savings**: ~30%
- **Annual cost with cover**: ~R31,900
- **Savings**: ~**R13,700/year** 💰

---

## 📖 Documentation

Created files in `/Users/jacques/DevFolder/aquatemp/`:

1. ✅ **ALOHA_DASHBOARD_README.md** (18 KB)
   - Complete user guide
   - Panel explanations
   - Troubleshooting
   - Optimization tips
   - Maintenance schedule

2. ✅ **grafana_aloha_pool_dashboard.json** (28 KB)
   - Full dashboard JSON (backup/reference)
   - Can be imported to other Grafana instances

3. ✅ **ALOHA_SETUP_COMPLETE.md** (This file)
   - Quick start guide
   - Configuration instructions

---

## 🔍 Troubleshooting

### No data showing?

**1. Check InfluxDB integration:**
```bash
ssh hassio@192.168.0.30
cat /config/configuration.yaml | grep influxdb
```

**2. Verify Aloha sensors exist:**
- Home Assistant → Developer Tools → States
- Search for: `sensor.aloha_sensory_aquatics_actual_power_z04`

**3. Check InfluxDB is writing:**
```bash
curl http://192.168.0.6:8086/health
```

### COP showing weird values?

**Check:**
1. Flow Rate variable is set correctly
2. ΔT is reasonable (1-4°C)
3. Power sensor is reporting (not 0)

### Cost calculation wrong?

**Check:**
1. Tariff variables are set (not placeholders)
2. Energy sensor is accumulating (Z06)

---

## 📈 Next Steps

### 1. Immediate (Today):
- [ ] Open dashboard and verify all panels load
- [ ] Set correct Flow Rate variable
- [ ] Set correct Pool Volume
- [ ] Set correct Tariff Rates
- [ ] Verify COP is reasonable (3.0-5.0)

### 2. This Week:
- [ ] Read full documentation (ALOHA_DASHBOARD_README.md)
- [ ] Set up Grafana alerts (optional but recommended)
- [ ] Train staff on dashboard interpretation
- [ ] Establish baseline metrics (COP, daily energy)

### 3. Ongoing:
- [ ] Weekly review of performance trends
- [ ] Monthly cost tracking
- [ ] Seasonal COP comparisons
- [ ] Maintenance scheduling based on runtime (Z08)

---

## 🎓 Key Concepts to Understand

### COP (Coefficient of Performance)
- **What**: How efficient the heat pump is
- **Formula**: Heat Out / Power In
- **Good values**: 4.0-5.5 in summer, 2.5-3.5 in winter
- **Why it varies**: Depends on ambient temperature (unavoidable)

### Thermal Lift
- **What**: Temperature difference heat pump must overcome
- **Formula**: Pool Temp - Ambient Temp
- **Impact**: Higher lift = lower COP = higher costs
- **Example**: Pool 28°C, Ambient 10°C → Lift = 18°C (challenging!)

### Water ΔT
- **What**: How much heat pump heats water per pass
- **Formula**: Outlet Temp - Inlet Temp
- **Optimal**: 2-3°C
- **Diagnoses**: Flow rate issues, capacity problems

### Duty Cycle
- **What**: % of time compressor runs
- **Formula**: (Runtime Hours / 24) × 100
- **Implications**: >80% means undersized or over-ambitious setpoint

---

## 💡 Optimization Quick Wins

1. **Add Pool Cover** - Save 50-70% on heating (ROI: <1 year)
2. **Lower Setpoint by 1°C** - Save ~10% energy (barely noticeable)
3. **Use TOU Tariff** - Heat during off-peak for 40-60% rate reduction
4. **Clean Filters Weekly** - Improves flow, maintains COP
5. **Annual Service** - Keeps COP high, avoids expensive breakdowns

---

## 🆘 Support Resources

### Dashboard Issues:
- **Integration GitHub**: https://github.com/jlwainwright/aquatemp
- **Home Assistant**: http://192.168.0.30:8123
- **InfluxDB**: http://192.168.0.6:8086
- **Grafana**: http://192.168.0.6:3000

### Heat Pump Technical:
- Check `ALOHA_DASHBOARD_README.md` troubleshooting section
- Manufacturer documentation
- Track runtime hours for service scheduling

---

## 📊 Dashboard Summary

| Attribute | Value |
|-----------|-------|
| **Dashboard UID** | f0d68b75-8119-4ca3-b749-dfa9d8f116b3 |
| **Panel Count** | 15 panels |
| **Variables** | 5 (flow, volume, 2× tariffs, interval) |
| **Refresh Rate** | 1 minute |
| **Data Source** | InfluxDB (homeassistant bucket) |
| **Device Filter** | aloha_sensory_aquatics only |
| **Created** | 2025-10-03 |
| **Version** | 6 |

---

## ✅ Verification Checklist

Before closing this setup:

- [ ] Dashboard loads without errors
- [ ] All 15 panels display data
- [ ] COP calculation works (shows 2.5-5.5 range)
- [ ] Temperature graphs show inlet/outlet/ambient
- [ ] Daily energy bars show last 7 days
- [ ] Power consumption shows current draw
- [ ] Variables are set at top of dashboard
- [ ] Documentation files saved locally
- [ ] Team knows how to access dashboard
- [ ] Bookmarked in browser

---

## 🎯 Success Metrics

Track these monthly:

- **Average COP**: Target >3.8 (summer), >3.2 (winter)
- **Daily Energy**: Compare month-to-month for trends
- **Cost per Day**: Monitor against budget
- **Duty Cycle**: Keep <70% for equipment longevity
- **Pool Temp Stability**: ±0.5°C of setpoint 95% of time

---

## 🏊‍♂️ Final Notes

This dashboard gives you professional-grade insights into your pool heat pump performance. Use it to:

- ✅ **Optimize costs** (save 20-50% through informed decisions)
- ✅ **Ensure comfort** (maintain consistent pool temperature)
- ✅ **Plan maintenance** (track runtime, predict service needs)
- ✅ **Diagnose issues** (spot problems before they become expensive)
- ✅ **Justify investments** (show ROI of covers, upgrades, etc.)

**Remember**: COP is king! A well-maintained heat pump at COP 4.0 costs 75% less to run than electric elements.

Enjoy efficient, cost-effective pool heating! 🎉💰⚡

---

**Dashboard URL**: http://192.168.0.6:3000/d/f0d68b75-8119-4ca3-b749-dfa9d8f116b3/aloha-pool-heat-pump-performance-and-cop-analysis

**Documentation**: ALOHA_DASHBOARD_README.md
