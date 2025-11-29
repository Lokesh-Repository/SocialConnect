import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Update last_login timestamp
    const { error } = await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('Update last login error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update last login' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Last login updated' })
  } catch (error) {
    console.error('Update last login error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
