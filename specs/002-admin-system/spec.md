# Feature: Admin Menu System with CRUD, Tariff Config & Reports

**Spec ID:** 002-admin-system
**Date:** 2025-10-05
**Status:** In Progress
**Type:** Feature Development
**Priority:** High

## Overview

Add a comprehensive admin menu system to the AquaTemp pool dashboard that provides role-based access control, settings management with CRUD operations, electricity tariff configuration, and report generation/export capabilities.

## Business Value

- **Administrative Control**: Provides administrators with full control over dashboard configuration and settings
- **Cost Management**: Enables accurate electricity cost tracking through customizable tariff configuration
- **Data Insights**: Generates exportable reports for energy analysis and pool performance tracking
- **Security**: Implements role-based access to protect sensitive configuration from regular users
- **Flexibility**: Allows dynamic configuration changes without code modifications

## User Scenarios

### Scenario 1: Admin Login & Access
**Given** an administrator needs to access system configuration
**When** they navigate to the admin section
**Then** they are prompted to authenticate with admin credentials
**And** upon successful authentication, they see the admin dashboard with full menu access

### Scenario 2: Configure Electricity Tariffs
**Given** the admin is logged in and electricity rates have changed
**When** they navigate to the Tariff Configuration page
**Then** they can define multiple tariff periods (peak, off-peak, super off-peak)
**And** set time schedules for each tariff period
**And** the dashboard immediately uses new tariffs for cost calculations

### Scenario 3: Manage Dashboard Settings
**Given** the admin wants to customize dashboard behavior
**When** they access the Settings Management page
**Then** they can create, read, update, or delete various settings:
- Pool configuration (volume, flow rate)
- Display thresholds (COP warnings, power alerts)
- Refresh intervals and data retention
- InfluxDB/Grafana connection details
**And** changes are immediately applied to the dashboard

### Scenario 4: Generate & Export Reports
**Given** the admin needs to analyze pool performance data
**When** they access the Reports section
**Then** they can:
- Select report type (energy, cost, performance)
- Choose date range (daily, weekly, monthly, custom)
- Preview report data in the dashboard
- Export to PDF, CSV, or Excel format
**And** downloaded reports contain accurate data with proper formatting

### Scenario 5: Regular User Access Restriction
**Given** a regular user accesses the dashboard
**When** they try to access admin routes
**Then** they are redirected to the login page
**And** admin menu items are not visible in the UI

## Functional Requirements

### FR1: Authentication & Authorization
- **FR1.1**: Implement NextAuth.js authentication system
- **FR1.2**: Support admin and regular user roles
- **FR1.3**: Protect admin routes with middleware
- **FR1.4**: Hide admin UI elements from non-admin users
- **FR1.5**: Store credentials securely in environment variables
- **FR1.6**: Implement session management with auto-timeout

### FR2: Admin Menu System
- **FR2.1**: Create admin sidebar navigation with sections:
  - Dashboard Overview
  - Settings Management
  - Tariff Configuration
  - Reports
  - User Management (placeholder for future)
- **FR2.2**: Implement responsive admin layout
- **FR2.3**: Add breadcrumb navigation for admin pages
- **FR2.4**: Include quick access to main dashboard

### FR3: Settings CRUD Operations
- **FR3.1**: Dashboard Preferences
  - Refresh interval configuration
  - Default device selection
  - Theme preferences
- **FR3.2**: Pool Configuration
  - Pool volume (m³)
  - Flow rate (L/min)
  - Device ID management
- **FR3.3**: Display Thresholds
  - COP warning levels (green/yellow/red)
  - Power consumption thresholds
  - Temperature delta thresholds
  - Thermal lift thresholds
- **FR3.4**: External Services
  - InfluxDB connection settings
  - Grafana dashboard UIDs
  - API endpoints
- **FR3.5**: Validation & Error Handling
  - Input validation with clear error messages
  - Confirmation dialogs for destructive actions
  - Auto-save with success notifications

