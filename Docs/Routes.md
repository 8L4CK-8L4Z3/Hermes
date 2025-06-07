# Hermes API Routes Documentation

## Authentication Routes (`/auth`)

### Public Routes

#### POST `/auth/register`

- **Controller**: `register`
- **Input**:
  - Body: `{ email, password, username }`
- **Description**: Register a new user account

#### POST `/auth/login`

- **Controller**: `login`
- **Input**:
  - Body: `{ email, password }`
- **Description**: Authenticate user and get access token

#### POST `/auth/forgot-password`

- **Controller**: `forgotPassword`
- **Input**:
  - Body: `{ email }`
- **Description**: Initiate password reset process

#### GET `/auth/verify-email/:token`

- **Controller**: `verifyEmail`
- **Params**: `token`
- **Description**: Verify user's email address

#### POST `/auth/reset-password/:resetToken`

- **Controller**: `resetPassword`
- **Params**: `resetToken`
- **Input**:
  - Body: `{ newPassword }`
- **Description**: Reset user's password

### Protected Routes

All protected routes use the `protect` middleware for authentication

#### POST `/auth/logout`

- **Controller**: `logout`
- **Middleware**: `protect`
- **Description**: Logout user and invalidate token

#### POST `/auth/refresh-token`

- **Controller**: `refreshTokenHandler`
- **Middleware**: `protect`
- **Description**: Get new access token using refresh token

#### PUT `/auth/update-password`

- **Controller**: `updatePassword`
- **Middleware**: `protect`
- **Input**:
  - Body: `{ currentPassword, newPassword }`
- **Description**: Update user's password

## User Routes (`/users`)

### Public Routes

#### GET `/users/profile/:id`

- **Controller**: `getProfile`
- **Params**: `id`
- **Description**: Get user's public profile

#### GET `/users/:id/followers`

- **Controller**: `getFollowers`
- **Params**: `id`
- **Description**: Get user's followers list

#### GET `/users/:id/following`

- **Controller**: `getFollowing`
- **Params**: `id`
- **Description**: Get list of users being followed

#### GET `/users/:id/stats`

- **Controller**: `getUserStats`
- **Params**: `id`
- **Description**: Get user's statistics

#### GET `/users/:id/activity`

- **Controller**: `getUserActivity`
- **Params**: `id`
- **Description**: Get user's recent activity

### Protected Routes

All protected routes use the `protect` middleware

#### PUT `/users/profile`

- **Controller**: `updateProfile`
- **Middleware**: `protect`
- **Input**:
  - Body: User profile data
- **Description**: Update user's profile information

#### DELETE `/users/profile`

- **Controller**: `deleteAccount`
- **Middleware**: `protect`
- **Description**: Delete user account

#### PUT `/users/preferences`

- **Controller**: `updatePreferences`
- **Middleware**: `protect`
- **Input**:
  - Body: User preferences data
- **Description**: Update user preferences

#### PUT `/users/photo`

- **Controller**: `updateUserPhoto`
- **Middleware**: `protect`
- **Input**:
  - Body: Photo data
- **Description**: Update user's profile photo

### Admin Routes

#### PUT `/users/:id/verify`

- **Controller**: `verifyUser`
- **Middleware**: `protect`, `isAdmin`
- **Params**: `id`
- **Description**: Verify a user account (admin only)

## Trip Routes (`/trips`)

### Public Routes with Caching

All public routes use the `cache` middleware with 15-minute duration

#### GET `/trips/public`

- **Controller**: `getPublicTrips`
- **Middleware**: `cache`
- **Description**: Get list of public trips

#### GET `/trips/:id`

- **Controller**: `getTrip`
- **Middleware**: `cache`
- **Params**: `id`
- **Description**: Get trip details

#### GET `/trips/user/:userId`

- **Controller**: `getUserTrips`
- **Middleware**: `cache`
- **Params**: `userId`
- **Description**: Get user's trips

#### GET `/trips/:id/activities`

