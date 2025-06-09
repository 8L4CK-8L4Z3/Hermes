# Middleware Documentation

This document lists all exported functions and variables from the middleware modules. See the [Routing Documentation](./Routes.md) for how these middlewares are used in the application.

## Authentication Middleware (`auth.js`)

### `protect(req, res, next)`

Authentication middleware that verifies JWT tokens. It looks for a token in two places, in order:

- HTTP-only cookie named `token`.
- `Authorization` header with the `Bearer <token>` scheme.

If a token is found, it is verified.

- If the token is valid, the user is fetched from the database using the ID from the token payload. The user object is then attached to `req.user`.
- If the token is missing, invalid, or the user is not found, it returns a `401 Unauthorized` error.

### `isModerator(req, res, next)`

Authorization middleware that checks if the authenticated user (`req.user`) has moderator privileges. It checks for a truthy `isMod` property on the user object.
Returns `403 Forbidden` if the user is not a moderator.

### `isAdmin(req, res, next)`

Authorization middleware that checks if the authenticated user (`req.user`) has admin privileges. It checks for a truthy `isAdmin` property on the user object.
Returns `403 Forbidden` if the user is not an admin.

## Core Server Middleware (`server.js`)

This section outlines the core middleware configured in `server.js` for security, request processing, and logging.

### `helmet()`

Enhances API security by setting various HTTP headers. It helps protect the application from common web vulnerabilities like Cross-Site Scripting (XSS), clickjacking, and other attacks.

### `hpp()`

Stands for HTTP Parameter Pollution. This middleware protects against attacks where an attacker submits multiple values for the same parameter. `hpp` will only consider the last submitted value.

### `cors(options)`

Enables Cross-Origin Resource Sharing (CORS) to allow or restrict requested resources on a web server depending on where the HTTP request was initiated. It's configured to allow requests from the `FRONTEND_URL` and to handle credentials (like cookies).

### Rate Limiters (`rateLimiter.js`)

Three rate limiter instances are configured to protect the API from brute-force or denial-of-service attacks. They are applied to different parts of the API.

- `apiLimiter`: A general rate limiter for most API routes.
- `authLimiter`: A stricter rate limiter specifically for authentication routes (`/api/auth`) to prevent credential stuffing and brute-force login attempts.
- `uploadLimiter`: A rate limiter for file upload endpoints to prevent abuse.

The limits and time windows for these are configured via environment variables.

### `express.json({ limit: "10kb" })`

A built-in Express middleware that parses incoming requests with JSON payloads. It limits the size of the request body to `10kb` to prevent large payloads from overwhelming the server.

### `express.urlencoded({ extended: true, limit: "10kb" })`

Parses incoming requests with URL-encoded payloads (e.g., from form submissions). It also has a `10kb` payload limit.

### `cookieParser()`

Parses the `Cookie` header on incoming requests and populates `req.cookies` with an object keyed by the cookie names. This makes it easy to work with cookies.

### `compression()`

Compresses response bodies for all requests that traverse through the middleware, which can significantly reduce the size of the response body and improve performance.

### `morgan('dev')`

An HTTP request logger middleware. In the development environment, it logs concise output for each request to the console, which is useful for debugging.

## Input Sanitization Middleware (`inputSanitizer.js`)

### `sanitizeInput(req, res, next)`

A middleware that sanitizes incoming request data to prevent XSS attacks. It sanitizes the following properties on the `req` object:

- `req.body`
- `req.query`
- `req.params`

It uses the `sanitizeData` utility function internally.

### `sanitizeData(data, seen = new WeakSet())`

A utility function that recursively sanitizes data.

- Sanitizes strings using the `xss` library.
- Primitives (number, boolean, etc.) are returned as-is.
- `Date` objects are preserved.
- It handles nested objects and arrays.
- It tracks visited objects to prevent infinite loops from circular references.

## Ownership Middleware (`ownership.js`)

### `checkTripOwnership(req, res, next)`

Verifies if the authenticated user owns the trip specified by `req.params.tripId`.

- Returns `404 Not Found` if the trip does not exist.
- Returns `403 Forbidden` with message "You are not authorized to access this trip" if `req.user.id` does not match the trip's `user_id`.

### `checkDestinationOwnership(req, res, next)`

Verifies if the authenticated user owns the trip and the destination. The trip is identified by `req.params.tripId` and the destination by `req.params.destinationId`.

- First, it performs the same ownership check as `checkTripOwnership`.
- Then, it checks if the destination exists.
- Finally, it checks if the destination belongs to the specified trip.
- Returns `404 Not Found` if trip or destination doesn't exist.
- Returns `403 Forbidden` with message "You are not authorized to access this destination" if the user is not the owner or the destination is not part of the trip.

