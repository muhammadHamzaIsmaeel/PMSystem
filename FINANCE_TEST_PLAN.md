# Finance Test Plan - Complete Testing Guide

## 🎯 Role Overview
Finance role can:
- ✅ View all projects and tasks
- ✅ Submit expenses
- ✅ **Approve/Reject expenses** (KEY FEATURE)
- ✅ Add and manage income
- ✅ View financial reports and profit/loss
- ❌ Cannot create projects (PM/Admin only)
- ❌ Cannot create tasks (PM/Admin only)
- ❌ Cannot manage users (Admin only)

---

## 🔐 Step 1: Login as Finance

**Credentials:**
- Email: finance@example.com
- Password: (jo aapne set kiya hai)

**Expected Result:**
- ✅ Successfully login
- ✅ Redirect to dashboard

---

## 📊 Step 2: Dashboard Check

**Test kya:**
- Financial metrics prominently displayed?
- Total Income/Expenses visible?
- Pending Approvals badge/count shown?
- Quick Actions section check karein

**Expected Quick Actions for Finance:**
1. ✅ View Projects (read-only)
2. ✅ View Tasks (read-only)
3. ✅ Manage Expenses (can approve/reject)
4. ✅ Manage Income (can add/edit)
5. ✅ Submit Expense (can submit own)
6. ❌ New Project (NOT visible - PM/Admin only)
7. ❌ Manage Users (NOT visible - Admin only)

**Expected Dashboard Cards:**
- Total Income: Shows sum of all income
- Total Expenses: Shows approved expenses
- Pending Expenses: Shows count needing approval
- Profit/Loss: Shows net profit calculation
- Expense Approval Rate: Shows approval statistics

---

## 💰 Step 3: View Pending Expenses (Critical Test)

**Test Steps:**
1. Dashboard → "Manage Expenses" button
2. Filter by Status: "Pending"

**Expected Result:**
- ✅ List of all pending expenses visible
- ✅ Each expense shows:
  - Amount
  - Category
  - Date
  - Submitted by (user name)
  - Project name
  - Description
- ✅ **"Approve" and "Reject" buttons visible** (KEY!)
- ✅ Buttons styled properly (green for approve, red for reject)

**Important:**
- Finance role should see approve/reject buttons
- If these buttons are missing, it's a bug!

---

## ✅ Step 4: Approve Expense

**Test Steps:**
1. Select any pending expense (submitted by someone else)
2. Click "Approve" button
3. Confirm approval

**Example Expense to Approve:**
- Submitted by: PM or Team Member
- Category: Software/Cloud Services
- Amount: Any amount
- Status: Pending → Approved

**Expected Result:**
- ✅ Success message: "Expense approved successfully!"
- ✅ Expense status changes to "Approved" (green badge)
- ✅ "Approved by" field shows your name
- ✅ Notification sent to submitter
- ✅ Expense moves to "Approved" filter
- ✅ Dashboard pending count decreases by 1

---

## ❌ Step 5: Reject Expense

**Test Steps:**
1. Select another pending expense
2. Click "Reject" button
3. Optionally add rejection reason

**Example Expense to Reject:**
- Submitted by: Team Member
- Category: Any
- Amount: Any
- Status: Pending → Rejected

**Expected Result:**
- ✅ Success message: "Expense rejected!"
- ✅ Expense status changes to "Rejected" (red badge)
- ✅ "Approved by" field shows your name (reviewer)
- ✅ Notification sent to submitter
- ✅ Expense moves to "Rejected" filter
- ✅ Dashboard pending count decreases by 1

---

## 🚫 Step 6: Cannot Approve Own Expense

**Test Steps:**
1. Submit a new expense (as Finance user)
2. Try to approve your own expense

**Dummy Expense Data:**
```
Project: (Select any project)
Category: Professional Services
Amount: 1200.00
Expense Date: 2024-02-15
Description: Financial audit consultation - Q1 2024
```

**Expected Result:**
- ✅ Expense submitted successfully
- ✅ Shows in expenses list with "Pending" status
- ❌ **Approve/Reject buttons should be DISABLED or HIDDEN for your own expense**
- ❌ Error if you try: "Cannot approve your own expense"

---

## 💵 Step 7: Add Income Entry

