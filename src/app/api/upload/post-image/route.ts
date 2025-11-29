import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth } from '@/lib/middleware'

export const POST = withAuth(async (user, request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return errorResponse('No file provided', 400)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return errorResponse('File must be an image', 400)
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('File size must be less than 5MB', 400)
    }

    // Upload to Supabase Storage
    const supabase = await createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `posts/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return errorResponse('Failed to upload image', 500)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return successResponse({ imageUrl: publicUrl })
  } catch (error) {
    console.error('Upload post image error:', error)
    return errorResponse('Internal server error', 500)
  }
})
