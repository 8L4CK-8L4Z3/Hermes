# Middleware Documentation

This document lists all exported functions and variables from the middleware modules.

## Authentication Middleware (`auth.js`)

### `protect(req, res, next)`

Authentication middleware that verifies JWT tokens from:

- Cookies (`token`)
- Authorization header (`Bearer token`)

If token is valid, adds the user object to `req.user` for use in subsequent middleware/routes.

### `isModerator(req, res, next)`

Verifies if the authenticated user has moderator privileges by checking the `isMod` boolean flag.
Returns 403 Forbidden if user is not a moderator.

### `isAdmin(req, res, next)`

Verifies if the authenticated user has admin privileges by checking the `isAdmin` boolean flag.
Returns 403 Forbidden if user is not an admin.

## Input Sanitization Middleware (`inputSanitizer.js`)

### `sanitizeInput(req, res, next)`

Global middleware for XSS prevention. Sanitizes:

- `req.body`
- `req.query`
- `req.params`

### `sanitizeData(data, seen = new WeakSet())`

Utility function for recursive data sanitization:

- Handles nested objects and arrays
- Prevents circular references
- Preserves Date objects
- Sanitizes strings using XSS library
- Returns primitives unchanged

## Ownership Middleware (`ownership.js`)

### `checkTripOwnership(req, res, next)`

Verifies if the authenticated user owns the requested trip:

- Checks if trip exists
- Verifies user ID matches trip owner ID
- Returns 403 Forbidden if unauthorized

### `checkDestinationOwnership(req, res, next)`

Verifies destination ownership within a trip:

- Checks if trip exists
- Verifies user ID matches trip owner ID
- Checks if destination exists and belongs to the trip
- Returns 403 Forbidden if unauthorized

## Cache Middleware (`cache.js`)

### `cache(duration = DEFAULT_EXPIRATION, keyGenerator)`

Redis-based caching middleware factory:

- Only caches GET requests
- Supports custom cache key generation
- Default expiration: 1 hour (3600 seconds)
- Only caches successful responses (200-299)
- Includes logging for cache operations

### `clearCache(pattern)`

Utility function to clear cache entries matching a pattern:

- Uses Redis SCAN for efficient pattern matching
- Supports batch deletion of matched keys
- Includes logging for cache clearing operations

### `CACHE_DURATIONS`

Predefined cache duration constants:

```javascript
{
  MINUTE_5: 300,
  MINUTE_15: 900,
  HOUR_1: 3600,
  HOUR_6: 21600,
  DAY_1: 86400
}
```

## Validation Middleware (`validators.js`)

### User Validation

#### `userRegistrationValidator`

- Username: 3-30 chars, alphanumeric + underscore
- Email: Valid format, normalized
- Password: Min 6 chars, must contain letter and number

#### `userLoginValidator`

- Email: Valid format
- Password: Not empty

#### `userUpdateValidator`

- Username (optional): 3-30 chars, alphanumeric + underscore
- Photo (optional): Valid URL
- Bio (optional): Max 500 chars

### Content Validation

#### `postValidator`

- Content: 1-1000 chars
- Media (optional): Valid URL
- Type (optional): ["trip_share", "review_share", "general", "announcement"]
- Visibility (optional): ["public", "followers", "private"]
- Tags: Array of strings
- Location: Point coordinates

#### `commentValidator`

- Content: 1-1000 chars
- Parent comment ID (optional): Valid MongoDB ID

#### `reviewValidator`

- Place ID: Required, valid MongoDB ID
- Rating: Integer 1-5
- Comment: Required, trimmed
- Photos: Array of {url, caption}
- Visit date (optional): ISO8601
- Categories (optional):
  - cleanliness: 0-5
  - service: 0-5
  - value: 0-5
  - atmosphere: 0-5

### Trip Related Validation

#### `tripValidator`

- Title: 3-100 chars
- Start date: Required, ISO8601
- End date: Required, ISO8601, after start date
- Destinations: Non-empty array
- Status (optional): ["planning", "ongoing", "completed", "cancelled"]
- Budget (optional): {amount: float, currency: string}
- Activities (optional): Array of {place_id, date, notes}

#### `placeValidator`

- Destination ID: Required, valid MongoDB ID
- Type: Required
- Name: 2-100 chars
- Description: Required
- Photo (optional): Valid URL
- Price range (optional): ["$", "$$", "$$$", "$$$$"]
- Opening hours: Required
- Address: Required

#### `destinationValidator`

- Name: 2-100 chars
- Description: Required
- Location: Required
- Photo (optional): Valid URL

### Other Validators

#### `idParamValidator`

- ID: Valid MongoDB ObjectId

#### `analyticsValidator`

- Date: Valid ISO8601
- Metrics: Object containing:
  - newUsers (optional): Non-negative integer
  - activeUsers (optional): Non-negative integer
  - newTrips (optional): Non-negative integer
  - newReviews (optional): Non-negative integer
  - newPosts (optional): Non-negative integer

#### `moderationLogValidator`

Validates moderation actions:

- action:
  - Required
  - Must be one of: 'warn', 'ban', 'delete', 'approve', 'reject'
- target_type:
  - Required
  - Must be one of: 'user', 'post', 'comment', 'review'
- target_id:
  - Required
  - Valid MongoDB ObjectId
- reason: Required
- status:
  - Required
  - Must be one of: 'pending', 'resolved', 'rejected'

#### `followValidator`

Validates follow operations:

- user_id:
  - Required
  - Valid MongoDB ObjectId
  - Cannot be same as current user

#### `notificationValidator`

Validates notifications:

- type:
  - Required
  - Must be one of: 'follow', 'like', 'comment', 'mention', 'trip_invite', 'system'
- data: Must be an object
- user_id:
  - Required
  - Valid MongoDB ObjectId

#### `likeValidator`

Validates like operations:

- target_type:
  - Required
  - Must be one of: 'post', 'comment', 'review'
- target_id:
  - Required
  - Valid MongoDB ObjectId

#### `validateReport`

Validates content reports:

- target_type:
  - Required
  - Must be one of: 'review', 'post', 'comment'
- target_id:
  - Required
  - Valid MongoDB ObjectId
- reason:
  - Required
  - Length: 10-500 characters

#### `validateModAction`

Validates moderation actions on reports:

- action:
  - Required
  - Must be one of: 'remove', 'warn', 'ignore'
- resolution_note:
  - Required
  - Length: 10-500 characters
