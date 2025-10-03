# Aloha Pool Heat Pump Performance Dashboard

## 🎯 Purpose
This dashboard is optimized for swim school operations, focusing on **COP (Coefficient of Performance)**, efficiency analysis, and cost management for the Aloha Sensory Aquatics pool heat pump.

## 📊 Dashboard URL
```
http://192.168.0.6:3000/d/f0d68b75-8119-4ca3-b749-dfa9d8f116b3/aloha-pool-heat-pump-performance-and-cop-analysis
```

---

## 🔧 Configuration Variables

Before using the dashboard, configure these variables (top of dashboard):

| Variable | Default | Purpose | How to Set |
|----------|---------|---------|------------|
| **Flow Rate** | 100 L/min | Water pump flow rate | Check pump nameplate or measure |
| **Pool Volume** | 200 m³ | Total pool volume | Measure or from pool specs |
| **Regular Tariff** | R2.50/kWh | Standard electricity rate | From Eskom/City bill |
| **Low Tariff** | R1.00/kWh | Off-peak/TOU rate | From bill (if applicable) |
| **Aggregation** | Auto | Data grouping interval | Leave as Auto |

### How to Find These Values:

#### 1. Flow Rate
- Check filtration pump nameplate (usually 60-150 L/min for pools)
- Or calculate: run pump for 1 minute into bucket, measure liters
- Typical swim school: 80-120 L/min

#### 2. Pool Volume
- From pool construction documents
- Or calculate: Length × Width × Average Depth
- Example: 25m × 10m × 1.5m = 375 m³

#### 3. Tariff Rates
- Check electricity bill under "Energy Charges"
- Regular: typically R2.00-R3.00/kWh
- Low tariff: if on TOU (Time of Use), usually 40-60% of regular

---

## 📈 Dashboard Panels Explained

### Row 1: KEY PERFORMANCE INDICATORS (6 Panels)

#### 1. **COP Now**
- **What**: Current Coefficient of Performance
- **Formula**: `Heat Output (kW) / Electrical Power (kW)`
- **Good Values**:
  - 🟢 COP > 4: Excellent efficiency
  - 🟡 COP 3-4: Normal operation
  - 🔴 COP < 3: Check for issues
- **Why it matters**: Shows how many kW of heat you get per kW of electricity

#### 2. **Power Now (kW)**
- **What**: Current electrical consumption
- **Typical Range**: 2-8 kW depending on load
- **Use**: Monitor real-time draw

#### 3. **Energy Today (kWh)**
- **What**: Total electricity used today
- **Typical**: 30-80 kWh/day for swim schools
- **Use**: Daily cost tracking

#### 4. **Thermal Lift (°C)**
- **What**: Pool temperature - Ambient temperature
- **Impact**: Higher lift = lower COP = higher costs
- **Thresholds**:
  - 🟢 < 10°C: Good conditions
  - 🟡 10-15°C: Moderate
  - 🔴 > 15°C: Challenging (winter)

#### 5. **Cost Today (R)**
- **What**: Electricity cost for the day
- **Formula**: `Energy (kWh) × Tariff (R/kWh)`
- **Use**: Direct operational cost

#### 6. **Water ΔT (°C)**
- **What**: Outlet temp - Inlet temp
- **Good Range**:
  - 🟢 2-3°C: Optimal
  - 🟡 1-2°C or 3-4°C: Acceptable
  - 🔴 < 1°C: Flow too high or heat pump issue
  - 🔴 > 4°C: Flow too low or over-capacity

---

### Row 2: PERFORMANCE ANALYSIS (2 Panels)

