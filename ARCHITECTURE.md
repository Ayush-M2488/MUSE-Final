# MUSE Architecture

## Frontend Component Organization

The MUSE frontend leverages a modular component architecture built on React.

### Admin Dashboard Orchestrator Pattern

The Admin Dashboard implements an Orchestrator Pattern to maintain separation of concerns and keep complex UI logic manageable. 

**`AdminDashboard.jsx`** acts as the central state manager (Orchestrator).
- It is responsible for making API requests to `adminService` to fetch global state (`users`, `allCourses`, `auditLogs`, `grievancesList`, `reportData`).
- It maintains state for user interactions (e.g., `userPage`, `coursePage`).
- It delegates rendering to dedicated Tab Components located in `src/components/dashboard/admin/tabs/`.

### Admin Tabs Directory (`src/components/dashboard/admin/tabs/`)

To prevent monolithic bloat, the Admin UI is divided into the following specialized tab components:

1. **`UserManagementTab.jsx`**: Manages the user directory, bulk imports, and role assignments.
2. **`SystemSettingsTab.jsx`**: Handles system configurations, SMTP/SSO settings, and database backups.
3. **`AdminAnalyticsTab.jsx`**: Displays high-level administrative charts, risk distibutions, and student-to-faculty ratios.
4. **`ReportsTab.jsx`**: Central hub for generating customizable CSV/PDF administrative reports (attendance, grades, etc.).
5. **`CoursesTab.jsx`**: Manages the curriculum catalog and handles faculty assignments to specific subjects.
6. **`GrievancesTab.jsx`**: Administrator interface for reviewing and responding to system-level student grievances.
7. **`FeesTab.jsx`**: Module for tracking and managing student fee payments, dues, and payment statuses.
8. **`LogsTab.jsx`**: Provides a raw interface to view system audit logs and intervention events.

This separation guarantees that individual components are highly cohesive and loosely coupled to the orchestrator's state fetching logic.
