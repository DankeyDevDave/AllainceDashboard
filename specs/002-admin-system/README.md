# Admin System - Feature 002

Complete admin menu system with authentication, CRUD operations, tariff configuration, and report generation.

## Quick Start

### 1. Install Dependencies

Already installed during implementation. If needed:
```bash
cd pool-dashboard
npm install
```

### 2. Configure Admin Credentials

**Option A: Using quick_launch.sh (Recommended)**
```bash
./quick_launch.sh
# Select option 13: Setup Admin Credentials
```

**Option B: Manual Configuration**
```bash
cd pool-dashboard
cp .env.example .env.local
# Edit .env.local and set:
# AUTH_SECRET=<generate with: openssl rand -base64 32>
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=<your-password>
```

### 3. Start Development Server

```bash
./quick_launch.sh
# Select option 1: Run Dashboard Development Server
```

### 4. Access Admin Panel

Navigate to: **http://localhost:3000/admin**

Or use quick_launch.sh:
```bash
./quick_launch.sh
# Select option 14: Open Admin Dashboard
```

## Features

### 🔐 Authentication
- Secure login with username/password
- JWT-based session management (8-hour sessions)
- Role-based access control
- Automatic route protection

### ⚙️ Settings Management
Complete CRUD operations for:
- **Pool Configuration**: Volume, flow rate, device ID
- **Display Thresholds**: COP, power, temperature warnings
- **Dashboard Preferences**: Refresh intervals, themes
- **External Services**: InfluxDB and Grafana config

### 💰 Tariff Configuration
- Multiple tariff period management
- Time-based scheduling (HH:MM)
- Day-of-week selection
- Currency customization
- Real-time rate calculation
- Pre-configured templates

### 📊 Reports
Generate and export reports in multiple formats:

**Report Types:**
- Energy Report - Consumption trends
- Cost Analysis - Breakdown by tariff
- Performance Report - COP and efficiency
- Custom Report - User-defined metrics

**Export Formats:**
- PDF - Professional formatted reports
- CSV - Raw data for analysis
- Excel - Multi-sheet workbooks

## Architecture

```
Admin System
├── Authentication Layer (NextAuth.js)
├── Admin Layout (Sidebar + Header)
├── Settings Module (CRUD with localStorage)
├── Tariff Module (Time-based pricing)
└── Reports Module (PDF/CSV/Excel export)
```

## File Locations

```
pool-dashboard/
├── app/admin/                  # Admin pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── settings/page.tsx
│   ├── tariffs/page.tsx
│   ├── reports/page.tsx
│   └── users/page.tsx
├── app/auth/login/page.tsx     # Login page
├── components/admin/           # Admin components
├── lib/
│   ├── auth.ts                # Auth config
│   ├── settings-storage.ts    # Persistence
│   └── reports/               # Export functions
└── middleware.ts              # Route protection
```

## Environment Variables

Required in `pool-dashboard/.env.local`:

```bash
# Authentication (Required)
AUTH_SECRET=<random-secret-here>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<your-password>

# Optional: Use bcrypt hash for production
# ADMIN_PASSWORD_HASH=$2a$10$...

# InfluxDB (Required for data)
INFLUXDB_URL=http://10.31.222.5:8086
INFLUXDB_TOKEN=<your-token>
INFLUXDB_ORG=<your-org>
INFLUXDB_BUCKET=homeassistant

# Grafana (Optional)
NEXT_PUBLIC_GRAFANA_URL=http://10.31.222.5:3001
NEXT_PUBLIC_GRAFANA_DASHBOARD_UID_ALOHA=<uid>
```

## Security

### Current Implementation:
✅ Role-based access control
✅ Route protection middleware
✅ JWT session management
✅ Input validation (Zod schemas)
✅ CSRF protection (NextAuth)

### Production Recommendations:
1. Use bcrypt password hashing:
   ```bash
   # Generate hash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
   # Set ADMIN_PASSWORD_HASH in .env.local
   ```

2. Generate strong AUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

3. Never commit `.env.local` to git

4. Consider migrating from localStorage to database

## Common Tasks

### Change Admin Password
```bash
./quick_launch.sh
# Option 13: Setup Admin Credentials
```

### Reset Settings to Defaults
1. Login to admin panel
2. Navigate to Settings
3. Click "Reset to Defaults"

### Add New Tariff Period
1. Login to admin panel
2. Navigate to Tariff Configuration
3. Click "Add Period"
4. Configure time, price, and active days
5. Click "Save All"

### Generate Report
1. Login to admin panel
2. Navigate to Reports
3. Select report type
4. Choose date range
5. Click "Generate Report"
6. Export to PDF/CSV/Excel

## Troubleshooting

### Cannot Login
- Check `.env.local` has AUTH_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
- Verify credentials match what's configured
- Clear browser cookies and try again

### Settings Not Saving
- Check browser console for errors
- Verify localStorage is not full (max ~5MB)
- Try different browser

### Report Export Fails
- Check browser allows downloads
- Verify adequate disk space
- Try different export format

### Admin Routes Redirect to Login
- Verify you're logged in
- Check session hasn't expired (8 hours)
- Try logging in again

## Development

### Adding New Settings
1. Update `lib/types/admin.ts` - Add Zod schema
2. Update `lib/settings-storage.ts` - Add default values
3. Update `app/admin/settings/page.tsx` - Add UI form

### Adding New Report Type
1. Update `lib/types/admin.ts` - Add report type
2. Update `app/admin/reports/page.tsx` - Add UI option
3. Update export functions to handle new type

### Testing
```bash
# Run dashboard in dev mode
./quick_launch.sh # Option 1

# Access admin at localhost:3000/admin
# Test all CRUD operations
# Verify exports download correctly
```

## Support

For issues or questions:
- Check specification: `specs/002-admin-system/spec.md`
- Check implementation: `specs/002-admin-system/IMPLEMENTATION.md`
- GitHub Issues: https://github.com/radical-squared/aquatemp/issues

## License

Same as parent project (AquaTemp)