**Test Steps:**
1. Dashboard → "Manage Income" → "Add Income"
2. Form fill karein

**Dummy Data:**
```
Project: (Select any active project)
Income Source: Client Payment - Milestone 1
Amount: 25000.00
Income Date: 2024-02-01
Description: First milestone payment received - 30% of total project budget
```

**Expected Result:**
- ✅ "Income added successfully!" alert
- ✅ Redirect to income list
- ✅ Income entry visible in list
- ✅ Dashboard total income updated
- ✅ Profit/Loss calculation updated

---

## 💵 Step 8: Add Multiple Income Entries

**Income 2:**
```
Project: (Select another project)
Income Source: Advance Payment
Amount: 10000.00
Income Date: 2024-02-05
Description: 20% advance payment for new project kickoff
```

**Income 3:**
```
Project: (Same as Income 1)
Income Source: Client Payment - Milestone 2
Amount: 30000.00
Income Date: 2024-03-01
Description: Second milestone payment - Development phase completed
```

**Expected Result:**
- ✅ All income entries created
- ✅ Total income on dashboard updated
- ✅ Income filterable by project
- ✅ Income sortable by date

---

## 📊 Step 9: View Financial Reports

**Test Steps:**
1. Navigate to any project detail page
2. Click on "Profit & Loss" tab

**Expected to See:**
```
Profit & Loss Statement
├── Total Income: $65,000.00 (sum of all income)
├── Expenses
│   ├── Approved Expenses: -$5,000.00
│   ├── Labor Costs: -$0.00 (simplified)
│   └── Total Expenses: -$5,000.00
├── Net Profit: $60,000.00
└── Profit Margin: 92.31%
```

**Verify:**
- ✅ Income calculation correct
- ✅ Only APPROVED expenses counted
- ✅ Pending expenses shown separately (not in net profit)
- ✅ Net Profit = Total Income - Approved Expenses
- ✅ Profit Margin = (Net Profit / Total Income) × 100

---

## 📋 Step 10: Expense Filtering and Search

**Test Steps:**
1. Go to "Manage Expenses"
2. Test all filters

**Filter Tests:**
- **By Status:**
  - All
  - Pending (should show only pending)
  - Approved (should show only approved)
  - Rejected (should show only rejected)

- **By Project:**
  - Filter by specific project
  - Should show only that project's expenses

- **By Date Range:**
  - Filter by date range
  - Should show expenses in that period

**Expected Result:**
- ✅ All filters work correctly
- ✅ Results update in real-time
- ✅ Count badges show correct numbers

---

## 💸 Step 11: Bulk Approval Test (If Feature Exists)

**Test Steps:**
1. Go to pending expenses
2. Select multiple expenses (if checkbox available)
3. Bulk approve

**Expected Result:**
- ✅ All selected expenses approved
- ✅ Status updated for all
- ✅ Notifications sent to all submitters

**Note:** If bulk feature not implemented, skip this test.

---

## 📊 Step 12: Income Management

**Test Steps:**
1. Go to "Manage Income"
2. View income list
3. Try to edit an income entry

**Edit Test:**
- Select any income entry
- Update amount or description
- Save changes

**Expected Result:**
- ✅ Can view all income
- ✅ Can edit income entries
- ✅ Can delete income (if necessary)
- ✅ Changes reflected in financial reports
- ✅ Profit/loss recalculated

---

## 🚫 Step 13: Negative Tests (What You CANNOT Do)

**Test 1: Try to Create Project**
- Check dashboard Quick Actions
- Check Projects page
- **Expected:** ❌ "New Project" button NOT visible

**Test 2: Try to Create Task**
- Check Tasks page
- **Expected:** ❌ "Create Task" button NOT visible or shows permission error

**Test 3: Try to Access Users Management**
- Check navigation
- Check Quick Actions
- **Expected:** ❌ "Manage Users" NOT accessible

**Test 4: Try to Edit Other User's Profile**
- Navigate to user profile (if accessible)
- **Expected:** ❌ Cannot edit other users

---

## 📈 Step 14: Dashboard Analytics Deep Dive

**Test Steps:**
1. Return to Dashboard
2. Verify all financial metrics

