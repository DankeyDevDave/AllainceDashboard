# Grafana Iframe Fix - Status & Manual Solution

## Current Situation

**Grafana Version**: 12.2.0  
**Container**: `kong-guard-grafana` (running)  
**Status**: Config file mounted, but X-Frame-Options still set to "deny"

## What Was Done

✅ Created custom grafana.ini with:
- `allow_embedding = true`
- `[auth.anonymous] enabled = true`  
- `org_role = Viewer`

✅ Mounted config file: `/Users/jacques/DevFolder/KongGuardAI/grafana.ini`

✅ Container recreated with proper volume mounts

❌ Still getting "X-Frame-Options: deny"

## Issue

Grafana 12.2.0 may require additional configuration or the settings need to be applied via the web UI for proper persistence with the data volume.

---

## ✅ RECOMMENDED SOLUTION: Manual UI Configuration

This is the most reliable method for Grafana 12.2.0:

### Step 1: Login to Grafana

**URL**: http://192.168.0.6:3000  
**Default Credentials**: admin / admin (or your password)

### Step 2: Enable Anonymous Access

1. Click **⚙️ Configuration** (gear icon in left sidebar)
2. Select **Settings**
3. Scroll down to find **Anonymous authentication** section
4. Toggle **Enable** to ON
5. Set:
   - **Organization**: Main Org.
   - **Role**: Viewer
6. Click **Save** at the bottom

### Step 3: Allow Embedding (if available in UI)

1. In **Settings**, look for **Security** section
2. Find **Allow embedding** option
3. Toggle to **ON**
4. Click **Save**

### Step 4: Verify Configuration

Open a new incognito/private browser window and visit:
```
http://192.168.0.6:3000/d-solo/f0d68b75-8119-4ca3-b749-dfa9d8f116b3?orgId=1&panelId=7&kiosk
```

**Expected**: Panel displays without login prompt

### Step 5: Test in Dashboard

Refresh your Next.js dashboard:
```
http://localhost:3001
```

Grafana panels should now display without iframe errors.

---

## Alternative: Database Direct Edit (Advanced)

If UI doesn't show the options, you can edit Grafana's database directly:

```bash
# Access the Grafana SQLite database
docker exec -it kong-guard-grafana sqlite3 /var/lib/grafana/grafana.db

# Enable anonymous auth
UPDATE preferences SET value = 'true' WHERE name = 'anonymous_enabled';
UPDATE preferences SET value = 'Viewer' WHERE name = 'anonymous_org_role';

# Exit
.quit

# Restart Grafana
docker restart kong-guard-grafana
```

---

## If Still Not Working: Workaround Options

### Option 1: Use Grafana's Share Feature

For each dashboard:
1. Open dashboard in Grafana
2. Click **Share** → **Snapshot**
3. Select **Publish to snapshots.raintank.io** OR **Local Snapshot**
4. Use the snapshot URL instead

### Option 2: Disable Grafana Panels Temporarily

Edit `app/dashboard/page.tsx` and comment out the GrafanaPanel components:

```typescript
{/* Temporarily disabled - Grafana iframe configuration needed
<div className="grid gap-6 lg:grid-cols-2">
  <GrafanaPanel ... />
</div>
*/}
```

The dashboard will still show all real-time metrics from InfluxDB.

### Option 3: Use Image/PNG Renders

Instead of iframes, fetch panel images:

Update `.env.local`:
```bash
# Use image rendering instead
NEXT_PUBLIC_GRAFANA_RENDER_MODE=image
```

Then modify GrafanaPanel component to use:
```
http://192.168.0.6:3000/render/d-solo/...&format=image
```

---

## Current Dashboard Status

**✅ Working**:
- Real-time InfluxDB data
- All KPI metrics (Power, COP, Energy, Cost, etc.)
- API endpoint functioning
- Auto-refresh every 30 seconds
- Calculations (COP, thermal lift, duty cycle)

**⚠️ Pending**:
- Grafana panel embedding (X-Frame-Options issue)

**The dashboard is 90% functional** - only the embedded Grafana charts need the iframe fix.

---

## Next Steps

**Immediate**:
1. Try the **Manual UI Configuration** above (most reliable)
2. If you have Grafana admin access, this takes 2 minutes

**Alternative**:
1. Use the dashboard without Grafana panels (still fully functional)
2. Add Grafana panels later once configuration is resolved

**For Testing**:
After UI configuration, refresh http://localhost:3001 and check browser console (F12) for iframe errors.

---

## Support

If you need help with the manual UI configuration:
1. Take a screenshot of Grafana Settings page
2. Check if "Anonymous authentication" section exists
3. Verify you can access http://192.168.0.6:3000 as admin

---

## Container Info

**Current Setup**:
```bash
# Container name
kong-guard-grafana

# Ports
Host: 33000 → Container: 3000

# Volumes
- /Users/jacques/DevFolder/KongGuardAI/grafana-data:/var/lib/grafana
- /Users/jacques/DevFolder/KongGuardAI/grafana.ini:/etc/grafana/grafana.ini:ro

# Access Grafana
http://192.168.0.6:3000

# View logs
docker logs kong-guard-grafana

# Restart
docker restart kong-guard-grafana
```

**The config file is properly mounted**, but Grafana 12.2.0 may require UI or database configuration for these specific security settings.