#### 7. **Energy In vs Heat Out (Dual-Axis)**
- **Left Axis (Orange)**: Electrical power input (kW)
- **Right Axis (Red)**: Heat output (kW)
- **15-minute rolling average** for readability
- **What to look for**:
  - Heat should be 3-5× higher than power (that's your COP!)
  - Spikes in power with dips in heat = defrost cycles
  - Parallel lines = stable operation

#### 8. **Temperature Monitoring**
- **Blue**: Ambient air temperature
- **Other lines**: Pool inlet, outlet temps
- **Use**: Correlate COP changes with ambient conditions
- **Insight**: COP drops when ambient is low

---

### Row 3: DAILY TRENDS & STATUS (3 Panels)

#### 9. **Daily Energy - Last 7 Days**
- **Bar Chart**: kWh consumed per day
- **Use**: Spot trends, compare weekdays vs weekends
- **Target**: Consistent daily usage for stable costs

#### 10. **Pool Temperature (Gauge)**
- **Range**: 20-35°C
- **Color Zones**:
  - Blue (20-26°C): Cool
  - Green (26-30°C): Comfortable swim range
  - Yellow (30-32°C): Warm
  - Red (>32°C): Hot
- **Use**: Ensure setpoint is maintained

#### 11. **Operating Mode Timeline**
- **Shows**: Heat/Cool/Auto/Off status over time
- **Colors**:
  - 🔴 Red: Heating mode
  - 🔵 Blue: Cooling mode (rare for pools)
  - 🟢 Green: Auto mode
  - ⚫ Gray: Off
- **Use**: Check if mode changes align with schedule

---

### Row 4: OPERATIONAL METRICS (4 Panels)

#### 12. **Water ΔT Over Time**
- **Graph**: Temperature difference (outlet - inlet)
- **Target**: 2-3°C steady
- **Diagnose**:
  - Dropping ΔT: flow rate increased or heat pump losing capacity
  - Rising ΔT: flow rate decreased or over-heating
  - Fluctuating: unstable operation

#### 13. **Compressor Frequency (Gauge)**
- **Range**: 0-120 Hz
- **Zones**:
  - Gray (0 Hz): Off
  - Green (30-80 Hz): Normal modulation
  - Yellow (80-100 Hz): High load
  - Red (>100 Hz): Max capacity
- **Use**: See how hard the compressor is working

#### 14. **Duty Cycle Today (%)**
- **What**: % of day compressor was running
- **Formula**: `(Runtime hours / 24) × 100`
- **Thresholds**:
  - 🟢 < 50%: Light duty, good for equipment life
  - 🟡 50-80%: Moderate
  - 🔴 > 80%: Heavy duty, may need larger unit

#### 15. **Runtime Today (hours)**
- **What**: Total compressor hours today
- **Typical**: 8-16 hours/day for swim schools
- **Use**: Maintenance scheduling (track total lifetime hours)

---

## 🧮 Key Calculations

### Heat Output Formula
```
Q_kW = 0.0698 × FlowRate_Lmin × ΔT_°C
```

**Example**:
- Flow: 100 L/min
- ΔT: 3°C
- Heat: 0.0698 × 100 × 3 = **20.94 kW**

If electrical power is 5 kW:
- **COP = 20.94 / 5 = 4.19** ✅ Excellent!

### Alternative Formula (if flow in m³/h)
```
Q_kW = 1.163 × FlowRate_m³h × ΔT_°C
```

### COP Instant
```
COP = Heat_kW / Electrical_kW
```

### COP Daily (Energy-Weighted)
```
COP_daily = Total_Heat_kWh / Total_Elec_kWh
```

### Cost per Thermal kWh
```
R/kWh-th = Electricity_Tariff / COP
```

**Example**:
- Tariff: R2.50/kWh
- COP: 4.0
- Cost: **R2.50 / 4 = R0.625 per kWh of heat** 🔥

Compare to electric element: R2.50/kWh (COP=1)
**Savings: 75%!**

---

## 🎯 What Good Performance Looks Like

### Excellent Operation:
- ✅ COP: 4.0-5.5
- ✅ Water ΔT: 2-3°C
- ✅ Thermal Lift: <10°C
- ✅ Duty Cycle: 30-50%
- ✅ Pool temp: Within ±0.5°C of setpoint
- ✅ Compressor freq: 40-70 Hz (efficient modulation)

### Warning Signs:
- ⚠️ COP dropping below 3.0 (when ambient > 15°C)
- ⚠️ Water ΔT < 1°C or > 4°C
- ⚠️ Duty cycle > 80% consistently
- ⚠️ Compressor always at max frequency (120 Hz)
- ⚠️ Pool temp swings > ±2°C from setpoint

### Immediate Action Required:
- 🚨 COP < 2.5 in good weather
- 🚨 ΔT < 0.5°C (no heating happening)
- 🚨 Frequent defrost cycles (>6/hour)
- 🚨 Power draw > nameplate by 10%
- 🚨 Pool not reaching setpoint by first class

---

## 💡 Optimization Tips

### Morning Warm-Up (04:00-09:00)
- This is when most energy is consumed
- Monitor: "Energy In vs Heat Out" during this period
- Optimize:
  - Start earlier with lower setpoint
  - Use low-tariff hours if available
  - Check COP is good (>3.5) during warm-up

### Ambient Temperature Impact
- COP drops 0.1-0.2 for every 5°C drop in ambient
- At 5°C ambient: expect COP 2.5-3.5
- At 25°C ambient: expect COP 4.5-5.5
- **Action**: Accept lower COP in winter, but ensure still > 2.5

### Water Flow Optimization
- Too high flow: ΔT <1°C, wastes pump energy
- Too low flow: ΔT >4°C, stress on heat pump
- **Sweet spot**: ΔT = 2-3°C
- Adjust filtration pump speed if variable

### Defrost Management
- Normal: 2-4 defrosts/hour in humid conditions
- Excessive: >6/hour indicates issues
- Defrosts show as:
  - Spike in electrical power
  - Dip in heat output
  - Brief COP drop

### Cost Reduction Strategies
1. **Use TOU tariffs**: Heat during off-peak (22:00-06:00)
2. **Pool cover**: Reduces overnight heat loss by 50-70%
3. **Lower setpoint by 1°C**: Saves ~10% energy
4. **Maintain filters**: Clean filters = better flow = better COP
5. **Annual servicing**: Keeps COP high

---

## 🔍 Troubleshooting

### Problem: Low COP (<3.0) in warm weather

**Check:**
1. ΔT: Should be 2-3°C
   - Too low? Check flow rate (may be too high)
   - Too high? Check flow rate (may be too low)
2. Filters: Clean pool filters
3. Refrigerant: May need service (check for leaks)
4. Coils: Outdoor coil may be dirty/blocked

### Problem: Pool not reaching setpoint

**Check:**
1. Duty cycle: If >80%, heat pump is undersized for load
2. Heat loss: Use pool cover at night
3. Thermal lift: If >15°C, heat pump capacity is limited
4. Setpoint: May be unrealistic for conditions

### Problem: High electricity costs

**Calculate:**
```
Cost per degree = Daily_cost / (Setpoint - Ambient_avg)
```

**Actions:**
1. Lower setpoint by 1-2°C (10-20% savings)
2. Add pool cover (50% savings overnight)
3. Shift heating to low-tariff hours
4. Check COP is >3.5 (if not, service needed)

### Problem: Frequent mode changes

**Likely causes:**
- Setpoint too close to pool temp (hysteresis issue)
- Auto mode cycling
- **Solution**: Use fixed heating mode with 2°C differential

---

## 📊 Performance Benchmarks

### Typical Swim School Pool (200m³, 28°C target)

| Season | Ambient | COP | Daily kWh | Daily Cost (R2.50/kWh) |
|--------|---------|-----|-----------|------------------------|
| Summer | 25°C | 5.0 | 30 | R75 |
| Autumn | 15°C | 4.0 | 50 | R125 |
| Winter | 10°C | 3.0 | 80 | R200 |
| Spring | 18°C | 4.5 | 40 | R100 |

**Annual**: ~18,250 kWh = ~R45,600 @ R2.50/kWh

With pool cover: ~30% savings = **R31,900/year**

### ROI Calculations

**Heat pump vs Electric element:**
- Heat pump COP 4.0 → R0.625/kWh-th
- Electric element COP 1.0 → R2.50/kWh-th
- **Savings**: 75%

**Heat pump vs Gas (LPG)**:
- Gas: ~R1.20/kWh-th
- Heat pump: R0.625/kWh-th
- **Savings**: 48%

---

## 🔄 Maintenance Schedule

### Based on Compressor Runtime (Z08 sensor):

| Runtime Hours | Action |
|---------------|--------|
| Every 2,000h | Check refrigerant levels, clean coils |
| Every 4,000h | Full service: filters, pressures, electrical |
| Every 6,000h | Major service: compressor check, replacement parts |

**Track in "Runtime Today" panel** and set alerts.

---

## 🚨 Recommended Alerts

### Set up in Grafana (Alert Rules):

1. **Low COP Alert**
   - Condition: COP < 3.0 for 15 min when Ambient > 15°C
   - Action: Email ops team

2. **High Power Alert**
   - Condition: Power > 10 kW for 5 min
   - Action: SMS technician

3. **Pool Temp Alert**
   - Condition: Pool < 26°C at 08:00 (class start)
   - Action: Email manager

4. **Excessive Runtime**
   - Condition: Duty cycle > 85% for 2 days
   - Action: Review sizing/setpoint

5. **ΔT Out of Range**
   - Condition: ΔT < 0.5°C or > 4°C for 10 min
   - Action: Check flow rate

---

## 📖 Further Reading & Resources

### Understanding COP:
- **COP = Energy Out / Energy In**
- Higher is better
- Varies with ambient temperature (unavoidable)
- Best: 4.5-5.5 in summer, 2.5-3.5 in winter

### Energy Formulas:
- **Specific heat of water**: 4.186 kJ/(kg·°C) or 1.163 Wh/(L·°C)
- **Heat to raise 1000L by 1°C**: 1.163 kWh
- **Daily heat loss** (no cover): 2-5 kWh per °C lift

### Cost Optimization:
- Pool covers: 50-70% reduction in heat loss
- TOU tariffs: Shift 60% of heating to off-peak
- Setpoint: Each 1°C lower = 10% energy saving

---

## 🆘 Support

### For Dashboard Issues:
- Check InfluxDB is receiving data: http://192.168.0.6:8086
- Verify sensors in Home Assistant: Developer Tools → States
- Integration repo: https://github.com/jlwainwright/aquatemp

### For Heat Pump Technical Support:
- Manufacturer: AquaTemp
- Model: [Check nameplate]
- Installation date: [From records]
- Service history: Track via Z08 runtime sensor

---

## 📝 Customization

### Adding More Panels:

**1. Morning Warm-Up Performance (04:00-09:00)**
```flux
from(bucket: "homeassistant")
  |> range(start: -1d)
  |> filter(fn: (r) => r["entity_id"] =~ /aloha_sensory_aquatics/)
  |> filter(fn: (r) => hour(v: r._time) >= 4 and hour(v: r._time) <= 9)
```

**2. COP vs Ambient Scatter Plot**
- Requires XY panel type
- X-axis: Ambient temp
- Y-axis: COP
- Color by thermal lift buckets

**3. Pool Temperature Heatmap**
- X-axis: Hour of day (0-23)
- Y-axis: Date
- Cell value: Pool temperature
- Great for stability scan

### Adjusting Thresholds:

Edit panel → Field tab → Thresholds:
- Change color breakpoints
- Add/remove steps
- Customize for your operation

---

## ✅ Quick Start Checklist

- [ ] Set **Flow Rate** variable (check pump specs)
- [ ] Set **Pool Volume** variable (from pool dimensions)
- [ ] Set **Tariff Rates** (from electricity bill)
- [ ] Verify data is flowing (all panels showing data)
- [ ] Check COP is reasonable (3.0-5.0)
- [ ] Set up alerts for critical conditions
- [ ] Add dashboard to favorites
- [ ] Train staff on interpretation
- [ ] Schedule weekly review sessions
- [ ] Track monthly costs and COP trends

---

## 📊 Summary

This dashboard provides swim school operators with:
- ✅ **Real-time efficiency monitoring** (COP)
- ✅ **Cost tracking** (R/day, R/kWh-th)
- ✅ **Performance diagnostics** (ΔT, lift, duty cycle)
- ✅ **Operational insights** (mode, frequency, runtime)
- ✅ **Trend analysis** (daily energy, weekly patterns)

**Goal**: Maintain COP > 3.5, minimize costs, ensure pool comfort.

**Dashboard URL**: http://192.168.0.6:3000/d/f0d68b75-8119-4ca3-b749-dfa9d8f116b3/aloha-pool-heat-pump-performance-and-cop-analysis

Enjoy efficient swimming! 🏊‍♂️💰⚡
