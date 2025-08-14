# Social Module API Documentation

## Authentication

- Most endpoints require JWT authentication via the `Authorization: Bearer <token>` header.
- Public endpoints are noted.

---

## 1. Posts

### Create Post

- **POST** `/social/post`
- **Auth:** Required
- **Body:**
  ```json
  {
    "content": "string",
    "images": ["string"], // optional, array of image URLs
    "attachments": ["string"], // optional, array of file URLs
    "targetId": "string", // optional, ObjectId of manga/chapter/etc.
    "targetType": "string", // optional, e.g. "manga", "chapter"
    "visibility": "public" // optional, "public" | "private" | "friends"
  }
  ```
- **Response:** Created post object

---

### Get All Posts

- **GET** `/social/post?limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of post objects (paginated, newest first)

---

### Get User Posts

- **GET** `/social/post/user/:userId`
- **Auth:** Not required
- **Response:** Array of post objects by user

---

### Get Post by ID

- **GET** `/social/post/:postId`
- **Auth:** Not required
- **Response:** Post object

---

### Update Post

- **PATCH** `/social/post/:postId`
- **Auth:** Required (must be owner)
- **Body:** Any updatable fields (content, images, attachments, visibility)
- **Response:** Updated post object

---

### Delete Post

- **DELETE** `/social/post/:postId`
- **Auth:** Required (must be owner)
- **Response:** `{ deleted: true }` if successful

---

### Count Posts

- **GET** `/social/post/count?userId=...&targetType=...`
- **Auth:** Not required
- **Response:** `{ count: number }`

---

### Search Posts

- **GET** `/social/post/search?q=term&limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of matching posts

---

### Filter Posts

- **GET** `/social/post/filter?visibility=public&targetType=manga&limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of filtered posts

---

### Get Posts by Hashtag

- **GET** `/social/post/hashtag/:hashtag?limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of posts containing the hashtag

---

### Get Posts by Mention

- **GET** `/social/post/mention/:username?limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of posts mentioning the username

---

### Update Post Visibility

- **PATCH** `/social/post/:postId/visibility`
- **Auth:** Required (must be owner)
- **Body:** `{ "visibility": "public" | "private" | "friends" }`
- **Response:** Updated post object

---

### Report Post

- **POST** `/social/post/:postId/report`
- **Auth:** Required
- **Body:** `{ "reason": "string" }`
- **Response:** `{ reported: true, postId, userId, reason }`

---

### Hide Post

- **POST** `/social/post/:postId/hide`
- **Auth:** Required
- **Response:** `{ hidden: true, postId, userId }`

---

### Block User's Posts

- **POST** `/social/post/block/:blockedUserId`
- **Auth:** Required
- **Response:** `{ blocked: true, blockedUserId, userId }`

---

### Admin: List All Posts

- **GET** `/social/post/admin/all`
- **Auth:** Admin only
- **Response:** Array of all posts

---

### Admin: Delete Any Post

- **DELETE** `/social/post/admin/:postId`
- **Auth:** Admin only
- **Response:** `{ deleted: true }`

---

### Analytics: Post Stats

- **GET** `/social/post/stats`
- **Auth:** Admin only
- **Response:** `{ total, public, private }`

---

## 2. Comments

### Create Comment

- **POST** `/social/comment`
- **Auth:** Required
- **Body:**
  ```json
  {
    "postId": "string",
    "parentId": "string",
    "content": "string",
    "attachments": ["string"],
    "visibility": "public"
  }
  ```
- **Response:** Comment object

---

### Get Comments by Post

- **GET** `/social/comment/post/:postId`
- **Auth:** Not required
- **Response:** Array of comments for the post

---

### Get Comments by User

- **GET** `/social/comment/user/:userId`
- **Auth:** Not required
- **Response:** Array of comments by user

---

### Get Comment by ID

- **GET** `/social/comment/:commentId`
- **Auth:** Not required
- **Response:** Comment object

---

### Update Comment

- **PATCH** `/social/comment/:commentId`
- **Auth:** Required (must be owner)
- **Body:** Any updatable fields (content, attachments, visibility)
- **Response:** Updated comment object

---

### Delete Comment

- **DELETE** `/social/comment/:commentId`
- **Auth:** Required (must be owner)
- **Response:** `{ deleted: true }`

---

### Count Comments

- **GET** `/social/comment/count?postId=...`
- **Auth:** Not required
- **Response:** `{ count: number }`

---

### Search Comments

- **GET** `/social/comment/search?q=term&limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of matching comments

