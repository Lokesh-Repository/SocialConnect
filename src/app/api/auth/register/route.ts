import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { registerSchema } from '@/lib/validations'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues)
    }

    const { email, username, password, fullName } = validation.data

    // Check if email already exists in database
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (existingEmail) {
      return errorResponse('This email is already registered. Please use a different email or try logging in.', 409)
    }

    // Check if username already exists in database (case-insensitive)
    const { data: existingUsername } = await supabaseAdmin
      .from('users')
      .select('id, username')
      .ilike('username', username)
      .maybeSingle()

    if (existingUsername) {
      return errorResponse('This username is already taken. Please choose a different username.', 409)
    }

    // Create user in Supabase Auth
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName
        }
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      
      // Provide specific error messages
      if (authError.message.includes('already registered')) {
        return errorResponse('An account with this email already exists', 409)
      }
      
      return errorResponse(authError.message, 400)
    }

    if (!authData.user) {
      return errorResponse('Failed to create user', 500)
    }

    // Create user profile in our database
    const { data: user, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        username,
        full_name: fullName
      })
      .select('id, email, username, full_name, created_at')
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      
      // Rollback: delete auth user if database insert fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Failed to rollback auth user:', deleteError)
      }
      
      // Check for specific database errors
      if (dbError.code === '23505') {
        if (dbError.message.includes('email')) {
          return errorResponse('An account with this email already exists', 409)
        }
        if (dbError.message.includes('username')) {
          return errorResponse('This username is already taken', 409)
        }
      }
      
      return errorResponse('Failed to create user profile. Please try again.', 500)
    }

    return successResponse(user, 201)
  } catch (error: any) {
    console.error('Registration error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