- **Controller**: `getTripActivities`
- **Middleware**: `cache`
- **Params**: `id`
- **Description**: Get trip activities

#### GET `/trips/:id/timeline`

- **Controller**: `getTripTimeline`
- **Middleware**: `cache`
- **Params**: `id`
- **Description**: Get trip timeline

### Protected Routes

All protected routes use `protect` middleware and most use `checkTripOwnership`

#### POST `/trips`

- **Controller**: `createTrip`
- **Middleware**: `protect`, `tripValidator`
- **Input**:
  - Body: Trip details
- **Description**: Create a new trip

#### PUT `/trips/:id`

- **Controller**: `updateTrip`
- **Middleware**: `protect`, `tripValidator`, `checkTripOwnership`
- **Params**: `id`
- **Input**:
  - Body: Updated trip details
- **Description**: Update trip information

#### DELETE `/trips/:id`

- **Controller**: `deleteTrip`
- **Middleware**: `protect`, `checkTripOwnership`
- **Params**: `id`
- **Description**: Delete a trip

#### POST `/trips/:id/destinations`

- **Controller**: `addDestination`
- **Middleware**: `protect`, `checkTripOwnership`
- **Params**: `id`
- **Input**:
  - Body: Destination details
- **Description**: Add destination to trip

#### DELETE `/trips/:id/destinations/:destinationId`

- **Controller**: `removeDestination`
- **Middleware**: `protect`, `checkTripOwnership`
- **Params**: `id`, `destinationId`
- **Description**: Remove destination from trip

#### POST `/trips/:id/activities`

- **Controller**: `addActivity`
- **Middleware**: `protect`, `checkTripOwnership`
- **Params**: `id`
- **Input**:
  - Body: Activity details
- **Description**: Add activity to trip

#### PATCH `/trips/:id/activities/:activityId`

- **Controller**: `updateActivity`
- **Middleware**: `protect`, `checkTripOwnership`
- **Params**: `id`, `activityId`
- **Input**:
  - Body: Updated activity details
- **Description**: Update trip activity

#### PATCH `/trips/:id/status`

- **Controller**: `updateTripStatus`
- **Middleware**: `protect`, `checkTripOwnership`
- **Params**: `id`
- **Input**:
  - Body: `{ status }`
- **Description**: Update trip status

#### PATCH `/trips/:id/visibility`

- **Controller**: `updateTripVisibility`
- **Middleware**: `protect`, `checkTripOwnership`
- **Params**: `id`
- **Input**:
  - Body: `{ visibility }`
- **Description**: Update trip visibility

#### POST `/trips/:id/share`

- **Controller**: `shareTrip`
- **Middleware**: `protect`, `checkTripOwnership`
- **Params**: `id`
- **Input**:
  - Body: Sharing details
- **Description**: Share trip with other users

## Notification Routes (`/notifications`)

### Protected Routes

All notification routes require authentication (`protect` middleware)

#### GET `/notifications`

- **Controller**: `getNotifications`
- **Middleware**: `protect`
- **Description**: Get user's notifications

#### GET `/notifications/unread/count`

- **Controller**: `getUnreadCount`
- **Middleware**: `protect`
- **Description**: Get count of unread notifications

#### GET `/notifications/type/:type`

- **Controller**: `getNotificationsByType`
- **Middleware**: `protect`
- **Params**: `type`
- **Description**: Get notifications filtered by type

#### PATCH `/notifications/:id/read`

- **Controller**: `markAsRead`
- **Middleware**: `protect`
- **Params**: `id`
- **Description**: Mark a notification as read

#### PATCH `/notifications/read-all`

- **Controller**: `markAllAsRead`
- **Middleware**: `protect`
- **Description**: Mark all notifications as read

#### PATCH `/notifications/:id/status`

- **Controller**: `updateNotificationReadStatus`
- **Middleware**: `protect`
- **Params**: `id`
- **Input**:
  - Body: `{ status }`
- **Description**: Update notification read status

#### DELETE `/notifications/:id`

