// Privacy helper functions

export async function canViewProfile(
  targetUser: any,
  currentUserId: string | null,
  isFollowing: boolean = false
): Promise<boolean> {
  // Public profiles can be viewed by anyone
  if (targetUser.privacy === 'PUBLIC') {
    return true
  }

  // Not logged in users can't view private/followers-only profiles
  if (!currentUserId) {
    return false
  }

  // Users can always view their own profile
  if (targetUser.id === currentUserId) {
    return true
  }

  // Private profiles can't be viewed by others
  if (targetUser.privacy === 'PRIVATE') {
    return false
  }

  // Followers-only profiles require following
  if (targetUser.privacy === 'FOLLOWERS_ONLY') {
    return isFollowing
  }

  return false
}

export async function canViewPosts(
  postUserId: string,
  postUserPrivacy: string,
  currentUserId: string | null,
  isFollowing: boolean = false
): Promise<boolean> {
  // Public posts can be viewed by anyone
  if (postUserPrivacy === 'PUBLIC') {
    return true
  }

  // Not logged in users can't view private/followers-only posts
  if (!currentUserId) {
    return false
  }

  // Users can always view their own posts
  if (postUserId === currentUserId) {
    return true
  }

  // Private posts can't be viewed by others
  if (postUserPrivacy === 'PRIVATE') {
    return false
  }

  // Followers-only posts require following
  if (postUserPrivacy === 'FOLLOWERS_ONLY') {
    return isFollowing
  }

  return false
}
