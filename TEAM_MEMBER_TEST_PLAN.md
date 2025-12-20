# Team Member Test Plan - Complete Testing Guide

## 🎯 Role Overview
Team Member can:
- ✅ View assigned tasks
- ✅ Update task status and progress
- ✅ Submit expenses
- ✅ View projects
- ✅ Log time entries (if feature exists)
- ❌ Cannot create projects
- ❌ Cannot create tasks (can only work on assigned)
- ❌ Cannot approve expenses
- ❌ Cannot manage users
- ❌ Limited to own work and assigned tasks

---

## 🔐 Step 1: Login as Team Member

**Credentials:**
- Email: team@example.com
- Password: (jo aapne set kiya hai)

**Expected Result:**
- ✅ Successfully login
- ✅ Redirect to dashboard

---

## 📊 Step 2: Dashboard Check

**Test kya:**
- My Tasks section prominently displayed?
- Only assigned tasks visible?
- Limited Quick Actions compared to Admin/PM?
- Personal productivity metrics shown?

**Expected Quick Actions for Team Member:**
1. ✅ View My Tasks (only assigned to me)
2. ✅ View Projects (can view project details)
3. ✅ Submit Expense
4. ❌ New Project (NOT visible)
5. ❌ New Task (NOT visible - cannot create tasks)
6. ❌ Manage Expenses (NOT visible - cannot approve)
7. ❌ Manage Users (NOT visible)

**Expected Dashboard Cards:**
- My Active Tasks: Count of tasks assigned to me
- Tasks Due Soon: Tasks with approaching deadlines
- Tasks Completed This Week: Personal productivity
- Projects I'm Working On: List of projects with assigned tasks

---

## 📋 Step 3: View Assigned Tasks

**Test Steps:**
1. Dashboard → "View My Tasks"
2. Check tasks list

**Expected Result:**
- ✅ Only tasks assigned to YOU are visible
- ✅ Cannot see tasks assigned to other team members
- ✅ Tasks grouped by status or project
- ✅ Task cards show:
  - Title
  - Description
  - Priority badge
  - Status badge
  - Deadline
  - Project name
  - Progress bar

**Important:**
- Should NOT see all tasks in system
- Only YOUR assigned tasks

---

## ✏️ Step 4: Update Task Status

**Prerequisites:**
- PM or Admin should have created and assigned tasks to you
- If no tasks assigned, ask PM to create one

**Test Steps:**
1. Select a task with status "To Do"
2. Click "Edit" or update status directly
3. Change status: To Do → In Progress

**Expected Result:**
- ✅ Status updated successfully
- ✅ Status badge changes color
- ✅ Notification sent to Project Manager
- ✅ Task shows in "In Progress" filter
- ✅ Dashboard "Active Tasks" count updated

---

## 📈 Step 5: Update Task Progress

**Test Steps:**
1. Open task in "In Progress" status
2. Update progress percentage
3. Add progress notes (if field exists)

**Example Update:**
```
Task: Setup Development Environment
Status: In Progress
Progress: 50%
Notes: Completed Docker setup and database configuration.
       Working on CI/CD pipeline integration.
```

**Expected Result:**
- ✅ Progress bar updated to 50%
- ✅ Progress reflected in task card
- ✅ Last updated timestamp shows
- ✅ PM receives notification of progress update

---

## ✅ Step 6: Complete a Task

**Test Steps:**
1. Select a task you've been working on
2. Update progress to 100%
3. Change status to "Done"
4. Add completion notes

**Example:**
```
Task: Database Schema Design
Status: In Progress → Done
Progress: 100%
Completion Notes: Schema designed and reviewed.
                  Created migration scripts.
                  Documentation added to wiki.
```

**Expected Result:**
- ✅ Task marked as completed
- ✅ Status shows "Done" with green badge
- ✅ Task moves to completed section
- ✅ PM receives completion notification
- ✅ Dashboard "Completed This Week" count increases

---

## 💰 Step 7: Submit Expense for Work

**Test Steps:**
1. Dashboard → "Submit Expense"
2. Submit expense related to your work

**Dummy Data:**
```
Project: (Select project you're working on)
Category: Software
Amount: 49.99
Expense Date: 2024-02-20
Description: JetBrains IntelliJ IDEA license - Monthly subscription for development work
Receipt Path: /receipts/jetbrains-feb-2024.pdf
```

**Expected Result:**
- ✅ Expense submitted successfully
- ✅ Alert: "Expense submitted! Awaiting Finance approval."
- ✅ Expense visible in your submissions
- ✅ Status: "Pending" (yellow badge)
- ✅ Cannot approve own expense

