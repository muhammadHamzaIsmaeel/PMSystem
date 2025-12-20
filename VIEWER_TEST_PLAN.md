# Viewer Test Plan - Complete Testing Guide

## 🎯 Role Overview
Viewer is a **READ-ONLY** role that can:
- ✅ View projects
- ✅ View tasks
- ✅ View financial reports (if permitted)
- ✅ View dashboard metrics
- ❌ **CANNOT create anything**
- ❌ **CANNOT edit anything**
- ❌ **CANNOT delete anything**
- ❌ **CANNOT approve anything**
- ❌ Strictly read-only access

**Use Case:** Stakeholders, clients, auditors who need visibility but no modification rights

---

## 🔐 Step 1: Login as Viewer

**Credentials:**
- Email: viewer@example.com
- Password: (jo aapne set kiya hai)

**Expected Result:**
- ✅ Successfully login
- ✅ Redirect to dashboard

**Important:**
- Dashboard should be clean and simple
- No action buttons (Create, Edit, Delete, Approve)

---

## 📊 Step 2: Dashboard Check (Read-Only Mode)

**Test kya:**
- Dashboard displays metrics and charts?
- ALL action buttons are HIDDEN or DISABLED?
- Data is view-only?

**Expected Dashboard Elements:**

**Visible (Read-Only):**
- ✅ Total Projects count
- ✅ Active Tasks count
- ✅ Budget Overview (if permitted)
- ✅ Project Status Distribution chart
- ✅ Task Status chart
- ✅ Recent activity feed (view only)

**NOT Visible:**
- ❌ "New Project" button
- ❌ "Create Task" button
- ❌ "Submit Expense" button
- ❌ "Add Income" button
- ❌ "Manage Users" button
- ❌ Any "Edit" or "Delete" buttons

**Expected Quick Actions for Viewer:**
- ✅ View Projects (read-only)
- ✅ View Tasks (read-only)
- ✅ View Reports (if permitted)
- ❌ NO creation/edit buttons at all

---

## 🏗️ Step 3: View Projects (Read-Only)

**Test Steps:**
1. Dashboard → "View Projects" (should be only option)
2. Browse projects list

**Expected Result:**
- ✅ Can see all projects or permitted projects
- ✅ Project cards display:
  - Name
  - Description
  - Client
  - Budget
  - Start/End dates
  - Status badge
  - Progress bar
- ❌ NO "New Project" button
- ❌ NO "Edit" button on any project
- ❌ NO "Delete" button

**Filter/Sort Test:**
- ✅ Can filter by status (Active, Planning, Completed, etc.)
- ✅ Can sort by name, date, budget
- ✅ Search functionality works (if available)

---

## 🔍 Step 4: View Project Details (Read-Only)

**Test Steps:**
1. Click on any project from the list
2. Explore project detail page

**Expected to See:**

**Project Information (Read-Only):**
- ✅ Project name
- ✅ Description
- ✅ Client name
- ✅ Budget
- ✅ Start and end dates
- ✅ Current status
- ✅ Progress percentage

**Tabs Available (All Read-Only):**

1. **Tasks Tab:**
   - ✅ List of all project tasks
   - ✅ Task status, priority, assignee visible
   - ❌ NO "Create Task" button
   - ❌ NO "Edit" button on tasks

2. **Expenses Tab (if permitted):**
   - ✅ List of expenses
   - ✅ Amounts, categories, status visible
   - ❌ NO "Submit Expense" button
   - ❌ NO "Approve/Reject" buttons

3. **Income Tab (if permitted):**
   - ✅ List of income entries
   - ✅ Amounts, sources, dates visible
   - ❌ NO "Add Income" button

4. **Profit & Loss Tab (if permitted):**
   - ✅ Financial summary visible
   - ✅ Charts and graphs display
   - ✅ Net profit calculation shown

---

## 📋 Step 5: View Tasks (Read-Only)

**Test Steps:**
1. Navigate to Tasks page
2. Browse all tasks

**Expected Result:**
- ✅ Can see all tasks or permitted tasks
- ✅ Task cards show:
  - Title
  - Description
  - Status badge
  - Priority badge
  - Assigned to (user name)
  - Project name
  - Deadline
  - Progress bar
- ❌ NO "Create Task" button
- ❌ NO "Edit" button on any task
- ❌ NO "Delete" button
- ❌ NO "Add Subtask" button

**Filter Test:**
- ✅ Can filter by:
  - Status (To Do, In Progress, Review, Done)
  - Priority (Low, Medium, High, Urgent, Critical)
  - Project
  - Assigned User
- ✅ Filters work correctly

---

## 🔍 Step 6: View Task Details (Read-Only)

**Test Steps:**
1. Click on any task
2. View task detail page (or modal)

