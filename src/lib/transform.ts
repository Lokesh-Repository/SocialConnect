// Transform database snake_case to camelCase for frontend
export function transformPost(post: any) {
  return {
    id: post.id,
    content: post.content,
    imageUrl: post.image_url,
    category: post.category,
    likeCount: post.like_count,
    commentCount: post.comment_count,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    userId: post.user_id,
    user: post.user ? {
      id: post.user.id,
      username: post.user.username,
      fullName: post.user.full_name,
      avatarUrl: post.user.avatar_url
    } : undefined
  }
}

export function transformUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.full_name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    role: user.role,
    privacy: user.privacy,
    isActive: user.is_active,
    followersCount: user.followers_count,
    followingCount: user.following_count,
    postsCount: user.posts_count,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLogin: user.last_login
  }
}

export function transformComment(comment: any) {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    userId: comment.user_id,
    postId: comment.post_id,
    user: comment.user ? {
      id: comment.user.id,
      username: comment.user.username,
      fullName: comment.user.full_name,
      avatarUrl: comment.user.avatar_url
    } : undefined
  }
}

export function transformNotification(notification: any) {
  return {
    id: notification.id,
    type: notification.type,
    content: notification.content,
    isRead: notification.is_read,
    userId: notification.user_id,
    createdAt: notification.created_at
  }
}