- **Controller**: `deleteNotification`
- **Middleware**: `protect`
- **Params**: `id`
- **Description**: Delete a notification

### Admin Routes

#### POST `/notifications`

- **Controller**: `createNotification`
- **Middleware**: `protect`, `isAdmin`
- **Input**:
  - Body: Notification details
- **Description**: Create a new notification (admin only)

#### DELETE `/notifications/cleanup`

- **Controller**: `deleteOldNotifications`
- **Middleware**: `protect`, `isAdmin`
- **Description**: Clean up old notifications (admin only)

## Review Routes (`/reviews`)

### Public Routes

#### GET `/reviews/helpful`

- **Controller**: `getHelpfulReviews`
- **Description**: Get most helpful reviews

#### GET `/reviews/by-date`

- **Controller**: `getReviewsByVisitDate`
- **Description**: Get reviews sorted by visit date

#### GET `/reviews/:id`

- **Controller**: `getReview`
- **Params**: `id`
- **Description**: Get a specific review

### Protected Routes

All protected routes use the `protect` middleware

#### POST `/reviews`

- **Controller**: `createReview`
- **Middleware**: `protect`, `reviewValidator`
- **Input**:
  - Body: Review details
- **Description**: Create a new review

#### PUT `/reviews/:id`

- **Controller**: `updateReview`
- **Middleware**: `protect`, `reviewValidator`
- **Params**: `id`
- **Input**:
  - Body: Updated review details
- **Description**: Update an existing review

#### DELETE `/reviews/:id`

- **Controller**: `deleteReview`
- **Middleware**: `protect`
- **Params**: `id`
- **Description**: Delete a review

#### POST `/reviews/:id/like`

- **Controller**: `likeReview`
- **Middleware**: `protect`
- **Params**: `id`
- **Description**: Like a review

#### POST `/reviews/:id/unlike`

- **Controller**: `unlikeReview`
- **Middleware**: `protect`
- **Params**: `id`
- **Description**: Unlike a review

### Mounted Routes

These routes are mounted under different paths

#### GET `/api/places/:placeId/reviews`

- **Controller**: `getPlaceReviews`
- **Params**: `placeId`
- **Description**: Get all reviews for a specific place

#### GET `/api/users/:userId/reviews`

- **Controller**: `getUserReviews`
- **Params**: `userId`
- **Description**: Get all reviews by a specific user

## Place Routes (`/places`)

### Public Routes

All public routes use the `cache` middleware with 15-minute duration

#### GET `/places/popular`

- **Controller**: `getPopularPlaces`
- **Middleware**: `cache`
- **Description**: Get list of popular places

#### GET `/places/type/:type`

- **Controller**: `getPlacesByType`
- **Middleware**: `cache`
- **Params**: `type`
- **Description**: Get places filtered by type

#### GET `/places/destination/:destinationId`

- **Controller**: `getPlacesByDestination`
- **Middleware**: `cache`
- **Params**: `destinationId`
- **Description**: Get places in a specific destination

#### GET `/places/price/:range`

- **Controller**: `getPlacesByPriceRange`
- **Middleware**: `cache`
- **Params**: `range`
- **Description**: Get places within a price range

#### GET `/places/hours`

- **Controller**: `getPlacesByOpeningHours`
- **Middleware**: `cache`
- **Description**: Get places filtered by opening hours

#### GET `/places/:id`

- **Controller**: `getPlace`
- **Middleware**: `cache`, `idParamValidator`
- **Params**: `id`
- **Description**: Get details of a specific place

#### GET `/places/:id/stats`

- **Controller**: `getPlaceStats`
- **Middleware**: `cache`, `idParamValidator`
- **Params**: `id`
- **Description**: Get statistics for a specific place

### Protected Admin Routes

All admin routes require both `protect` and `isAdmin` middleware

#### POST `/places`

- **Controller**: `createPlace`
- **Middleware**: `protect`, `isAdmin`, `placeValidator`
- **Input**:
  - Body: Place details
