# Middleware Exports Documentation

This document lists all exported functions and variables from the middleware modules.

## Authentication Middleware (`auth.js`)

### `protect(req, res, next)`

Authentication middleware that verifies JWT tokens from:

- Cookies (`token`)
- Authorization header (`Bearer token`)

### `isModerator(req, res, next)`

Verifies if the authenticated user has moderator privileges.

## Validation Middleware (`validators.js`)

### User Validation

#### `userRegistrationValidator`

Validates user registration data:

- Username:
  - Length: 3-30 characters
  - Pattern: Letters, numbers, and underscores only
  - Required
- Email:
  - Valid email format
  - Normalized
  - Required
- Password:
  - Minimum 8 characters
  - Must contain at least one letter and one number
  - Allowed special characters: @$!%*#?&
  - Required

#### `userLoginValidator`

Validates login credentials:

- Email: Valid email format
- Password: Must not be empty

#### `userPreferencesValidator`

Validates user preferences:

- Language:
  - Optional
  - Must be one of: 'en', 'fr', 'es', 'de', 'it', 'pt'
- Notifications:
  - email: Boolean (optional)
  - push: Boolean (optional)

#### `userStatsValidator`

Validates user statistics updates:

- tripsCount: Non-negative integer (optional)
- reviewsCount: Non-negative integer (optional)
- followersCount: Non-negative integer (optional)
- followingCount: Non-negative integer (optional)

### Content Validation

#### `postValidator`

Validates post content:

- Content:
  - Length: 1-1000 characters
  - Required
- Media:
  - Valid URL
  - Optional

#### `commentValidator`

Validates comment content:

- Content: Trimmed text

#### `reviewValidator`

Validates review submissions:

- Rating:
  - Integer between 0-5
  - Required
- Content: Trimmed text

### Trip Related Validation

#### `tripValidator`

Validates trip details:

- Title:
  - Length: 3-100 characters
  - Required
- Description: Optional
- StartDate:
  - Valid ISO8601 date
  - Required
- EndDate:
  - Valid ISO8601 date
  - Must be after startDate
  - Required

#### `placeValidator`

Validates place data:

- Name:
  - Length: 2-100 characters
  - Required
- Description: Optional
- Location:
  - Required
  - Non-empty
- Coordinates:
  - Optional
  - Must be array [latitude, longitude]

#### `destinationValidator`

Validates destination data:

- Name:
  - Length: 2-100 characters
  - Required
- Description: Optional
- Location:
  - Required
  - Non-empty

### Other Validators

#### `idParamValidator`

Validates route parameters:

- id: Must be valid MongoDB ObjectId

#### `analyticsValidator`

Validates analytics data:

- date: Valid ISO8601 date
- metrics: Must be an object
- popularDestinations: Must be an array
- popularPlaces: Must be an array

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

## Ownership Middleware (`ownership.js`)

### `checkTripOwnership(req, res, next)`

Verifies if the authenticated user owns the requested trip.

### `checkDestinationOwnership(req, res, next)`

Verifies destination ownership within a trip.

### `isAdmin(req, res, next)`

Verifies if the user has admin privileges.

## Cache Middleware (`cache.js`)

### `cache(duration, keyGenerator)`

Factory function that creates Redis-based caching middleware.

- Parameters:
  - `duration`: Cache duration in seconds (default: 3600)
  - `keyGenerator`: Optional function to generate cache keys

### `clearCache(pattern)`

Utility function to clear cache entries matching a pattern.

### `CACHE_DURATIONS`

Exported constant with predefined cache durations:

```javascript
{
  MINUTE_5: 300,
  MINUTE_15: 900,
  HOUR_1: 3600,
  HOUR_6: 21600,
  DAY_1: 86400
}
```

## Input Sanitization Middleware (`inputSanitizer.js`)

### `sanitizeInput(req, res, next)`

Global middleware for XSS prevention.

### `sanitizeData(data)`

Utility function for recursive data sanitization.