**Check:**
- ✅ Total Income = Sum of all income entries
- ✅ Total Approved Expenses = Sum of approved expenses only
- ✅ Pending Expenses Count = Number of pending approvals
- ✅ Net Profit = Income - Approved Expenses
- ✅ Expense Approval Rate = (Approved / Total) × 100

**Charts to Verify:**
- Expense Status Distribution (Pie/Donut chart)
  - Pending: X%
  - Approved: Y%
  - Rejected: Z%

- Monthly Income vs Expenses (Line/Bar chart)
  - Shows trends over time

---

## 🎯 Step 15: Approval Workflow Test

**Complete Workflow:**
1. Team Member submits expense
2. Finance receives notification (check notification bell)
3. Finance reviews expense details
4. Finance approves/rejects
5. Team Member receives notification
6. Dashboard metrics update

**Expected Result:**
- ✅ Entire workflow works smoothly
- ✅ Notifications sent at each step
- ✅ Real-time updates on dashboard
- ✅ Audit trail maintained (who approved/rejected)

---

## 💰 Step 16: Large Amount Approval Test

**Test Steps:**
1. Create expense with large amount
2. Test approval process

**Dummy Data:**
```
Category: Equipment
Amount: 15000.00
Description: High-performance server equipment for production
```

**Expected Result:**
- ✅ Can approve large amounts
- ✅ No amount limit errors (unless configured)
- ✅ Same approval process as small amounts

---

## 📊 Step 17: Report Generation (If Feature Exists)

**Test Steps:**
1. Navigate to Reports section
2. Generate financial report

**Reports to Test:**
- Monthly expense report
- Project-wise income report
- Approval statistics
- Pending approvals summary

**Expected Result:**
- ✅ Reports generated successfully
- ✅ Data accurate
- ✅ Can export to PDF/CSV (if feature exists)

---

## 🎯 Final Checklist for Finance Role

**Core Permissions Verified:**
- ✅ Can view all projects (read-only)
- ✅ Can view all tasks (read-only)
- ✅ Can submit own expenses
- ✅ **Can approve expenses submitted by others**
- ✅ **Can reject expenses**
- ✅ **Cannot approve own expenses**
- ✅ Can add income entries
- ✅ Can edit/delete income
- ✅ Can view financial reports
- ❌ Cannot create projects
- ❌ Cannot create tasks
- ❌ Cannot manage users

**Critical Features Working:**
- ✅ Approve button visible on pending expenses
- ✅ Reject button visible on pending expenses
- ✅ Approval/Rejection updates status immediately
- ✅ Notifications sent to submitters
- ✅ Dashboard pending count accurate
- ✅ Financial calculations correct
- ✅ Profit/Loss shows real-time data

**Financial Data Integrity:**
- ✅ Income entries accurate
- ✅ Only approved expenses in profit calculation
- ✅ Pending expenses tracked separately
- ✅ Rejected expenses not counted
- ✅ Audit trail maintained

**UI/UX Checks:**
- ✅ Approve/Reject buttons clearly visible
- ✅ Status badges color-coded (Pending=yellow, Approved=green, Rejected=red)
- ✅ Financial amounts formatted correctly ($XX,XXX.XX)
- ✅ Dates display in readable format
- ✅ No console errors
- ✅ No 401/403 errors for allowed actions

---

## 🐛 Common Issues to Check

1. **Approve/Reject Buttons Not Visible**
   - This is critical bug for Finance role!
   - Check role permissions in backend
   - Verify `useHasRole(['Finance', 'Admin'])` in frontend

2. **Can Approve Own Expense**
   - Should NOT be allowed
   - Backend should validate submitter ≠ approver

3. **Profit/Loss Shows Wrong Amount**
   - Check if pending expenses being counted
   - Only approved expenses should be in calculation

4. **Cannot Add Income**
   - Check permissions
   - Verify income endpoint accessible

---

## ✅ Success Criteria

**Test passes if:**
1. ✅ Can approve/reject expenses (most important!)
2. ✅ Cannot approve own expenses
3. ✅ Can add and manage income
4. ✅ Financial reports show accurate data
5. ✅ Dashboard metrics correct
6. ✅ Notifications working
7. ✅ No permission errors for allowed actions
8. ✅ Restricted features properly hidden
9. ✅ Clean browser console
10. ✅ All calculations accurate

**This role is critical for financial workflow - report any issues immediately!**