- **Description**: Create a new place

#### PUT `/places/:id`

- **Controller**: `updatePlace`
- **Middleware**: `protect`, `isAdmin`, `idParamValidator`, `placeValidator`
- **Params**: `id`
- **Input**:
  - Body: Updated place details
- **Description**: Update an existing place

#### DELETE `/places/:id`

- **Controller**: `deletePlace`
- **Middleware**: `protect`, `isAdmin`, `idParamValidator`
- **Params**: `id`
- **Description**: Delete a place

## Search Routes (`/search`)

All search routes use the `apiLimiter` middleware for rate limiting

#### GET `/search`

- **Controller**: `searchAll`
- **Middleware**: `apiLimiter`
- **Query Parameters**: `q` (search query)
- **Description**: Search across all content types

#### GET `/search/destinations`

- **Controller**: `searchDestinations`
- **Middleware**: `apiLimiter`
- **Query Parameters**: `q` (search query)
- **Description**: Search destinations

#### GET `/search/places`

- **Controller**: `searchPlaces`
- **Middleware**: `apiLimiter`
- **Query Parameters**: `q` (search query)
- **Description**: Search places

#### GET `/search/users`

- **Controller**: `searchUsers`
- **Middleware**: `apiLimiter`
- **Query Parameters**: `q` (search query)
- **Description**: Search users

#### GET `/search/posts`

- **Controller**: `searchPosts`
- **Middleware**: `apiLimiter`
- **Query Parameters**: `q` (search query)
- **Description**: Search posts

#### GET `/search/suggestions`

- **Controller**: `getSearchSuggestions`
- **Middleware**: `apiLimiter`
- **Query Parameters**: `q` (search query)
- **Description**: Get search suggestions based on partial query

## Post Routes (`/posts`)

### Public Routes

All public routes use the `cache` middleware with 15-minute duration

#### GET `/posts/:id`

- **Controller**: `getPost`
- **Middleware**: `cache`
- **Params**: `id`
- **Description**: Get a specific post

#### GET `/posts/type/:type`

- **Controller**: `getPostsByType`
- **Middleware**: `cache`
- **Params**: `type`
- **Description**: Get posts filtered by type

#### GET `/posts/location`

- **Controller**: `getPostsByLocation`
- **Middleware**: `cache`
- **Query Parameters**: Location parameters
- **Description**: Get posts by location

#### GET `/posts/tags`

- **Controller**: `getPostsByTags`
- **Middleware**: `cache`
- **Query Parameters**: `tags`
- **Description**: Get posts by tags

#### GET `/posts/user/:userId`

- **Controller**: `getUserPosts`
- **Middleware**: `cache`
- **Params**: `userId`
- **Description**: Get posts by a specific user

### Protected Routes

All protected routes use the `protect` middleware

#### POST `/posts`

- **Controller**: `createPost`
- **Middleware**: `protect`, `postValidator`
- **Input**:
  - Body: Post details
- **Description**: Create a new post

#### PUT `/posts/:id`

- **Controller**: `updatePost`
- **Middleware**: `protect`, `postValidator`
- **Params**: `id`
- **Input**:
  - Body: Updated post details
- **Description**: Update an existing post

#### DELETE `/posts/:id`

- **Controller**: `deletePost`
- **Middleware**: `protect`
- **Params**: `id`
- **Description**: Delete a post

#### GET `/posts/feed`

- **Controller**: `getFeed`
- **Middleware**: `protect`
- **Description**: Get user's personalized feed

#### PATCH `/posts/:id/visibility`

- **Controller**: `updatePostVisibility`
- **Middleware**: `protect`
- **Params**: `id`
- **Input**:
  - Body: `{ visibility }`
- **Description**: Update post visibility

#### PATCH `/posts/:id/type`

- **Controller**: `updatePostType`
- **Middleware**: `protect`
- **Params**: `id`
- **Input**:
  - Body: `{ type }`
- **Description**: Update post type

#### PATCH `/posts/:id/location`

