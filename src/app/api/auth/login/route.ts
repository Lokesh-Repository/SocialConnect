import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { loginSchema } from '@/lib/validations'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { transformUser } from '@/lib/transform'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues)
    }

    const { identifier, password } = validation.data
    const supabase = await createClient()

    let email = identifier
    
    // Check if identifier is an email or username
    const isEmail = identifier.includes('@') && identifier.includes('.')
    
    if (!isEmail) {
      // Treat as username - fetch email from database
      const cleanUsername = identifier.replace('@', '').toLowerCase()
      
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('email, is_active')
        .ilike('username', cleanUsername)
        .single()

      if (userError || !userData) {
        return errorResponse('Invalid username or password', 401)
      }

      // Check if account is active
      if (!userData.is_active) {
        return errorResponse('Your account has been deactivated. Please contact support.', 403)
      }

      email = userData.email
    }

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return errorResponse('Invalid email/username or password', 401)
    }

    if (!data.user) {
      return errorResponse('Login failed', 401)
    }

    // Update last login timestamp
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id)

    // Fetch full user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, username, full_name, bio, avatar_url, role, privacy, is_active, followers_count, following_count, posts_count, created_at, updated_at, last_login')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // Create response with custom cookies
    const response = successResponse({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at,
      user: data.user,
      profile: userProfile ? transformUser(userProfile) : null,
      session: data.session
    })

    // Set additional cookies for easy access (optional)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: data.session.expires_in,
      path: '/'
    }

    // Set access token cookie
    response.cookies.set('access_token', data.session.access_token, cookieOptions)
    
    // Set refresh token cookie
    response.cookies.set('refresh_token', data.session.refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    // Set user info cookie (non-sensitive data only)
    if (userProfile) {
      response.cookies.set('user_info', JSON.stringify({
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        role: userProfile.role
      }), {
        ...cookieOptions,
        httpOnly: false // Allow client-side access
      })
    }

    return response
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Internal server error', 500)
  }
}