### FR4: Tariff Configuration System
- **FR4.1**: Tariff Period Management
  - Create multiple tariff periods (Peak, Standard, Off-Peak)
  - Set price per kWh for each period
  - Define time schedules using time pickers
  - Support weekday/weekend variations
- **FR4.2**: Seasonal Tariff Support
  - Define summer/winter tariff variations
  - Set effective date ranges
- **FR4.3**: Currency Configuration
  - Select currency symbol (R, $, €, £)
  - Set decimal precision
- **FR4.4**: Tariff Preview
  - Show current active tariff
  - Display tariff schedule visualization
  - Simulate cost calculations
- **FR4.5**: Default Tariff Templates
  - Provide common tariff presets (Eskom, City Power, etc.)
  - Allow custom tariff creation

### FR5: Reports Module
- **FR5.1**: Report Types
  - **Energy Report**: Daily/weekly/monthly consumption with trends
  - **Cost Analysis**: Breakdown by tariff period with charts
  - **Performance Report**: COP trends, efficiency metrics
  - **Custom Report**: User-defined metrics and date ranges
- **FR5.2**: Report Generation
  - Select report type from dropdown
  - Choose date range with calendar picker
  - Set aggregation interval (hourly, daily, weekly)
  - Preview data before export
- **FR5.3**: Data Visualization in Reports
  - Summary statistics (total consumption, average COP, etc.)
  - Charts and graphs (line, bar, pie)
  - Data tables with sorting/filtering
- **FR5.4**: Export Functionality
  - **PDF Export**: Professional formatted reports with charts
  - **CSV Export**: Raw data for spreadsheet analysis
  - **Excel Export**: Multi-sheet workbooks with formatting
- **FR5.5**: Report Scheduling (Future Enhancement)
  - Schedule automated report generation
  - Email delivery of reports

## Technical Requirements

### TR1: Technology Stack
- **Frontend Framework**: Next.js 15 with React 19
- **Authentication**: NextAuth.js v5
- **Form Handling**: react-hook-form + zod validation
- **Data Tables**: @tanstack/react-table
- **PDF Generation**: jspdf + jspdf-autotable
- **Excel Export**: xlsx library
- **UI Components**: Radix UI + Tailwind CSS

### TR2: Data Storage
- **Phase 1**: localStorage for settings (MVP)
- **Phase 2**: PostgreSQL/SQLite for persistence (future)
- **Session Storage**: NextAuth session management

### TR3: API Endpoints
- `POST /api/auth/[...nextauth]` - Authentication
- `GET/POST/PUT/DELETE /api/admin/settings` - Settings CRUD
- `GET/POST/PUT/DELETE /api/admin/tariffs` - Tariff management
- `POST /api/admin/reports/generate` - Generate report data
- `POST /api/admin/reports/export` - Export reports

### TR4: Security
- HTTPS only for production
- Environment variable for admin credentials
- CSRF protection via NextAuth
- Role-based access control middleware
- Input sanitization and validation

### TR5: Performance
- Lazy loading for admin routes
- Optimized report generation (max 10,000 data points)
- Pagination for large datasets
- Client-side caching for settings

## Acceptance Criteria

### Authentication & Access Control
- [ ] Admin can log in with username/password
- [ ] Invalid credentials show error message
- [ ] Session persists across page refreshes
- [ ] Regular users cannot access `/admin/*` routes
- [ ] Admin menu is hidden for non-admin users
- [ ] Logout functionality clears session

### Settings Management
- [ ] All settings can be created, viewed, updated, and deleted
- [ ] Form validation prevents invalid data
- [ ] Changes are saved and persisted
- [ ] Success/error notifications appear
- [ ] Confirmation dialogs prevent accidental deletions
- [ ] Settings immediately affect dashboard behavior

