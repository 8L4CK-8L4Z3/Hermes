# Controllers Structure

## Authentication Controller (`authController.js`)

- `register`: Create new user account
- `login`: Authenticate user and return JWT
- `logout`: Invalidate user session
- `refreshTokenHandler`: Generate new access token
- `forgotPassword`: Send password reset email
- `resetPassword`: Reset user password
- `verifyEmail`: Verify user email address
- `updatePassword`: Update user password (authenticated)

## User Controller (`userController.js`)

- `getProfile`: Get user profile
- `updateProfile`: Update user information
- `deleteAccount`: Delete user account
- `getFollowers`: Get user's followers
- `getFollowing`: Get users being followed
- `followUser`: Follow another user
- `unfollowUser`: Unfollow a user
- `getUserStats`: Get user statistics (trips, reviews, etc.)
- `updatePreferences`: Update user preferences (language, notifications)
- `updateLastLogin`: Update last login timestamp
- `verifyEmail`: Handle email verification
- `getUserActivity`: Get user's recent activity
- `updateUserPhoto`: Update user profile photo
- `updateUserStats`: Update user statistics (tripsCount, reviewsCount, followersCount, followingCount)
- `updateUserPreferences`: Update user preferences (language, notifications)
- `getUserPreferences`: Get user preferences
- `verifyUser`: Update user verification status

## Trip Controller (`tripController.js`)

- `createTrip`: Create new trip
- `getTrip`: Get trip details
- `updateTrip`: Update trip information
- `deleteTrip`: Delete trip
- `getUserTrips`: Get all trips for a user
- `addDestination`: Add destination to trip
- `removeDestination`: Remove destination from trip
- `updateTripStatus`: Update trip status (planning, ongoing, completed)
- `shareTrip`: Share trip with other users
- `getPublicTrips`: Get public trips (for feed)
- `updateBudget`: Update trip budget
- `addActivity`: Add activity to trip
- `removeActivity`: Remove activity from trip
- `updateActivity`: Update activity details
- `getTripActivities`: Get all activities for a trip
- `getTripTimeline`: Get trip timeline with activities
- `updateTripBudget`: Update trip budget details
- `updateTripVisibility`: Update trip public/private status
- `updateTripActivity`: Update activity details
- `removeTripActivity`: Remove activity from trip

## Destination Controller (`destinationController.js`)

- `createDestination`: Create new destination
- `getDestination`: Get destination details
- `updateDestination`: Update destination information
- `deleteDestination`: Delete destination
- `searchDestinations`: Search destinations
- `getPopularDestinations`: Get trending destinations
- `getNearbyDestinations`: Get destinations near a location
- `updateDestinationPhoto`: Update destination photo
- `getDestinationStats`: Get destination statistics (views, saves)
- `getDestinationPlaces`: Get all places in a destination

## Place Controller (`placeController.js`)

- `createPlace`: Create new place
- `getPlace`: Get place details
- `updatePlace`: Update place information
- `deletePlace`: Delete place
- `searchPlaces`: Search places
- `getPlacesByType`: Get places by type (accommodation, restaurant, activity)
- `getPlacesByDestination`: Get places in a destination
- `getPopularPlaces`: Get trending places
- `updatePlaceRating`: Update place average rating
- `updatePlacePriceRange`: Update place price range
- `updatePlaceOpeningHours`: Update place opening hours
- `updatePlaceAddress`: Update place address
- `getPlaceStats`: Get place statistics (views, reviews)
- `getPlacesByPriceRange`: Get places by price range
- `getPlacesByOpeningHours`: Get places by opening hours

## Review Controller (`reviewController.js`)

- `createReview`: Create new review
- `getReview`: Get review details
- `updateReview`: Update review
- `deleteReview`: Delete review
- `getReviews`: Get reviews for a place or user
- `likeReview`: Like a review
- `unlikeReview`: Unlike a review
- `getHelpfulReviews`: Get most helpful reviews
- `getReviewsByVisitDate`: Get reviews by visit date

