import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ success: false, error: 'Search query required' }, { status: 400 })
    }

    // Search users by username
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, full_name, bio, avatar_url')
      .ilike('username', `%${query}%`)
      .eq('is_active', true)
      .limit(10)

    if (error) {
      console.error('Search users error:', error)
      return NextResponse.json({ success: false, error: 'Failed to search users' }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Check if current user is following each user
    const userIds = users.map(u => u.id)
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .in('following_id', userIds)

    const followingIds = new Set(follows?.map(f => f.following_id) || [])

    const usersWithFollowStatus = users.map(u => ({
      ...u,
      isFollowing: followingIds.has(u.id),
      isCurrentUser: u.id === user.id
    }))

    return NextResponse.json({ success: true, data: usersWithFollowStatus })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
