# API Documentation

## Base URL
```
https://firestore.googleapis.com
```

## Authentication
All requests require Firebase Authentication token in header:
```
Authorization: Bearer {firebase_token}
```

## Collections

### Users Collection
**Path**: `/users/{userId}`

#### Get User Profile
```bash
GET /users/{userId}
```

#### Update User Profile
```bash
PATCH /users/{userId}
{
  "email": "user@akppa.com",
  "role": "admin",
  "updatedAt": "2024-01-10T12:00:00Z"
}
```

### Members Collection
**Path**: `/members/{memberId}`

#### Create Member
```bash
POST /members
{
  "name": "John Doe",
  "email": "john@akppa.com",
  "phone": "+1234567890",
  "designation": "President",
  "status": "active",
  "createdAt": "2024-01-10T12:00:00Z"
}
```

**Response:**
```json
{
  "id": "member_123",
  "name": "John Doe",
  "email": "john@akppa.com",
  "phone": "+1234567890",
  "designation": "President",
  "status": "active",
  "createdAt": "2024-01-10T12:00:00Z"
}
```

#### Get All Members
```bash
GET /members
```

**Query Parameters:**
- `limit`: Number of records (default: 100)
- `offset`: Skip records (default: 0)
- `search`: Search term (name/email)

#### Get Member by ID
```bash
GET /members/{memberId}
```

#### Update Member
```bash
PATCH /members/{memberId}
{
  "name": "John Doe Updated",
  "designation": "Vice President"
}
```

#### Delete Member
```bash
DELETE /members/{memberId}
```

### Attendance Collection
**Path**: `/attendance/{attendanceId}`

#### Mark Attendance
```bash
POST /attendance
{
  "memberId": "member_123",
  "userName": "John Doe",
  "date": "2024-01-08",
  "time": "18:30:45",
  "status": "present",
  "timestamp": "2024-01-08T18:30:45Z"
}
```

**Rules:**
- Only on Mondays
- Between 6:00 PM - 10:00 PM
- One mark per member per day

**Response:**
```json
{
  "id": "attendance_123",
  "memberId": "member_123",
  "userName": "John Doe",
  "date": "2024-01-08",
  "time": "18:30:45",
  "status": "present",
  "timestamp": "2024-01-08T18:30:45Z"
}
```

#### Get Attendance Records
```bash
GET /attendance
```

**Query Parameters:**
- `memberId`: Filter by member
- `date`: Filter by date (yyyy-MM-dd)
- `status`: Filter by status (present/absent)
- `startDate`: Start date range
- `endDate`: End date range

#### Get Weekly Attendance
```bash
GET /attendance?startDate=2024-01-08&endDate=2024-01-14
```

#### Update Attendance
```bash
PATCH /attendance/{attendanceId}
{
  "status": "absent"
}
```

#### Delete Attendance
```bash
DELETE /attendance/{attendanceId}
```

### Notices Collection
**Path**: `/notices/{noticeId}`

#### Create Notice
```bash
POST /notices
{
  "title": "Important Announcement",
  "content": "Please note the following...",
  "priority": "high",
  "createdBy": "user_123",
  "createdAt": "2024-01-10T12:00:00Z"
}
```

**Priority Values:**
- `low`
- `normal`
- `medium`
- `high`

**Response:**
```json
{
  "id": "notice_123",
  "title": "Important Announcement",
  "content": "Please note the following...",
  "priority": "high",
  "createdBy": "user_123",
  "createdAt": "2024-01-10T12:00:00Z",
  "updatedAt": "2024-01-10T12:00:00Z"
}
```

#### Get All Notices
```bash
GET /notices
```

**Query Parameters:**
- `priority`: Filter by priority
- `createdBy`: Filter by author
- `limit`: Number of records
- `orderBy`: Sort field (default: createdAt)

#### Get Notice by ID
```bash
GET /notices/{noticeId}
```

#### Update Notice
```bash
PATCH /notices/{noticeId}
{
  "title": "Updated Title",
  "content": "Updated content...",
  "priority": "medium"
}
```

#### Delete Notice
```bash
DELETE /notices/{noticeId}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": "Date must be in yyyy-MM-dd format"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "details": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "details": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "details": "Member not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}
```

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per minute per IP

## Pagination

### Request
```bash
GET /members?limit=20&offset=0
```

### Response
```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 145,
    "hasMore": true
  }
}
```

## Filtering & Searching

### Search Members
```bash
GET /members?search=john
```

### Filter by Status
```bash
GET /members?status=active
```

### Complex Filter
```bash
GET /attendance?date=2024-01-08&status=present&memberId=member_123
```

## Timestamps

All timestamps are in ISO 8601 format:
```
2024-01-10T12:30:45Z
```

## Examples

### cURL Examples

#### Login
```bash
curl -X POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@akppa.com",
    "password": "Demo@123",
    "returnSecureToken": true
  }'
```

#### Add Member
```bash
curl -X POST https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/default/documents/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "name": {"stringValue": "John Doe"},
      "email": {"stringValue": "john@akppa.com"},
      "phone": {"stringValue": "+1234567890"},
      "designation": {"stringValue": "President"},
      "status": {"stringValue": "active"}
    }
  }'
```

#### Mark Attendance
```bash
curl -X POST https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/default/documents/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "memberId": {"stringValue": "member_123"},
      "date": {"stringValue": "2024-01-08"},
      "status": {"stringValue": "present"},
      "timestamp": {"timestampValue": "2024-01-08T18:30:45Z"}
    }
  }'
```

## Webhooks

Not currently available. Use Firestore Realtime Listeners for real-time updates.

## SDK Usage

### JavaScript (Firebase SDK)

```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config/firebase';

// Get attendance by date
const attendanceRef = collection(db, 'attendance');
const q = query(attendanceRef, where('date', '==', '2024-01-08'));
const snapshot = await getDocs(q);
```

---

For more information, visit [Firebase Docs](https://firebase.google.com/docs)
