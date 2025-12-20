# Project Manager Test Plan - Complete Testing Guide

## 🎯 Role Overview
Project Manager can:
- ✅ Create and manage projects
- ✅ Create and assign tasks
- ✅ View all projects and tasks
- ✅ Submit expenses
- ✅ View income
- ❌ Cannot approve expenses (Finance/Admin only)
- ❌ Cannot manage users (Admin only)

---

## 🔐 Step 1: Login as Project Manager

**Credentials:**
- Email: pm@example.com
- Password: (jo aapne set kiya hai)

**Expected Result:**
- Successfully login
- Redirect to dashboard

---

## 📊 Step 2: Dashboard Check

**Test kya:**
- Total Projects count show ho raha hai?
- My Projects (projects where you are manager) highlighted?
- Active Tasks count correct hai?
- Budget Utilization display ho raha hai?
- Quick Actions section check karein

**Expected Quick Actions for Project Manager:**
1. ✅ New Project (PM can create projects)
2. ✅ View Projects
3. ✅ View Tasks
4. ✅ Submit Expense
5. ✅ View Income
6. ❌ Manage Users (NOT visible - Admin only)

**Expected Dashboard Cards:**
- Total Projects: Shows count
- Active Tasks: Shows count
- Budget Utilization: Shows percentage
- Profit/Loss: Shows financial summary

---

## 🏗️ Step 3: Create New Project

**Test Steps:**
1. Dashboard → "New Project" button click karein
2. Form fill karein with dummy data

**Dummy Data:**
```
Project Name: E-Commerce Platform MVP
Description: Build minimum viable product for online retail platform with payment integration
Client: StartupXYZ Inc.
Budget: 75000
Start Date: 2024-02-01
End Date: 2024-07-31
Status: Planning
```

**Expected Result:**
- ✅ Success message: "Project created successfully!"
- ✅ Redirect to projects list
- ✅ New project visible in list
- ✅ You are listed as the project manager

---

## 📋 Step 4: Create Task for Your Project

**Test Steps:**
1. Dashboard → "View Tasks" → "Create Task" button
2. Form fill karein

**Dummy Data:**
```
Task Title: Setup Development Environment
Description: Configure local dev environment with Docker, databases, and CI/CD pipeline
Project: E-Commerce Platform MVP (select your project)
Assign To: (Select any Team Member from dropdown)
Priority: High
Status: To Do
Deadline: 2024-02-10
```

**Expected Result:**
- ✅ Task created successfully
- ✅ Notification sent to assigned user
- ✅ Task visible in tasks list
- ✅ No "[object Object]" error
- ✅ Status badge shows "To Do"

---

## 📝 Step 5: Create Multiple Tasks

**Task 2 - Dummy Data:**
```
Title: Database Schema Design
Description: Design PostgreSQL schema for products, orders, customers, and payments
Project: E-Commerce Platform MVP
Assign To: (Select another Team Member)
Priority: Critical
Status: To Do
Deadline: 2024-02-15
```

**Task 3 - Dummy Data:**
```
Title: User Authentication Module
Description: Implement JWT-based authentication with email verification
Project: E-Commerce Platform MVP
Assign To: (Select a Team Member)
Priority: High
Status: In Progress
Deadline: 2024-02-20
```

**Expected Result:**
- ✅ All tasks created successfully
- ✅ Tasks grouped by project in tasks list
- ✅ Priority badges show correct colors (Critical=red, High=orange)

---

## 💰 Step 6: Submit Expense

**Test Steps:**
1. Dashboard → "Submit Expense" button
2. Form fill karein

**Dummy Data:**
```
Project: E-Commerce Platform MVP
Category: Cloud Services
Amount: 500.00
Expense Date: 2024-02-05
Description: AWS cloud hosting - February 2024 (EC2, RDS, S3)
Receipt Path: /receipts/aws-feb-2024.pdf
```

**Expected Result:**
- ✅ "Expense submitted successfully! Awaiting approval." alert
- ✅ Redirect to expenses list
- ✅ Expense visible with "Pending" status (yellow badge)
- ✅ You are listed as submitter

**Important Note:**
- ❌ You CANNOT approve your own expense
- ⏳ Expense needs Finance/Admin approval

---

## 💵 Step 7: View Income (Read-Only)

**Test Steps:**
1. Dashboard → "View Income"
2. Check if income entries are visible

**Expected Result:**
- ✅ Can view all income entries
- ✅ Can filter by project
- ✅ Income list displays properly
- ❌ May or may not have "Add Income" button (depends on role permissions)

---

## 🔍 Step 8: View and Edit Tasks

**Test Steps:**
1. Dashboard → "View Tasks"
2. Click on any task you created
3. Try to edit task details

**Edit Test Data:**
```
Task: Setup Development Environment
Change Status: To Do → In Progress
Update Progress: 0% → 30%
Update Description: Add "Completed Docker setup, working on database configuration"
```

**Expected Result:**
- ✅ Can view all task details
- ✅ Can edit tasks for your projects
- ✅ Status and progress updated successfully
- ✅ Updated task shows in task list

---

## 📊 Step 9: View Project Details

**Test Steps:**
1. Dashboard → "View Projects"
2. Click on "E-Commerce Platform MVP" project
3. Check project detail page tabs

