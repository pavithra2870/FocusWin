# Postman API Testing Guide for FocusWin Todo Application

## Table of Contents
1. [Setup](#setup)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Tasks Endpoints](#tasks-endpoints)
4. [Groups Endpoints](#groups-endpoints)
5. [Notifications Endpoints](#notifications-endpoints)
6. [Common Issues & Troubleshooting](#common-issues--troubleshooting)

---

## Setup

### Prerequisites
- Postman installed on your computer
- Backend server running on `http://localhost:5000`
- MongoDB running and connected
- Valid test user credentials

### Important Notes
⚠️ **Session-based Authentication**: This API uses Express sessions, so cookies are required for authenticated requests.

### Step 1: Create a Postman Environment
1. Open Postman
2. Click "Environments" in the left sidebar
3. Click "+" to create a new environment
4. Name it "FocusWin Todo API"
5. Add these variables:
   - `base_url`: `http://localhost:5000`
   - `session_id`: (will be populated automatically after login)

### Step 2: Enable Cookie Management
1. Go to Settings (gear icon) → **General**
2. Enable "Cookies" to automatically handle session cookies

---

## Authentication Endpoints

### 1. User Signup
**Endpoint:** `POST {{base_url}}/api/auth/signup`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "testpass123"
}
```

**Expected Response (201):**
```json
{
  "id": "65f8a9b3c4e5d6f7a8b9c0d1",
  "name": "Test User",
  "email": "test@example.com"
}
```

**Test Cases:**
- ✅ Valid signup
- ❌ Duplicate email (409 Conflict)
- ❌ Missing fields (400 Bad Request)

---

### 2. User Login
**Endpoint:** `POST {{base_url}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "abc@gmail.com",
  "password": "abcdefg"
}
```

**Expected Response (200):**
```json
{
  "id": "65f8a9b3c4e5d6f7a8b9c0d1",
  "name": "abc",
  "email": "abc@gmail.com"
}
```

⚠️ **Important:** After login, Postman will automatically save the session cookie. You must include this cookie in subsequent requests!

**Test Cases:**
- ✅ Valid login
- ❌ Invalid email (401 Unauthorized)
- ❌ Invalid password (401 Unauthorized)
- ❌ Missing fields (400 Bad Request)

---

### 3. Check Authentication Status
**Endpoint:** `GET {{base_url}}/api/auth/me`

**Headers:** (No additional headers needed - session cookie is automatically sent)

**Expected Response (200):**
```json
{
  "_id": "65f8a9b3c4e5d6f7a8b9c0d1",
  "name": "abc",
  "email": "abc@gmail.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "error": "Not authenticated"
}
```

**Test Cases:**
- ✅ When logged in
- ❌ When not logged in (401)

---

### 4. User Logout
**Endpoint:** `POST {{base_url}}/api/auth/logout`

**Headers:** (No additional headers needed)

**Expected Response (200):**
```json
{
  "message": "You have been logged out successfully"
}
```

**Test Cases:**
- ✅ Successfully logout
- ❌ When already logged out

---

## Tasks Endpoints

⚠️ **All tasks endpoints require authentication!**

### 1. Get All Tasks
**Endpoint:** `GET {{base_url}}/api/tasks`

**Headers:** (Session cookie automatically included)

**Expected Response (200):**
```json
[
  {
    "_id": "65f8a9b3c4e5d6f7a8b9c0d2",
    "title": "Test Task",
    "completed": false,
    "importance": 5,
    "dueDate": "2024-12-31T00:00:00.000Z",
    "userId": "65f8a9b3c4e5d6f7a8b9c0d1",
    "group": "Work",
    "recurrence": {
      "type": "none",
      "days": [],
      "date": null
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Test Cases:**
- ✅ Get all user's tasks
- ❌ Without authentication (401)
- ✅ Empty array if no tasks

---

### 2. Create a Task
**Endpoint:** `POST {{base_url}}/api/tasks`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "Complete the project",
  "importance": 8,
  "dueDate": "2024-12-31",
  "group": "Work",
  "recurrence": {
    "type": "none"
  }
}
```

**Minimal Task (required fields only):**
```json
{
  "title": "Buy groceries"
}
```

**Complex Task with Recurrence:**
```json
{
  "title": "Daily Standup",
  "importance": 6,
  "dueDate": "2024-12-31",
  "group": "Work",
  "recurrence": {
    "type": "weekly",
    "days": [1, 2, 3, 4, 5]
  }
}
```

**Expected Response (201):**
```json
{
  "_id": "65f8a9b3c4e5d6f7a8b9c0d3",
  "title": "Complete the project",
  "completed": false,
  "importance": 8,
  "dueDate": "2024-12-31T00:00:00.000Z",
  "userId": "65f8a9b3c4e5d6f7a8b9c0d1",
  "group": "Work",
  "recurrence": {
    "type": "none",
    "days": [],
    "date": null
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Test Cases:**
- ✅ Create task with all fields
- ✅ Create minimal task
- ✅ Create task with recurrence
- ❌ Without authentication (401)
- ❌ Missing required fields

---

### 3. Update a Task
**Endpoint:** `PUT {{base_url}}/api/tasks/:id`

**Replace `:id` with actual task ID**

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "Updated Task Title",
  "completed": true,
  "importance": 9
}
```

**Update Only Completion Status:**
```json
{
  "completed": true
}
```

**Expected Response (200):**
```json
{
  "_id": "65f8a9b3c4e5d6f7a8b9c0d3",
  "title": "Updated Task Title",
  "completed": true,
  "importance": 9,
  "dueDate": "2024-12-31T00:00:00.000Z",
  "userId": "65f8a9b3c4e5d6f7a8b9c0d1",
  "group": "Work",
  "recurrence": {
    "type": "none"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Test Cases:**
- ✅ Update task
- ✅ Update completion status
- ❌ Update other user's task (404)
- ❌ Invalid task ID (404)
- ❌ Without authentication (401)

---

### 4. Delete a Task
**Endpoint:** `DELETE {{base_url}}/api/tasks/:id`

**Replace `:id` with actual task ID**

**Headers:** (No body needed)

**Expected Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Test Cases:**
- ✅ Delete task
- ❌ Delete other user's task (404)
- ❌ Invalid task ID (404)
- ❌ Without authentication (401)

---

## Groups Endpoints

⚠️ **All groups endpoints require authentication!**

### 1. Get All Groups
**Endpoint:** `GET {{base_url}}/api/groups`

**Headers:** (Session cookie automatically included)

**Expected Response (200):**
```json
[
  {
    "_id": "65f8a9b3c4e5d6f7a8b9c0d4",
    "name": "Work",
    "userId": "65f8a9b3c4e5d6f7a8b9c0d1",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Test Cases:**
- ✅ Get all user's groups
- ✅ Empty array if no groups
- ❌ Without authentication (401)

---

### 2. Create a Group
**Endpoint:** `POST {{base_url}}/api/groups`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Personal"
}
```

**Expected Response (201):**
```json
{
  "_id": "65f8a9b3c4e5d6f7a8b9c0d5",
  "name": "Personal",
  "userId": "65f8a9b3c4e5d6f7a8b9c0d1",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Test Cases:**
- ✅ Create group
- ❌ Duplicate group name (409)
- ❌ Missing name (400)
- ❌ Without authentication (401)

---

### 3. Delete a Group
**Endpoint:** `DELETE {{base_url}}/api/groups/:id`

**Replace `:id` with actual group ID**

**Headers:** (No body needed)

**Expected Response (200):**
```json
{
  "message": "Group deleted successfully and tasks have been unassigned."
}
```

**Test Cases:**
- ✅ Delete group
- ❌ Delete other user's group (404)
- ❌ Invalid group ID (404)
- ❌ Without authentication (401)

---

## Notifications Endpoints

### 1. Send Email Notification
**Endpoint:** `POST {{base_url}}/api/notifications/email`

⚠️ **Requires authentication!**

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "taskId": "65f8a9b3c4e5d6f7a8b9c0d3",
  "taskTitle": "Complete the project",
  "dueDate": "2024-12-31T00:00:00.000Z"
}
```

**Expected Response (200):**
```json
{
  "message": "Email notification sent successfully"
}
```

**Test Cases:**
- ✅ Send notification
- ❌ Invalid task ID
- ❌ Without authentication (401)

---

## Step-by-Step Testing Workflow

### Complete User Flow

#### 1. Setup
```
Base URL: http://localhost:5000
Test Credentials:
  Email: abc@gmail.com
  Password: abcdefg
```

#### 2. Authentication Flow
1. **Signup** (optional) → POST `/api/auth/signup`
2. **Login** → POST `/api/auth/login` ⚠️ Save the session cookie!
3. **Check Auth Status** → GET `/api/auth/me`
4. **Get Tasks** → GET `/api/tasks` (should be empty initially)
5. **Create Task** → POST `/api/tasks`
6. **Update Task** → PUT `/api/tasks/:id`
7. **Get All Tasks** → GET `/api/tasks`
8. **Delete Task** → DELETE `/api/tasks/:id`
9. **Logout** → POST `/api/auth/logout`

#### 3. Groups Flow
1. **Create Group** → POST `/api/groups`
2. **Get All Groups** → GET `/api/groups`
3. **Create Task with Group** → POST `/api/tasks` (include `group` field)
4. **Delete Group** → DELETE `/api/groups/:id`

---

## Common Issues & Troubleshooting

### Issue 1: "401 Unauthorized" Error
**Problem:** Not authenticated or session expired

**Solution:**
1. Make sure you're logged in first
2. Check that cookies are enabled in Postman settings
3. Try logging in again

### Issue 2: "404 Not Found" Error
**Problem:** Wrong endpoint URL or task/group doesn't exist

**Solution:**
1. Verify the endpoint URL is correct
2. Check the `:id` parameter is valid
3. Make sure you're using your own tasks/groups

### Issue 3: "409 Conflict" Error
**Problem:** Trying to create duplicate resource (email, group name)

**Solution:**
1. Use a different email/group name
2. Or update existing resource instead

### Issue 4: Session Not Persisting
**Problem:** Cookies not being sent with requests

**Solution:**
1. Go to Postman Settings → General
2. Enable "Cookies"
3. After login, check "Cookies" icon in bottom left to see session cookie

### Issue 5: "503 Service Unavailable"
**Problem:** Backend server not running

**Solution:**
1. Check MongoDB is running
2. Check backend server is running on port 5000
3. Verify environment variables are set correctly

---

## Quick Reference Cheat Sheet

### Authentication
```
POST /api/auth/signup      - Register new user
POST /api/auth/login        - Login user
GET  /api/auth/me          - Check auth status
POST /api/auth/logout      - Logout user
```

### Tasks (All require auth)
```
GET    /api/tasks           - Get all user's tasks
POST   /api/tasks          - Create new task
PUT    /api/tasks/:id      - Update task
DELETE /api/tasks/:id      - Delete task
```

### Groups (All require auth)
```
GET    /api/groups         - Get all user's groups
POST   /api/groups        - Create new group
DELETE /api/groups/:id    - Delete group
```

### Notifications (Requires auth)
```
POST /api/notifications/email - Send email notification
```

---

## Test Scenarios

### Scenario 1: Complete CRUD Operations
1. Login → POST `/api/auth/login`
2. Create Task → POST `/api/tasks`
3. Get Task → GET `/api/tasks`
4. Update Task → PUT `/api/tasks/:id`
5. Delete Task → DELETE `/api/tasks/:id`
6. Logout → POST `/api/auth/logout`

### Scenario 2: Group Management
1. Login
2. Create Group → POST `/api/groups`
3. Get Groups → GET `/api/groups`
4. Create Task with Group → POST `/api/tasks` (include `group`)
5. Delete Group → DELETE `/api/groups/:id` (tasks auto-unassigned)

### Scenario 3: Recurrence
1. Login
2. Create Task with Weekly Recurrence:
```json
{
  "title": "Team Meeting",
  "recurrence": {
    "type": "weekly",
    "days": [1, 3, 5]
  }
}
```

### Scenario 4: Error Handling
1. Try accessing protected route without login → 401
2. Create task with invalid data → 400
3. Update non-existent task → 404
4. Create duplicate group → 409

---

## Tips for Better Testing

1. **Use Collections**: Organize requests in Postman collections
2. **Use Variables**: Store task/group IDs in variables for reuse
3. **Add Tests**: Write Postman tests to verify responses
4. **Use Environments**: Switch between dev/staging/prod easily
5. **Save Requests**: Save frequently used requests for quick access

---

## Example Postman Collection Structure

```
FocusWin Todo API
├── Authentication
│   ├── Signup
│   ├── Login
│   ├── Check Auth Status
│   └── Logout
├── Tasks
│   ├── Get All Tasks
│   ├── Create Task (Minimal)
│   ├── Create Task (Full)
│   ├── Create Task (Recurring)
│   ├── Update Task
│   └── Delete Task
├── Groups
│   ├── Get All Groups
│   ├── Create Group
│   └── Delete Group
└── Notifications
    └── Send Email Notification
```

---

## Automated Testing Script

You can also add automated tests in Postman:

```javascript
// Example test in Postman
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('_id');
    pm.expect(jsonData).to.have.property('title');
});

// Save task ID for later use
pm.environment.set("taskId", pm.response.json()._id);
```

---

**Created with ❤️ for FocusWin Todo Application**

