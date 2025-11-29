import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response'
import { z } from 'zod'

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = changePasswordSchema.safeParse(body)
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues)
    }

    const { newPassword } = validation.data

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return errorResponse(error.message, 400)
    }

    return successResponse({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return errorResponse('Internal server error', 500)
  }
}
