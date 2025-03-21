# Dashboard Screen Specification

## Overview

The Dashboard serves as the main landing page after user login. It provides an overview of the user's form submission history, quick access to common actions, and important system notifications.

## UI Components

### Header Section
- Application logo (top left)
- User profile dropdown (top right)
  - User avatar/initials
  - User name/email
  - Menu options (Profile, Settings, Logout)
- Notification bell icon with unread count
- Help/support button

### Welcome & Statistics Section
- Personalized welcome message with user's name
- Summary statistics in card format:
  - Forms submitted this month (with comparison to previous month)
  - Total tax calculated year-to-date
  - Pending drafts count
  - Upcoming deadline alert (if applicable)

### Quick Actions
- "Create New Form" (primary button)
- "Resume Draft" (only visible if drafts exist)
- "Import Data" (for bulk operations)
- "View Business Profiles" (secondary action)

### Recent Submissions
- Tabular display with columns:
  - Date submitted
  - Form ID/reference
  - Status (Draft, Completed, Processing)
  - Reporting period
  - Total entries
  - Total amount
  - Actions (View, Download, Duplicate)
- Pagination controls
- Filter/search options
- Empty state design for new users

### Announcements & Notifications
- Important system updates
- Tax rate or form changes
- Subscription status alerts
- Upcoming maintenance notifications

## Detailed Specifications

### Statistics Cards
- Each statistic displayed in a card with:
  - Icon representing the metric
  - Current value in large, bold text
  - Label describing the metric
  - Comparison to previous period (where applicable)
  - Trend indicator (up/down arrow) with appropriate coloring

### Recent Submissions Table
- Limited to 5-10 most recent submissions by default
- Sortable columns
- Status indicator using color-coding:
  - Draft: Gray
  - Completed: Green
  - Processing: Blue
  - Error: Red
- Row hover effect revealing action buttons
- Click on row navigates to detailed view

### Responsive Adaptations
- Statistics cards stack on mobile
- Table converts to card view on smaller screens
- Quick actions convert to icon-only on mobile with labels in tooltips
- Sidebar navigation collapses to bottom bar on mobile

## Implementation Example

```tsx
// pages/dashboard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/auth';
import { getUserStats, getRecentForms } from '@/lib/api';

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [recentForms, setRecentForms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsData, formsData] = await Promise.all([
          getUserStats(),
          getRecentForms({ limit: 5 })
        ]);
        
        setStats(statsData);
        setRecentForms(formsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-gray-500">Here's what's happening with your forms</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button size="lg" className="w-full md:w-auto">
            Create New Form
          </Button>
        </div>
      </div>
      
      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Forms Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.formsSubmitted}</div>
            <p className="text-xs text-gray-500">
              {stats.formsTrend > 0 ? '+' : ''}{stats.formsTrend}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Tax Calculated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalTax.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Year to date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDrafts}</div>
            {stats.pendingDrafts > 0 && (
              <Button variant="link" className="p-0 h-auto text-xs">
                Resume latest
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Next Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nextDeadline || 'None'}</div>
            <p className="text-xs text-gray-500">
              {stats.daysToDeadline} days remaining
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Submissions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Submissions</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        
        {recentForms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Form ID</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Period</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentForms.map((form) => (
                  <tr key={form.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{new Date(form.created_at).toLocaleDateString()}</td>
                    <td className="py-2">{form.id.substring(0, 8)}</td>
                    <td className="py-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        form.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        form.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {form.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {new Date(form.date_range_start).toLocaleDateString()} - 
                      {new Date(form.date_range_end).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-right">${form.total_amount.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Download</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first form to get started
            </p>
            <Button>Create New Form</Button>
          </div>
        )}
      </div>
      
      {/* Announcements */}
      {stats.announcements && stats.announcements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Announcements</h2>
          <div className="space-y-4">
            {stats.announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    {announcement.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{announcement.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(announcement.date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Empty State Design

For new users or when no data is available:

1. **First-time User**:
   - Welcome message explaining the application purpose
   - Quick tutorial or guided walkthrough option
   - Clear call-to-action to create first form
   - Visual illustration of the process

2. **No Recent Forms**:
   - Message acknowledging no submissions yet
   - Suggestion to create a new form
   - Primary button to start the process

3. **No Stats Available**:
   - Placeholder cards with empty state messaging
   - Information about when data will start appearing
