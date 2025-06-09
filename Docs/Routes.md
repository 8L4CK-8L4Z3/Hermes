# Routes Documentation

This document provides a detailed overview of all the API routes in the application. It includes information on the HTTP methods, endpoints, functionalities, and the middleware applied to each route.

## Table of Contents

- [Routes Documentation](#routes-documentation)
  - [Table of Contents](#table-of-contents)
  - [Authentication Routes (`auth`)](#authentication-routes-auth)
  - [User Routes (`users`)](#user-routes-users)
  - [Trip Routes (`trips`)](#trip-routes-trips)
  - [Place Routes (`places`)](#place-routes-places)
  - [Destination Routes (`destinations`)](#destination-routes-destinations)
  - [Post Routes (`posts`)](#post-routes-posts)
  - [Review Routes (`reviews`)](#review-routes-reviews)
  - [Comment Routes (`comments`)](#comment-routes-comments)
  - [Like Routes (`likes`)](#like-routes-likes)
  - [Follow Routes (`follows`)](#follow-routes-follows)
  - [Notification Routes (`notifications`)](#notification-routes-notifications)
  - [Search Routes (`search`)](#search-routes-search)
  - [Admin Routes (`admin`)](#admin-routes-admin)
  - [Moderation Routes (`moderation`)](#moderation-routes-moderation)
  - [Analytics Routes (`analytics`)](#analytics-routes-analytics)

---

## Authentication Routes (`auth`)

Handles user authentication, registration, and password management.

| Method | Path                  | Description                   | Middleware      |
|--------|-----------------------|-------------------------------|-----------------|
| POST   | `/register`           | Create new user account       | `authLimiter`   |
| POST   | `/login`              | Authenticate user and return JWT | `authLimiter`   |
| POST   | `/forgot-password`    | Send password reset email     | `authLimiter`   |
| GET    | `/verify-email/:token`| Verify user email address     | -               |
| POST   | `/reset-password/:resetToken`| Reset user password         | `authLimiter`   |
| POST   | `/logout`             | Invalidate user session       | `protect`       |
| POST   | `/refresh-token`      | Generate new access token     | `protect`       |
| PUT    | `/update-password`    | Update user password          | `protect`       |

## User Routes (`users`)

Manages user profiles, preferences, and social connections.

| Method | Path                  | Description                   | Middleware                |
|--------|-----------------------|-------------------------------|---------------------------|
| GET    | `/profile/:id`        | Get user profile              | `idParamValidator`        |
| GET    | `/:id/followers`      | Get user's followers          | `idParamValidator`        |
| GET    | `/:id/following`      | Get users being followed      | `idParamValidator`        |
| GET    | `/:id/stats`          | Get user statistics           | `idParamValidator`        |
| GET    | `/:id/activity`       | Get user's recent activity    | `idParamValidator`        |
| PUT    | `/profile`            | Update user information       | `protect`                 |
| DELETE | `/profile`            | Delete user account           | `protect`                 |
| PUT    | `/preferences`        | Update user preferences       | `protect`                 |
| PUT    | `/last-login`         | Update last login timestamp   | `protect`                 |
| PUT    | `/photo`              | Update user profile photo     | `protect`                 |
| PUT    | `/stats`              | Update user statistics        | `protect`                 |
| GET    | `/preferences`        | Get user preferences          | `protect`                 |
| PUT    | `/:id/verify`         | Verify a user                 | `protect`, `isAdmin`      |

## Trip Routes (`trips`)

Manages travel itineraries and related activities.

| Method | Path                          | Description                  | Middleware                               |
|--------|-------------------------------|------------------------------|------------------------------------------|
| GET    | `/public`                     | Get public trips             | `cache("15m")`                           |
| GET    | `/:id`                        | Get trip details             | `cache("15m")`                           |
| GET    | `/user/:userId`               | Get all trips for a user     | `userIdValidator`, `cache("15m")`        |
| GET    | `/:id/activities`             | Get all activities for a trip| `cache("15m")`                           |
| GET    | `/:id/timeline`               | Get trip timeline            | `cache("15m")`                           |
| POST   | `/`                           | Create new trip              | `protect`, `tripValidator`               |
| PUT    | `/:id`                        | Update trip information      | `protect`, `tripValidator`, `checkTripOwnership` |
| DELETE | `/:id`                        | Delete trip                  | `protect`, `checkTripOwnership`          |
| POST   | `/:id/destinations`           | Add destination to trip      | `protect`, `checkTripOwnership`          |
| DELETE | `/:id/destinations/:destinationId` | Remove destination from trip | `protect`, `destinationIdValidator`, `checkTripOwnership` |
| POST   | `/:id/activities`             | Add activity to trip         | `protect`, `checkTripOwnership`          |
| DELETE | `/:id/activities/:activityId` | Remove activity from trip    | `protect`, `activityIdValidator`, `checkTripOwnership` |
| PATCH  | `/:id/activities/:activityId` | Update activity details      | `protect`, `activityIdValidator`, `checkTripOwnership` |
| PATCH  | `/:id/status`                 | Update trip status           | `protect`, `checkTripOwnership`          |
| PATCH  | `/:id/budget`                 | Update trip budget           | `protect`, `checkTripOwnership`          |
| PATCH  | `/:id/visibility`             | Update trip visibility       | `protect`, `checkTripOwnership`          |
| POST   | `/:id/share`                  | Share trip with other users  | `protect`, `checkTripOwnership`          |

## Place Routes (`places`)

Manages places of interest, such as accommodations, restaurants, and attractions.

| Method | Path                        | Description                     | Middleware                                  |
|--------|-----------------------------|---------------------------------|---------------------------------------------|
| GET    | `/popular`                  | Get popular places              | `cache("15m")`                              |
| GET    | `/type/:type`               | Get places by type              | `cache("15m")`                              |
| GET    | `/destination/:destinationId` | Get places by destination     | `destinationIdValidator`, `cache("15m")`    |
| GET    | `/price/:range`             | Get places by price range       | `cache("15m")`                              |
| GET    | `/hours`                    | Get places by opening hours     | `cache("15m")`                              |
| GET    | `/:id`                      | Get place details               | `idParamValidator`, `cache("15m")`          |
| GET    | `/:id/stats`                | Get place statistics            | `idParamValidator`, `cache("15m")`          |
| POST   | `/`                         | Create a new place              | `protect`, `isAdmin`, `placeValidator`      |
| PUT    | `/:id`                      | Update a place                  | `protect`, `isAdmin`, `idParamValidator`, `placeValidator` |
| DELETE | `/:id`                      | Delete a place                  | `protect`, `isAdmin`, `idParamValidator`    |
| PATCH  | `/:id/rating`               | Update place average rating     | `protect`, `isAdmin`, `idParamValidator`    |

## Destination Routes (`destinations`)

Manages travel destinations.

| Method | Path            | Description                   | Middleware                                          |
|--------|-----------------|-------------------------------|-----------------------------------------------------|
| GET    | `/search`       | Search destinations           | `cache("15m")`                                      |
| GET    | `/popular`      | Get popular destinations      | `cache("15m")`                                      |
| GET    | `/nearby`       | Get destinations near a location | `cache("15m")`                                      |
| GET    | `/:id`          | Get destination details       | `idParamValidator`, `cache("15m")`                  |
| GET    | `/:id/stats`    | Get destination statistics    | `idParamValidator`, `cache("15m")`                  |
| GET    | `/:id/places`   | Get all places in a destination | `idParamValidator`, `cache("15m")`                  |
| POST   | `/`             | Create a new destination      | `protect`, `isAdmin`, `destinationValidator`        |
| PUT    | `/:id`          | Update a destination          | `protect`, `isAdmin`, `idParamValidator`, `destinationValidator` |
| DELETE | `/:id`          | Delete a destination          | `protect`, `isAdmin`, `idParamValidator`            |
| PUT    | `/:id/photo`    | Update destination photo      | `protect`, `isAdmin`, `idParamValidator`            |

## Post Routes (`posts`)

Manages user-generated posts.

| Method | Path                    | Description                      | Middleware                    |
|--------|-------------------------|----------------------------------|-------------------------------|
| GET    | `/:id`                  | Get post details                 | `cache("15m")`                |
| GET    | `/type/:type`           | Get posts by type                | `cache("15m")`                |
| GET    | `/location`             | Get posts by location            | `cache("15m")`                |
| GET    | `/tags`                 | Get posts by tags                | `cache("15m")`                |
| GET    | `/user/:userId`         | Get posts by a user              | `cache("15m")`                |
| POST   | `/`                     | Create new post                  | `protect`, `postValidator`    |
| PUT    | `/:id`                  | Update post                      | `protect`, `postValidator`    |
| DELETE | `/:id`                  | Delete post                      | `protect`                     |
| GET    | `/feed`                 | Get social feed                  | `protect`                     |
| PATCH  | `/:id/visibility`       | Update post visibility           | `protect`                     |
| PATCH  | `/:id/type`             | Update post type                 | `protect`                     |
| PATCH  | `/:id/location`         | Update post location             | `protect`                     |
| GET    | `/visibility/:visibility` | Get posts by visibility          | `protect`                     |

## Review Routes (`reviews`)

Manages reviews for places. These routes are typically mounted under a path that includes a place or user context (e.g., `/api/places/:placeId/reviews`).

| Method | Path        | Description                | Middleware                |
|--------|-------------|----------------------------|---------------------------|
| GET    | `/helpful`  | Get most helpful reviews   | -                         |
| GET    | `/by-date`  | Get reviews by visit date  | -                         |
| GET    | `/:id`      | Get review details         | -                         |
| GET    | `/`         | Get reviews for a place/user | -                         |
| POST   | `/`         | Create new review          | `protect`, `reviewValidator` |
| PUT    | `/:id`      | Update review              | `protect`, `reviewValidator` |
| DELETE | `/:id`      | Delete review              | `protect`                 |
| POST   | `/:id/like` | Like a review              | `protect`                 |
| POST   | `/:id/unlike`| Unlike a review          | `protect`                 |

## Comment Routes (`comments`)

Manages comments on posts. All routes are protected.

| Method | Path             | Description                | Middleware |
|--------|------------------|----------------------------|------------|
| POST   | `/`              | Create new comment         | `protect`  |
| GET    | `/:id`           | Get comment details        | `protect`  |
| PUT    | `/:id`           | Update comment             | `protect`  |
| DELETE | `/:id`           | Delete comment             | `protect`  |
| GET    | `/post/:postId`  | Get comments for a post    | `protect`  |
| POST   | `/:id/like`      | Like a comment             | `protect`  |
| POST   | `/:id/unlike`    | Unlike a comment           | `protect`  |
| GET    | `/:id/replies`   | Get replies to a comment   | `protect`  |
| GET    | `/:id/thread`    | Get full comment thread    | `protect`  |
| PATCH  | `/:id/content`   | Update comment content     | `protect`  |

## Like Routes (`likes`)

Manages likes on different types of content.

| Method | Path                    | Description                      | Middleware          |
|--------|-------------------------|----------------------------------|---------------------|
| GET    | `/content/:type/:id`    | Get likes for content            | `idParamValidator`  |
| GET    | `/type/:type`           | Get likes by content type        | -                   |
| POST   | `/`                     | Like any content type            | `protect`, `likeValidator` |
| DELETE | `/`                     | Unlike any content type          | `protect`, `likeValidator` |
| GET    | `/user/:userId`         | Get user's liked content         | `protect`, `userIdValidator` |
| GET    | `/user/:userId/content` | Get all content liked by a user  | `protect`, `userIdValidator` |

## Follow Routes (`follows`)

Manages user following relationships.

| Method | Path              | Description                 | Middleware                       |
|--------|-------------------|-----------------------------|----------------------------------|
| GET    | `/:userId/followers` | Get user's followers     | `userIdValidator`, `cache("5m")` |
| GET    | `/:userId/following` | Get users being followed | `userIdValidator`, `cache("5m")` |
| GET    | `/:userId/stats`     | Get follow statistics     | `userIdValidator`, `cache("5m")` |
| POST   | `/:userId`           | Follow a user            | `protect`, `userIdValidator`     |
| DELETE | `/:userId`           | Unfollow a user          | `protect`, `userIdValidator`     |
| GET    | `/suggestions`       | Get follow suggestions   | `protect`, `cache("15m")`        |
| GET    | `/:userId/mutual`    | Get mutual followers        | `protect`, `userIdValidator`     |

## Notification Routes (`notifications`)

Manages user notifications. All routes require authentication.

| Method | Path             | Description                     | Middleware      |
|--------|------------------|---------------------------------|-----------------|
| GET    | `/`              | Get user notifications          | `protect`       |
| GET    | `/unread/count`  | Get unread notification count   | `protect`       |
| GET    | `/type/:type`    | Get notifications by type       | `protect`       |
| PATCH  | `/:id/read`      | Mark notification as read       | `protect`       |
| PATCH  | `/read-all`      | Mark all notifications as read  | `protect`       |
| PATCH  | `/:id/status`    | Update notification read status | `protect`       |
| DELETE | `/:id`           | Delete notification             | `protect`       |
| POST   | `/`              | Create new notification         | `protect`, `isAdmin` |
| DELETE | `/cleanup`       | Delete old notifications        | `protect`, `isAdmin` |

## Search Routes (`search`)

Provides search functionality across different content types.

| Method | Path            | Description                  | Middleware |
|--------|-----------------|------------------------------|------------|
| GET    | `/`             | Search across all content    | -          |
| GET    | `/destinations` | Search destinations          | -          |
| GET    | `/places`       | Search places                | -          |
| GET    | `/users`        | Search users                 | -          |
| GET    | `/posts`        | Search posts                 | -          |
| GET    | `/suggestions`  | Get search suggestions       | -          |

## Admin Routes (`admin`)

Provides administrative functionalities. All routes require admin privileges.

| Method | Path                       | Description                 | Middleware                  |
|--------|----------------------------|-----------------------------|-----------------------------|
| GET    | `/stats`                   | Get admin dashboard stats   | `protect`, `isAdmin`, `cache("5m")` |
| GET    | `/users`                   | Get all users               | `protect`, `isAdmin`        |
| PUT    | `/users/:id/role`          | Update user role            | `protect`, `isAdmin`        |
| PUT    | `/users/:id/ban`           | Ban a user                  | `protect`, `isAdmin`        |
| PUT    | `/users/:id/unban`         | Unban a user                | `protect`, `isAdmin`        |
| GET    | `/moderation-logs`         | Get moderation logs         | `protect`, `isAdmin`        |
| GET    | `/analytics`               | Get platform analytics      | `protect`, `isAdmin`, `cache("15m")` |
| GET    | `/reported-content`        | Get reported content        | `protect`, `isAdmin`        |
| PUT    | `/reported-content/:id`    | Moderate reported content   | `protect`, `isAdmin`        |

## Moderation Routes (`moderation`)

Handles content moderation and reporting.

| Method | Path             | Description                | Middleware                               |
|--------|------------------|----------------------------|------------------------------------------|
| POST   | `/report`        | Report inappropriate content | `protect`, `validateReport`            |
| GET    | `/reports`       | Get content reports        | `protect`, `isModerator`                 |
| PUT    | `/reports/:id`   | Handle content report      | `protect`, `isModerator`                 |
| GET    | `/queue`         | Get moderation queue       | `protect`, `isModerator`                 |
| POST   | `/log`           | Log moderation action      | `protect`, `isModerator`, `validateModAction` |
| GET    | `/history`       | Get moderation history     | `protect`, `isModerator`                 |
| GET    | `/stats`         | Get moderator statistics   | `protect`, `isModerator`                 |

## Analytics Routes (`analytics`)

Provides access to platform analytics. All routes require admin privileges.

| Method | Path                       | Description                     | Middleware                  |
|--------|----------------------------|---------------------------------|-----------------------------|
| GET    | `/users`                   | Get user activity analytics     | `protect`, `isAdmin`, `cache("15m")` |
| GET    | `/content`                 | Get content engagement analytics| `protect`, `isAdmin`, `cache("15m")` |
| GET    | `/destinations`            | Get destination analytics       | `protect`, `isAdmin`, `cache("15m")` |
| GET    | `/places`                  | Get place analytics             | `protect`, `isAdmin`, `cache("15m")` |
| GET    | `/search`                  | Get search trends analytics     | `protect`, `isAdmin`, `cache("15m")` |
| GET    | `/date`                    | Get analytics by date           | `protect`, `isAdmin`, `cache("15m")` |
| GET    | `/metric/:metricName`      | Get analytics by metric         | `protect`, `isAdmin`, `cache("15m")` |
| GET    | `/content/popular`         | Get popular content             | `protect`, `isAdmin`, `cache("15m")` |
| POST   | `/metrics/daily`           | Update daily metrics            | `protect`, `isAdmin`        |
| POST   | `/destinations/popular`    | Update popular destinations     | `protect`, `isAdmin`        |
| POST   | `/places/popular`          | Update popular places           | `protect`, `isAdmin`        |