- **Controller**: `updatePostLocation`
- **Middleware**: `protect`
- **Params**: `id`
- **Input**:
  - Body: Location details
- **Description**: Update post location

#### GET `/posts/visibility/:visibility`

- **Controller**: `getPostsByVisibility`
- **Middleware**: `protect`
- **Params**: `visibility`
- **Description**: Get posts filtered by visibility

## Destination Routes (`/destinations`)

### Public Routes

All public routes use the `cache` middleware with 15-minute duration

#### GET `/destinations/search`

- **Controller**: `searchDestinations`
- **Middleware**: `cache`
- **Query Parameters**: Search parameters
- **Description**: Search destinations

#### GET `/destinations/popular`

- **Controller**: `getPopularDestinations`
- **Middleware**: `cache`
- **Description**: Get list of popular destinations

#### GET `/destinations/nearby`

- **Controller**: `getNearbyDestinations`
- **Middleware**: `cache`
- **Query Parameters**: Location parameters
- **Description**: Get nearby destinations

#### GET `/destinations/:id`

- **Controller**: `getDestination`
- **Middleware**: `cache`, `idParamValidator`
- **Params**: `id`
- **Description**: Get details of a specific destination

#### GET `/destinations/:id/stats`

- **Controller**: `getDestinationStats`
- **Middleware**: `cache`, `idParamValidator`
- **Params**: `id`
- **Description**: Get statistics for a destination

#### GET `/destinations/:id/places`

- **Controller**: `getDestinationPlaces`
- **Middleware**: `cache`, `idParamValidator`
- **Params**: `id`
- **Description**: Get places in a destination

### Protected Admin Routes

All admin routes require both `protect` and `isAdmin` middleware

#### POST `/destinations`

- **Controller**: `createDestination`
- **Middleware**: `protect`, `isAdmin`, `destinationValidator`
- **Input**:
  - Body: Destination details
- **Description**: Create a new destination

#### PUT `/destinations/:id`

- **Controller**: `updateDestination`
- **Middleware**: `protect`, `isAdmin`, `idParamValidator`, `destinationValidator`
- **Params**: `id`
- **Input**:
  - Body: Updated destination details
- **Description**: Update an existing destination

#### DELETE `/destinations/:id`

- **Controller**: `deleteDestination`
- **Middleware**: `protect`, `isAdmin`, `idParamValidator`
- **Params**: `id`
- **Description**: Delete a destination

#### PUT `/destinations/:id/photo`

- **Controller**: `updateDestinationPhoto`
- **Middleware**: `protect`, `isAdmin`, `idParamValidator`
- **Params**: `id`
- **Input**:
  - Body: Photo data
- **Description**: Update destination photo

## Common Middleware

### Authentication & Authorization

- `protect`: Verifies JWT token and adds user to request object
- `isAdmin`: Checks if authenticated user has admin privileges
- `checkTripOwnership`: Verifies if authenticated user owns the trip

### Validation

- `tripValidator`: Validates trip-related input data
- `postValidator`: Validates post-related input data
- `placeValidator`: Validates place-related input data
- `destinationValidator`: Validates destination-related input data
- `idParamValidator`: Validates ID parameters in routes
- `reviewValidator`: Validates review-related input data

### Caching

- `cache`: Implements response caching with configurable duration
  - Used primarily on public GET routes
  - Default duration: 15 minutes
  - Helps improve performance and reduce database load

### Rate Limiting

- `apiLimiter`: Implements rate limiting for API endpoints
  - Applied to search routes to prevent abuse
  - Limits number of requests per IP address

### Error Handling

All routes are wrapped with error handling middleware that:

- Catches and formats errors consistently
- Handles different types of errors (validation, authentication, etc.)
- Returns appropriate HTTP status codes
- Provides meaningful error messages

### Request Processing

- Body parsing for JSON and form data
- Query parameter parsing
- File upload handling for photos and media

### Response Formatting

- Consistent response structure
- Data pagination where applicable
- Error formatting
- Success messages