## Post Controller (`postController.js`)

- `createPost`: Create new post
- `getPost`: Get post details
- `updatePost`: Update post
- `deletePost`: Delete post
- `getFeed`: Get social feed
- `getUserPosts`: Get posts by a user
- `likePost`: Like a post
- `unlikePost`: Unlike a post
- `updatePostVisibility`: Update post visibility settings
- `updatePostType`: Update post type
- `updatePostLocation`: Update post location
- `getPostsByType`: Get posts by type
- `getPostsByVisibility`: Get posts by visibility
- `getPostsByLocation`: Get posts by location
- `getPostsByTags`: Get posts by tags

## Comment Controller (`commentController.js`)

- `createComment`: Create new comment
- `getComment`: Get comment details
- `updateComment`: Update comment
- `deleteComment`: Delete comment
- `getPostComments`: Get comments for a post
- `likeComment`: Like a comment
- `unlikeComment`: Unlike a comment
- `getCommentReplies`: Get replies to a comment
- `getCommentThread`: Get full comment thread
- `updateCommentContent`: Update comment content

## Notification Controller (`notificationController.js`)

- `getNotifications`: Get user notifications
- `markAsRead`: Mark notification as read
- `markAllAsRead`: Mark all notifications as read
- `deleteNotification`: Delete notification
- `getUnreadCount`: Get unread notification count
- `createNotification`: Create new notification
- `updateNotificationReadStatus`: Update notification read status
- `getNotificationsByType`: Get notifications by type
- `deleteOldNotifications`: Delete old notifications

## Admin Controller (`adminController.js`)

- `getStats`: Get admin dashboard stats
- `getUsers`: Get all users
- `updateUserRole`: Update user role
- `banUser`: Ban a user
- `unbanUser`: Unban a user
- `getModerationLogs`: Get moderation logs
- `getAnalytics`: Get platform analytics
- `getReportedContent`: Get reported content
- `moderateContent`: Moderate reported content

## Analytics Controller (`analyticsController.js`)

- `getUserAnalytics`: Get user activity analytics
- `getContentAnalytics`: Get content engagement analytics
- `getDestinationAnalytics`: Get destination popularity analytics
- `getPlaceAnalytics`: Get place popularity analytics
- `getSearchAnalytics`: Get search trends analytics
- `updateDailyMetrics`: Update daily metrics
- `updatePopularDestinations`: Update popular destinations
- `updatePopularPlaces`: Update popular places
- `getAnalyticsByDate`: Get analytics by date
- `getAnalyticsByMetric`: Get analytics by metric
- `getPopularContent`: Get popular content

## Moderation Controller (`moderationController.js`)

- `reportContent`: Report inappropriate content
- `getReports`: Get content reports
- `handleReport`: Handle content report
- `getModerationQueue`: Get moderation queue
- `logModerationAction`: Log moderation action
- `getModerationHistory`: Get moderation history
- `getModeratorStats`: Get moderator statistics

## Search Controller (`searchController.js`)

- `searchAll`: Search across all content types
- `searchDestinations`: Search destinations
- `searchPlaces`: Search places
- `searchUsers`: Search users
- `searchPosts`: Search posts
- `getSearchSuggestions`: Get search suggestions

## Like Controller (`likeController.js`)

- `likeContent`: Like any content type
- `unlikeContent`: Unlike any content type
- `getLikes`: Get likes for content
- `getUserLikes`: Get user's liked content
- `getLikesByType`: Get likes by content type
- `getLikedContent`: Get all content liked by a user

## Follow Controller (`followController.js`)

- `followUser`: Follow a user
- `unfollowUser`: Unfollow a user
- `getFollowers`: Get user's followers
- `getFollowing`: Get users being followed
- `getFollowSuggestions`: Get follow suggestions
- `getFollowStats`: Get follow statistics
- `getMutualFollowers`: Get mutual followers