**Expected to See:**
- ✅ Project information (name, client, budget, dates)
- ✅ **Tasks Tab**: List of all tasks for this project
- ✅ **Expenses Tab**: All expenses submitted for this project
- ✅ **Income Tab**: Income entries for this project
- ✅ **Profit & Loss Tab**: Financial summary
  - Total Income
  - Approved Expenses
  - Pending Expenses
  - Net Profit
  - Profit Margin %

**Expected Result:**
- ✅ All tabs load properly
- ✅ Financial calculations are correct
- ✅ Can navigate between tabs

---

## 🎯 Step 10: Additional Project Creation

**Create Second Project:**

**Dummy Data:**
```
Project Name: CRM System Upgrade
Description: Upgrade legacy CRM to modern cloud-based solution with mobile app
Client: Enterprise Solutions Ltd
Budget: 120000
Start Date: 2024-03-01
End Date: 2024-12-31
Status: Planning
```

**Expected Result:**
- ✅ Second project created
- ✅ Dashboard shows updated project count
- ✅ Both projects visible in projects list

---

## 🧪 Step 11: Task Assignment Test

**Create tasks for second project:**

**Task 1:**
```
Title: Requirements Gathering
Description: Meet with stakeholders to document CRM requirements and pain points
Project: CRM System Upgrade
Assign To: (Select Team Member)
Priority: Urgent
Status: To Do
Deadline: 2024-03-05
```

**Task 2:**
```
Title: Technology Stack Selection
Description: Research and select tech stack (Frontend, Backend, Database, Cloud)
Project: CRM System Upgrade
Assign To: (Select different Team Member)
Priority: High
Status: To Do
Deadline: 2024-03-10
```

**Expected Result:**
- ✅ Tasks created for new project
- ✅ Team members receive notifications
- ✅ Tasks filterable by project

---

## 💸 Step 12: Submit Multiple Expenses

**Expense 2:**
```
Project: E-Commerce Platform MVP
Category: Professional Services
Amount: 3500.00
Expense Date: 2024-02-10
Description: UI/UX designer consultant - Week 1 & 2
```

**Expense 3:**
```
Project: CRM System Upgrade
Category: Software
Amount: 899.00
Expense Date: 2024-03-01
Description: Salesforce integration license - Annual subscription
```

**Expected Result:**
- ✅ All expenses submitted successfully
- ✅ All show "Pending" status
- ✅ Expenses grouped by project
- ✅ Total pending expenses reflected on dashboard

---

## 🚫 Step 13: Negative Tests (What You CANNOT Do)

**Test 1: Try to Approve Expense**
- Navigate to Expenses list
- Look for "Approve" or "Reject" buttons
- **Expected:** ❌ Buttons should NOT be visible (Finance/Admin only)

**Test 2: Try to Access Users Management**
- Check dashboard Quick Actions
- Check navigation menu
- **Expected:** ❌ "Manage Users" option NOT visible (Admin only)

**Test 3: Try to Approve Your Own Expense**
- Submit an expense
- Try to approve it
- **Expected:** ❌ Cannot approve own expenses (system should prevent)

---

## 📈 Step 14: Dashboard Analytics Verification

**Return to Dashboard and verify:**
- ✅ Total Projects count = 2 (or however many you created)
- ✅ Active Tasks count = All tasks you created
- ✅ Budget Utilization shows percentage based on projects
- ✅ Pending Expenses total shown
- ✅ Charts and graphs display data

**Check Charts:**
- Task Status Distribution (To Do, In Progress, Done, Review)
- Project Status Distribution
- Expense Approval Status (Pending, Approved, Rejected)

---

## 🎯 Final Checklist for Project Manager

**Permissions Verified:**
- ✅ Can create projects
- ✅ Can create and assign tasks
- ✅ Can edit tasks for their projects
- ✅ Can submit expenses
- ✅ Can view income
- ✅ Can view project details and financials
- ❌ Cannot approve expenses
- ❌ Cannot manage users
- ❌ Cannot approve own expenses

**Features Working:**
- ✅ Dashboard loads with correct stats
- ✅ Project creation working
- ✅ Task creation and assignment working
- ✅ Expense submission working
- ✅ Project details page shows all tabs
- ✅ Financial calculations correct
- ✅ No console errors
- ✅ No 422 validation errors
- ✅ No 401/403 permission errors for allowed actions

**Data Integrity:**
- ✅ Tasks linked to correct projects
- ✅ Expenses linked to correct projects
- ✅ Assigned users receive notifications
- ✅ Status badges display correctly
- ✅ Dates format correctly

---

## 🐛 Common Issues to Check

1. **Task Creation Error**: If you get "[object Object]" error
   - Check browser console for validation errors
   - Verify all required fields filled
   - Ensure deadline is valid date

2. **Project Not Showing**: If created project not visible
   - Refresh the page
   - Check if you're on correct filter (Active/All)

3. **Expense Pending Forever**: If expense stays pending
   - This is correct! Finance/Admin must approve
   - Test with Finance role to approve

4. **Cannot Edit Task**: If edit button not working
   - Verify you are the project manager
   - Check browser console for errors

---

## ✅ Success Criteria

**Test passes if:**
1. All allowed features work without errors
2. Restricted features (approve expenses, manage users) are hidden
3. Dashboard shows accurate data
4. Projects, tasks, and expenses linked correctly
5. Financial calculations accurate
6. No permission errors (401/403) for allowed actions
7. Clean browser console (no JavaScript errors)

**Report any issues found during testing!**