## Middleware and Utilities

### Security Middleware

#### Helmet (`helmet`)

- Adds various HTTP headers to secure the application
- Protects against common web vulnerabilities
- Configures CSP, XSS protection, and other security headers

#### HTTP Parameter Pollution (`hpp`)

- Prevents parameter pollution attacks
- Cleans up request parameters
- Ensures consistent parameter handling

#### CORS (`cors`)

- Configures Cross-Origin Resource Sharing
- Allows requests from frontend origin (`FRONTEND_URL`)
- Handles credentials and preflight requests

#### Input Sanitization (`sanitizeInput`)

- Sanitizes incoming request data
- Prevents XSS attacks
- Cleans HTML and script tags from input

### Rate Limiting

#### API Rate Limiter (`apiLimiter`)

- Limits general API requests
- Configuration:
  - Window: Configurable time window
  - Max Requests: Configurable max requests per window
  - Applied to: All API routes

#### Authentication Rate Limiter (`authLimiter`)

- Stricter limits for authentication endpoints
- Configuration:
  - Window: Configurable time window
  - Max Requests: Lower limit for security
  - Applied to: `/api/auth` routes

#### Upload Rate Limiter (`uploadLimiter`)

- Controls file upload frequency
- Configuration:
  - Window: Configurable time window
  - Max Uploads: Limited uploads per window
  - Applied to: `/api/upload` routes

### Image Processing Utilities

#### Image Optimization (`imageProcessor.js`)

- Handles image processing and optimization
- Features:
  - Resizing: Maintains aspect ratio
  - Compression: Optimizes file size
  - Format conversion: Supports multiple formats
- Presets:
  - Profile Images: 400x400px, 80% quality
  - Trip Images: 1200x800px, 85% quality
  - Place Images: 1000x1000px, 85% quality
  - Review Images: 800x800px, 80% quality

### Email System (`email.js`)

#### Email Service Configuration

- Supports both development and production environments
- Development:
  - Uses Ethereal Email for testing
  - Provides preview URLs
- Production:
  - Configurable SMTP settings
  - Secure email delivery

#### Email Templates

- Verification Email:
  - Custom HTML template
  - 24-hour expiration
  - Verification link
- Password Reset:
  - Secure reset link
  - 1-hour expiration
  - Mobile-responsive design

### Logging System

#### Winston Logger (`winston.js`)

- Comprehensive logging solution
- Log Levels:
  - Error: System errors and exceptions
  - Warn: Warning conditions
  - Info: General information
  - Debug: Detailed debugging
- Features:
  - Timestamp
  - Log rotation
  - Different formats per environment

#### Application Logger (`logger.js`)

- Wrapper around Winston
- Structured logging format
- Context-based logging
- Error stack traces

### Authentication Utilities (`token.js`)

#### Token Management

- JWT token generation
- Refresh token handling
- Token validation
- Expiration management

#### Security Features

- Secure token storage
- Token rotation
- Blacklisting capabilities
- CSRF protection

### Response Handling (`responses.js`)

#### Standardized Response Format

- Success responses:
  - Status code
  - Success flag
  - Data payload
  - Messages
- Error responses:
  - Error codes
  - Error messages
  - Stack traces (development only)
  - Validation errors

### Request Processing

#### Body Parsing

- JSON parsing (limit: 10kb)
- URL-encoded data
- File uploads
- Cookie parsing

#### Compression

- Response compression
- Reduces bandwidth usage
- Improves load times

### Static File Serving

- Serves uploaded files
- Configurable paths
- Security headers
- Cache control

### Database Connection

- Managed connection pool
- Error handling
- Reconnection logic
- Connection logging

### Environment Configuration

- Environment-based settings
- Secure secrets management
- Configuration validation
- Default fallbacks

These utilities and middleware work together to provide:

- Secure request handling
- Efficient response processing
- Robust error management
- Comprehensive logging
- Image and file management
- Email communications
- Rate limiting and protection
- Data validation and sanitization