---

### Filter Comments

- **GET** `/social/comment/filter?visibility=public&limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of filtered comments

---

### Get Comments by Hashtag

- **GET** `/social/comment/hashtag/:hashtag?limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of comments containing the hashtag

---

### Get Comments by Mention

- **GET** `/social/comment/mention/:username?limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of comments mentioning the username

---

### Update Comment Visibility

- **PATCH** `/social/comment/:commentId/visibility`
- **Auth:** Required (must be owner)
- **Body:** `{ "visibility": "public" | "private" | "friends" }`
- **Response:** Updated comment object

---

### Report Comment

- **POST** `/social/comment/:commentId/report`
- **Auth:** Required
- **Body:** `{ "reason": "string" }`
- **Response:** `{ reported: true, commentId, userId, reason }`

---

### Hide Comment

- **POST** `/social/comment/:commentId/hide`
- **Auth:** Required
- **Response:** `{ hidden: true, commentId, userId }`

---

### Block User's Comments

- **POST** `/social/comment/block/:blockedUserId`
- **Auth:** Required
- **Response:** `{ blocked: true, blockedUserId, userId }`

---

### Admin: List All Comments

- **GET** `/social/comment/admin/all`
- **Auth:** Admin only
- **Response:** Array of all comments

---

### Admin: Delete Any Comment

- **DELETE** `/social/comment/admin/:commentId`
- **Auth:** Admin only
- **Response:** `{ deleted: true }`

---

### Analytics: Comment Stats

- **GET** `/social/comment/stats`
- **Auth:** Admin only
- **Response:** `{ total, public, private }`

---

## 3. Likes & Reactions

### Like/React to Target

- **POST** `/social/like`
- **Auth:** Required
- **Body:**
  ```json
  {
    "targetId": "string",
    "targetType": "post" | "comment",
    "reaction": "like" | "love" | "haha" | "wow" | "sad" | "angry"
  }
  ```
- **Response:** Like object

---

### Unlike/Remove Reaction

- **DELETE** `/social/like`
- **Auth:** Required
- **Body:** Same as above
- **Response:** `{ deleted: true }`

---

### Get Likes for Target

- **GET** `/social/like?targetType=post&targetId=...`
- **Auth:** Not required
- **Response:** Array of likes for the target

---

### Get Likes by User

- **GET** `/social/like/user/:userId`
- **Auth:** Not required
- **Response:** Array of likes by user

---

### Count Likes for Target

- **GET** `/social/like/count?targetType=post&targetId=...`
- **Auth:** Not required
- **Response:** `{ count: number }`

---

### Count Likes by Reaction

- **GET** `/social/like/count-by-reaction?targetType=post&targetId=...`
- **Auth:** Not required
- **Response:** `{ like: n, love: n, ... }`

---

### Admin: List All Likes

- **GET** `/social/like/admin/all`
- **Auth:** Admin only
- **Response:** Array of all likes

---

### Admin: Delete Any Like

- **DELETE** `/social/like/admin/:likeId`
- **Auth:** Admin only
- **Response:** `{ deleted: true }`

---

### Analytics: Like Stats

- **GET** `/social/like/stats`
- **Auth:** Admin only
- **Response:** `{ total, byReaction: { like: n, love: n, ... } }`

---

## 4. Follows

### Follow User

- **POST** `/social/follow`
- **Auth:** Required
- **Body:** `{ "followingId": "string" }`
- **Response:** Follow object

---

### Unfollow User

- **DELETE** `/social/follow/:followingId`
- **Auth:** Required
- **Response:** `{ deleted: true }`

---

### Get Followers

- **GET** `/social/follow/followers/:userId?limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of followers

---

### Get Following

- **GET** `/social/follow/following/:userId?limit=20&offset=0`
- **Auth:** Not required
- **Response:** Array of following

---

### Get Mutual Followers

- **GET** `/social/follow/mutual/:userIdA/:userIdB`
- **Auth:** Not required
- **Response:** Array of mutual followers

---

### Get Follow Status

- **GET** `/social/follow/status/:followerId/:followingId`
- **Auth:** Not required
- **Response:** `{ isFollowing: true/false }`

---

### Block/Unblock/Report User