## Cache Middleware (`cache.js`)

### `cache(duration = 3600, keyGenerator)`

A Redis-based caching middleware factory.

- It only caches `GET` requests.
- The `duration` is in seconds, with a default of 3600 (1 hour).
- A custom `keyGenerator` function can be provided, which receives the `req` object to generate a cache key. If not provided, the key defaults to `req.originalUrl` or `req.url`.
- It only caches successful responses (status code 200-299).
- Logs cache hits, misses, and errors.

### `clearCache(pattern)`

An async utility function to clear cache entries from Redis based on a key pattern.

- It uses `SCAN` to iterate through keys matching the `pattern` to avoid blocking the Redis server.
- Deletes all matched keys in a single `DEL` command.

### `CACHE_DURATIONS`

An object containing predefined cache durations in seconds:

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

This file contains a set of validation middleware chains using `express-validator`.

### User Validation

#### `userRegistrationValidator`

- `username`: 3-30 chars, alphanumeric & underscore.
- `email`: Must be a valid email format. It's also trimmed and normalized.
- `password`: Min 6 chars, must contain at least one letter and one number.

#### `userLoginValidator`

- `email`: Must be a valid email.
- `password`: Must not be empty.

#### `userUpdateValidator`

- `username` (optional): 3-30 chars, alphanumeric & underscore.
- `photo` (optional): Must be a valid URL.
- `bio` (optional): Max 500 chars.

### Content Validation

#### `postValidator`

- `content`: 1-1000 chars.
- `media` (optional): Must be a valid URL.
- `type` (optional): Must be one of `["trip_share", "review_share", "general", "announcement"]`.
- `visibility` (optional): Must be one of `["public", "followers", "private"]`.
- `tags` (optional): Must be an array of strings.
- `location` (optional): GeoJSON Point object.
  - `type`: Must be "Point".
  - `coordinates`: Array of 2 numbers (longitude, latitude).

#### `commentValidator`

- `content`: 1-1000 chars.
- `parent_comment_id` (optional): Must be a valid MongoDB ID.

#### `reviewValidator`

- `place_id`: Required, must be a valid MongoDB ID.
- `rating`: Integer from 1 to 5.
- `comment`: Required, trimmed.
- `photos` (optional): Array of objects, each with:
  - `url`: Must be a valid URL.
  - `caption`: Must be a string.
- `visit_date` (optional): Must be an ISO8601 date string.
- `categories` (optional): Object with ratings.
  - `cleanliness`, `service`, `value`, `atmosphere`: float from 0 to 5.

### Trip Related Validation

#### `tripValidator`

- `title`: 3-100 chars.
- `start_date`: Required, ISO8601 date.
- `end_date`: Required, ISO8601 date, must be after `start_date`.
- `destinations`: Required, non-empty array of strings.
- `status` (optional): One of `["planning", "ongoing", "completed", "cancelled"]`.
- `isPublic` (optional): Boolean.
- `budget` (optional): Object with:
  - `amount`: Non-negative float.
  - `currency`: String.
- `activities` (optional): Array of objects, each with:
  - `place_id`: Valid MongoDB ID.
  - `date`: ISO8601 date.
  - `notes`: String.

#### `placeValidator`

- `destination_id`: Required, valid MongoDB ID.
- `type`: Required, non-empty string.
- `name`: 2-100 chars.
- `description`: Required, non-empty string.
- `photo` (optional): Valid URL.
- `price_range` (optional): One of `["$", "$$", "$$$", "$$$$"]`.
- `opening_hours`: Required, non-empty string.
- `address`: Required, non-empty string.

#### `destinationValidator`

- `name`: 2-100 chars.
- `description`: Required, non-empty string.
- `location`: Required, non-empty string.
- `photo` (optional): Valid URL.

### Other Validators

#### `idParamValidator`

- `id` (in URL params): Must be a valid MongoDB ObjectId.

#### `analyticsValidator`

- `date`: Required, ISO8601 date.
- `metrics`: Required object, with optional integer fields: `newUsers`, `activeUsers`, `newTrips`, `newReviews`, `newPosts`, `totalLikes`, `totalComments`.
- `popularDestinations` (optional): Array of objects with `destination_id` (MongoID), `views` (integer), `saves` (integer).
- `popularPlaces` (optional): Array of objects with `place_id` (MongoID), `views` (integer), `reviews` (integer).

#### `moderationLogValidator`

