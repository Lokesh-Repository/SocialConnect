'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Heart, MessageCircle, Share2, Link as LinkIcon, Check, MoreHorizontal, Trash2 } from 'lucide-react'

interface Post {
  id: string
  content: string
  imageUrl?: string
  category?: string
  likeCount: number
  commentCount: number
  createdAt: string
  user: {
    id: string
    username: string
    fullName?: string
    avatarUrl?: string
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  technology: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  sports: 'bg-green-100 text-green-700 hover:bg-green-200',
  entertainment: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  news: 'bg-red-100 text-red-700 hover:bg-red-200',
  lifestyle: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  business: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  health: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  education: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  travel: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  food: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  other: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
}

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [copied, setCopied] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const isOwner = user?.id === post.user.id
  
  // Debug logging
  console.log('PostCard Debug:', {
    currentUserId: user?.id,
    postUserId: post.user.id,
    isOwner,
    postUserUsername: post.user.username
  })

  const handleLike = async () => {
    try {
      const method = liked ? 'DELETE' : 'POST'
      const res = await fetch(`/api/posts/${post.id}/like`, { method })
      
      if (res.ok) {
        setLiked(!liked)
        setLikeCount(prev => liked ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/posts/${post.id}`
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
    }
  }

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/posts/${post.id}`
    const shareData = {
      title: `Post by ${post.user.fullName || post.user.username}`,
      text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
      url: postUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copy link
        handleCopyLink()
      }
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        // Refresh the page to show updated posts
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete post')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/users/${post.user.id}`}>
              <Avatar>
                <AvatarImage src={post.user.avatarUrl} alt={post.user.username} />
                <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/users/${post.user.id}`} className="font-semibold hover:underline">
                {post.user.fullName || post.user.username}
              </Link>
              <p className="text-sm text-muted-foreground">@{post.user.username}</p>
            </div>
          </div>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-wrap mb-3">{post.content}</p>

        {post.category && (
          <div className="mb-3">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              CATEGORY_COLORS[post.category] || CATEGORY_COLORS.other
            }`}>
              #{post.category}
            </span>
          </div>
        )}

        {post.imageUrl && (
          <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-contain"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant={liked ? 'default' : 'ghost'}
          size="sm"
          onClick={handleLike}
          className={liked ? 'text-red-500' : ''}
        >
          <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
          {likeCount}
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <Link href={`/posts/${post.id}`}>
            <MessageCircle className="w-4 h-4 mr-2" />
            {post.commentCount}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share post
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link copied!
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copy link
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
