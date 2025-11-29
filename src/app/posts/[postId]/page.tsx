'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, Lock, UserX } from 'lucide-react'
import Link from 'next/link'

export default function PostPage() {
  const { postId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (postId) {
      fetchPost()
      fetchComments()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`)
      const data = await res.json()
      
      if (data.success) {
        setPost(data.data)
        setError(null)
      } else {
        // Handle error responses
        if (res.status === 403) {
          setError(data.error || 'This post is private')
        } else if (res.status === 404) {
          setError('Post not found')
        } else {
          setError('Failed to load post')
        }
      }
    } catch (error) {
      console.error('Fetch post error:', error)
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      const data = await res.json()
      if (data.success) {
        setComments(data.data.comments)
      }
    } catch (error) {
      console.error('Fetch comments error:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (res.ok) {
        setNewComment('')
        fetchComments()
        fetchPost()
      }
    } catch (error) {
      console.error('Submit comment error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              {error.includes('private') ? (
                <>
                  <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">This Post is Private</h2>
                  <p className="text-muted-foreground mb-6">
                    {error.includes('followers') 
                      ? 'This post is only visible to followers of this user.'
                      : 'This post is private and cannot be viewed.'}
                  </p>
                </>
              ) : error.includes('not found') ? (
                <>
                  <UserX className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
                  <p className="text-muted-foreground mb-6">
                    This post may have been deleted or doesn't exist.
                  </p>
                </>
              ) : (
                <>
                  <UserX className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">Unable to Load Post</h2>
                  <p className="text-muted-foreground mb-6">{error}</p>
                </>
              )}
              <Button onClick={() => router.push('/feed')}>
                Go to Feed
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <PostCard post={post} />

        <Card className="mb-4">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            <form onSubmit={handleSubmitComment} className="mb-6">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
              />
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Comment
              </Button>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment: any) => (
                  <div key={comment.id} className="flex space-x-3 pb-4 border-b last:border-0">
                    <Link href={`/users/${comment.user.id}`}>
                      <Avatar>
                        <AvatarImage src={comment.user.avatarUrl} alt={comment.user.username} />
                        <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Link href={`/users/${comment.user.id}`} className="font-semibold hover:underline">
                          {comment.user.fullName || comment.user.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