**Expected to See:**
- ✅ All task information visible
- ✅ Comments/notes visible (if any)
- ✅ Time logs visible (if any)
- ✅ Attachments visible (if any)
- ❌ NO edit capability
- ❌ NO "Update Status" button
- ❌ NO "Add Comment" button
- ❌ NO "Delete" button

---

## 💰 Step 7: View Expenses (If Permitted)

**Test Steps:**
1. Navigate to Expenses (if link available)
2. View expenses list

**Expected Result:**
- ✅ Can view all expenses or project-specific expenses
- ✅ See details:
  - Amount
  - Category
  - Date
  - Status (Pending/Approved/Rejected)
  - Submitted by
  - Project
- ❌ NO "Submit Expense" button
- ❌ NO "Approve/Reject" buttons
- ❌ NO "Edit" or "Delete" buttons

**Note:**
- Depending on organization policy, financial data may or may not be visible to Viewer
- If not permitted, should get "Access Denied" or section not visible

---

## 💵 Step 8: View Income (If Permitted)

**Test Steps:**
1. Navigate to Income section (if available)
2. View income list

**Expected Result:**
- ✅ Can view income entries
- ✅ See details:
  - Amount
  - Source
  - Date
  - Project
  - Created by
- ❌ NO "Add Income" button
- ❌ NO edit capability

---

## 📊 Step 9: View Financial Reports (If Permitted)

**Test Steps:**
1. Navigate to Reports/Analytics (if available)
2. View financial dashboards

**Expected to See:**
- ✅ Profit & Loss statements
- ✅ Budget utilization charts
- ✅ Income vs Expenses graphs
- ✅ Project-wise financial breakdown
- ✅ Export to PDF/CSV (if permitted)
- ❌ NO data modification capability

**Charts/Graphs:**
- ✅ All charts render correctly
- ✅ Data points accurate
- ✅ Interactive tooltips work (hover to see details)

---

## 🚫 Step 10: Negative Tests (Critical!)

**These tests verify that Viewer truly has NO edit access:**

**Test 1: Try to Create Project**
- Check Projects page
- **Expected:** ❌ "New Project" button NOT visible
- **If visible and clicked:** Should get 403 Forbidden error

**Test 2: Try to Edit Project (URL Manipulation)**
- If you know a project ID, try: `/projects/{id}/edit`
- **Expected:** ❌ 403 Forbidden or "Access Denied" page

**Test 3: Try to Create Task**
- Check Tasks page
- **Expected:** ❌ "Create Task" button NOT visible
- **If visible and clicked:** 403 error

**Test 4: Try to Edit Task (URL Manipulation)**
- Try: `/tasks/{id}/edit`
- **Expected:** ❌ 403 Forbidden

**Test 5: Try to Submit Expense**
- Check for "Submit Expense" button/link
- **Expected:** ❌ Button NOT visible
- **If accessible:** 403 error

**Test 6: Try to Approve Expense**
- View any expense
- **Expected:** ❌ NO "Approve/Reject" buttons
- **If buttons visible:** Should be disabled or return error

**Test 7: Try to Add Income**
- Check Income page
- **Expected:** ❌ "Add Income" button NOT visible

**Test 8: Try to Manage Users**
- Check navigation and Quick Actions
- **Expected:** ❌ "Manage Users" NOT accessible
- **If accessible:** 403 error

**Test 9: Try Direct API Calls (Advanced)**
- Open browser console
- Try: `fetch('/api/v1/projects', {method: 'POST', ...})`
- **Expected:** ❌ 403 Forbidden or 401 Unauthorized

---

## 🔔 Step 11: Notifications (If Applicable)

**Test Steps:**
1. Check notification bell icon (if visible)
2. View notifications

**Expected Notifications:**
- ✅ Project status updates (if subscribed)
- ✅ Task completions (if relevant)
- ✅ General announcements
- ❌ NO action required notifications (like "Approve expense")

**Expected Result:**
- ✅ Can view notifications
- ✅ Can mark as read
- ❌ Cannot take actions from notifications

---

## 📊 Step 12: Search and Filter Functionality

**Test Steps:**
1. Use search bar (if available)
2. Test filters on various pages

**Search Test:**
```
Search for: "Website" (project name)
Expected: Shows matching projects, tasks, etc.

Search for: "Design" (task/category keyword)
Expected: Shows relevant results
```

**Filter Test:**
- ✅ Project filters work (status, client, date range)
- ✅ Task filters work (status, priority, assignee)
- ✅ Expense filters work (status, category, project)
- ✅ Results update correctly

---

## 📱 Step 13: Responsive Design Check (If Applicable)

**Test Steps:**
1. Resize browser window or use mobile device
2. Navigate through pages

**Expected Result:**
- ✅ Layout adapts to screen size
- ✅ Read-only data still accessible
- ✅ Charts/graphs responsive
- ✅ No horizontal scroll (unless intentional)