---

## 💸 Step 8: Submit Multiple Expenses

**Expense 2:**
```
Category: Transportation
Amount: 75.50
Expense Date: 2024-02-18
Description: Uber to client meeting - Project kickoff
```

**Expense 3:**
```
Category: Equipment
Amount: 129.99
Expense Date: 2024-02-15
Description: Wireless mouse and keyboard for remote work setup
```

**Expected Result:**
- ✅ All expenses submitted
- ✅ All show pending status
- ✅ Can view your expense history
- ✅ Can filter your expenses by status/date

---

## 🔍 Step 9: View Project Details (Read-Only)

**Test Steps:**
1. Dashboard → "View Projects"
2. Click on a project you're working on
3. Explore project detail page

**Expected to See:**
- ✅ Project information (name, description, budget, dates)
- ✅ **Tasks Tab**: Only YOUR tasks for this project (not all tasks)
- ✅ **Team Members**: List of people working on project
- ❌ May NOT see Expenses tab (depends on permissions)
- ❌ May NOT see Income tab (depends on permissions)
- ❌ May NOT see Profit & Loss (management view only)

**Expected Restrictions:**
- ❌ Cannot edit project details
- ❌ No "Edit Project" button
- ❌ Cannot add/remove team members
- ❌ Read-only view only

---

## 📋 Step 10: Task Comments/Updates (If Feature Exists)

**Test Steps:**
1. Open an assigned task
2. Add comment or update

**Example Comment:**
```
Task: User Authentication Module
Comment: "Encountered issue with JWT token expiration.
         Researching best practices for refresh token implementation.
         May need extra 2 days for security testing."
```

**Expected Result:**
- ✅ Comment added successfully
- ✅ Timestamp and your name shown
- ✅ PM receives notification
- ✅ Comment visible in task history

---

## 🚫 Step 11: Negative Tests (What You CANNOT Do)

**Test 1: Try to Create New Project**
- Check dashboard
- Check Projects page
- **Expected:** ❌ "New Project" button NOT visible
- **If visible and clicked:** Should get 403 Forbidden error

**Test 2: Try to Create New Task**
- Check Tasks page
- **Expected:** ❌ "Create Task" button NOT visible
- **If visible and clicked:** Should get 403 Forbidden error

**Test 3: Try to View Other Team Members' Tasks**
- Navigate to Tasks
- Try to filter "All Tasks"
- **Expected:** ❌ Should only see YOUR assigned tasks
- ❌ Cannot see tasks assigned to others

**Test 4: Try to Approve Expenses**
- Navigate to expenses (if accessible)
- **Expected:** ❌ No "Approve/Reject" buttons visible
- ❌ Read-only view of your own expenses

**Test 5: Try to Access User Management**
- Check navigation
- **Expected:** ❌ "Manage Users" NOT accessible
- **If accessible:** Should get 403 error

**Test 6: Try to Edit Other's Tasks**
- Try to access task not assigned to you (if URL known)
- **Expected:** ❌ 403 Forbidden or task not found

---

## 📊 Step 12: View Own Performance Metrics

**Test Steps:**
1. Check dashboard for personal metrics

**Expected Metrics:**
- ✅ Total tasks assigned to me
- ✅ Tasks completed this week/month
- ✅ Tasks in progress
- ✅ Tasks overdue (if any)
- ✅ Average completion time
- ✅ On-time completion rate

**Expected Result:**
- ✅ Only YOUR metrics visible
- ❌ Cannot see other team members' performance

---

## 🎯 Step 13: Deadline and Priority Management

**Test Steps:**
1. View tasks with different priorities
2. Check tasks by deadline

**Priority Test:**
- Tasks should be sortable by priority
- High/Critical priority highlighted
- Color coding visible

**Deadline Test:**
- Tasks near deadline highlighted
- Overdue tasks marked clearly
- Can filter "Due This Week"

**Expected Result:**
- ✅ Visual indicators for urgent tasks
- ✅ Can prioritize your work
- ✅ Due date reminders (if notifications enabled)

---

## 📝 Step 14: Task Status Workflow

**Test Complete Workflow:**

**Task Progression:**
1. To Do → In Progress (start working)
2. In Progress → Review (if review needed)
3. Review → Done (after PM approval)

OR

1. To Do → In Progress
2. In Progress → Done (direct completion)

**Test Each Transition:**
```
Task 1: To Do → In Progress
- Update: Started task, updated progress to 25%

Task 1: In Progress → Review
- Update: Development complete, ready for code review
- Progress: 90%

Task 1: Review → Done
- Update: Code review passed, merged to main branch
- Progress: 100%
```

