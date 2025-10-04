# Fix Grafana Iframe Embedding

## Problem
Grafana panels show error: "Refused to display in a frame because it set 'X-Frame-Options' to 'deny'"

## Solution

You need to configure Grafana to allow iframe embedding. Here are multiple options:

---

## Option 1: Enable Anonymous Access (Easiest)

### Step 1: Login to Grafana
```
URL: http://192.168.0.6:3000
Username: admin
Password: [your admin password]
```

### Step 2: Enable Anonymous Access
1. Go to **Configuration** (gear icon) → **Settings**
2. Scroll to **Auth** section
3. Find **Anonymous Auth**
4. Click **Enable**
5. Set these settings:
   - **Enabled**: ✅ Check
   - **Organization name**: Main Org. (or your org name)
   - **Organization role**: Viewer
6. Click **Save**

### Step 3: Update Grafana Config (if needed)
If the UI doesn't work, edit Grafana config file:

**For Docker Grafana:**
```bash
# Find Grafana container
docker ps | grep grafana

# Edit config
docker exec -it <grafana-container> vi /etc/grafana/grafana.ini

# Or mount a custom config
```

**Add to `grafana.ini`:**
```ini
[auth.anonymous]
enabled = true
org_name = Main Org.
org_role = Viewer

[security]
allow_embedding = true
cookie_samesite = none
```

### Step 4: Restart Grafana
```bash
docker restart grafana
# Or
systemctl restart grafana-server
```

---

## Option 2: Configure X-Frame-Options

Edit `grafana.ini`:

```ini
[security]
allow_embedding = true
cookie_samesite = none

# Optional: Allow from specific domain
# x_frame_options = allow-from http://localhost:3001
```

Restart Grafana.

---

## Option 3: Use Grafana's Share Feature

### For Public Dashboards (Grafana 9+):

1. Open your dashboard in Grafana
2. Click **Share** button (top right)
3. Go to **Public dashboard** tab
4. Click **Generate public URL**
5. Enable **Public dashboard**
6. Copy the public URL

Then update your `.env.local`:
```bash
# Use the public dashboard URL instead
NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA=<public-dashboard-id>
```

---

## Option 4: Proxy Grafana Through Next.js (Advanced)

Create a proxy route in your Next.js app to bypass CORS/iframe restrictions.

**File: `app/api/grafana-proxy/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const grafanaUrl = process.env.GRAFANA_URL || 'http://192.168.0.6:3000';
  
  // Build Grafana URL
  const path = searchParams.get('path') || '';
  const fullUrl = `${grafanaUrl}${path}`;
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        // Forward any auth headers if needed
      },
    });
    
    const data = await response.text();
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        // Remove X-Frame-Options
        'X-Frame-Options': 'ALLOWALL',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to proxy Grafana' }, { status: 500 });
  }
}
```

Then update `GrafanaPanel` component to use proxy.

---

## Quick Test

After configuring, test if it works:

### Test 1: Direct URL
Open in browser:
```
http://192.168.0.6:3000/d-solo/f0d68b75-8119-4ca3-b749-dfa9d8f116b3?orgId=1&panelId=7&kiosk
```

Should display the panel.

### Test 2: Iframe Test
Create a simple HTML file:
```html
<!DOCTYPE html>
<html>
<body>
  <iframe 
    src="http://192.168.0.6:3000/d-solo/f0d68b75-8119-4ca3-b749-dfa9d8f116b3?orgId=1&panelId=7&kiosk"
    width="800" 
    height="400"
  ></iframe>
</body>
</html>
```

Open in browser. If panel shows, iframe embedding works.

---

## Recommended Solution

**For Development/Testing:**
Use **Option 1** (Anonymous Access) - fastest and easiest.

**For Production:**
- Use **Option 1** with IP restrictions
- Or use **Option 3** (Public Dashboards) for specific dashboards
- Or implement proper authentication with **Option 4** (Proxy)

---

## After Fixing

Once Grafana allows embedding:

1. Refresh your dashboard: http://localhost:3001
2. Grafana panels should now display
3. You'll see:
   - Power Consumption Timeline
   - Temperature Monitoring  
   - Daily Energy Bars

---

## Alternative: Remove Grafana Panels

If you can't configure Grafana, you can temporarily comment out the Grafana panels in the dashboard:

**File: `app/dashboard/page.tsx`**

Find the GrafanaPanel sections and comment them out:
```tsx
{/* Temporarily disabled until Grafana iframe is configured
<div className="grid gap-6 lg:grid-cols-2">
  <GrafanaPanel ... />
</div>
*/}
```

The dashboard will still show all the real-time metrics from InfluxDB, just without the Grafana charts.

---

## Need Help?

If you're stuck, let me know:
1. What type of Grafana setup you have (Docker, bare metal, etc.)
2. If you have admin access
3. Your preferred solution

I can provide more specific instructions!