### Tariff Configuration
- [ ] Multiple tariff periods can be defined
- [ ] Time schedules work correctly (00:00 - 23:59)
- [ ] Tariff changes update cost calculations accurately
- [ ] Currency symbol displays throughout dashboard
- [ ] Default templates load correctly
- [ ] Invalid tariff configs show validation errors

### Reports
- [ ] All report types generate correct data
- [ ] Date range picker allows custom date selection
- [ ] Report preview displays data accurately
- [ ] PDF exports contain charts and formatted data
- [ ] CSV exports contain all raw data points
- [ ] Excel exports have proper sheet structure
- [ ] Downloaded files have descriptive names (e.g., `energy-report-2025-10-01.pdf`)
- [ ] Large datasets (>1000 rows) are handled gracefully

### Testing
- [ ] Unit tests for authentication logic (>80% coverage)
- [ ] Integration tests for CRUD operations
- [ ] E2E tests for admin workflows
- [ ] Report generation validated against known data
- [ ] Export files validated for correct format

## Constraints & Assumptions

### Constraints
- No multi-user management in Phase 1 (single admin account)
- localStorage limits settings to ~5-10 MB
- PDF export limited to 50 pages per report
- No email delivery in Phase 1

### Assumptions
- Admin credentials stored in `.env.local` (not in database)
- All users accessing dashboard are trusted (no public access)
- InfluxDB data is available and reliable
- Users have modern browsers (Chrome, Firefox, Safari, Edge)

## Out of Scope

The following are explicitly NOT included in this feature:
- Multi-user account management with registration
- Password reset/recovery functionality
- Two-factor authentication
- Audit logging of admin actions
- Real-time report scheduling and automation
- Mobile-specific admin interface
- Backup/restore functionality for settings
- Integration with external accounting systems

## Dependencies

### External Dependencies
- NextAuth.js for authentication
- jsPDF for PDF generation
- xlsx for Excel export
- react-hook-form + zod for forms
- @tanstack/react-table for data tables

### Internal Dependencies
- InfluxDB API for report data
- Existing dashboard components
- Theme system for consistent styling

## Implementation Phases

### Phase 1: Authentication (Week 1)
- Set up NextAuth.js
- Create login page
- Implement middleware protection
- Add logout functionality

### Phase 2: Admin Layout (Week 1)
- Build admin sidebar
- Create admin dashboard page
- Add breadcrumb navigation
- Implement responsive design

### Phase 3: Settings CRUD (Week 2)
- Build settings forms
- Implement CRUD API endpoints
- Add validation logic
- Create settings UI

### Phase 4: Tariff Configuration (Week 2)
- Design tariff data structure
- Build tariff management UI
- Update cost calculation logic
- Add tariff templates

### Phase 5: Reports (Week 3)
- Implement report data fetching
- Build report preview UI
- Add PDF export
- Add CSV/Excel export
- Test all export formats

### Phase 6: Testing & Documentation (Week 3)
- Write comprehensive tests
- Update quick_launch.sh
- Document admin features
- Create admin user guide

## Success Metrics

- Admin can perform all CRUD operations without errors
- Tariff configuration updates costs accurately (±1% tolerance)
- Reports export successfully in all three formats
- Page load time < 2 seconds for admin pages
- Test coverage > 80% for admin code
- Zero security vulnerabilities in auth implementation

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| localStorage size limits | Medium | Add warning when approaching limit; plan DB migration |
| PDF generation performance | Medium | Limit report data points; add progress indicator |
| NextAuth.js learning curve | Low | Use official documentation; follow examples |
| Tariff calculation bugs | High | Extensive unit tests; manual validation |
| Browser compatibility issues | Low | Test on major browsers; use polyfills |

## Future Enhancements

- Migrate settings from localStorage to PostgreSQL
- Add multi-user support with role management
- Implement audit logging for all admin actions
- Email report scheduling and delivery
- Advanced analytics with ML-powered insights
- Mobile-optimized admin interface
- Import/export of settings for backup
- Integration with Home Assistant for notifications