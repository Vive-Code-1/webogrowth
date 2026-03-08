

# Dashboard Enhancement Plan

## Overview
Add revenue/budget charts (weekly, monthly, yearly) and enhance the dashboard with new futuristic widgets and better icons.

## Data Source
Projects table already has `budget` and `currency` fields, plus `created_at` timestamps. We'll calculate revenue from **completed projects' budgets** grouped by time periods.

## Changes

### 1. Enhanced `src/pages/Dashboard.tsx`
- **Revenue Chart Section**: Area/Bar chart using Recharts showing budget amounts by week, month, and year with tab switching
- **New Stat Cards**: Add "Revenue This Month", "Revenue This Week" stat cards with `DollarSign`, `Calendar`, `Activity`, `Zap` icons
- **Task Distribution Donut Chart**: Show tasks by stage (backlog, todo, in_progress, review, completed) as a pie/donut chart
- **Project Priority Overview**: Small bar chart or visual showing project count by priority
- **Recent Activity Timeline**: A sleek timeline showing latest task/project updates

### 2. Revenue Calculation Logic (inside Dashboard.tsx)
- Filter projects by `status === "completed"` or all projects
- Use `created_at` to group by current week/month/year
- Sum `budget` values per period
- Generate chart data arrays for Recharts

### 3. UI Enhancements
- Use `ChartContainer` from existing `src/components/ui/chart.tsx`
- Recharts `AreaChart`, `BarChart`, `PieChart` components
- Tabs component for switching between Week/Month/Year views
- Gradient fills on charts for futuristic look
- Updated StatCard icons: `DollarSign`, `Zap`, `Activity`, `BarChart3`

### Files
- **Edit**: `src/pages/Dashboard.tsx` — Major rewrite with charts and new sections
- **Edit**: `src/components/StatCard.tsx` — Minor polish (gradient icon backgrounds)

