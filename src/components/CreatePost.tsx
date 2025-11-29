'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImagePlus, Loader2, X, Image as ImageIcon, Hash } from 'lucide-react'
import Image from 'next/image'

const CATEGORIES = [
  { value: 'General', label: 'Technology', emoji: '➕' },
  { value: 'Announcements', label: 'Sports', emoji: '📢' },
  { value: 'Question', label: 'Entertainment', emoji: '❓' },
  { value: 'news', label: 'News', emoji: '📰' },
  { value: 'lifestyle', label: 'Lifestyle', emoji: '✨' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'health', label: 'Health', emoji: '🏥' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'food', label: 'Food', emoji: '🍔' },
  { value: 'other', label: 'Other', emoji: '📌' }
]

export default function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [category, setCategory] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const MAX_CHARS = 280
  const remainingChars = MAX_CHARS - content.length
  const isOverLimit = remainingChars < 0

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/post-image', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) return null

      const data = await res.json()
      return data.data.imageUrl
    } catch (error) {
      console.error('Upload image error:', error)
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !imageFile) return

    setLoading(true)
    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content.trim() || ' ',
          imageUrl,
          category: category || undefined
        })
      })

      if (res.ok) {
        setContent('')
        setCategory('')
        handleRemoveImage()
        onPostCreated?.()
      }
    } catch (error) {
      console.error('Create post error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6 shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 text-base"
            maxLength={MAX_CHARS}
          />
          <div className="flex items-center justify-between my-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] h-8 text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {category && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCategory('')}
                  className="h-8 px-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className={`text-sm ${
              remainingChars < 20 ? (isOverLimit ? 'text-destructive font-semibold' : 'text-orange-500 font-medium') : 'text-muted-foreground'
            }`}>
              {remainingChars} characters remaining
            </div>
          </div>
          
          {imagePreview && (
            <div className="mt-4 relative rounded-xl overflow-hidden border-2 border-border">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 z-10 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <Image
                src={imagePreview}
                alt="Preview"
                width={600}
                height={400}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-4">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <Button 
              type="button" 
              variant={imageFile ? "default" : "outline"}
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploadingImage}
              className="gap-2"
            >
              {imageFile ? (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Image Added
                </>
              ) : (
                <>
                  <ImagePlus className="w-4 h-4" />
                  Add Photo
                </>
              )}
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={loading || uploadingImage || (!content.trim() && !imageFile) || isOverLimit}
            className="min-w-[100px]"
          >
            {uploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting
              </>
            ) : (
              'Post'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
