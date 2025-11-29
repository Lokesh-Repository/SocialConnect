import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { userId: targetUserId } = await params

    if (user.id === targetUserId) {
      return NextResponse.json({ success: false, error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single()

    if (existing) {
      return NextResponse.json({ success: false, error: 'Already following' }, { status: 400 })
    }

    // Create follow relationship
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      })

    if (error) {
      console.error('Follow error:', error)
      return NextResponse.json({ success: false, error: 'Failed to follow user' }, { status: 500 })
    }

    // Create notification for the followed user
    await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        actor_id: user.id,
        type: 'FOLLOW',
        read: false
      })

    return NextResponse.json({ success: true, message: 'User followed successfully' })
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { userId: targetUserId } = await params

    // Delete follow relationship
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)

    if (error) {
      console.error('Unfollow error:', error)
      return NextResponse.json({ success: false, error: 'Failed to unfollow user' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'User unfollowed successfully' })
  } catch (error) {
    console.error('Unfollow error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