- **POST** `/social/follow/block/:blockedUserId`
- **POST** `/social/follow/unblock/:blockedUserId`
- **POST** `/social/follow/report/:reportedUserId`
- **Auth:** Required
- **Body (report only):** `{ "reason": "string" }`
- **Response:** `{ blocked: true }`, `{ unblocked: true }`, `{ reported: true, reason }`

---

### Admin: List All Follows

- **GET** `/social/follow/admin/all`
- **Auth:** Admin only
- **Response:** Array of all follows

---

### Admin: Delete Any Follow

- **DELETE** `/social/follow/admin/:followId`
- **Auth:** Admin only
- **Response:** `{ deleted: true }`

---

### Analytics: Follow Stats

- **GET** `/social/follow/stats`
- **Auth:** Admin only
- **Response:** `{ total }`

---

## 5. Shares

### Share Any Target

- **POST** `/social/share`
- **Auth:** Required
- **Body:**
  ```json
  {
    "targetType": "manga" | "chapter" | "scene" | "panel",
    "targetId": "string",
    "comment": "string"
  }
  ```
- **Response:** Share object

---

### Unshare

- **DELETE** `/social/share?targetType=...&targetId=...`
- **Auth:** Required
- **Response:** `{ deleted: true }`

---

### Get Shares for Target

- **GET** `/social/share?targetType=...&targetId=...`
- **Auth:** Not required
- **Response:** Array of shares

---

### Get Shares by User

- **GET** `/social/share/user/:userId`
- **Auth:** Not required
- **Response:** Array of shares by user

---

### Count Shares

- **GET** `/social/share/count?targetType=...&targetId=...`
- **Auth:** Not required
- **Response:** `{ count: number }`

---

### Get Shares by Type

- **GET** `/social/share/type/:targetType`
- **Auth:** Not required
- **Response:** Array of shares of that type

---

### Admin: List All Shares

- **GET** `/social/share/admin/all`
- **Auth:** Admin only
- **Response:** Array of all shares

---

### Admin: Delete Any Share

- **DELETE** `/social/share/admin/:shareId`
- **Auth:** Admin only
- **Response:** `{ deleted: true }`

---

### Analytics: Share Stats

- **GET** `/social/share/stats`
- **Auth:** Admin only
- **Response:** `{ total, byType: { manga: n, chapter: n, ... } }`

---

## 6. Notifications

### Create Notification

- **POST** `/social/notification`
- **Auth:** Required
- **Body:**
  ```json
  {
    "userId": "string",
    "type": "string",
    "message": "string",
    "sourceId": "string"
  }
  ```
- **Response:** Notification object

---

### Get User Notifications

- **GET** `/social/notification/user?limit=20&offset=0`
- **Auth:** Required
- **Response:** Array of notifications for the user

---

### Mark Notification as Read

- **PATCH** `/social/notification/:notificationId/read`
- **Auth:** Required
- **Response:** Updated notification object

---

### Mark All as Read

- **PATCH** `/social/notification/read/all`
- **Auth:** Required
- **Response:** `{ success: true }`

---

### Delete Notification

- **DELETE** `/social/notification/:notificationId`
- **Auth:** Required
- **Response:** `{ deleted: true }`

---

### Count Notifications

- **GET** `/social/notification/count`
- **Auth:** Required
- **Response:** `{ count: number }`

---

### Analytics: Notification Stats

- **GET** `/social/notification/stats`
- **Auth:** Admin only
- **Response:** `{ total, unread }`

---

### Admin: List All Notifications

- **GET** `/social/notification/admin/all`
- **Auth:** Admin only
- **Response:** Array of all notifications

---

### Admin: Delete Any Notification

- **DELETE** `/social/notification/admin/:notificationId`
- **Auth:** Admin only
- **Response:** `{ deleted: true }`

---

### Real-time Notification (Stub)

- **POST** `/social/notification/realtime`
- **Auth:** Required
- **Body:** `{ ... }`
- **Response:** `{ sent: true, userId, ... }`

---

## General Notes

- All endpoints return standard REST responses (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, etc.).
- Pagination is supported via `limit` and `offset` query parameters.
- All IDs are MongoDB ObjectIds (strings).
- All timestamps are in ISO 8601 format.
- All endpoints are ready for extension and can be further customized as needed.

---

This documentation covers every feature and endpoint in the social module. Frontend agents can use this as a single source of truth for all social features, request/response shapes, and behaviors.
