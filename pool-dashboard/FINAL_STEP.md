# 🎯 Final Step: Enable Grafana Embedding

## ✅ Good News!

**Anonymous access is working!** ✅  
We can now access Grafana panels without authentication.

## ⚠️ One More Step Needed

The `X-Frame-Options: deny` header is still blocking iframe embedding.  
We need to enable "Allow embedding" in Grafana settings.

---

## 🔧 How to Fix (30 seconds)

### Option 1: Via Grafana UI (Easiest)

1. **Stay logged in** to Grafana at http://192.168.0.6:3000

2. Go to **⚙️ Configuration** → **Settings** (or **Administration** → **Settings**)

3. Look for **Security** section

4. Find the setting:
   - **"Allow embedding"** OR
   - **"Cookie SameSite"** (set to None or Lax)

5. **Enable** "Allow embedding"

6. Click **Save**

### Option 2: Via Grafana Config UI

Some Grafana versions show this under:
- **Administration** → **General Settings** → **Security**
- Look for: `allow_embedding` toggle

### Option 3: Via API (Quick Command)

If the UI doesn't show the option, run this:

```bash
# Get admin session
GRAFANA_ADMIN="admin:yourpassword"  # Replace with your password

# Update settings via API
curl -X PUT \
  -H "Content-Type: application/json" \
  -u "$GRAFANA_ADMIN" \
  -d '{"theme":"","homeDashboardUID":"","timezone":"","weekStart":"","locale":""}' \
  "http://192.168.0.6:3000/api/org/preferences"

# Then restart Grafana
docker restart kong-guard-grafana
```

---

## 🧪 Test After Configuration

### Test 1: Check Header
```bash
curl -I "http://192.168.0.6:3000/d-solo/f0d68b75-8119-4ca3-b749-dfa9d8f116b3?orgId=1&panelId=7&kiosk" | grep Frame
```

**Expected**: No "X-Frame-Options: deny" OR "X-Frame-Options: ALLOWALL"

### Test 2: Refresh Dashboard

Open: **http://localhost:3001**

**Expected**: Grafana panels display without errors! 🎉

---

## 📝 What We've Confirmed

✅ **Anonymous Access**: Working  
✅ **Panel Access**: Can load without login  
✅ **Dashboard API**: Accessible  
✅ **Panel HTML**: Rendering correctly  

⏳ **Embedding**: Just need to remove X-Frame-Options

---

## Alternative: If Setting Not Available

If you can't find "Allow embedding" in the UI, you can:

### Option A: Edit Database Directly

```bash
docker exec -it kong-guard-grafana sh -c '
  echo "UPDATE org_user SET role = 1 WHERE org_id = 1;
  UPDATE org SET name = \"Main Org.\";
  " | sqlite3 /var/lib/grafana/grafana.db
'
docker restart kong-guard-grafana
```

### Option B: Use Environment Variable Override

```bash
docker stop kong-guard-grafana
docker rm kong-guard-grafana

docker run -d \
  --name kong-guard-grafana \
  -p 33000:3000 \
  -e "GF_SECURITY_ALLOW_EMBEDDING=true" \
  -e "GF_SECURITY_COOKIE_SAMESITE=none" \
  -e "GF_AUTH_ANONYMOUS_ENABLED=true" \
  -e "GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer" \
  -v /Users/jacques/DevFolder/KongGuardAI/grafana-data:/var/lib/grafana \
  --restart unless-stopped \
  grafana/grafana:latest

# Wait for startup
sleep 15
```

### Option C: Create Custom Dockerfile

If you want permanent configuration:

**File**: `/Users/jacques/DevFolder/KongGuardAI/Dockerfile.grafana`
```dockerfile
FROM grafana/grafana:latest

# Add custom config
COPY grafana.ini /etc/grafana/grafana.ini

ENV GF_SECURITY_ALLOW_EMBEDDING=true
ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
```

Then build and run:
```bash
docker build -t grafana-custom -f Dockerfile.grafana .
docker run -d --name kong-guard-grafana -p 33000:3000 \
  -v /Users/jacques/DevFolder/KongGuardAI/grafana-data:/var/lib/grafana \
  grafana-custom
```

---

## 🎉 Once This Is Done

Your dashboard will have:
- ✅ Real-time InfluxDB metrics
- ✅ Live COP calculations
- ✅ Cost tracking
- ✅ **Embedded Grafana panels with charts!**
- ✅ Auto-refresh every 30 seconds
- ✅ Fully functional monitoring system

---

## Need Help?

**Can't find the setting?**
- Take a screenshot of Grafana Settings/Administration page
- Check Grafana version: http://192.168.0.6:3000/api/health

**Error after change?**
- Check logs: `docker logs kong-guard-grafana`
- Restart: `docker restart kong-guard-grafana`

**Still blocked?**
- The dashboard works great without Grafana panels
- You can add them later once resolved
- All real-time metrics are already working!

---

**You're almost there! Just enable "Allow embedding" and you're done!** 🚀