- `action`: Required, one of: 'report', 'remove', 'warn', 'ignore', 'ban_user', 'unban_user'.
- `target_type`: Required, one of: 'user', 'post', 'comment', 'review'.
- `target_id`: Required, valid MongoDB ObjectId.
- `reason`: Required, non-empty string.
- `status`: Optional, one of: 'pending', 'resolved'.
- `resolution` (optional): object containing:
  - `action` (optional): one of 'remove', 'warn', 'ignore'.
  - `note` (optional): string.
  - `moderator_id` (optional): MongoDB ObjectId.
  - `date` (optional): ISO8601 date.

#### `followValidator`

- `user_id`: Required, valid MongoDB ObjectId. Cannot be the same as the authenticated user.

#### `notificationValidator`

- `type`: Required, one of: 'follow', 'like', 'comment', 'mention', 'trip_invite', 'system'.
- `data`: Must be an object.
- `user_id`: Required, valid MongoDB ObjectId.

#### `likeValidator`

- `target_type`: Required, one of: 'Post', 'Comment', 'Review'.
- `target_id`: Required, valid MongoDB ObjectId.

#### `validateReport`

- `target_type`: Required, one of: 'review', 'post', 'comment', 'user'.
- `target_id`: Required, valid MongoDB ObjectId.
- `reason`: Required, 10-500 characters.

#### `validateModAction`

- `action`: Required, one of: 'remove', 'warn', 'ignore'.
- `resolution_note`: Required, 10-500 characters.

#### `userStatsValidator`

Validates optional non-negative integer fields for user statistics:

- `tripsCount`
- `reviewsCount`
- `followersCount`
- `followingCount`

#### `userPreferencesValidator`

Validates optional fields for user preferences:

- `language` (optional): One of 'en', 'fr', 'es', 'de', 'it', 'pt'.
- `notifications.email` (optional): Boolean.
- `notifications.push` (optional): Boolean.

## Response Formatting Utilities (`responses.js`)

The response formatting utilities provide a consistent structure for all API responses. These utilities ensure that all responses follow the same format, making it easier for clients to handle the responses.

### Response Format

All responses follow this general structure:

```javascript
{
  "success": boolean,
  "message": string,          // Optional
  "data": any,               // Optional
  "error": Object,           // Optional
  "meta": {
    "timestamp": string,
    // ... additional metadata
  }
}
```

### `successResponse(res, options)`

Sends a successful response with a consistent format.

Parameters:

- `res`: Express response object
- `options`: Object containing:
  - `code`: HTTP status code (default: 200)
  - `message`: Success message
  - `data`: Response data (optional)
  - `meta`: Additional metadata (optional)

### `errorResponse(res, options)`

Sends an error response with a consistent format.

Parameters:

- `res`: Express response object
- `options`: Object containing:
  - `code`: HTTP status code
  - `message`: Error message
  - `error`: Additional error details (optional)
  - `meta`: Additional metadata (optional)

### `paginatedResponse(data, options)`

Formats paginated response data with metadata about the pagination.

Parameters:

- `data`: Array of items
- `options`: Object containing:
  - `page`: Current page number
  - `limit`: Items per page
  - `total`: Total number of items

Returns an object with:

```javascript
{
  "success": true,
  "data": Array,
  "meta": {
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "pages": number
    }
  }
}
```

### Common Response Patterns

#### Success Patterns

Pre-configured success response patterns for common operations:

- `successPatterns.created(res, { data, message, meta })`: 201 Created response
- `successPatterns.updated(res, { data, message, meta })`: 200 OK response for updates
- `successPatterns.deleted(res, { message, meta })`: 200 OK response for deletions
- `successPatterns.retrieved(res, { data, message, meta })`: 200 OK response for retrievals

#### Error Patterns

Pre-configured error response patterns:

- `errorPatterns.notFound(res, { message, error, meta })`: 404 Not Found
- `errorPatterns.unauthorized(res, { message, error, meta })`: 401 Unauthorized
- `errorPatterns.forbidden(res, { message, error, meta })`: 403 Forbidden
- `errorPatterns.validationError(res, { message, error, meta })`: 422 Unprocessable Entity
- `errorPatterns.conflict(res, { message, error, meta })`: 409 Conflict
- `errorPatterns.internalError(res, { message, error, meta })`: 500 Internal Server Error

### HTTP Status Codes

Common HTTP status codes are available as constants:

```javascript
{
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
}
```

### Async Handler

A utility wrapper for async controller functions that automatically handles errors:

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    errorPatterns.internalError(res, {
      error: process.env.NODE_ENV === "development" ? error : undefined
    });
  });
};
```

This wrapper eliminates the need for try-catch blocks in controller functions and ensures consistent error handling.