---

## 📄 Step 14: Export Functionality (If Permitted)

**Test Steps:**
1. Look for export buttons on reports
2. Try to export data

**Export Options (If Available):**
- ✅ Export project list to CSV
- ✅ Export task list to CSV
- ✅ Export financial report to PDF
- ✅ Print-friendly view

**Expected Result:**
- ✅ Exports work (if feature exists and permitted)
- ✅ Data accurate in exported file
- ❌ Cannot export sensitive data if restricted

---

## 🎯 Step 15: Data Accuracy Verification

**Test Steps:**
1. Cross-check data with other roles
2. Verify counts and calculations

**Verify:**
- ✅ Project count matches Admin view
- ✅ Task count matches actual tasks
- ✅ Financial amounts match Income/Expense records
- ✅ Charts reflect accurate data
- ✅ Status badges correct

**Expected Result:**
- ✅ Viewer sees accurate, real-time data
- ✅ No data discrepancies
- ✅ Same data as other roles (just read-only)

---

## 🔒 Step 16: Security & Permission Boundaries

**Critical Security Tests:**

**Test 1: Session Security**
- Log in as Viewer
- Try to access Admin-only URL
- **Expected:** 403 Forbidden

**Test 2: Role Escalation**
- Viewer should NOT be able to perform actions by:
  - URL manipulation
  - Browser console commands
  - API calls
  - Form submission
- **Expected:** All attempts blocked with 403

**Test 3: Data Leakage**
- Check browser Network tab
- Ensure API responses don't include:
  - Edit tokens
  - Sensitive fields (passwords, API keys)
  - More data than Viewer should see

---

## 🎯 Final Checklist for Viewer Role

**Core Permissions Verified:**
- ✅ Can view projects
- ✅ Can view tasks
- ✅ Can view financial reports (if permitted)
- ✅ Can use search and filters
- ✅ Can view charts and analytics
- ❌ **CANNOT create anything**
- ❌ **CANNOT edit anything**
- ❌ **CANNOT delete anything**
- ❌ **CANNOT approve anything**
- ❌ **CANNOT access user management**

**UI Verification:**
- ✅ Dashboard is clean and read-only
- ✅ NO action buttons visible (Create, Edit, Delete, Approve)
- ✅ All data displays correctly
- ✅ Charts and graphs render
- ✅ Filters and search work
- ✅ Navigation works smoothly

**Security Verification:**
- ✅ Cannot access edit URLs directly
- ✅ API calls blocked for write operations
- ✅ 403 errors returned for unauthorized actions
- ✅ No data leakage in Network tab
- ✅ Role cannot be escalated

**Data Integrity:**
- ✅ Sees accurate, real-time data
- ✅ Data matches other roles' views
- ✅ Counts and calculations correct
- ✅ No data discrepancies

**User Experience:**
- ✅ Interface intuitive for read-only access
- ✅ No confusing disabled buttons
- ✅ Clear indication of read-only mode
- ✅ No frustrating "Access Denied" popups for visible features
- ✅ Clean browser console (no errors)

---

## 🐛 Common Issues to Check

1. **Can See Edit Buttons**
   - Critical Bug! All edit/create buttons should be hidden
   - Check role-based rendering in frontend

2. **Can Submit Forms**
   - If forms are visible and submittable → Bug!
   - Backend should return 403 even if frontend allows

3. **Gets 500 Errors Instead of 403**
   - Backend should properly handle unauthorized requests
   - Should return 403 Forbidden, not 500 Internal Server Error

4. **Can Access Data Via URL Manipulation**
   - If `/projects/{id}/edit` accessible → Bug!
   - Should redirect to read-only view or show 403

5. **Inconsistent Data**
   - If Viewer sees different data than Admin → Bug!
   - Data should be consistent, just permissions different

---

## ✅ Success Criteria

**Test passes if:**
1. ✅ Viewer can access ALL permitted read-only views
2. ✅ **ZERO edit/create/delete capabilities** (most important!)
3. ✅ All data accurate and up-to-date
4. ✅ Charts and reports render correctly
5. ✅ Search and filters work
6. ✅ NO action buttons visible anywhere
7. ✅ URL manipulation blocked (403 errors)
8. ✅ API write operations blocked
9. ✅ Clean, intuitive read-only interface
10. ✅ No console errors
11. ✅ Proper 403 errors for unauthorized actions (not 500)
12. ✅ No data leakage or security issues

**Important Notes:**
- Viewer is the MOST restrictive role
- It's a pure read-only stakeholder view
- Must be completely secure - no loopholes
- Should still be user-friendly and informative
- If Viewer can modify ANYTHING, test fails!

**Report any ability to modify data as a CRITICAL security bug!**
