import { supabaseAdmin } from './supabase-admin'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

export async function uploadImage(file: File, bucket: string, folder: string): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 2MB limit')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, file)

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return publicUrl
}

export async function deleteImage(url: string, bucket: string): Promise<void> {
  const fileName = url.split('/').pop()
  if (!fileName) return

  await supabaseAdmin.storage
    .from(bucket)
    .remove([fileName])
}