**Expected Result:**
- ✅ All status transitions work
- ✅ Status cannot skip stages illogically
- ✅ Notifications sent at each stage

---

## 💼 Step 15: Work Hours Logging (If Feature Exists)

**Test Steps:**
1. Navigate to Time Tracking (if available)
2. Log work hours for a task

**Example Entry:**
```
Task: User Authentication Module
Date: 2024-02-20
Hours: 6.5
Description: Implemented JWT authentication, wrote unit tests, code review fixes
```

**Expected Result:**
- ✅ Time entry logged
- ✅ Total hours tracked per task
- ✅ Hours visible in task details
- ✅ PM can see time entries

---

## 🔔 Step 16: Notifications Check

**Test Steps:**
1. Check notification bell icon
2. View notification list

**Expected Notifications:**
- ✅ New task assigned to you
- ✅ Task deadline approaching
- ✅ Expense approved/rejected
- ✅ Task comment/update from PM
- ✅ Project update notifications

**Test Marking as Read:**
- Click notification
- Should mark as read
- Unread count decreases

---

## 📊 Step 17: Dashboard Widgets (Personal View)

**Expected Widgets:**

1. **My Tasks Summary**
   - To Do: X tasks
   - In Progress: Y tasks
   - In Review: Z tasks
   - Completed: W tasks

2. **Upcoming Deadlines**
   - Tasks due this week
   - Tasks due next week
   - Overdue tasks (if any)

3. **Recent Activity**
   - Tasks recently assigned
   - Tasks recently completed
   - Comments on your tasks

4. **My Expenses**
   - Pending expenses count
   - Approved expenses total
   - Rejected expenses (if any)

**Expected Result:**
- ✅ All widgets show YOUR data only
- ✅ Real-time updates
- ✅ Clickable for details

---

## 🎯 Final Checklist for Team Member

**Core Permissions Verified:**
- ✅ Can view assigned tasks only
- ✅ Can update task status and progress
- ✅ Can add comments to tasks
- ✅ Can submit expenses
- ✅ Can view projects (read-only)
- ✅ Can log time (if feature exists)
- ❌ Cannot create projects
- ❌ Cannot create tasks
- ❌ Cannot see other members' tasks
- ❌ Cannot approve expenses
- ❌ Cannot access user management

**Task Management Working:**
- ✅ Can see only assigned tasks
- ✅ Can update status (To Do → In Progress → Review → Done)
- ✅ Can update progress percentage
- ✅ Can add comments/notes
- ✅ Can mark tasks complete
- ✅ Notifications working for task updates

**Expense Workflow:**
- ✅ Can submit expenses
- ✅ Can view own expense history
- ✅ Can see approval status
- ✅ Receives notification on approval/rejection
- ❌ Cannot approve any expenses

**Data Visibility:**
- ✅ See only own tasks
- ✅ See only own expenses
- ✅ See only own performance metrics
- ✅ Can view project details (limited)
- ❌ Cannot see team-wide data (unless explicitly shared)

**UI/UX Checks:**
- ✅ Dashboard shows relevant personal metrics
- ✅ Task list clean and focused
- ✅ Priority and deadline indicators clear
- ✅ No unauthorized buttons/links visible
- ✅ No console errors
- ✅ No permission errors for allowed actions

---

## 🐛 Common Issues to Check

1. **Can See All Tasks**
   - Bug! Should only see assigned tasks
   - Check backend filtering by assigned_user_id

2. **Cannot Update Task Status**
   - Check if task is actually assigned to you
   - Verify permissions for task update endpoint

3. **Can Create Tasks/Projects**
   - Bug! These buttons should be hidden
   - Check role-based UI rendering

4. **Expense Approval Buttons Visible**
   - Bug! Team members cannot approve
   - Check role permissions in frontend

---

## ✅ Success Criteria

**Test passes if:**
1. ✅ Can only see and work on assigned tasks
2. ✅ Can update task status and progress smoothly
3. ✅ Can submit expenses successfully
4. ✅ Cannot access management features (create project/task, approve expenses, manage users)
5. ✅ Dashboard shows personalized, relevant data
6. ✅ Notifications working for task assignments and updates
7. ✅ No permission errors for allowed actions
8. ✅ Restricted features properly hidden
9. ✅ Task workflow (To Do → Done) works smoothly
10. ✅ Clean browser console, no errors

**This is the most common role - it should be intuitive and focused on getting work done!**
