# My Library - REST API Documentation

## Base URL
```
http://localhost:5000
```

## Overview
This REST API provides full CRUD operations for managing a TV show library. All endpoints return JSON responses.

---

## Endpoints

### 1. Get All TV Shows
Retrieve all TV shows with optional filtering.

**Endpoint:** `GET /api/shows`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | No | Filter by title (case-insensitive, partial match) |
| status | string | No | Filter by status: `ended` or `in_progress` |

**Example Requests:**
```bash
# Get all shows
GET http://localhost:5000/api/shows

# Filter by title
GET http://localhost:5000/api/shows?title=breaking

# Filter by status
GET http://localhost:5000/api/shows?status=ended

# Combine filters
GET http://localhost:5000/api/shows?title=game&status=ended
```

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
[
  {
    "id": 1,
    "title": "Breaking Bad",
    "cover_image_url": "https://example.com/breaking-bad.jpg",
    "is_ended": 1,
    "created_at": "2025-11-13T14:30:00.000000"
  },
  {
    "id": 2,
    "title": "Game of Thrones",
    "cover_image_url": "https://example.com/got.jpg",
    "is_ended": 1,
    "created_at": "2025-11-13T14:35:00.000000"
  }
]
```

**Empty Response:**
```json
[]
```

---

### 2. Get Single TV Show
Retrieve a specific TV show by ID.

**Endpoint:** `GET /api/shows/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | The TV show ID |

**Example Request:**
```bash
GET http://localhost:5000/api/shows/1
```

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "id": 1,
  "title": "Breaking Bad",
  "cover_image_url": "https://example.com/breaking-bad.jpg",
  "is_ended": 1,
  "created_at": "2025-11-13T14:30:00.000000"
}
```

**Error Response:**
- **Code:** 404 NOT FOUND
- **Content:**
```json
{
  "error": "TV show not found"
}
```

---

### 3. Create TV Show
Add a new TV show to the library.

**Endpoint:** `POST /api/shows`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | The TV show title |
| cover_image_url | string | Yes | HTTPS URL to the cover image |
| is_ended | boolean | Yes | true if show has ended, false if in progress |

**Example Request:**
```bash
POST http://localhost:5000/api/shows
Content-Type: application/json

{
  "title": "Breaking Bad",
  "cover_image_url": "https://example.com/breaking-bad.jpg",
  "is_ended": true
}
```

**Success Response:**
- **Code:** 201 CREATED
- **Content:**
```json
{
  "id": 1,
  "message": "TV show created successfully"
}
```

**Error Responses:**

**Missing Fields:**
- **Code:** 400 BAD REQUEST
- **Content:**
```json
{
  "error": "All fields are required"
}
```

**Invalid URL:**
- **Code:** 400 BAD REQUEST
- **Content:**
```json
{
  "error": "Cover image URL must be a valid HTTPS URL"
}
```

**IMDB Verification Failed:**
- **Code:** 400 BAD REQUEST
- **Content:**
```json
{
  "error": "TV show 'Invalid Title' not found in IMDB. Please verify the title is correct."
}
```

**Duplicate Title:**
- **Code:** 400 BAD REQUEST
- **Content:**
```json
{
  "error": "A TV show with this title already exists"
}
```

---

### 4. Update TV Show
Update an existing TV show.

**Endpoint:** `PUT /api/shows/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | The TV show ID to update |

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | The TV show title |
| cover_image_url | string | Yes | HTTPS URL to the cover image |
| is_ended | boolean | Yes | true if show has ended, false if in progress |

**Example Request:**
```bash
PUT http://localhost:5000/api/shows/1
Content-Type: application/json

{
  "title": "Breaking Bad",
  "cover_image_url": "https://example.com/breaking-bad-updated.jpg",
  "is_ended": true
}
```

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "TV show updated successfully"
}
```

**Error Responses:**

**Show Not Found:**
- **Code:** 404 NOT FOUND
- **Content:**
```json
{
  "error": "TV show not found"
}
```

**Validation Errors:** Same as Create endpoint (400 BAD REQUEST)

---

### 5. Delete TV Show
Remove a TV show from the library.

**Endpoint:** `DELETE /api/shows/:id`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | The TV show ID to delete |

**Example Request:**
```bash
DELETE http://localhost:5000/api/shows/1
```

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "TV show deleted successfully"
}
```

**Error Response:**
- **Code:** 404 NOT FOUND
- **Content:**
```json
{
  "error": "TV show not found"
}
```

---

## Data Models

### TV Show Object
```json
{
  "id": integer,              // Unique identifier
  "title": string,            // TV show title
  "cover_image_url": string,  // HTTPS URL to cover image
  "is_ended": integer,        // 1 = ended, 0 = in progress
  "created_at": string        // ISO 8601 timestamp
}
```

---

## Validation Rules

### Title
- Required field
- Must be unique (case-insensitive)
- Must exist in IMDB database (verified via OMDb API)
- Must be a TV series (not a movie)

### Cover Image URL
- Required field
- Must start with `https://`
- Must follow standard URL format

### Is Ended
- Required field
- Boolean value (true/false or 1/0)
- false/0 = "In Progress"
- true/1 = "Ended"

---

## CORS Support

The API supports Cross-Origin Resource Sharing (CORS), allowing requests from any origin during development.

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS
**Allowed Headers:** Content-Type

---

## Error Handling

All errors return a JSON object with an `error` field:

```json
{
  "error": "Description of the error"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## Example Usage with JavaScript (Fetch API)

### Get All Shows
```javascript
fetch('http://localhost:5000/api/shows')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Create Show
```javascript
fetch('http://localhost:5000/api/shows', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Breaking Bad',
    cover_image_url: 'https://example.com/breaking-bad.jpg',
    is_ended: true
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Update Show
```javascript
fetch('http://localhost:5000/api/shows/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Breaking Bad',
    cover_image_url: 'https://example.com/breaking-bad-new.jpg',
    is_ended: true
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Delete Show
```javascript
fetch('http://localhost:5000/api/shows/1', {
  method: 'DELETE'
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

---

## Example Usage with cURL

### Get All Shows
```bash
curl http://localhost:5000/api/shows
```

### Create Show
```bash
curl -X POST http://localhost:5000/api/shows \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Breaking Bad",
    "cover_image_url": "https://example.com/breaking-bad.jpg",
    "is_ended": true
  }'
```

### Update Show
```bash
curl -X PUT http://localhost:5000/api/shows/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Breaking Bad",
    "cover_image_url": "https://example.com/updated.jpg",
    "is_ended": true
  }'
```

### Delete Show
```bash
curl -X DELETE http://localhost:5000/api/shows/1
```

---

## Testing with Postman

1. Import the endpoints into Postman
2. Set the base URL to `http://localhost:5000`
3. For POST/PUT requests:
   - Set Headers: `Content-Type: application/json`
   - Use raw JSON body format
4. Test each endpoint with valid and invalid data

---

## Notes

- The API uses SQLite for data storage
- Database file: `library.db`
- IMDB verification uses OMDb API (free tier)
- All timestamps are in ISO 8601 format
- Boolean values can be sent as `true`/`false` or `1`/`0`
